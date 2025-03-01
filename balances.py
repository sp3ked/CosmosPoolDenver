from web3 import Web3
from eth_utils import to_checksum_address
import json

# Initialize Web3 connection (replace with your node URL)
w3 = Web3(Web3.HTTPProvider("http://127.0.0.1:8545"))  # Local Hardhat node

# Check connection
if not w3.is_connected():
    raise RuntimeError("Failed to connect to the node!")

# USDC contract address and ABI
USDC_ADDRESS = to_checksum_address("0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48")
USDC_ABI = [{"inputs":[{"internalType":"address","name":"implementationContract","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":False,"inputs":[{"indexed":False,"internalType":"address","name":"previousAdmin","type":"address"},{"indexed":False,"internalType":"address","name":"newAdmin","type":"address"}],"name":"AdminChanged","type":"event"},{"anonymous":False,"inputs":[{"indexed":False,"internalType":"address","name":"implementation","type":"address"}],"name":"Upgraded","type":"event"},{"stateMutability":"payable","type":"fallback"},{"inputs":[],"name":"admin","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"newAdmin","type":"address"}],"name":"changeAdmin","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"implementation","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"newImplementation","type":"address"}],"name":"upgradeTo","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newImplementation","type":"address"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"upgradeToAndCall","outputs":[],"stateMutability":"payable","type":"function"}]

# Address to check
ADDRESS_TO_CHECK = to_checksum_address("0x078D782b760474a361dDA0AF3839290b0EF57AD6")

# Initialize USDC contract
usdc_contract = w3.eth.contract(address=USDC_ADDRESS, abi=USDC_ABI)

# Get USDC balance
def get_usdc_balance(address):
    """Get USDC balance in base units (e.g., 1 USDC = 1.0)."""
    raw_balance = usdc_contract.functions.balanceOf(address).call()
    return raw_balance / 1e6  # USDC has 6 decimals

# Fetch and print balance
usdc_balance = get_usdc_balance(ADDRESS_TO_CHECK)
print(f"USDC Balance for {ADDRESS_TO_CHECK}: {usdc_balance} USDC")