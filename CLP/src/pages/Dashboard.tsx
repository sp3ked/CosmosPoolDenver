import { useState } from "react";
import DashNav from "../components/DashNav";
import SpaceBackground from '../components/backgrounds/spaceBg';
import AddLiquidityModal from '../components/AddLiquidityModal';
import { motion } from 'framer-motion';

interface Pool {
  id: string;
  tokenA: string;
  tokenB: string;
  tvl: string;
  volume24h: string;
  apr: string;
  available: boolean;
  greyedOut?: boolean;
  comingSoon?: boolean;
  waitingQueue: {
    tokenAAmount: number;
    tokenBAmount: number;
    tokenAFormatted: string;
    tokenBFormatted: string;
    readyTokenA: boolean;
    readyTokenB: boolean;
  };
}

// Feature Pools (available from smart contract)
const featurePools: Pool[] = [
  { 
    id: "2", 
    tokenA: "ETH", 
    tokenB: "USDC", 
    tvl: "$5.2M", 
    volume24h: "$1.2M", 
    apr: "12.4%",
    available: true,
    greyedOut: false,
    waitingQueue: {
      tokenAAmount: 0,
      tokenBAmount: 2800,
      tokenAFormatted: "0 ETH",
      tokenBFormatted: "2,800 USDC",
      readyTokenA: true,
      readyTokenB: false
    }
  },
  { 
    id: "1", 
    tokenA: "BTC", 
    tokenB: "USDC", 
    tvl: "$8.7M", 
    volume24h: "$3.5M", 
    apr: "18.2%",
    available: false,
    greyedOut: true,
    comingSoon: true,
    waitingQueue: {
      tokenAAmount: 3.5,
      tokenBAmount: 0,
      tokenAFormatted: "3.5 BTC",
      tokenBFormatted: "0 USDC",
      readyTokenA: false,
      readyTokenB: true
    }
  },
];

// All pools including coming soon ones
const allPools: Pool[] = [
  ...featurePools,
  { 
    id: "3", 
    tokenA: "SOL", 
    tokenB: "USDC", 
    tvl: "$2.1M", 
    volume24h: "$980K", 
    apr: "15.7%",
    available: false,
    waitingQueue: {
      tokenAAmount: 0,
      tokenBAmount: 0,
      tokenAFormatted: "0 SOL",
      tokenBFormatted: "0 USDC",
      readyTokenA: false,
      readyTokenB: false
    },
    comingSoon: true
  },
  { 
    id: "4", 
    tokenA: "AVAX", 
    tokenB: "USDT", 
    tvl: "$1.8M", 
    volume24h: "$870K", 
    apr: "14.3%",
    available: false,
    waitingQueue: {
      tokenAAmount: 0,
      tokenBAmount: 0,
      tokenAFormatted: "0 AVAX",
      tokenBFormatted: "0 USDT",
      readyTokenA: false,
      readyTokenB: false
    },
    comingSoon: true
  },
  { 
    id: "5", 
    tokenA: "MATIC", 
    tokenB: "ETH", 
    tvl: "$1.2M", 
    volume24h: "$650K", 
    apr: "10.9%",
    available: false,
    waitingQueue: {
      tokenAAmount: 0,
      tokenBAmount: 0,
      tokenAFormatted: "0 MATIC",
      tokenBFormatted: "0 ETH",
      readyTokenA: false,
      readyTokenB: false
    },
    comingSoon: true
  },
  { 
    id: "6", 
    tokenA: "DOT", 
    tokenB: "USDC", 
    tvl: "$3.1M", 
    volume24h: "$750K", 
    apr: "16.2%",
    available: false,
    waitingQueue: {
      tokenAAmount: 0,
      tokenBAmount: 0,
      tokenAFormatted: "0 DOT",
      tokenBFormatted: "0 USDC",
      readyTokenA: false,
      readyTokenB: false
    },
    comingSoon: true
  },
  { 
    id: "7", 
    tokenA: "ATOM", 
    tokenB: "OSMO", 
    tvl: "$1.9M", 
    volume24h: "$420K", 
    apr: "13.8%",
    available: false,
    waitingQueue: {
      tokenAAmount: 0,
      tokenBAmount: 0,
      tokenAFormatted: "0 ATOM",
      tokenBFormatted: "0 OSMO",
      readyTokenA: false,
      readyTokenB: false
    },
    comingSoon: true
  },
  { 
    id: "8", 
    tokenA: "AVAX", 
    tokenB: "ETH", 
    tvl: "$1.3M", 
    volume24h: "$380K", 
    apr: "11.6%",
    available: false,
    waitingQueue: {
      tokenAAmount: 0,
      tokenBAmount: 0,
      tokenAFormatted: "0 AVAX",
      tokenBFormatted: "0 ETH",
      readyTokenA: false,
      readyTokenB: false
    },
    comingSoon: true
  },
];

