import os
import json
import math
import requests
from datetime import datetime
from dotenv import load_dotenv
from web3 import Web3
from web3.middleware import geth_poa_middleware
from eth_utils import to_checksum_address
from solcx import compile_files, install_solc
from wrap import weth_abi, get_weth_balance, wrap_eth
from main import usdc_contract

def deploy_contract(w3, owner):
    MOCK_CONTRACT_PATH = "MockNonfungiblePositionManager.sol"  # Make sure this file exists.
    BASE_PATH = os.path.abspath(".")
    print("🔨 Compiling mock position manager...")
    compiled = compile_files(
        [MOCK_CONTRACT_PATH],
        output_values=["abi", "bin"],
        solc_version="0.7.6",
        import_remappings=[
            "@openzeppelin=node_modules/@openzeppelin",
            "contracts/=contracts/",
            "@uniswap=node_modules/@uniswap"
        ],
        allow_paths=[BASE_PATH, os.path.join(BASE_PATH, "node_modules")]
    )
    contract_id = f"{MOCK_CONTRACT_PATH}:MockNonfungiblePositionManager"
    contract_interface = compiled[contract_id]
    MockPositionManager = w3.eth.contract(
        abi=contract_interface["abi"],
        bytecode=contract_interface["bin"]
    )
    print("🚀 Deploying mock position manager...")
    tx_hash = MockPositionManager.constructor().transact({"from": owner, "gas": 3_000_000})
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    mock_address = receipt.contractAddress
    print(f"Mock deployed at: {receipt.contractAddress}")

    """Compiles and deploys the LiquidityMatching contract."""
    CONTRACT_PATH = "liquidityMatching.sol"
    BASE_PATH = os.path.abspath(".")

    compiled_contract = compile_files(
        ["liquidityMatching.sol"],
        output_values=["abi", "bin"],
        solc_version="0.7.6",
        import_remappings=[
            "@openzeppelin=node_modules/@openzeppelin",
            "contracts/=contracts/",
            "@uniswap=node_modules/@uniswap"
        ],
        allow_paths=["./", "./node_modules"]
    )
    print("Compiling liquiditymatching")
    contract_interface = compiled_contract.get(f"{CONTRACT_PATH}:LiquidityMatching")
    if not contract_interface:
        raise ValueError("Compilation failed")

    abi = contract_interface["abi"]
    bytecode = contract_interface["bin"]

    print(f"Bytecode length: {len(bytecode)} characters")

    LiquidityMatching = w3.eth.contract(abi=abi, bytecode=bytecode)

    weth_address = to_checksum_address("0x4200000000000000000000000000000000000006")
    usdc_address = to_checksum_address("0x078D782b760474a361dDA0AF3839290b0EF57AD6")

    tx_hash = LiquidityMatching.constructor(
        weth_address, usdc_address, mock_address
    ).transact({
        "from": owner,
        "gas": 3_000_000
    })

    tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    contract_address = tx_receipt.contractAddress

    print(f"🚀 Contract deployed at: {contract_address}")

    return w3.eth.contract(address=contract_address, abi=abi)

def display_account_balances(w3, accounts):
    """Displays ETH, WETH, and USDC balances for the first 3 accounts."""
    for i in range(3):
        print(f"Account {i}: {accounts[i]}")
        print(f"\t ETH Balance: {w3.from_wei(w3.eth.get_balance(accounts[i]), 'ether')} ETH")
        print(f"\t wETH Balance: {get_weth_balance(accounts[i])} WETH")
        print(f"\t USDC Balance: {usdc_contract.functions.balanceOf(accounts[i]).call() / 10 ** 6} USDC")


