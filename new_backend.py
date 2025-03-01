import os
import json
import math
import requests
from datetime import datetime
from dotenv import load_dotenv
from web3 import Web3
from web3.middleware import geth_poa_middleware
from eth_utils import to_checksum_address
from solcx import compile_files

# Load environment variables
load_dotenv()

# Solidity Compilation Setup
CONTRACT_PATH = "LiquidityMatching.sol"
BASE_PATH = os.path.abspath(".")
PRIVATE_KEY = os.getenv("PRIVATE_KEY")

# Compile the contract
compiled_contract = compile_files(
    [CONTRACT_PATH],
    output_values=["abi", "bin"],
    solc_version="0.8.28",
    allow_paths=[BASE_PATH, os.path.join(BASE_PATH, "node_modules")],
    import_remappings=["@openzeppelin/=node_modules/@openzeppelin/", "contracts/=contracts/"]
)

contract_interface = compiled_contract.get(f"{CONTRACT_PATH}:LiquidityMatching")
if not contract_interface:
    raise ValueError("Compilation failed")

abi = contract_interface["abi"]
bytecode = contract_interface["bin"]

# Check if bytecode is not empty
print(f"Bytecode length: {len(bytecode)} characters")

# Setup connection
LOCAL_NODE_URL = "http://127.0.0.1:8545"
w3 = Web3(Web3.HTTPProvider(LOCAL_NODE_URL))
w3.middleware_onion.inject(geth_poa_middleware, layer=0)

if not w3.is_connected():
    raise Exception("Not connected to local Hardhat node!")

print("Connected to Hardhat node.")

# Accounts
accounts = w3.eth.accounts
owner = accounts[0]

# Deploy compiled contract
LiquidityMatching = w3.eth.contract(abi=abi, bytecode=bytecode)

weth_address = to_checksum_address("0x4200000000000000000000000000000000000006")
usdc_address = to_checksum_address("0x078D782b760474a361dDA0AF3839290b0EF57AD6")

tx_hash = LiquidityMatching.constructor(
    weth_address, usdc_address
).transact({
    "from": owner,
    "gas": 3_000_000
})

tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
contract_address = tx_receipt.contractAddress

print(f"Contract deployed at: {contract_address}")

# Connect to deployed contract
contract = w3.eth.contract(address=contract_address, abi=abi)
account = w3.eth.accounts[0]

# JSON Files for DB
DATABASE_FILE = "deposits.json"
MATCHED_OUTPUT_FILE = "matched_pairs.json"

# Initialize database with empty mappings
def initialize_database():
    if not os.path.exists(DATABASE_FILE):
        with open(DATABASE_FILE, "w") as f:
            json.dump({"weth_deposits": {}, "usdc_deposits": {}}, f, indent=4)

# Store deposits in JSON
def store_deposit(token_type, address, amount):
    timestamp = datetime.now().isoformat()
    with open(DATABASE_FILE, "r") as f:
        data = json.load(f)

    deposit = {"amount": float(amount), "timestamp": timestamp}
    if token_type == "WETH":
        data["weth_deposits"][address] = deposit
    else:
        data["usdc_deposits"][address] = deposit

    with open(DATABASE_FILE, "w") as f:
        json.dump(data, f, indent=4)

# Retrieve sorted deposits from JSON
def get_deposits(token_type):
    with open(DATABASE_FILE, "r") as f:
        data = json.load(f)
    deposits = data["weth_deposits"] if token_type == "WETH" else data["usdc_deposits"]
    # Convert to a list of deposits sorted by timestamp
    return sorted(
        [{"address": addr, **deposit} for addr, deposit in deposits.items()],
        key=lambda x: x["timestamp"]
    )

# Fetch WETH price from CoinGecko
def fetch_weth_price():
    """Fetches the current price of WETH in USDC using CoinGecko API."""
    url = "https://api.coingecko.com/api/v3/simple/price"
    params = {"ids": "weth", "vs_currencies": "usd"}
    response = requests.get(url, params=params)
    if response.status_code == 200:
        return response.json()["weth"]["usd"]
    else:
        raise Exception(f"Failed to fetch WETH price: {response.status_code}")

# Define price range
def get_price_range(base_price, percentage=0.1):
    """Defines a ±percentage price range around a base price."""
    return base_price * (1 - percentage), base_price * (1 + percentage)

# The core function: liquidity calculation
def calculate_liquidity(weth_amount=None, usdc_amount=None, price_lower=None, price_upper=None):
    """Calculates required pairing amounts using the Uniswap V4 liquidity formula."""
    if price_lower is None or price_upper is None:
        raise ValueError("Price range must be provided")

    sqrt_p_lower = math.sqrt(price_lower)
    sqrt_p_upper = math.sqrt(price_upper)

    if weth_amount is not None:
        liquidity = weth_amount / (sqrt_p_upper - sqrt_p_lower)
        required_usdc = liquidity * (sqrt_p_upper * sqrt_p_lower)
        return weth_amount, required_usdc

    elif usdc_amount is not None:
        liquidity = usdc_amount / (sqrt_p_upper * sqrt_p_lower)
        required_weth = liquidity * (sqrt_p_upper - sqrt_p_lower)
        return required_weth, usdc_amount

    else:
        raise ValueError("Either weth_amount or usdc_amount must be provided")

