import os
from dotenv import load_dotenv
from web3 import Web3
from eth_utils import to_checksum_address

load_dotenv()

# Connect to Ethereum node (Hardhat or Mainnet fork)
w3 = Web3(Web3.HTTPProvider("http://127.0.0.1:8545"))

if not w3.is_connected():
    raise Exception("Connection to node failed.")

# Minimal WETH ABI: deposit() + balanceOf()
weth_abi = [
    {
        "inputs": [],
        "name": "deposit",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "constant": True,
        "inputs": [{"name": "owner", "type": "address"}],
        "name": "balanceOf",
        "outputs": [{"name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    }
]

# WETH contract address
WETH_ADDRESS = to_checksum_address("0x4200000000000000000000000000000000000006")
weth_contract = w3.eth.contract(address=WETH_ADDRESS, abi=weth_abi)

def wrap_eth(account, amount_eth):
    """Wrap `amount_eth` of native ETH into WETH using deposit()."""
    print(f"Wrapping {amount_eth} ETH into WETH for {account}...")

    tx = weth_contract.functions.deposit().build_transaction({
        "from": account,
        "value": w3.to_wei(amount_eth, 'ether'),
        "gas": 150000,
        "gasPrice": w3.eth.gas_price,
        "nonce": w3.eth.get_transaction_count(account),
    })

    tx_hash = w3.eth.send_transaction(tx)
    w3.eth.wait_for_transaction_receipt(tx_hash)

    print(f"Transaction Hash: {tx_hash.hex()}")
    print("Done wrapping!\n")

def get_weth_balance(account):
    """Fetch WETH balance using `balanceOf()` from the WETH contract."""
    balance_wei = weth_contract.functions.balanceOf(account).call()
    return w3.from_wei(balance_wei, 'ether')

def main():
    """Main function to test wrapping and checking WETH balance."""
    account = w3.eth.accounts[1]  # Change this for testing a different account

    print(f"Initial WETH balance of {account}: {get_weth_balance(account)} WETH")
    wrap_eth(account, 1)  # Wrap 1 ETH → WETH
    print(f"New WETH balance of {account}: {get_weth_balance(account)} WETH")

# Only run when executed directly
if __name__ == "__main__":
    main()
