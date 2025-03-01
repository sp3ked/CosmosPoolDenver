import os
from dotenv import load_dotenv
from web3 import Web3
from eth_utils import to_checksum_address
from wrap import wrap_eth, get_weth_balance  # Import from wrap.py

load_dotenv()

# Local Hardhat node (fork)
LOCAL_NODE_URL = "http://127.0.0.1:8545"
w3 = Web3(Web3.HTTPProvider(LOCAL_NODE_URL))

if not w3.is_connected():
    print("Connection failed!")
    exit()

print("Connected to local Hardhat fork!")

# Hardhat accounts
accounts = w3.eth.accounts
print(f"Account 0 ETH Balance: {w3.from_wei(w3.eth.get_balance(accounts[0]), 'ether')} ETH")
print(f"Account 1 ETH Balance: {w3.from_wei(w3.eth.get_balance(accounts[1]), 'ether')} ETH")
print(f"Account 2 ETH Balance: {w3.from_wei(w3.eth.get_balance(accounts[2]), 'ether')} ETH")

# ==== WRAP 100 ETH → WETH FOR ACCOUNTS[0], [1], [2] ====

"""
print("\n--- WETH BALANCES BEFORE WRAPPING ---")
for i in range(3):
    print(f"Account {i} WETH: {get_weth_balance(accounts[i])} WETH")
"""
# Wrap ETH into WETH

for i in range(3):
    wrap_eth(accounts[i], 10)


# print("\n--- WETH BALANCES AFTER WRAPPING ---")
print("WETH BALANCES")
for i in range(3):
    print(f"Account {i} WETH: {get_weth_balance(accounts[i])} WETH")

# now that we have converted ETH to wETh we can now work on swapping wETH to USDC via uniswap basic protocols

from eth_utils import to_checksum_address

# Uniswap V2 Router & Token Addresses (Change if needed)
UNISWAP_V2_ROUTER = to_checksum_address("0x284f11109359a7e1306c3e447ef14d38400063ff")  # Uniswap V2 Router Address
WETH_ADDRESS = to_checksum_address("0x4200000000000000000000000000000000000006")  # WETH Address
USDC_ADDRESS = to_checksum_address("0x078D782b760474a361dDA0AF3839290b0EF57AD6")  # USDC Address

# Minimal Uniswap V2 Router ABI
uniswap_v2_abi = [
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
]

# Minimal ERC20 ABI for Approvals & Balance Checking
erc20_abi = [
    {
        "constant": False,
        "inputs": [{"name": "spender", "type": "address"}, {"name": "amount", "type": "uint256"}],
        "name": "approve",
        "outputs": [{"name": "", "type": "bool"}],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": True,
        "inputs": [{"name": "owner", "type": "address"}],
        "name": "balanceOf",
        "outputs": [{"name": "balance", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    }
]

# Initialize Contracts
router = w3.eth.contract(address=UNISWAP_V2_ROUTER, abi=uniswap_v2_abi)
weth_contract = w3.eth.contract(address=WETH_ADDRESS, abi=erc20_abi)
usdc_contract = w3.eth.contract(address=USDC_ADDRESS, abi=erc20_abi)

def get_token_balance(contract, account):
    """Fetch token balance (WETH or USDC)."""
    balance = contract.functions.balanceOf(account).call()

    return w3.from_wei(contract.functions.balanceOf(account).call(), "ether")

def approve_weth(account, amount):
    """Approve Uniswap Router to spend WETH."""
    nonce = w3.eth.get_transaction_count(account)  # ✅ Fetch the latest nonce
    print(f"Approving Uniswap Router to spend {amount} WETH from {account}...")

    tx = weth_contract.functions.approve(
        UNISWAP_V2_ROUTER, w3.to_wei(amount, "ether")
    ).build_transaction({
        "from": account,
        "gas": 100000,
        "gasPrice": w3.eth.gas_price,
        "nonce": nonce,  # ✅ Use latest nonce
    })

    tx_hash = w3.eth.send_transaction(tx)
    w3.eth.wait_for_transaction_receipt(tx_hash)
    print(f"Approval Complete! TX: {tx_hash.hex()}\n")


def swap_weth_for_usdc(account, amount_weth):
    """Swap WETH for USDC using Uniswap V2 (simplest way)."""
    nonce = w3.eth.get_transaction_count(account)  # ✅ Fetch the latest nonce
    print(f"Swapping {amount_weth} WETH → USDC from {account}...")

    txn = router.functions.swapExactTokensForTokens(
        w3.to_wei(amount_weth, "ether"),
        0,  # No slippage control (for testing)
        [WETH_ADDRESS, USDC_ADDRESS],  # Path: WETH → USDC
        account,
        w3.eth.get_block("latest")["timestamp"] + 600  # Deadline (10 min)
    ).build_transaction({
        "from": account,
        "gas": 200000,
        "gasPrice": w3.eth.gas_price,
        "nonce": nonce,  # ✅ Use latest nonce
    })

    tx_hash = w3.eth.send_transaction(txn)
    w3.eth.wait_for_transaction_receipt(tx_hash)
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    print(f"Swap Complete! TX: {tx_hash.hex()} | Status: {receipt.status}\n")

def check_weth_allowance(account):
    allowance = weth_contract.functions.balanceOf(UNISWAP_V2_ROUTER).call()
    print(f"Allowance for Router: {w3.from_wei(allowance, 'ether')} WETH")

# ==== PRINT BALANCES BEFORE SWAP ====
print("\n--- BALANCES BEFORE SWAP ---")
for i in range(3):
    print(f"Account {i} WETH: {get_token_balance(weth_contract, accounts[i])} WETH")
    print(f"Account {i} USDC: {get_token_balance(usdc_contract, accounts[i])} USDC")

# ==== APPROVE & SWAP FOR ACCOUNTS[0], [1], [2] ====
for i in range(3):
    try:
        approve_weth(accounts[i], 100)
        check_weth_allowance(accounts[1])
        swap_weth_for_usdc(accounts[i], 100)
    except:
        print(f"error in: {i}")

# ==== PRINT BALANCES AFTER SWAP ====
print("\n--- BALANCES AFTER SWAP ---")
for i in range(3):
    print(f"Account {i} WETH: {get_token_balance(weth_contract, accounts[i])} WETH")
    print(f"Account {i} USDC: {get_token_balance(usdc_contract, accounts[i])} USDC")

