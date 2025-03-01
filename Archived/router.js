const { ethers } = require("hardhat");

async function main() {
  // Replace with your addresses
  const poolManagerAddress = "0x000000000004444c5dc75cB358380D2e3dE08A90"; // PoolManager address
  const usdcAddress = "0x078D782b760474a361dDA0AF3839290b0EF57AD6"; // USDC address
  const wethAddress = "0x4200000000000000000000000000000000000006"; // WETH address

  // Replace with your amounts
  const usdcAmount = ethers.utils.parseUnits("100", 6); // 100 USDC (6 decimals)
  const ethAmount = ethers.utils.parseEther("1");       // 1 ETH (18 decimals)

  // Get the signer (your address with ETH and USDC)
  const [signer] = await ethers.getSigners();
  console.log("Using account:", signer.address);

  // Check ETH and USDC balances
  const ethBalance = await ethers.provider.getBalance(signer.address);
  console.log("ETH Balance:", ethers.utils.formatEther(ethBalance));

  const usdc = await ethers.getContractAt("IERC20", usdcAddress);
  const usdcBalance = await usdc.balanceOf(signer.address);
  console.log("USDC Balance:", ethers.utils.formatUnits(usdcBalance, 6));

  // Ensure the signer has enough ETH and USDC
  if (ethBalance.lt(ethAmount)) {
    throw new Error("Insufficient ETH balance");
  }
  if (usdcBalance.lt(usdcAmount)) {
    throw new Error("Insufficient USDC balance");
  }

  // Approve the PoolManager to spend USDC
  await usdc.connect(signer).approve(poolManagerAddress, usdcAmount);
  console.log("USDC approved for PoolManager");

  // Define the PoolKey
  const poolKey = {
    currency0: usdcAddress,
    currency1: wethAddress,
    fee: 3000, // 0.3% fee tier
    hooks: ethers.constants.AddressZero, // No hooks
  };

  // Get the PoolManager contract
  const PoolManager = await ethers.getContractAt("PoolManager", poolManagerAddress);

  // Deposit liquidity
  const tx = await PoolManager.connect(signer).modifyPosition(
    poolKey,
    {
      tickLower: -6000, // Lower tick
      tickUpper: 6000,  // Upper tick
      liquidityDelta: ethers.utils.parseUnits("100", 18), // 100 liquidity
    },
    { value: ethAmount } // Send ETH with the transaction
  );

  await tx.wait();
  console.log("Liquidity deposited successfully!");

  // Settle the tokens
  await PoolManager.connect(signer).settle(usdcAddress);
  await PoolManager.connect(signer).settle(wethAddress);
  console.log("Tokens settled successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });