import { ethers, Signer, utils } from "ethers";
import contractABI from "../contracts/LiquidityMatchingABI.json";

const WETH_ABI = [
    "function deposit() external payable",
    "function transfer(address to, uint amount) returns (bool)",
    "function approve(address spender, uint256 amount) external returns (bool)"
];

const USDC_ABI = [
    "function transfer(address to, uint amount) returns (bool)",
    "function approve(address spender, uint256 amount) external returns (bool)"
];

const POOL_ABI = [
    "function depositSingle(address token, uint256 amount) external returns (bool)"
];

const WETH_ADDRESS = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"; // Mainnet WETH
const USDC_ADDRESS = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"; // Mainnet USDC
const POOL_ADDRESS = "0x1234567890123456789012345678901234567890"; // Example pool address

declare global {
  interface Window {
    // ethereum: any;
  }
}

const CONTRACT_ADDRESS = "0xc6e7DF5E7b4f2A278906862b61205850344D4e7d";

// Function to get a contract instance
export const getContract = async (): Promise<ethers.Contract | null> => {
  if (!window.ethereum) {
    alert("MetaMask is required to use this application.");
    return null;
  }

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);

  return contract;
};

// Connect Wallet
export const connectWallet = async (): Promise<{ address: string; signer: Signer } | null> => {
    if (!window.ethereum) {
      alert("MetaMask is required to use this application.");
      return null;
    }
  
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = await provider.getSigner();
      const accounts = await provider.send("eth_requestAccounts", []);
      return { address: accounts[0], signer };
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      return null;
    }
  };

const getProviderAndSigner = async () => {
    if (!window.ethereum) {
        throw new Error("No Ethereum wallet found");
    }

    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    return { provider, signer };
};

export const depositUSDC = async (amount: number): Promise<string> => {
    try {
        const { signer } = await getProviderAndSigner();
        const usdcContract = new ethers.Contract(USDC_ADDRESS, USDC_ABI, signer);
        const poolContract = new ethers.Contract(POOL_ADDRESS, POOL_ABI, signer);
        
        // USDC has 6 decimals
        const amountUSDC = ethers.utils.parseUnits(amount.toString(), 6);
        
        // Approve pool to spend USDC
        const approveTx = await usdcContract.approve(POOL_ADDRESS, amountUSDC);
        await approveTx.wait();
        
        // Deposit to pool
        const depositTx = await poolContract.depositSingle(USDC_ADDRESS, amountUSDC);
        const receipt = await depositTx.wait();
        
        return receipt.transactionHash;
    } catch (error) {
        console.error("Error depositing USDC:", error);
        throw error;
    }
};

export const depositWETH = async (amount: number): Promise<string> => {
    try {
        const { signer } = await getProviderAndSigner();
        const wethContract = new ethers.Contract(WETH_ADDRESS, WETH_ABI, signer);
        const poolContract = new ethers.Contract(POOL_ADDRESS, POOL_ABI, signer);
        
        // Convert amount to wei
        const amountWei = ethers.utils.parseEther(amount.toString());
        
        // First deposit ETH to get WETH
        const depositTx = await wethContract.deposit({ value: amountWei });
        await depositTx.wait();
        
        // Approve pool to spend WETH
        const approveTx = await wethContract.approve(POOL_ADDRESS, amountWei);
        await approveTx.wait();
        
        // Deposit to pool
        const depositPoolTx = await poolContract.depositSingle(WETH_ADDRESS, amountWei);
        const receipt = await depositPoolTx.wait();
        
        return receipt.transactionHash;
    } catch (error) {
        console.error("Error depositing WETH:", error);
        throw error;
    }
};