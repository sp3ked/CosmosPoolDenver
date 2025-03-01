import os
from web3 import Web3
from eth_utils import to_checksum_address, encode_hex, keccak

# Connect to the local Hardhat node
LOCAL_NODE_URL = "http://127.0.0.1:8545"
w3 = Web3(Web3.HTTPProvider(LOCAL_NODE_URL))

# Ensure connection
assert w3.is_connected(), "Connection to node failed!"

# USDC contract address
USDC_ADDRESS = to_checksum_address("0x078D782b760474a361dDA0AF3839290b0EF57AD6")

# Hardhat accounts
accounts = [
    to_checksum_address("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"),  # Account 0
    to_checksum_address("0x70997970C51812dc3A010C7d01b50e0d17dc79C8"),  # Account 1
    to_checksum_address("0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"),  # Account 2
]

# Amount to set: 150,000 USDC (USDC has 6 decimals)
amount_usdc = 150000 * (10 ** 11)
amount_hex = "0x" + format(amount_usdc, "064x")  # Convert to 32-byte hex


def get_usdc_balance_storage_slot(account):
    """
    Correctly computes the storage slot for an account's USDC balance.
    Follows Solidity's mapping storage pattern:

    storage_slot = keccak256(abi.encode(account, balanceMappingSlot))

    - balanceMappingSlot = 0 (since it's the first state variable)
    - account must be left-padded to 32 bytes
    """
    padded_account = account.lower().replace("0x", "").rjust(64, "0")  # 32-byte address
    balance_slot = int(0).to_bytes(32, "big").hex()  # Slot 0 as a 32-byte hex

    # Correct slot computation: keccak256(account || balance_slot)
    slot_hash = keccak(bytes.fromhex(padded_account + balance_slot))
    return encode_hex(slot_hash)


# Inject 150k USDC balance into each account
for account in accounts:
    storage_slot = get_usdc_balance_storage_slot(account)

    print(f"Setting 150,000 USDC for {account} at storage slot {storage_slot}")

    # Modify Hardhat's blockchain storage directly
    w3.provider.make_request("hardhat_setStorageAt", [USDC_ADDRESS, storage_slot, amount_hex])

    print(f"✔ Successfully assigned 150,000 USDC to {account}!\n")

# Verify balances after modification
usdc_abi = [
    {
        "constant": True,
        "inputs": [{"name": "owner", "type": "address"}],
        "name": "balanceOf",
        "outputs": [{"name": "balance", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function",
    }
]

usdc_contract = w3.eth.contract(address=USDC_ADDRESS, abi=usdc_abi)

print("\n--- FINAL USDC BALANCES ---")
for account in accounts:
    balance = usdc_contract.functions.balanceOf(account).call()
    print(f"{account}: {balance / 10**6} USDC")  # Convert from 6 decimals