def swap_weth_to_usdc(w3, account, amount_weth, private_key):
    """Swaps `amount_weth` WETH for USDC using Uniswap V2 Router with price safety check."""

    # ✅ Uniswap V2 Router Address on Unichain (Replace if different)
    UNISWAP_V2_ROUTER = to_checksum_address("0x284f11109359a7e1306c3e447ef14d38400063ff")

    # ✅ Load Uniswap V2 Router ABI
    router_abi = json.loads("""[
        {
            "inputs": [
                {"internalType": "uint256", "name": "amountIn", "type": "uint256"},
                {"internalType": "uint256", "name": "amountOutMin", "type": "uint256"},
                {"internalType": "address[]", "name": "path", "type": "address[]"},
                {"internalType": "address", "name": "to", "type": "address"},
                {"internalType": "uint256", "name": "deadline", "type": "uint256"}
            ],
            "name": "swapExactTokensForTokens",
            "outputs": [{"internalType": "uint256[]", "name": "amounts", "type": "uint256[]"}],
            "stateMutability": "nonpayable",
            "type": "function"
        }
    ]""")

    # ✅ Define Token Addresses
    WETH_ADDRESS = to_checksum_address("0x4200000000000000000000000000000000000006")
    USDC_ADDRESS = to_checksum_address("0x078D782b760474a361dDA0AF3839290b0EF57AD6")

    # ✅ Load Uniswap V2 Router Contract
    router_contract = w3.eth.contract(address=UNISWAP_V2_ROUTER, abi=router_abi)

    # ✅ Load WETH Contract with Expanded ABI (for `approve()`)
    weth_abi_extended = weth_abi + [{
        "constant": False,
        "inputs": [{"name": "spender", "type": "address"}, {"name": "amount", "type": "uint256"}],
        "name": "approve",
        "outputs": [{"name": "", "type": "bool"}],
        "stateMutability": "nonpayable",
        "type": "function"
    }]
    weth_contract = w3.eth.contract(address=WETH_ADDRESS, abi=weth_abi_extended)

    # ✅ Step 1: Approve Uniswap Router to Spend WETH
    approve_txn = weth_contract.functions.approve(
        UNISWAP_V2_ROUTER,
        w3.to_wei(amount_weth, "ether")
    ).build_transaction({
        "from": account,
        "nonce": w3.eth.get_transaction_count(account),
        "gas": 100_000,
        "gasPrice": w3.eth.gas_price
    })

    signed_approve_txn = w3.eth.account.sign_transaction(approve_txn, private_key)
    w3.eth.send_raw_transaction(signed_approve_txn.rawTransaction)
    print(f"✅ Approved {amount_weth} WETH for Uniswap swap.")
    # ✅ Step 2: Fetch Current WETH Price
    weth_price = fetch_weth_price()
    print(f"ℹ️ Current WETH Price: ${weth_price} per WETH")

    # ✅ Step 3: Calculate Minimum Output with 1% Slippage Protection
    amount_out_min = 1  # Allowing the transaction to go through with minimal output constraints

    # ✅ Step 4: Swap WETH → USDC via Uniswap V2
    swap_txn = router_contract.functions.swapExactTokensForTokens(
        w3.to_wei(amount_weth, "ether"),  # Amount In
        amount_out_min,  # Minimum Amount Out (Price-protected)
        [WETH_ADDRESS, USDC_ADDRESS],  # Path WETH → USDC
        account,  # Recipient
        int(datetime.utcnow().timestamp()) + 60 * 5  # Deadline (5 min from now)
    ).build_transaction({
        "from": account,
        "nonce": w3.eth.get_transaction_count(account),# Next nonce
        "gas": 200_000,
        "gasPrice": w3.eth.gas_price
    })

    signed_swap_txn = w3.eth.account.sign_transaction(swap_txn, private_key)
    tx_hash = w3.eth.send_raw_transaction(signed_swap_txn.rawTransaction)
    print(f"✅ Swap Transaction Sent: {w3.to_hex(tx_hash)}")

    # ✅ Wait for transaction receipt
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    print(f"✅ Swap Confirmed! Hash: {receipt.transactionHash.hex()}")


def fetch_weth_price():
    """Fetches the current price of WETH in USDC using CoinGecko API."""
    url = "https://api.coingecko.com/api/v3/simple/price"
    params = {"ids": "weth", "vs_currencies": "usd"}
    response = requests.get(url, params=params)
    if response.status_code == 200:
        return response.json()["weth"]["usd"]
    else:
        raise Exception(f"Failed to fetch WETH price: {response.status_code}")

def main():
    """Main function to initialize web3, deploy the contract, and display balances."""
    load_dotenv()

    LOCAL_NODE_URL = "http://127.0.0.1:8545"
    w3 = Web3(Web3.HTTPProvider(LOCAL_NODE_URL))
    w3.middleware_onion.inject(geth_poa_middleware, layer=0)

    if not w3.is_connected():
        raise Exception("❌ Not connected to local Hardhat node!")

    print("✅ Connected to Hardhat node.")

    # ✅ Accounts
    accounts = w3.eth.accounts
    owner = accounts[0]
    private_keys = [
        os.getenv("PRIVATE_KEY_0"),
        os.getenv("PRIVATE_KEY_1"),
        os.getenv("PRIVATE_KEY_2")
    ]
    # ✅ Deploy contract
    contract = deploy_contract(w3, owner)

    # ✅ Display Balances Before Swap
    display_account_balances(w3, accounts)


    # ✅ Wrap ETH to WETH
    wrap_eth(accounts[0], 50)
    wrap_eth(accounts[1], 50)
    wrap_eth(accounts[2], 50)


    # ✅ Swap 10 WETH for USDC using Uniswap V2 (with price safety)
    for i in range(3):
       swap_weth_to_usdc(w3, accounts[i], 50, private_keys[i])

    # ✅ Display Balances After Swap
    display_account_balances(w3, accounts)

if __name__ == "__main__":
    main()
