import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotification } from "../context/NotificationContext";
import { depositUSDC, depositWETH, approveWETH } from "../utils/contract";

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

  const isWalletConnected = (): boolean => {
    return window.ethereum && (window.ethereum as any).selectedAddress ? true : false;
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
    // First check if wallet is connected
    if (!isWalletConnected()) {
      showNotification(
        "warning", 
        "Please connect your wallet before adding liquidity to this pool.",
        "Wallet Required"
      );
      onClose(); // Close the modal
      return;
    }

    if (!selectedSide || !amount || parseFloat(amount) <= 0) {
      showNotification("warning", "Enter a valid deposit amount", "Invalid Input");
      return;
    }

    const depositAmount = parseFloat(amount);
    let success = false;

    try {
      if (selectedSide === "tokenA" && tokenA === "ETH") {
        success = await depositWETH(depositAmount);
      } else if (selectedSide === "tokenB" && tokenB === "ETH") {
        success = await depositWETH(depositAmount);
      } else {
        success = await depositUSDC(depositAmount);
      }

      if (success) {
        showNotification("success", `Deposited ${depositAmount} ${selectedSide === "tokenA" ? tokenA : tokenB}`, "Deposit Successful");
        setAmount(""); // Reset input field
        simulateMatchingProcess(); // Simulate the match status UI
      } else {
        showNotification("error", "Transaction failed", "Deposit Failed");
      }
    } catch (error) {
      console.error("Deposit failed:", error);
      showNotification("error", "Transaction failed. Please try again.", "Deposit Error");
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
      }
    }, 500);
  };

  if (!isOpen || !pool) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-gray-900 border border-blue-900/50 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Single-Sided Deposit: {pool.tokenA}/{pool.tokenB}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        </div>

        {/* Token Selection */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSideSelect("tokenA")}
            className={`relative p-6 rounded-lg border-2 transition-colors ${
              selectedSide === "tokenA" ? "border-blue-500 bg-blue-900/30" : "border-blue-900/50 bg-blue-900/20 hover:border-blue-500/50"
            }`}
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-2">{pool.tokenA}</div>
              <div className="text-sm text-gray-400">Volatile Token</div>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSideSelect("tokenB")}
            className={`relative p-6 rounded-lg border-2 transition-colors ${
              selectedSide === "tokenB" ? "border-blue-500 bg-blue-900/30" : "border-blue-900/50 bg-blue-900/20 hover:border-blue-500/50"
            }`}
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-2">{pool.tokenB}</div>
              <div className="text-sm text-gray-400">Stable Token</div>
            </div>
          </motion.button>
        </div>

        {/* Amount Input */}
        <div className="bg-black/30 rounded-lg p-4 border border-blue-900/50">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-400">Amount to deposit:</span>
          </div>
          <div className="flex items-center">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.0"
              className="bg-transparent text-xl w-full focus:outline-none text-white"
            />
            <span className="text-lg font-medium text-white">
              {selectedSide === "tokenA" ? pool.tokenA : pool.tokenB}
            </span>
          </div>
        </div>

        {/* Match Status */}
        <div className="mt-4">
          <p className="text-gray-400">Match Status</p>
          <div className="relative w-full h-2 bg-gray-700 rounded-full">
            <div className="absolute h-2 bg-blue-500 rounded-full" style={{ width: `${matchProgress}%` }}></div>
          </div>
          <p className="text-gray-300 mt-2">{matchStatus}</p>
        </div>

        {/* Confirm Deposit Button */}
        <div className="flex justify-end gap-4 mt-6">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAddLiquidity}
            disabled={!amount || parseFloat(amount) <= 0}
            className={`px-6 py-3 text-white font-medium rounded-lg ${
              !amount || parseFloat(amount) <= 0 
                ? "bg-gray-600 cursor-not-allowed" 
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            Confirm Deposit
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default AddLiquidityModal;