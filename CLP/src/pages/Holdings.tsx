import { useState, useEffect } from "react";
import DashNav from "../components/DashNav";
import SpaceBackground from "../components/backgrounds/spaceBg";
import { motion } from "framer-motion";
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
}

function Holdings() {
  const { showNotification } = useNotification();
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [loading, setLoading] = useState(true);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [selectedDeposit, setSelectedDeposit] = useState<Deposit | null>(null);
  const [timeLeft, setTimeLeft] = useState<Record<string, number>>({});

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
        liquidityTokens: 123.45
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
        timestamp: Date.now() - (2 * 60 * 60 * 1000), // 2 hours ago
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
        liquidityTokens: 85.32
      }
    ];

    setTimeout(() => {
      setDeposits(mockDeposits);
      setLoading(false);
    }, 1000);
  }, []);

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
      
      // Remove the deposit from the list after successful withdrawal
      setDeposits(prev => prev.filter(d => d.depositId !== selectedDeposit.depositId));
      setWithdrawModalOpen(false);
      
      const isEarlyWithdrawal = !selectedDeposit.matched || 
        ((selectedDeposit.timestamp + 24 * 60 * 60 * 1000) > Date.now());
      
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

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 z-0">
        <SpaceBackground />
      </div>

      <div className="relative z-10 min-h-screen">
        <DashNav />
        
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">My Holdings</h1>
            <p className="text-gray-400 mt-2">Manage your active deposits and liquidity positions</p>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : deposits.length === 0 ? (
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
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {deposits.map((deposit) => {
                const isWithdrawable = deposit.matched && (timeLeft[deposit.depositId] || 0) === 0;
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
                        isWithdrawable 
                          ? "bg-green-500/20 text-green-300" 
                          : isMatched
                            ? "bg-blue-500/20 text-blue-300"
                            : "bg-yellow-500/20 text-yellow-300"
                      }`}>
                        {isWithdrawable 
                          ? "Ready to Withdraw" 
                          : isMatched
                            ? "Matched & Locked"
                            : "Awaiting Match"}
                      </div>
                    </div>
                    
                    {/* Deposit details */}
                    <div className="p-4">
                      <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                        <div>
                          <div className="text-sm text-gray-400">Your Deposit</div>
                          <div className="font-medium text-white">
                            {deposit.amount} {deposit.token === 'volatile' ? deposit.pool.tokenA : deposit.pool.tokenB}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-400">APR</div>
                          <div className="font-medium text-white">{deposit.pool.apr}</div>
                        </div>
                        
                        {isMatched && (
                          <>
                            <div>
                              <div className="text-sm text-gray-400">Matched With</div>
                              <div className="font-medium text-white">
                                {deposit.matchedWith?.amount} {deposit.token === 'volatile' ? deposit.pool.tokenB : deposit.pool.tokenA}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-400">LP Tokens</div>
                              <div className="font-medium text-white">{deposit.liquidityTokens?.toFixed(2)}</div>
                            </div>
                          </>
                        )}
                      </div>
                      
                      {/* State display */}
                      <div className="mt-5 pt-4 border-t border-blue-900/30">
                        {!isMatched ? (
                          <div className="bg-blue-900/20 p-4 rounded-lg">
                            <div className="flex items-center justify-center">
                              <div className="animate-pulse mr-2 h-2 w-2 bg-yellow-400 rounded-full"></div>
                              <div className="animate-pulse mx-1 h-2 w-2 bg-yellow-400 rounded-full" style={{ animationDelay: "0.2s" }}></div>
                              <div className="animate-pulse ml-2 h-2 w-2 bg-yellow-400 rounded-full" style={{ animationDelay: "0.4s" }}></div>
                              <span className="ml-3 text-yellow-300">Awaiting match with another user</span>
                            </div>
                            
                            <div className="mt-4 text-center">
                              <button 
                                className="relative inline-flex h-10 overflow-hidden rounded-full p-[1px] focus:outline-none"
                                onClick={() => handleWithdraw(deposit)}
                              >
                                <span className="absolute inset-[-1000%] animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#FBBF24_0%,#D97706_50%,#FBBF24_100%)]" />
                                <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-6 py-1 text-sm font-medium text-white backdrop-blur-3xl">
                                  Cancel Deposit
                                </span>
                              </button>
                            </div>
                          </div>
                        ) : isWithdrawable ? (
                          <div className="bg-green-900/20 border border-green-800/50 p-4 rounded-lg">
                            <div className="text-center mb-4">
                              <div className="text-green-300 font-medium">Your deposit is now available for withdrawal!</div>
                              <div className="text-gray-400 mt-1 text-sm">
                                Estimated returns: {(deposit.amount * 0.15).toFixed(4)} {deposit.token === 'volatile' ? deposit.pool.tokenA : deposit.pool.tokenB}
                              </div>
                            </div>
                            
                            <button 
                              className="w-full relative inline-flex h-12 overflow-hidden rounded-full p-[1px] focus:outline-none"
                              onClick={() => handleWithdraw(deposit)}
                            >
                              <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#10B981_0%,#065F46_50%,#10B981_100%)]" />
                              <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-6 py-1 text-base font-medium text-white backdrop-blur-3xl">
                                Withdraw Funds
                              </span>
                            </button>
                          </div>
                        ) : (
                          <div className="bg-blue-900/20 border border-blue-800/50 p-4 rounded-lg">
                            <div className="text-center mb-3">
                              <div className="text-blue-300 font-medium">Your deposit is matched and earning rewards</div>
                            </div>
                            
                            <div className="flex justify-between items-center bg-blue-900/30 rounded-lg p-3">
                              <div className="text-gray-300">Time until withdrawal:</div>
                              <div className="text-white font-mono text-lg">{formatTimeLeft(timeLeft[deposit.depositId] || 0)}</div>
                            </div>
                            
                            <div className="w-full bg-gray-700 h-1.5 rounded-full mt-4">
                              <div 
                                className="bg-blue-500 h-1.5 rounded-full" 
                                style={{ 
                                  width: `${100 - ((timeLeft[deposit.depositId] || 0) / (24 * 60 * 60 * 1000)) * 100}%` 
                                }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
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
