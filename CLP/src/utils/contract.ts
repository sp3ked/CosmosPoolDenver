import { ethers, Signer, utils } from "ethers";
import contractABI from "../contracts/LiquidityMatchingABI.json";
import config from "../config.json"; // Import the configuration file

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] | undefined; }) => Promise<any>;
      on: (event: string, callback: any) => void;
      removeListener: (event: string, callback: any) => void;
      removeAllListeners: (event: string) => void;
    };
  }
}

const CONTRACT_ADDRESS = config.contractAddress; // Fetch contract address from config
const WETH_ADDRESS = "0x4200000000000000000000000000000000000006"; // WETH token contract

// ✅ Function to approve WETH spending
export const approveWETH = async (amount: number): Promise<boolean> => {
    try {
        if (!window.ethereum) {
            throw new Error("Ethereum object not found");
        }

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        
        // Use the correct ABI for ERC20/WETH token
        const wethABI = [
            // ERC20 approve function
            {
                "constant": false,
                "inputs": [
                    {
                        "name": "spender",
                        "type": "address"
                    },
                    {
                        "name": "amount",
                        "type": "uint256"
                    }
                ],
                "name": "approve",
                "outputs": [
                    {
                        "name": "",
                        "type": "bool"
                    }
                ],
                "payable": false,
                "stateMutability": "nonpayable",
                "type": "function"
            }
        ];
        
        const wethContract = new ethers.Contract(WETH_ADDRESS, wethABI, signer);
        
        console.log(`Approving ${amount} WETH for contract at ${CONTRACT_ADDRESS}`);
        const amountInWei = utils.parseUnits(amount.toString(), 18);
        const tx = await wethContract.approve(CONTRACT_ADDRESS, amountInWei);
        console.log("Approval transaction sent:", tx.hash);
        
        const receipt = await tx.wait();
        console.log("Approval confirmed in block:", receipt.blockNumber);

        return true;
    } catch (error) {
        console.error("WETH approval error:", error);
        return false;
    }
};

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
    if (amount <= 0) {
        throw new Error("Amount must be greater than zero");
    }
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