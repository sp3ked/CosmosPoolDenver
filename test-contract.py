import os
import json
from solcx import compile_files, install_solc
from web3 import Web3
from web3.middleware import geth_poa_middleware
from eth_utils import to_checksum_address
# Updated compilation section
CONTRACT_PATH = "LiquidityMatching.sol"

# Explicitly set base path for imports
BASE_PATH = os.path.abspath(".")

compiled_sol = compile_files(
    [CONTRACT_PATH],
    output_values=["abi", "bin"],
    solc_version="0.8.28",
    allow_paths=[BASE_PATH, os.path.join(BASE_PATH, "node_modules")],
    import_remappings=[
        "@openzeppelin/=node_modules/@openzeppelin/",
        "contracts/=contracts/"
    ],
    # Add this to see compilation errors
    # solc_extra_args=["--revert-strings", "strip"]
)

# After compilation check
contract_interface = compiled_sol.get(f"{CONTRACT_PATH}:LiquidityMatching")
if not contract_interface:
    raise ValueError("❌ Compilation failed - check Solidity errors")

abi = contract_interface["abi"]
bytecode = contract_interface["bin"]

print(f"ℹ️ Bytecode length: {len(bytecode)} characters")
# ----------------------------------------------------------------------
# 1. Web3 Connection to Local Hardhat Node
# ----------------------------------------------------------------------
LOCAL_NODE_URL = "http://127.0.0.1:8545"
w3 = Web3(Web3.HTTPProvider(LOCAL_NODE_URL))
w3.middleware_onion.inject(geth_poa_middleware, layer=0)

if not w3.is_connected():
    raise Exception("❌ Web3 not connected to local Hardhat node!")

print("✅ Connected to Hardhat node.")

# Accounts
accounts = w3.eth.accounts
owner = accounts[0]

# ----------------------------------------------------------------------
# 2. Deploy the Contract
# ----------------------------------------------------------------------
LiquidityMatching = w3.eth.contract(abi=abi, bytecode=bytecode)

# Pass constructor arguments for wETH and USDC addresses on Unichain Mainnet
weth_address = to_checksum_address("0x4200000000000000000000000000000000000006")
usdc_address = to_checksum_address("0x078D782b760474a361dDA0AF3839290b0EF57AD6")

tx_hash = LiquidityMatching.constructor(weth_address, usdc_address).transact({
    "from": owner,
    "gas": 3_000_000
})

tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
liquidity_matching_address = tx_receipt.contractAddress

print(f"🚀 Contract deployed at: {liquidity_matching_address}")