function Dashboard() {
  const [selectedPool, setSelectedPool] = useState<Pool | null>(null);

  return (
    <div className="relative min-h-screen">
      {/* Background positioned correctly */}
      <div className="fixed inset-0 z-0">
        <SpaceBackground />
      </div>
      
      {/* Main content with proper z-index */}
      <div className="relative z-10 min-h-screen">
        <DashNav />
        
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white">Liquidity Pools</h1>
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Search pools..."
                className="bg-black/40 border border-blue-900/50 rounded-lg px-4 py-2 text-white"
              />
            </div>
          </div>

          {/* Featured Pools Section */}
          <div className="mb-10">
            <h2 className="text-xl font-bold mb-4 text-blue-400 flex items-center">
              <span className="mr-2"></span> Featured Pools
            </h2>
            
            {/* Pool Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {featurePools.map((pool) => (
                <motion.div
                  key={pool.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="relative" // Add this wrapper with relative positioning
                >
                  {pool.greyedOut && (
                    <div className="absolute inset-0 bg-black/50 z-10 rounded-lg backdrop-blur-[0px]" /> // Changed from backdrop-blur-[2px] to backdrop-blur-[1px]
                  )}
                  <div className={`bg-black/50 border border-blue-800/50 rounded-lg overflow-hidden transition-all shadow-lg ${
                    pool.greyedOut 
                      ? 'opacity-300 cursor-not-allowed'
                      : 'hover:border-blue-500/60'
                  }`}>
                    {/* Header with pool name and APR */}
                    <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 p-4 flex justify-between items-center border-b border-blue-900/30">
                      <div className="flex items-center">
                        <h3 className="text-xl font-bold text-white">{pool.tokenA}/{pool.tokenB}</h3>
                        {pool.comingSoon && (
                          <span className="ml-2 text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded">Coming Soon</span>
                        )}
                      </div>
                      <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm font-medium">
                        {pool.apr} APR
                      </span>
                    </div>
                    
                    {/* Pool stats */}
                    <div className="p-4">
                      <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                        <div>
                          <div className="text-sm text-gray-400">TVL</div>
                          <div className="font-medium text-white">{pool.tvl}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-400">Vol. 24h</div>
                          <div className="font-medium text-white">{pool.volume24h}</div>
                        </div>
                      </div>
                      
                      {/* Token Queue Status */}
                      <div className="mt-5 pt-4 border-t border-blue-900/30">
                        <div className="text-sm font-medium text-gray-200 mb-3">Queue Status</div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className={`p-3 rounded ${
                            pool.waitingQueue.tokenAAmount > 0 
                              ? 'bg-blue-900/20' 
                              : 'bg-green-900/20 border border-green-700/50'
                          }`}>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-gray-400">{pool.tokenA}:</span>
                              <div className="flex items-center">
                                {pool.waitingQueue.tokenAAmount > 0 ? (
                                  <span className="text-white font-medium">
                                    {pool.waitingQueue.tokenAFormatted}
                                    <span className="text-blue-400 ml-1">in queue</span>
                                  </span>
                                ) : (
                                  <span className="text-green-400 font-medium flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Ready for deposit
                                  </span>
                                )}
                              </div>
                            </div>
                            {pool.waitingQueue.tokenAAmount > 0 && (
                              <div className="w-full bg-gray-700 rounded-full h-1.5 mt-1.5">
                                <div className="bg-blue-500 h-1.5 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                              </div>
                            )}
                          </div>
                          <div className={`p-3 rounded ${
                            pool.waitingQueue.tokenBAmount > 0 
                              ? 'bg-blue-900/20' 
                              : 'bg-green-900/20 border border-green-700/50'
                          }`}>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-gray-400">{pool.tokenB}:</span>
                              <div className="flex items-center">
                                {pool.waitingQueue.tokenBAmount > 0 ? (
                                  <span className="text-white font-medium">
                                    {pool.waitingQueue.tokenBFormatted}
                                    <span className="text-blue-400 ml-1">in queue</span>
                                  </span>
                                ) : (
                                  <span className="text-green-400 font-medium flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Ready for deposit
                                  </span>
                                )}
                              </div>
                            </div>
                            {pool.waitingQueue.tokenBAmount > 0 && (
                              <div className="w-full bg-gray-700 rounded-full h-1.5 mt-1.5">
                                <div className="bg-blue-500 h-1.5 rounded-full animate-pulse" style={{ width: '75%' }}></div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Call to action - New animated border button */}
                      <div className="mt-6 flex justify-center">
                        <button 
                          onClick={() => !pool.greyedOut && setSelectedPool(pool)}  // Added same onClick handler as Join button
                          disabled={pool.greyedOut}
                          className={`relative inline-flex h-12 overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-50 ${
                            pool.greyedOut ? 'cursor-not-allowed opacity-75' : ''
                          }`}
                        >
                          <span className={`absolute inset-[-1000%] ${!pool.greyedOut && 'animate-[spin_2s_linear_infinite]'} bg-[conic-gradient(from_90deg_at_50%_50%,#3B82F6_0%,#1E40AF_50%,#3B82F6_100%)]`} />
                          <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-6 py-1 text-sm font-medium text-white backdrop-blur-3xl">
                            {pool.greyedOut ? (
                              "Coming Soon"
                            ) : (
                              <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Join Pool
                              </>
                            )}
                          </span>
                        </button>
                      </div>
                      
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Simplified All Pools Section */}
          <div className="mb-10">
            <h2 className="text-xl font-bold mb-4 text-blue-400 flex items-center">
              <span className="mr-2"></span> All Pools
            </h2>

            <div className="bg-black/50 border border-blue-800/50 rounded-lg overflow-hidden shadow-lg">
              <div className="grid grid-cols-5 gap-4 p-4 bg-gradient-to-r from-blue-900/30 to-indigo-900/30 text-sm text-gray-300 font-medium border-b border-blue-900/50">
                <div>Pool</div>
                <div>APR</div>
                <div>TVL</div>
                <div>Vol. 24h</div>
                <div className="text-right">Status</div>
              </div>

              {/* Pool rows - limited to 5 */}
              <div>
                {allPools.slice(0, 5).map((pool) => (
                  <motion.div 
                    key={`all-${pool.id}`}
                    className={`grid grid-cols-5 gap-4 p-4 hover:bg-blue-900/10 transition-colors items-center border-b border-blue-900/20 ${!pool.available ? 'opacity-60' : ''}`}
                    whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
                  >
                    <div className="flex items-center">
                      <div className="font-medium text-white">{pool.tokenA}/{pool.tokenB}</div>
                      {pool.comingSoon && (
                        <span className="ml-2 text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded">Soon</span>
                      )}
                    </div>
                    <div className="text-blue-400">{pool.apr}</div>
                    <div className="text-white">{pool.tvl}</div>
                    <div className="text-white">{pool.volume24h}</div>
                    <div className="text-right">
                      {pool.available ? (
                        <button 
                          onClick={() => setSelectedPool(pool)}
                          className="relative inline-flex h-9 overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-50"
                        >
                          <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#3B82F6_0%,#1E40AF_50%,#3B82F6_100%)]" />
                          <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-4 py-1 text-sm font-medium text-white backdrop-blur-3xl">
                            Join
                          </span>
                        </button>
                      ) : (
                        <span className="text-gray-500 px-4 py-1.5">Coming Soon</span>
                      )}
                    </div>
                  </motion.div>
                ))}

                {/* See More button */}
                <div className="p-4 flex justify-center">
                  <button
                    className="relative inline-flex h-10 overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-50"
                  >
                    <span className="absolute inset-[-1000%] animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#3B82F6_0%,#1E40AF_50%,#3B82F6_100%)]" />
                    <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-6 py-1 text-sm font-medium text-white backdrop-blur-3xl">
                      See More Pools
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal - show directly on pool selection */}
      <AddLiquidityModal
        isOpen={selectedPool !== null}
        onClose={() => setSelectedPool(null)}
        pool={selectedPool}
      />
    </div>
  );
}

export default Dashboard;
