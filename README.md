# Cosmos Pool

Welcome to Cosmos Pool! This project aims to solve one of the key obstacles in Concentrated Liquidity Market Makers (CLMMs): the requirement for users to provide liquidity with tokens on both sides of a trading pair within a specific price range. Our solution enables single-token deposits by matching users with complementary liquidity providers, potentially offering higher percentage gains compared to traditional Constant Function Market Makers (CFMMs) while managing risks akin to single-sided CFMMs.  Built for **Unichain**, the project leverages Uniswap's liquidity formulas and integrates with Uniswap-style pools for seamless token management.


# Cosmos Pool Liquidity Matching Mechanism:

Users deposit a single token (e.g., USDC or WETH) into a smart contract.
The system matches users with complementary providers (e.g., a USDC depositor with a WETH depositor).
Using the Uniswap L3 Formula for liquidity matching and calculate the liquidity.
We then deposit the tokens in the Uniswap liquidity pool. 

# Repository Structure

### **Smart Contracts**
- **`LiquidityManager.sol`**: Core smart contract for handling deposits, liquidity matching, and withdrawals.
  - Key Functions:
    - `depositUSDC(uint256 amount)`: Deposit USDC for matching.
    - `depositWETH(uint256 amount)`: Deposit WETH for matching.
    - `triggerLiquidityMatching(uint256 amountUSDC, uint256 amountWETH)`: Match and provide liquidity (owner-only).
    - `withdrawAndDistribute()`: Withdraw liquidity and return funds (owner-only, after 10 minutes).
  - Events: `UsdcDeposited`, `WethDeposited`, `LiquidityMatched`, `MatchingTriggered`, `WithdrawAndDistribute`.
- **`MockNonFungibleToken.sol`**: Mock implementation of a non-fungible position manager for testing liquidity provision.
  - Key Functions:
    - `mint(...)`: Mints an NFT representing a liquidity position (returns hardcoded values for testing).
    - `withdrawTokens(address token, address to)`: Transfers tokens back to the caller (mock implementation).

### **Python Scripts**
- **`lp-provision.py`**: End-to-end testing of liquidity provision, including contract deployment, deposits, matching, and withdrawals.
- **`main.py`**: Utility script for checking account balances on a local Hardhat node.

---

## Supported Tokens
- **WETH (Wrapped Ether)**: `0x4200000000000000000000000000000000000006`
- **USDC**: `0x078D782b760474a361dDA0AF3839290b0EF57AD6`

---

## How It Works

### **1. Deposits**
- Users call `depositUSDC` or `depositWETH`, transferring tokens to the `LiquidityManager` contract.

### **2. Matching**
- The owner triggers `triggerLiquidityMatching`, which calculates matched amounts based on available deposits and a hardcoded price range (±10% of the current WETH price).
- The system uses **Uniswap's liquidity formula** to calculate the optimal liquidity provision.

### **3. Liquidity Provision**
- Tokens are approved and minted into a liquidity position via the **mock position manager**.
- The liquidity is deposited into a **Uniswap V3-style pool** on **Unichain**.

### **4. Withdrawal**
- After a delay (10 minutes), `withdrawAndDistribute` returns the original deposit amounts to users.

---

## Integration with Unichain and Uniswap

### **Unichain Deployment**
- The project is deployed on **Unichain**, a blockchain optimized for DeFi applications.
- Unichain's compatibility with Ethereum allows seamless integration with Uniswap-style contracts and tools.

### **Uniswap Integration**
- **Liquidity Formula**: The project uses Uniswap's concentrated liquidity formula to calculate the optimal amount of liquidity to provide within a specified price range.
  - Formula: 
    \[
    L = \frac{\Delta y}{\sqrt{P} - \sqrt{P_{lower}}}
    \]
    Where:
    - \( L \) = Liquidity
    - \( \Delta y \) = Amount of token Y
    - \( P \) = Current price
    - \( P_{lower} \) = Lower price bound
- **Liquidity Provision**: The system interacts with Uniswap's `NonfungiblePositionManager` to mint liquidity positions and deposit tokens into the pool.
