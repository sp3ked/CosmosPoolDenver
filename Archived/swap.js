const { ethers } = require("hardhat");

async function main() {
  // Replace with your addresses
  const routerAddress = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"; // Uniswap V2 Router
  const usdcAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"; // Mainnet USDC address
  const wethAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"; // Mainnet WETH address

  // Replace with your amounts
  const ethToSwap = ethers.utils.parseEther("1"); // 1 ETH to swap

  // Get the signer (your address with ETH)
  const [signer] = await ethers.getSigners();
  console.log("Using account:", signer.address);

  // Check ETH balance
  const ethBalance = await ethers.provider.getBalance(signer.address);
  console.log("ETH Balance:", ethers.utils.formatEther(ethBalance));

  // Ensure the signer has enough ETH
  if (ethBalance.lt(ethToSwap)) {
    throw new Error("Insufficient ETH balance");
  }

  // Get the Router contract
  const Router = await ethers.getContractAt("IUniswapV2Router02", routerAddress);

  // Define the swap path (ETH → WETH → USDC)
  const path = [wethAddress, usdcAddress];

  // Define the deadline (10 minutes from now)
  const deadline = Math.floor(Date.now() / 1000) + 60 * 10;

  // Swap ETH for USDC
  const txSwap = await Router.connect(signer).swapExactETHForTokens(
    0, // Minimum amount of USDC to receive (slippage tolerance)
    path, // Swap path
    signer.address, // Recipient of the USDC
    deadline, // Transaction deadline
    { value: ethToSwap } // Send ETH with the transaction
  );

  await txSwap.wait();
  console.log("Swapped ETH for USDC successfully!");

  // Check USDC balance
  const usdc = await ethers.getContractAt("IERC20", usdcAddress);
  const usdcBalance = await usdc.balanceOf(signer.address);
  console.log("USDC Balance:", ethers.utils.formatUnits(usdcBalance, 6));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });