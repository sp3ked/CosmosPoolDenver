import os
import json
import math
import requests
from datetime import datetime
from decimal import Decimal, getcontext
from flask import Flask, request, jsonify
from web3 import Web3
from web3.middleware import geth_poa_middleware
from eth_utils import to_checksum_address
from solcx import compile_files, install_solc
from web3.types import RPCEndpoint

getcontext().prec = 100  # Increase precision
install_solc("0.7.6")

#############################
# 1) Setup & Constants
#############################
CONTRACT_PATH = "liquidityMatching.sol"
MOCK_CONTRACT_PATH = "MockNonfungiblePositionManager.sol"  # Ensure this file exists.
BASE_PATH = os.path.abspath(".")
WETH_ADDRESS = "0x4200000000000000000000000000000000000006"
USDC_ADDRESS = "0x078D782b760474a361dDA0AF3839290b0EF57AD6"

# Initialize Web3
w3 = Web3(Web3.HTTPProvider("http://127.0.0.1:8545"))
w3.middleware_onion.inject(geth_poa_middleware, layer=0)
if not w3.is_connected():
    raise Exception("ERROR: Unable to connect to Hardhat local node.")
print("INFO: Connected to Hardhat local node.")

accounts = w3.eth.accounts
owner = accounts[0]
user_usdc = accounts[2]
user_weth = accounts[1]


#############################
# 2) Core Price Functions
#############################
def fetch_weth_price():
    url = "https://api.coingecko.com/api/v3/simple/price"
    params = {"ids": "weth", "vs_currencies": "usd"}
    response = requests.get(url, params=params)
    if response.status_code == 200:
        return response.json()["weth"]["usd"]
    raise Exception(f"ERROR: Price fetch failed with status {response.status_code}")


def get_price_range(base_price, percentage=0.1):
    return (base_price * (1 - percentage), base_price * (1 + percentage))


def calculate_liquidity(
    weth_amount=None, usdc_amount=None, price_lower=None, price_upper=None
):
    sqrt_p_lower = math.sqrt(price_lower)
    sqrt_p_upper = math.sqrt(price_upper)
    if weth_amount:
        liquidity = weth_amount / (sqrt_p_upper - sqrt_p_lower)
        required_usdc = liquidity * (sqrt_p_upper * sqrt_p_lower)
        return weth_amount, required_usdc
    elif usdc_amount:
        liquidity = usdc_amount / (sqrt_p_upper * sqrt_p_lower)
        required_weth = liquidity * (sqrt_p_upper - sqrt_p_lower)
        return required_weth, usdc_amount
    raise ValueError("ERROR: Must provide either WETH or USDC amount.")


#############################
# 3) Contract Operations
#############################
def compile_and_deploy_mock():
    print("=== Compiling MockNonfungiblePositionManager.sol ===")
    compiled = compile_files(
        [MOCK_CONTRACT_PATH],
        output_values=["abi", "bin"],
        solc_version="0.7.6",
        import_remappings=[
            "@openzeppelin=node_modules/@openzeppelin",
            "contracts/=contracts/",
            "@uniswap=node_modules/@uniswap",
        ],
        allow_paths=[BASE_PATH, os.path.join(BASE_PATH, "node_modules")],
    )
    contract_id = f"{MOCK_CONTRACT_PATH}:MockNonfungiblePositionManager"
    contract_interface = compiled[contract_id]
    MockPositionManager = w3.eth.contract(
        abi=contract_interface["abi"], bytecode=contract_interface["bin"]
    )
    print(">>> Deploying MockNonfungiblePositionManager.sol ...")
    tx_hash = MockPositionManager.constructor().transact(
        {"from": owner, "gas": 3000000}
    )
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    print(f"INFO: Mock deployed at: {receipt.contractAddress}")
    return receipt.contractAddress


def compile_and_deploy_liquidity(mock_pm_address):
    print("=== Compiling LiquidityMatching.sol ===")
    compiled = compile_files(
        [CONTRACT_PATH],
        output_values=["abi", "bin"],
        solc_version="0.7.6",
        import_remappings=[
            "@openzeppelin=node_modules/@openzeppelin",
            "contracts/=contracts/",
            "@uniswap=node_modules/@uniswap",
        ],
        allow_paths=[BASE_PATH, os.path.join(BASE_PATH, "node_modules")],
    )
    contract_id = f"{CONTRACT_PATH}:LiquidityMatching"
    contract_interface = compiled[contract_id]
    LiquidityMatching = w3.eth.contract(
        abi=contract_interface["abi"], bytecode=contract_interface["bin"]
    )
    print(">>> Deploying LiquidityMatching contract ...")
    tx_hash = LiquidityMatching.constructor(
        to_checksum_address(WETH_ADDRESS),
        to_checksum_address(USDC_ADDRESS),
        to_checksum_address(mock_pm_address),
    ).transact({"from": owner, "gas": 3000000})
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    print(f"INFO: LiquidityMatching deployed at: {receipt.contractAddress}")
    return w3.eth.contract(
        address=receipt.contractAddress, abi=contract_interface["abi"]
    )


def deposit_tokens(contract, token_type, user, amount):
    token_address = WETH_ADDRESS if token_type == "WETH" else USDC_ADDRESS
    abi = json.loads(
        """[{
        "constant": false,
        "inputs": [{"name": "spender", "type": "address"}, {"name": "value", "type": "uint256"}],
        "name": "approve",
        "outputs": [{"name": "", "type": "bool"}],
        "type": "function"
    }]"""
    )
    token = w3.eth.contract(address=token_address, abi=abi)
    decimals = 18 if token_type == "WETH" else 6
    amount_wei = int(amount * (10**decimals))
    token.functions.approve(contract.address, amount_wei).transact(
        {"from": user, "gas": 100000}
    )
    if token_type == "WETH":
        contract.functions.depositWETH(amount_wei).transact(
            {"from": user, "gas": 2000000}
        )
    else:
        contract.functions.depositUSDC(amount_wei).transact(
            {"from": user, "gas": 2000000}
        )
    print(f"INFO: Deposited {amount} {token_type} from {user}")


def calculate_matched_amounts(contract):
    base_price = fetch_weth_price()
    price_lower, price_upper = get_price_range(base_price)
    print("=== Calculating Matched Amounts ===")
    print(f"Market Price: ${base_price:.2f}")
    print(f"Liquidity Range: ${price_lower:.2f} - ${price_upper:.2f}")
    total_weth = contract.functions.totalWETHDeposited().call() / 1e18
    total_usdc = contract.functions.totalUSDCDeposited().call() / 1e6
    print(f"Contract Holdings: {total_weth:.4f} WETH | {total_usdc:.2f} USDC")
    max_weth, required_usdc = calculate_liquidity(
        weth_amount=total_weth, price_lower=price_lower, price_upper=price_upper
    )
    if total_usdc >= required_usdc:
        return total_weth, required_usdc
    matched_weth, matched_usdc = calculate_liquidity(
        usdc_amount=total_usdc, price_lower=price_lower, price_upper=price_upper
    )
    return matched_weth, total_usdc


def execute_liquidity_matching(contract):
    matched_weth, matched_usdc = calculate_matched_amounts(contract)
    print(f"=== Executing Liquidity Matching ===")
    print(f"Matching {matched_weth:.4f} WETH with {matched_usdc:.2f} USDC")
    weth_wei = int(Decimal(str(matched_weth)) * Decimal("1e18"))
    usdc_wei = int(Decimal(str(matched_usdc)) * Decimal("1e6"))
    tx_hash = contract.functions.triggerLiquidityMatching(usdc_wei, weth_wei).transact(
        {"from": owner, "gas": 500000}
    )
    w3.eth.wait_for_transaction_receipt(tx_hash)
    fetch_events(contract)
    return tx_hash.hex()


def fetch_events(contract):
    latest_block = w3.eth.block_number
    events = {"LiquidityMatched": [], "MatchingTriggered": []}
    try:
        lm_events = contract.events.LiquidityMatched().get_logs(
            fromBlock=latest_block - 10
        )
        for event in lm_events:
            events["LiquidityMatched"].append(dict(event.args))
    except Exception as e:
        print("WARNING: Error fetching LiquidityMatched events:", e)
    try:
        mt_events = contract.events.MatchingTriggered().get_logs(
            fromBlock=latest_block - 10
        )
        for event in mt_events:
            events["MatchingTriggered"].append(dict(event.args))
    except Exception as e:
        print("WARNING: Error fetching MatchingTriggered events:", e)
    return events