# Match liquidity deposits
def match_liquidity():
    """Matches WETH and USDC deposits for single-sided LP in Uniswap V3."""
    base_price = fetch_weth_price()
    price_lower, price_upper = get_price_range(base_price, percentage=0.1)
    print(f"Price range: {price_lower:.2f} - {price_upper:.2f} USDC/WETH")

    weth_deposits = get_deposits("WETH")
    usdc_deposits = get_deposits("USDC")
    matched_pairs = []
    unmatched_weth = []
    unmatched_usdc = []

    weth_index = 0
    usdc_index = 0

    while weth_index < len(weth_deposits) and usdc_index < len(usdc_deposits):
        weth_dep = weth_deposits[weth_index]
        usdc_dep = usdc_deposits[usdc_index]

        weth_address, weth_amount = weth_dep["address"], float(weth_dep["amount"])
        usdc_address, usdc_amount = usdc_dep["address"], float(usdc_dep["amount"])

        # Calculate required USDC for the full WETH amount within the range
        _, required_usdc = calculate_liquidity(weth_amount=weth_amount, price_lower=price_lower, price_upper=price_upper)
        print(f"WETH {weth_address}: {weth_amount} needs {required_usdc:.2f} USDC, available: {usdc_amount}")

        if usdc_amount >= required_usdc:
            # Full WETH match: use all WETH and required USDC
            matched_pairs.append({
                "weth_address": weth_address,
                "weth_amount": weth_amount,
                "usdc_address": usdc_address,
                "usdc_amount": required_usdc
            })
            remaining_usdc = usdc_amount - required_usdc
            if remaining_usdc > 0:
                unmatched_usdc.append({"address": usdc_address, "amount": remaining_usdc, "timestamp": usdc_dep["timestamp"]})
            weth_index += 1
            usdc_index += 1 if remaining_usdc == 0 else usdc_index
        else:
            # Partial match: use all available USDC and corresponding WETH
            matched_weth, _ = calculate_liquidity(usdc_amount=usdc_amount, price_lower=price_lower, price_upper=price_upper)
            matched_pairs.append({
                "weth_address": weth_address,
                "weth_amount": matched_weth,
                "usdc_address": usdc_address,
                "usdc_amount": usdc_amount
            })
            remaining_weth = weth_amount - matched_weth
            if remaining_weth > 0:
                unmatched_weth.append({"address": weth_address, "amount": remaining_weth, "timestamp": weth_dep["timestamp"]})
            usdc_index += 1

    # Add remaining unmatched deposits
    unmatched_weth.extend(weth_deposits[weth_index:])
    unmatched_usdc.extend(usdc_deposits[usdc_index:])

    # Update the database with unmatched deposits
    update_database(unmatched_weth, unmatched_usdc)

    # Trigger contract for each match individually
    for pair in matched_pairs:
        trigger_liquidity_matching(pair["usdc_amount"], pair["weth_amount"])

    return matched_pairs, unmatched_weth, unmatched_usdc

# Transaction Helper
def send_transaction(function_call):
    """Helper function to send transactions."""
    txn = function_call.build_transaction({
        "from": account,
        "nonce": w3.eth.get_transaction_count(account),
        "gas": 200000,
        "gasPrice": w3.to_wei("10", "gwei"),
    })
    signed_txn = w3.eth.account.sign_transaction(txn, w3.eth.account.from_key(PRIVATE_KEY))
    tx_hash = w3.eth.send_raw_transaction(signed_txn.rawTransaction)
    return w3.to_hex(tx_hash)

# Deposit to Contract
def deposit_to_contract(token_type, amount):
    """Sends USDC or WETH to the smart contract."""
    function_call = contract.functions.depositUSDC(amount) if token_type == "USDC" else contract.functions.depositWETH(amount)
    tx_hash = send_transaction(function_call)
    print(f"Deposited {amount} {token_type} to contract. Tx Hash: {tx_hash}")

# Trigger Liquidity Matching
def trigger_liquidity_matching(amountUSDC, amountWETH):
    """Calls triggerLiquidityMatching in the smart contract."""
    function_call = contract.functions.triggerLiquidityMatching(amountUSDC, amountWETH)
    tx_hash = send_transaction(function_call)
    print(f"Triggered liquidity matching. Tx Hash: {tx_hash}")

# Update Database
def update_database(unmatched_weth, unmatched_usdc):
    """Updates the database with unmatched deposits."""
    with open(DATABASE_FILE, "r") as f:
        data = json.load(f)

    # Convert lists of unmatched deposits back to mappings
    data["weth_deposits"] = {dep["address"]: {"amount": dep["amount"], "timestamp": dep["timestamp"]} for dep in unmatched_weth}
    data["usdc_deposits"] = {dep["address"]: {"amount": dep["amount"], "timestamp": dep["timestamp"]} for dep in unmatched_usdc}

    with open(DATABASE_FILE, "w") as f:
        json.dump(data, f, indent=4)

# Initialize Database and Run Simulation
print("\n--- INITIALIZING DATABASE ---")
initialize_database()

print("\n--- SIMULATING DEPOSITS ---")
store_deposit("WETH", account, 0.5)
store_deposit("USDC", account, 500)

print("\n--- MATCHING DEPOSITS ---")
matched_pairs, unmatched_weth, unmatched_usdc = match_liquidity()

# Export matched pairs
with open(MATCHED_OUTPUT_FILE, "w") as f:
    json.dump(matched_pairs, f, indent=4)