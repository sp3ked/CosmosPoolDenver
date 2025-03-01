# Cosmos Pool

Welcome to Cosmos Pool! This project aims to solve one of the key obstacles in Concentrated Liquidity Market Makers (CLMMs): the requirement for users to provide liquidity with tokens on both sides of a trading pair within a specific price range. Our solution enables single-token deposits by matching users with complementary liquidity providers, potentially offering higher percentage gains compared to traditional Constant Function Market Makers (CFMMs) while managing risks akin to single-sided CFMMs.

# Cosmos Pool Liquidity Matching Mechanism:

Users deposit a single token (e.g., USDC or WETH) into a smart contract.
The system matches users with complementary providers (e.g., a USDC depositor with a WETH depositor).
Using the Uniswap L3 Formula for liquidity matching and calculate the liquidity.
We then deposit the tokens in the Uniswap liquidity pool. 
Rewards are distributed via a fixed ratio (e.g., 60/40 favoring the volatile token provider).

# Repository Structure

LiquidityMatching.sol: Core smart contract for liquidity matching and CLMM integration.
lp-provision-testing.py: Python script for testing contract deployment, deposits, matching, and withdrawals.
main.py: Basic script for interacting with the local node and displaying balances.

LiquidityMatching.sol
The core smart contract that handles token deposits, liquidity matching, and reward distribution. Key functions include:
depositUSDC(uint256 amount): Allows users to deposit USDC.
depositWETH(uint256 amount): Allows users to deposit WETH.
triggerLiquidityMatching(uint256 amountUSDC, uint256 amountWETH): Triggers the liquidity matching process.
withdrawAndDistribute(): Withdraws funds from the pool and distributes rewards to users.

MockNonfungiblePositionManager.sol
A mock contract used for testing the liquidity provision process. It simulates the behavior of a Uniswap V3 Nonfungible Position Manager.

