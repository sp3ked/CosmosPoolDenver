from web3 import Web3
import json
import time

# Connect to Hardhat node
w3 = Web3(Web3.HTTPProvider("http://127.0.0.1:8545"))
if not w3.is_connected():
    raise Exception("Failed to connect to Hardhat node")

# Hardhat default account (first of 20 ETH accounts)
account = w3.eth.accounts[0]  # e.g., "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
private_key = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"  # Hardhat default private key for account[0]

# Contract addresses (replace with your deployed addresses)
pool_manager_address = "0x000000000004444c5dc75cB358380D2e3dE08A90"
position_manager_address = "0xYOUR_POSITION_MANAGER_ADDRESS"  # Replace with actual address
usdc_address = "0x078D782b760474a361dDA0AF3839290b0EF57AD6"
weth_address = "0x4200000000000000000000000000000000000006"

# Amounts
usdc_amount = w3.to_wei(100, "mwei")  # 100 USDC (6 decimals)
eth_amount = w3.to_wei(1, "ether")    # 1 ETH (18 decimals)

# Load ABIs (simplified; replace with actual ABIs from your deployment)
pool_manager_abi = json.loads('[{"function": "initialize", "inputs": [{"name": "key", "type": "tuple", "components": [{"name": "currency0", "type": "address"}, {"name": "currency1", "type": "address"}, {"name": "fee", "type": "uint24"}, {"name": "tickSpacing", "type": "int24"}, {"name": "hooks", "type": "address"}]}, {"name": "sqrtPriceX96", "type": "uint160"}], "stateMutability": "nonpayable"}]')  # Partial ABI
position_manager_abi = json.loads('[{"function": "multicall", "inputs": [{"name": "data", "type": "bytes[]"}], "stateMutability": "payable"}]')  # Partial ABI
erc20_abi = json.loads('[{"function": "approve", "inputs": [{"name": "spender", "type": "address"}, {"name": "amount", "type": "uint256"}], "stateMutability": "nonpayable"}]')  # Partial ABI

# Contract instances
pool_manager = w3.eth.contract(address=pool_manager_address, abi=pool_manager_abi)
position_manager = w3.eth.contract(address=position_manager_address, abi=position_manager_abi)
usdc = w3.eth.contract(address=usdc_address, abi=erc20_abi)

# Check balances
eth_balance = w3.eth.get_balance(account)
usdc_balance = usdc.functions.balanceOf(account).call()
print(f"ETH Balance: {w3.from_wei(eth_balance, 'ether')} ETH")
print(f"USDC Balance: {w3.from_wei(usdc_balance, 'mwei')} USDC")

if eth_balance < eth_amount:
    raise Exception("Insufficient ETH balance")
if usdc_balance < usdc_amount:
    raise Exception("Insufficient USDC balance")

# Approve USDC for PositionManager
approve_tx = usdc.functions.approve(position_manager_address, usdc_amount).build_transaction({
    "from": account,
    "nonce": w3.eth.get_transaction_count(account),
    "gas": 200000,
    "gasPrice": w3.to_wei("50", "gwei")
})
signed_approve = w3.eth.account.sign_transaction(approve_tx, private_key)
tx_hash = w3.eth.send_raw_transaction(signed_approve.rawTransaction)
w3.eth.wait_for_transaction_receipt(tx_hash)
print("USDC approved for PositionManager")

# Define PoolKey
pool_key = (
    usdc_address,         # currency0
    weth_address,         # currency1
    3000,                 # fee (0.3%)
    60,                   # tickSpacing (standard for 0.3% fee tier)
    "0x0000000000000000000000000000000000000000"  # hooks (none)
)

# Initialize pool (sqrtPriceX96 for 1:1 ratio, adjust as needed)
sqrt_price_x96 = 79228162514264337593543950336  # 1:1 price (sqrt(1) * 2^96)
init_tx = pool_manager.functions.initialize(pool_key, sqrt_price_x96).build_transaction({
    "from": account,
    "nonce": w3.eth.get_transaction_count(account),
    "gas": 500000,
    "gasPrice": w3.to_wei("50", "gwei")
})
signed_init = w3.eth.account.sign_transaction(init_tx, private_key)
init_hash = w3.eth.send_raw_transaction(signed_init.rawTransaction)
w3.eth.wait_for_transaction_receipt(init_hash)
print("Pool initialized")

# Multicall to add liquidity
mint_params = w3.eth.contract.encodeABI(
    fn_name="mintPosition",
    args=[pool_key, -6000, 6000, w3.to_wei(100, "ether"), usdc_amount, eth_amount, account, "0x"]
)
settle_usdc = w3.eth.contract.encodeABI(fn_name="settle", args=[usdc_address])
settle_weth = w3.eth.contract.encodeABI(fn_name="settle", args=[weth_address])
multicall_data = [mint_params, settle_usdc, settle_weth]

multicall_tx = position_manager.functions.multicall(multicall_data).build_transaction({
    "from": account,
    "nonce": w3.eth.get_transaction_count(account),
    "value": eth_amount,  # Send ETH
    "gas": 1000000,
    "gasPrice": w3.to_wei("50", "gwei")
})
signed_multicall = w3.eth.account.sign_transaction(multicall_tx, private_key)
multi_hash = w3.eth.send_raw_transaction(signed_multicall.rawTransaction)
w3.eth.wait_for_transaction_receipt(multi_hash)
print("Liquidity deposited successfully!")