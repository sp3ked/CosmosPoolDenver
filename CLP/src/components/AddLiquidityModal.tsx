import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotification } from "../context/NotificationContext";
import { depositUSDC, depositWETH } from "../utils/contract";

interface Pool {
  id: string;
  tokenA: string;
  tokenB: string;
  tvl: string;
  volume24h: string;
  apr: string;
}

interface AddLiquidityModalProps {
  isOpen: boolean;
  onClose: () => void;
  pool: Pool | null;
}

const AddLiquidityModal: React.FC<AddLiquidityModalProps> = ({ isOpen, onClose, pool }) => {
  const { showNotification } = useNotification();
  const [selectedSide, setSelectedSide] = useState<"tokenA" | "tokenB" | null>(null);
  const [amount, setAmount] = useState("");
  const [tokenA, setTokenA] = useState("");
  const [tokenB, setTokenB] = useState("");
  const [matchProgress, setMatchProgress] = useState(0);
  const [matchStatus, setMatchStatus] = useState("Waiting for match");
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);

  // Check if wallet is connected (you can use any method that works in your app)
  const isWalletConnected = (): boolean => {
    // Check for wallet connection - can be adapted to your specific wallet implementation
    return window.ethereum && window.ethereum.selectedAddress ? true : false;
  };

  useEffect(() => {
    if (pool) {
      setTokenA(pool.tokenA);
      setTokenB(pool.tokenB);
    }
  }, [pool]);

  const handleSideSelect = (side: "tokenA" | "tokenB") => {
    setSelectedSide(side);
    setAmount("");
  };

  const handleAddLiquidity = async () => {
    if (!isWalletConnected()) {
      showNotification(
        "warning", 
        "Please connect your wallet before adding liquidity to this pool.",
        "Wallet Required"
      );
      onClose();
      return;
    }

    if (!selectedSide || !amount || parseFloat(amount) <= 0) {
      showNotification("warning", "Enter a valid deposit amount", "Invalid Input");
      return;
    }

    setIsProcessing(true);
    const depositAmount = parseFloat(amount);

    try {
      showNotification("info", "Transaction initiated. Please confirm in your wallet.", "Transaction Pending");
      
      let txHash;
      if (selectedSide === "tokenA" && tokenA === "ETH") {
        txHash = await depositWETH(depositAmount);
      } else if (selectedSide === "tokenB" && tokenB === "ETH") {
        txHash = await depositWETH(depositAmount);
      } else {
        txHash = await depositUSDC(depositAmount);
      }

      if (txHash) {
        setTransactionHash(txHash);
        showNotification(
          "success", 
          `Deposited ${depositAmount} ${selectedSide === "tokenA" ? tokenA : tokenB}`, 
          "Deposit Successful"
        );
        setAmount("");
        simulateMatchingProcess();
      } else {
        throw new Error("Transaction failed");
      }
    } catch (error: any) {
      console.error("Deposit failed:", error);
      showNotification(
        "error", 
        error.message || "Transaction failed. Please try again.", 
        "Deposit Error"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const simulateMatchingProcess = () => {
    let progress = 0;
    setMatchStatus("Match pending...");

    const interval = setInterval(() => {
      progress += 10;
      setMatchProgress(progress);

      if (progress >= 100) {
        clearInterval(interval);
        setMatchStatus("Match complete!");
        showNotification(
          "success", 
          "Your liquidity is now active and earning fees!", 
          "Pool Join Successful"
        );
      }
    }, 500);
  };

  if (!isOpen || !pool) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-gradient-to-b from-blue-900/30 to-indigo-900/30 backdrop-blur-md border border-blue-500/30 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-[0_0_15px_rgba(59,130,246,0.3)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with glowing text */}
        <div className="flex justify-between items-center mb-7">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent drop-shadow-[0_0_5px_rgba(59,130,246,0.5)]">
            Single-Sided Deposit: {pool.tokenA}/{pool.tokenB}
          </h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white transition-colors cursor-pointer hover:bg-blue-900/20 p-2 rounded-full"
          >
            ✕
          </button>
        </div>

        {/* Token Selection with more contrast between selected/non-selected */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSideSelect("tokenA")}
            className={`relative p-6 rounded-xl border transition-all duration-300 ${
              selectedSide === "tokenA" 
                ? "border-blue-500 bg-blue-600/20 shadow-[0_0_10px_rgba(59,130,246,0.4)]" 
                : "border-blue-800/30 bg-blue-900/5 backdrop-blur-sm hover:border-blue-700/30 opacity-60"
            }`}
          >
            <div className="text-center">
              <div className={`text-2xl font-bold mb-2 ${selectedSide === "tokenA" ? "text-white" : "text-white/70"}`}>
                {pool.tokenA}
              </div>
              <div className={`text-sm ${selectedSide === "tokenA" ? "text-blue-200/70" : "text-blue-200/40"}`}>
                Volatile Token
              </div>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSideSelect("tokenB")}
            className={`relative p-6 rounded-xl border transition-all duration-300 ${
              selectedSide === "tokenB" 
                ? "border-blue-500 bg-blue-600/20 shadow-[0_0_10px_rgba(59,130,246,0.4)]" 
                : "border-blue-800/30 bg-blue-900/5 backdrop-blur-sm hover:border-blue-700/30 opacity-60"
            }`}
          >
            <div className="text-center">
              <div className={`text-2xl font-bold mb-2 ${selectedSide === "tokenB" ? "text-white" : "text-white/70"}`}>
                {pool.tokenB}
              </div>
              <div className={`text-sm ${selectedSide === "tokenB" ? "text-blue-200/70" : "text-blue-200/40"}`}>
                Stable Token
              </div>
            </div>
          </motion.button>
        </div>

        {/* Glass input field */}
        <div className="bg-black/20 backdrop-blur-md rounded-xl p-4 border border-blue-500/30">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-blue-200/80">Amount to deposit:</span>
          </div>
          <div className="flex items-center">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.0"
              disabled={isProcessing}
              className="bg-transparent text-xl w-full focus:outline-none text-white"
            />
            <span className="text-lg font-medium text-blue-300">
              {selectedSide === "tokenA" ? pool.tokenA : selectedSide === "tokenB" ? pool.tokenB : ""}
            </span>
          </div>
        </div>

        {/* Match Status with glowing progress */}
        <div className="mt-6 bg-black/30 backdrop-blur-sm p-4 rounded-xl border border-blue-500/20">
          <p className="text-blue-200/80 mb-2">Match Status</p>
          <div className="relative w-full h-2 bg-blue-900/40 rounded-full overflow-hidden">
            <div 
              className="absolute h-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${matchProgress}%` }}
            ></div>
          </div>
          <p className="text-blue-100 mt-3 text-sm">{matchStatus}</p>
        </div>

        {/* Transaction hash display */}
        {transactionHash && (
          <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
            <p className="text-sm text-gray-300 mb-1">Transaction Hash:</p>
            <a 
              href={`https://etherscan.io/tx/${transactionHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-400 hover:text-blue-300 truncate block"
            >
              {transactionHash}
            </a>
          </div>
        )}

        {/* Confirm Deposit Button with animation */}
        <div className="flex justify-end gap-4 mt-6">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAddLiquidity}
            disabled={!selectedSide || !amount || parseFloat(amount) <= 0 || isProcessing}
            className={`relative inline-flex h-12 overflow-hidden rounded-xl p-[1px] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-950 ${
              !selectedSide || !amount || parseFloat(amount) <= 0 || isProcessing
                ? "opacity-50 cursor-not-allowed" 
                : ""
            }`}
          >
            <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#3B82F6_0%,#1E40AF_50%,#3B82F6_100%)]" />
            <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-xl bg-slate-950 px-8 py-1 text-base font-medium text-white backdrop-blur-3xl">
              {isProcessing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                "Confirm Deposit"
              )}
            </span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default AddLiquidityModal;