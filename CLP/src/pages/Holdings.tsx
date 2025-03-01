import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DashNav from "../components/DashNav";
import SpaceBackground from "../components/backgrounds/spaceBg";
import { useNotification } from "../context/NotificationContext";

// Mock data interface based on the smart contract data structure
interface Deposit {
  depositId: string;
  pool: {
    tokenA: string;
    tokenB: string;
    apr: string;
  };
  token: 'volatile' | 'safer';
  amount: number;
  matched: boolean;
  matchedWith?: {
    address: string;
    amount: number;
  };
  timestamp: number;
  liquidityTokens?: number;
  completed?: boolean; // Added to track if the deposit is completed
  cancelReason?: string; // Added to indicate why a deposit was canceled or completed early
}

function Holdings() {
  const { showNotification } = useNotification();
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [loading, setLoading] = useState(true);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [selectedDeposit, setSelectedDeposit] = useState<Deposit | null>(null);
  const [timeLeft, setTimeLeft] = useState<Record<string, number>>({});
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');

  // Mock data to simulate user's deposits
  useEffect(() => {
    // This would be replaced with an actual contract call
    const mockDeposits: Deposit[] = [
      {
        depositId: "1",
        pool: {
          tokenA: "BTC",
          tokenB: "USDC",
          apr: "18.2%"
        },
        token: 'volatile',
        amount: 0.25,
        matched: true,
        matchedWith: {
          address: "0x8723...4982",
          amount: 4500
        },
        timestamp: Date.now() - (20 * 60 * 60 * 1000), // 20 hours ago
        liquidityTokens: 123.45,
        completed: false
      },
      {
        depositId: "2",
        pool: {
          tokenA: "ETH",
          tokenB: "USDC",
          apr: "12.4%"
        },
        token: 'volatile',
        amount: 1.5,
        matched: false,
        timestamp: Date.now() - (2 * 60 * 60 * 1000), // 2 hours ago,
        completed: false
      },
      {
        depositId: "3",
        pool: {
          tokenA: "ETH",
          tokenB: "USDC",
          apr: "12.4%"
        },
        token: 'safer',
        amount: 2000,
        matched: true,
        matchedWith: {
          address: "0x3452...7623",
          amount: 1.1
        },
        timestamp: Date.now() - (25 * 60 * 60 * 1000), // 25 hours ago
        liquidityTokens: 85.32,
        completed: true
      },
      {
        depositId: "4",
        pool: {
          tokenA: "SOL",
          tokenB: "USDT",
          apr: "21.7%"
        },
        token: 'volatile',
        amount: 5.75,
        matched: true,
        matchedWith: {
          address: "0xab12...7f42",
          amount: 275.5
        },
        timestamp: Date.now() - (30 * 24 * 60 * 60 * 1000), // 30 days ago
        liquidityTokens: 342.18,
        completed: true
      },
      {
        depositId: "5",
        pool: {
          tokenA: "ETH",
          tokenB: "DAI",
          apr: "15.8%"
        },
        token: 'volatile',
        amount: 3.2,
        matched: false,
        timestamp: Date.now() - (5 * 24 * 60 * 60 * 1000), // 5 days ago
        completed: true,
        cancelReason: "Unmatched after 5 days"
      }
    ];

    setTimeout(() => {
      setDeposits(mockDeposits);
      setLoading(false);
    }, 1000);
  }, []);

  // Filter deposits based on active tab
  const activeDeposits = deposits.filter(d => !d.completed);
  const completedDeposits = deposits.filter(d => d.completed);

  // Sort active deposits - unmatched first, then by time left
  const sortedActiveDeposits = [...activeDeposits].sort((a, b) => {
    // Unmatched deposits first
    if (!a.matched && b.matched) return -1;
    if (a.matched && !b.matched) return 1;
    
    // Then sort by timestamp (newer first for unmatched, older first for matched)
    if (!a.matched) return b.timestamp - a.timestamp;
    return a.timestamp - b.timestamp;
  });

  // Sort completed deposits - newest first
  const sortedCompletedDeposits = [...completedDeposits].sort((a, b) => 
    b.timestamp - a.timestamp
  );

  // Update the time left for each deposit every second
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const newTimeLeft: Record<string, number> = {};
      
      deposits.forEach(deposit => {
        const lockPeriod = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
        const unlockTime = deposit.timestamp + lockPeriod;
        const remaining = Math.max(0, unlockTime - now);
        newTimeLeft[deposit.depositId] = remaining;
      });
      
      setTimeLeft(newTimeLeft);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [deposits]);

  // Format time left as HH:MM:SS
  const formatTimeLeft = (ms: number) => {
    if (ms <= 0) return "00:00:00";
    
    const hours = Math.floor(ms / (60 * 60 * 1000));
    const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
    const seconds = Math.floor((ms % (60 * 1000)) / 1000);
    
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      seconds.toString().padStart(2, '0'),
    ].join(':');
  };

  // Handle withdrawal with notifications
  const handleWithdraw = (deposit: Deposit) => {
    setSelectedDeposit(deposit);
    setWithdrawModalOpen(true);
  };

  const confirmWithdraw = async () => {
    if (!selectedDeposit) return;
    
    try {
      // This would call the contract's withdraw function
      console.log(`Withdrawing deposit ${selectedDeposit.depositId}`);
      
      const isEarlyWithdrawal = !selectedDeposit.matched || 
        ((selectedDeposit.timestamp + 24 * 60 * 60 * 1000) > Date.now());
      
      // Mark the deposit as completed instead of removing it
      setDeposits(prev => prev.map(d => 
        d.depositId === selectedDeposit.depositId 
          ? {
              ...d, 
              completed: true, 
              cancelReason: isEarlyWithdrawal ? 
                (d.matched ? "Early withdrawal" : "Canceled by user") : 
                undefined
            } 
          : d
      ));
      
      setWithdrawModalOpen(false);
      
      if (isEarlyWithdrawal) {
        showNotification(
          'warning',
          `Your deposit of ${selectedDeposit.amount} ${selectedDeposit.token === 'volatile' ? 
            selectedDeposit.pool.tokenA : selectedDeposit.pool.tokenB} has been cancelled. No rewards were earned.`,
          'Deposit Cancelled'
        );
      } else {
        const estimatedReturns = (selectedDeposit.amount * 0.15).toFixed(4);
        showNotification(
          'success',
          `Successfully withdrawn ${selectedDeposit.amount} ${selectedDeposit.token === 'volatile' ? 
            selectedDeposit.pool.tokenA : selectedDeposit.pool.tokenB} plus ${estimatedReturns} in rewards.`,
          'Withdrawal Successful'
        );
      }
      
      setSelectedDeposit(null);
    } catch (error) {
      console.error("Withdrawal failed:", error);
      showNotification(
        'error',
        `Failed to withdraw funds. Please try again or contact support.`,
        'Transaction Failed'
      );
    }
  };

  // Render deposit card based on its status
  const renderDepositCard = (deposit: Deposit) => {
    const isWithdrawable = deposit.matched && (timeLeft[deposit.depositId] || 0) === 0 && !deposit.completed;
    const isMatched = deposit.matched;
    
    return (
      <motion.div
        key={deposit.depositId}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-black/50 border border-blue-800/50 rounded-lg overflow-hidden hover:border-blue-500/60 transition-all shadow-lg"
      >
        {/* Header with pool name and status */}
        <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 p-4 flex justify-between items-center border-b border-blue-900/30">
          <h3 className="text-xl font-bold text-white">
            {deposit.pool.tokenA}/{deposit.pool.tokenB}
          </h3>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            deposit.completed
              ? deposit.cancelReason 
                ? "bg-red-500/20 text-red-300"
                : "bg-green-500/20 text-green-300"
              : isWithdrawable 
                ? "bg-green-500/20 text-green-300" 
                : isMatched
                  ? "bg-blue-500/20 text-blue-300"
                  : "bg-yellow-500/20 text-yellow-300"
          }`}>
            {deposit.completed
              ? deposit.cancelReason 
                ? "Canceled" 
                : "Completed"
              : isWithdrawable 
                ? "Ready to Withdraw" 
                : isMatched
                  ? "Matched & Locked"
                  : "Awaiting Match"}
          </div>
        </div>
        
        {/* Deposit details */}
        <div className="p-4">
          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
            <div className="flex flex-col">
              <span className="text-gray-400 text-sm">You deposited</span>
              <span className="text-white font-bold">
                {deposit.amount} {deposit.token === 'volatile' ? deposit.pool.tokenA : deposit.pool.tokenB}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-400 text-sm">Expected APR</span>
              <span className="text-green-400 font-bold">{deposit.pool.apr}</span>
            </div>
            
            {isMatched && (
              <>
                <div className="flex flex-col">
                  <span className="text-gray-400 text-sm">Matched with</span>
                  <div className="flex items-center">
                    <span className="text-white font-medium text-sm">
                      {deposit.matchedWith?.amount} {deposit.token === 'volatile' ? deposit.pool.tokenB : deposit.pool.tokenA}
                    </span>
                    <span className="text-gray-500 text-xs ml-2">({deposit.matchedWith?.address})</span>
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-400 text-sm">Liquidity tokens</span>
                  <span className="text-white font-medium">{deposit.liquidityTokens?.toFixed(2)} LP</span>
                </div>
              </>
            )}
          </div>
          
          {/* State display */}
          <div className="mt-5 pt-4 border-t border-blue-900/30">
            {!isMatched && !deposit.completed ? (
              <div className="flex flex-col justify-center items-center py-2">
                <div className="flex items-center mb-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-yellow-500 mr-2"></div>
                  <p className="text-yellow-400 text-sm font-medium">Looking for match</p>
                </div>
                <p className="text-gray-400 text-xs text-center mb-3">
                  Your funds are waiting to be matched with another user
                </p>
                <button 
                  onClick={() => handleWithdraw(deposit)}
                  className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 text-sm rounded-lg transition-colors">
                  Cancel
                </button>
              </div>
            ) : deposit.completed ? (
              <div className="flex flex-col">
                <div className="flex justify-center mb-2">
                  <p className={`text-sm font-medium ${deposit.cancelReason ? "text-red-400" : "text-green-400"}`}>
                    {deposit.cancelReason ? "Canceled: " + deposit.cancelReason : "Transaction completed"}
                  </p>
                </div>
                <p className="text-gray-400 text-xs text-center">
                  {deposit.cancelReason 
                    ? "This deposit was canceled before completion" 
                    : "This deposit has been fully processed and withdrawn"}
                </p>
              </div>
            ) : isWithdrawable ? (
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-green-400 text-sm font-medium">Lock period ended</p>
                  <p className="text-gray-400 text-xs mt-1">
                    Your funds and rewards are ready to withdraw
                  </p>
                </div>
                <button 
                  onClick={() => handleWithdraw(deposit)}
                  className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-sm rounded-lg transition-colors">
                  Withdraw
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <p className="text-blue-400 text-sm font-medium">Lock time remaining</p>
                <div className="mt-2 px-5 py-2 rounded-md bg-black/70 border border-blue-900/40">
                  <p className="text-white font-mono font-medium text-center">
                    {formatTimeLeft(timeLeft[deposit.depositId] || 0)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 z-0">
        <SpaceBackground />
      </div>

      <div className="relative z-10 min-h-screen">
        <DashNav />
        
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white">My Holdings</h1>
            <p className="text-gray-400 mt-2">Manage your active deposits and liquidity positions</p>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-blue-900/50 mb-6">
            <button
              className={`py-3 px-6 text-sm font-medium ${
                activeTab === 'active'
                  ? 'text-blue-400 border-b-2 border-blue-500'
                  : 'text-gray-400 hover:text-white'
              }`}
              onClick={() => setActiveTab('active')}
            >
              Active Deposits
            </button>
            <button
              className={`py-3 px-6 text-sm font-medium ${
                activeTab === 'completed'
                  ? 'text-blue-400 border-b-2 border-blue-500'
                  : 'text-gray-400 hover:text-white'
              }`}
              onClick={() => setActiveTab('completed')}
            >
              Completed Transactions
            </button>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : activeTab === 'active' && sortedActiveDeposits.length === 0 ? (
            <div className="bg-black/50 border border-blue-800/50 rounded-lg p-10 text-center">
              <h2 className="text-xl text-gray-300 mb-4">No active deposits</h2>
              <p className="text-gray-400 mb-6">You don't have any active liquidity positions</p>
              <a href="/dashboard" className="relative inline-flex h-10 overflow-hidden rounded-full p-[1px]">
                <span className="absolute inset-[-1000%] animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#3B82F6_0%,#1E40AF_50%,#3B82F6_100%)]" />
                <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-6 py-1 text-sm font-medium text-white backdrop-blur-3xl">
                  Explore Pools
                </span>
              </a>
            </div>
          ) : activeTab === 'completed' && sortedCompletedDeposits.length === 0 ? (
            <div className="bg-black/50 border border-blue-800/50 rounded-lg p-10 text-center">
              <h2 className="text-xl text-gray-300 mb-4">No completed transactions</h2>
              <p className="text-gray-400 mb-6">You don't have any completed transactions yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeTab === 'active'
                ? sortedActiveDeposits.map(renderDepositCard)
                : sortedCompletedDeposits.map(renderDepositCard)}
            </div>
          )}
        </div>
      </div>
      
      {/* Withdraw Confirmation Modal */}
      {withdrawModalOpen && selectedDeposit && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setWithdrawModalOpen(false)}>
          <div className="bg-gray-900 border border-blue-900/50 rounded-lg p-6 max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-white mb-4">
              {selectedDeposit.matched && timeLeft[selectedDeposit.depositId] === 0 
                ? "Confirm Withdrawal" 
                : "Cancel Deposit"}
            </h2>
            
            <div className="mb-6">
              <p className="text-gray-300">
                {selectedDeposit.matched && timeLeft[selectedDeposit.depositId] === 0
                  ? "You're about to withdraw your liquidity and any earned rewards from this pool."
                  : "You're about to cancel your deposit that hasn't been matched yet."}
              </p>
              
              <div className="mt-4 p-3 bg-blue-900/20 rounded-lg">
                <div className="flex justify-between">
                  <span className="text-gray-400">Pool:</span>
                  <span className="text-white">{selectedDeposit.pool.tokenA}/{selectedDeposit.pool.tokenB}</span>
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-gray-400">Deposit Amount:</span>
                  <span className="text-white">
                    {selectedDeposit.amount} {selectedDeposit.token === 'volatile' ? selectedDeposit.pool.tokenA : selectedDeposit.pool.tokenB}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-4 justify-end">
              <button 
                onClick={() => setWithdrawModalOpen(false)}
                className="px-4 py-2 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-800"
              >
                Cancel
              </button>
              <button 
                onClick={confirmWithdraw}
                className="relative inline-flex h-10 overflow-hidden rounded-lg p-[1px] focus:outline-none"
              >
                <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#3B82F6_0%,#1E40AF_50%,#3B82F6_100%)]" />
                <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-lg bg-slate-950 px-4 py-1 text-sm font-medium text-white backdrop-blur-3xl">
                  Confirm
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Holdings;