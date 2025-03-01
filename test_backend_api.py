import os
import json
import math
import requests
from datetime import datetime
from decimal import Decimal, getcontext
from flask import Flask, jsonify

# Increase precision for decimal calculations (if needed)
getcontext().prec = 100

BASE_URL = "http://127.0.0.1:5000"


def deploy_contracts():
    print("=== Deploying Contracts ===")
    response = requests.post(f"{BASE_URL}/deploy")
    data = response.json()
    if "error" in data:
        raise Exception(data["error"])
    print(
        f"INFO: Contracts deployed. Mock PM at: {data['mock_pm_address']}, LiquidityMatching at: {data['liquidity_contract_address']}"
    )
    return data


def deposit_tokens(token_type, amount):
    print(f"=== Depositing {amount} {token_type} ===")
    payload = {"token_type": token_type, "amount": amount}
    response = requests.post(f"{BASE_URL}/deposit", json=payload)
    data = response.json()
    if "error" in data:
        raise Exception(data["error"])
    print(f"INFO: {data['message']}")
    return data


def print_balances():
    print("\n========== CURRENT BALANCES ==========")
    response = requests.get(f"{BASE_URL}/balances")
    data = response.json()
    print(json.dumps(data, indent=2))
    print("========================================\n")
    return data


def execute_liquidity_matching():
    print("=== Executing Liquidity Matching ===")
    response = requests.post(f"{BASE_URL}/match")
    data = response.json()
    if "error" in data:
        print("ERROR during liquidity matching:", data["error"])
    else:
        print(
            f"INFO: Liquidity matching executed. Transaction hash: {data['transaction_hash']}"
        )
        print("Events:", json.dumps(data.get("events", {}), indent=2))
    return data


def withdraw_and_distribute():
    print("=== Initiating Withdrawal and Distribution ===")
    response = requests.post(f"{BASE_URL}/withdraw")
    data = response.json()
    if "error" in data:
        print("ERROR during withdrawal:", data["error"])
    else:
        print(
            f"INFO: Withdrawal executed. Transaction hash: {data['transaction_hash']}"
        )
    return data


def main():
    # Deploy contracts
    deploy_contracts()

    # Make deposits
    deposit_tokens("WETH", 0.2)
    deposit_tokens("USDC", 1)

    print("=== Balances BEFORE Liquidity Matching ===")
    print_balances()

    # Execute liquidity matching
    execute_liquidity_matching()

    print("=== Balances AFTER Liquidity Matching ===")
    print_balances()

    # Display initial holdings (same as balances)
    print("=== Balances BEFORE Withdrawal ===")
    print_balances()

    # Call withdrawal and distribution
    withdraw_and_distribute()

    print("=== Balances AFTER Withdrawal ===")
    print_balances()


if __name__ == "__main__":
    main()
