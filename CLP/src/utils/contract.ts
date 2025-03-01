import { ethers, Signer, utils } from "ethers";
import contractABI from "../contracts/LiquidityMatchingABI.json";

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

  export const depositUSDC = async (amount: number): Promise<boolean> => {
    try {
      const contract = await getContract();
      if (!contract) return false;
  
      const amountInWei = utils.parseUnits(amount.toString(), 6); // Convert to USDC decimals (6)
      
      const tx = await contract.depositUSDC(amountInWei);
      await tx.wait(); // Wait for transaction to be confirmed
  
      console.log("✅ USDC deposited:", amount);
      return true;
    } catch (error) {
      console.error("❌ Failed to deposit USDC:", error);
      return false;
    }
  };

  export const depositWETH = async (amount: number): Promise<boolean> => {
    try {
      const contract = await getContract();
      if (!contract) return false;
  
      const amountInWei = utils.parseUnits(amount.toString(), 18); // Convert to 18 decimals for WETH
  
      const tx = await contract.depositWETH(amountInWei);
      await tx.wait(); // Wait for transaction confirmation
  
      console.log("✅ WETH deposited:", amount);
      return true;
    } catch (error) {
      console.error("❌ Failed to deposit WETH:", error);
      return false;
    }
  };