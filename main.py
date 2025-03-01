import requests
from web3 import Web3
import json
import os
from dotenv import load_dotenv
from eth_account import Account
from eth_account.signers.local import LocalAccount
from web3.middleware import construct_sign_and_send_raw_middleware
from wrap import wrap_eth, get_weth_balance
from eth_utils import to_checksum_address

load_dotenv()

# Load environment variables
ALCHEMY_URL = os.getenv("ALCHEMY_URL")
INFURA_URL = os.getenv("INFURA_URL")
PRIVATE_KEY = os.getenv("PRIVATE_KEY")
UNISCAN_KEY = os.getenv("UNISCAN_KEY")

# Web3 connection
LOCAL_NODE_URL = "http://127.0.0.1:8545"
w3 = Web3(Web3.HTTPProvider(LOCAL_NODE_URL))

if not w3.is_connected():
    raise Exception("Connection to local Hardhat node failed!")

# Load account from private key
account: LocalAccount = Account.from_key(PRIVATE_KEY)
accounts = w3.eth.accounts

# Inject middleware for signing transactions
w3.middleware_onion.add(construct_sign_and_send_raw_middleware(account))

# USDC contract setup
USDC_CONTRACT_ADDRESS = "0x078D782b760474a361dDA0AF3839290b0EF57AD6"
USDC_ABI = '[{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"}]'

usdc_contract = w3.eth.contract(address=to_checksum_address(USDC_CONTRACT_ADDRESS), abi=json.loads(USDC_ABI))

def display_balances():
    """Displays balances of the first three accounts in the Hardhat node."""
    print("Connected to local Hardhat node")
    print(f"Your hot wallet address is {account.address}")

    for i in range(3):
        print(f"Account {i}: {accounts[i]}")
        print(f"\t ETH Balance: {w3.from_wei(w3.eth.get_balance(accounts[i]), 'ether')} ETH")
        print(f"\t WETH Balance: {get_weth_balance(accounts[i])} WETH")
        print(f"\t USDC Balance: {usdc_contract.functions.balanceOf(accounts[i]).call() / 10 ** 6} USDC")

def main():
    """Runs the balance display function."""
    display_balances()

if __name__ == "__main__":
    main()