def advance_time(seconds):
    w3.provider.make_request(RPCEndpoint("evm_increaseTime"), [seconds])
    w3.provider.make_request(RPCEndpoint("evm_mine"), [])
    print(f"INFO: Advanced time by {seconds} seconds.")


def withdraw_and_distribute(contract):
    print("=== Initiating Withdrawal Process ===")
    advance_time(600)
    tx_hash = contract.functions.withdrawAndDistribute().transact(
        {"from": owner, "gas": 500000}
    )
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    print(f"INFO: withdrawAndDistribute executed in transaction: {tx_hash.hex()}")
    return tx_hash.hex()


def get_token_balance(token_address, account):
    token = w3.eth.contract(
        address=token_address,
        abi=[
            {
                "constant": True,
                "inputs": [{"name": "account", "type": "address"}],
                "name": "balanceOf",
                "outputs": [{"name": "", "type": "uint256"}],
                "type": "function",
            }
        ],
    )
    return token.functions.balanceOf(account).call()


def get_all_balances(contract, pool_address):
    balances = {
        "LiquidityMatchingContract": {
            "WETH": get_token_balance(WETH_ADDRESS, contract.address),
            "USDC": get_token_balance(USDC_ADDRESS, contract.address),
        },
        "MockPositionManager": {
            "WETH": get_token_balance(WETH_ADDRESS, pool_address),
            "USDC": get_token_balance(USDC_ADDRESS, pool_address),
        },
        "Depositor_user_weth": {"WETH": get_token_balance(WETH_ADDRESS, user_weth)},
        "Depositor_user_usdc": {"USDC": get_token_balance(USDC_ADDRESS, user_usdc)},
        "Owner": owner,
    }
    return balances


#############################
# API Endpoints
#############################
app = Flask(__name__)

# Global variables to store deployed contracts
liquidity_contract = None
mock_pm_address = None


@app.route("/deploy", methods=["POST"])
def deploy_contracts():
    global liquidity_contract, mock_pm_address
    try:
        mock_pm_address = compile_and_deploy_mock()
        liquidity_contract = compile_and_deploy_liquidity(mock_pm_address)
        return jsonify(
            {
                "message": "Contracts deployed successfully",
                "mock_pm_address": mock_pm_address,
                "liquidity_contract_address": liquidity_contract.address,
            }
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/price", methods=["GET"])
def get_price():
    try:
        price = fetch_weth_price()
        return jsonify({"weth_price": price})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/deposit", methods=["POST"])
def deposit():
    global liquidity_contract
    if liquidity_contract is None:
        return jsonify({"error": "Contracts not deployed yet."}), 400
    data = request.get_json()
    token_type = data.get("token_type")
    amount = data.get("amount")
    if token_type not in ["WETH", "USDC"] or amount is None:
        return (
            jsonify({"error": "Invalid parameters. Require token_type and amount."}),
            400,
        )
    try:
        user = user_weth if token_type == "WETH" else user_usdc
        deposit_tokens(liquidity_contract, token_type, user, float(amount))
        return jsonify({"message": f"Deposited {amount} {token_type} successfully."})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/balances", methods=["GET"])
def balances():
    global liquidity_contract, mock_pm_address
    if liquidity_contract is None or mock_pm_address is None:
        return jsonify({"error": "Contracts not deployed yet."}), 400
    try:
        bal = get_all_balances(liquidity_contract, mock_pm_address)
        return jsonify(bal)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/match", methods=["POST"])
def match():
    global liquidity_contract
    if liquidity_contract is None:
        return jsonify({"error": "Contracts not deployed yet."}), 400
    try:
        tx_hash = execute_liquidity_matching(liquidity_contract)
        events = fetch_events(liquidity_contract)
        return jsonify(
            {
                "message": "Liquidity matching executed successfully.",
                "transaction_hash": tx_hash,
                "events": events,
            }
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/withdraw", methods=["POST"])
def withdraw():
    global liquidity_contract
    if liquidity_contract is None:
        return jsonify({"error": "Contracts not deployed yet."}), 400
    try:
        tx_hash = withdraw_and_distribute(liquidity_contract)
        return jsonify(
            {
                "message": "Withdrawal executed successfully.",
                "transaction_hash": tx_hash,
            }
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)
