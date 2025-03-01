import { useState, useEffect } from "react";
import DashNav from "../components/DashNav";
import SpaceBackground from "../components/backgrounds/spaceBg";
import { motion } from "framer-motion";
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

// Mock data - would be replaced with API/contract calls in production
const mockTVLData = [
  { day: 'Jul 24', tvl: 5.2 },
  { day: 'Jul 25', tvl: 5.8 },
  { day: 'Jul 26', tvl: 6.1 },
  { day: 'Jul 27', tvl: 6.4 },
  { day: 'Jul 28', tvl: 7.2 },
  { day: 'Jul 29', tvl: 7.8 },
  { day: 'Jul 30', tvl: 8.5 },
];

const mockVolumeData = [
  { day: 'Jul 24', volume: 1.2 },
  { day: 'Jul 25', volume: 0.8 },
  { day: 'Jul 26', volume: 1.5 },
  { day: 'Jul 27', volume: 1.9 },
  { day: 'Jul 28', volume: 1.1 },
  { day: 'Jul 29', volume: 2.3 },
  { day: 'Jul 30', volume: 1.7 },
];

const mockRangeData = [
  { name: '±10%', value: 60 },
  { name: '±30%', value: 30 },
  { name: '±50%', value: 10 },
];

const mockQueueData = {
  volatile: {
    symbol: 'BTC',
    amount: 3.5,
    valueUsd: 123000,
  },
  stable: {
    symbol: 'USDC',
    amount: 45000,
    valueUsd: 45000,
  },
  stableNeeded: true, // If more volatile tokens waiting vs stable
};

const mockPlatformData = {
  tvl: '$8.7M',
  volume24h: '$3.5M',
  volume7d: '$19.2M',
  feesDistributed24h: '$14.8K',
  aprRange: '12% - 18%',
  avgMatchTime: '2.4 hours',
  lastUpdate: new Date(Date.now() - 5 * 60000), // 5 minutes ago
};

const COLORS = ['#3B82F6', '#6366F1', '#8B5CF6'];

function Analytics() {
  const [platformData, setPlatformData] = useState(mockPlatformData);
  const [tvlData] = useState(mockTVLData);
  const [volumeData] = useState(mockVolumeData);
  const [queueData] = useState(mockQueueData);
  const [rangeData] = useState(mockRangeData);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Simulating data fetch from API/blockchain
  useEffect(() => {
    // This would be replaced with actual API calls
    setTimeout(() => {
      setLoading(false);
    }, 1200);

    // In a real app, set up event listeners for contract events
    // to get real-time updates
    const interval = setInterval(() => {
      // Update last refresh time
      setPlatformData(prev => ({
        ...prev,
        lastUpdate: new Date()
      }));
    }, 60000); // Check for updates every minute

    return () => clearInterval(interval);
  }, []);

  // Format time since last update
  const formatTimeSince = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds} seconds ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  };

  const customTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 p-2 border border-blue-900 rounded shadow-lg">
          <p className="text-blue-400">{`${payload[0].name}: $${payload[0].value}M`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="relative min-h-screen">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <SpaceBackground />
      </div>
      
      {/* Main content */}
      <div className="relative z-10 min-h-screen">
        <DashNav />
        
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white">Analytics & Platform Stats</h1>
              <p className="text-gray-400 mt-2">View real-time liquidity data, unmatched queues, and overall platform performance.</p>
            </div>
            
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <>
                {/* Platform Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <motion.div
                    whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.1)" }}
                    className="bg-black/40 border border-blue-800/50 rounded-lg p-6"
                  >
                    <h2 className="text-xl font-bold text-white mb-4">Global TVL & Volume</h2>
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm text-gray-400">Total Value Locked</div>
                        <div className="text-2xl font-bold text-white">{platformData.tvl}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">24h Volume</div>
                        <div className="text-lg font-medium text-white">{platformData.volume24h}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">7d Volume</div>
                        <div className="text-lg font-medium text-white">{platformData.volume7d}</div>
                      </div>
                    </div>
                  </motion.div>
                  
                  <motion.div
                    whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.1)" }}
                    className="bg-black/40 border border-blue-800/50 rounded-lg p-6"
                  >
                    <h2 className="text-xl font-bold text-white mb-4">Match Queue</h2>
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm text-gray-400">{queueData.volatile.symbol} Tokens Waiting</div>
                        <div className="text-lg font-medium text-white">
                          {queueData.volatile.amount} {queueData.volatile.symbol}
                          <span className="text-sm text-gray-400 ml-1">(${queueData.volatile.valueUsd.toLocaleString()})</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">{queueData.stable.symbol} Tokens Waiting</div>
                        <div className="text-lg font-medium text-white">
                          {queueData.stable.amount.toLocaleString()} {queueData.stable.symbol}
                          <span className="text-sm text-gray-400 ml-1">(${queueData.stable.valueUsd.toLocaleString()})</span>
                        </div>
                      </div>
                      {queueData.stableNeeded && (
                        <div className="mt-2 p-2 bg-green-900/20 border border-green-700/30 rounded-md text-sm text-green-400">
                          Deposit stable tokens now to earn a bonus yield!
                        </div>
                      )}
                    </div>
                  </motion.div>
                  
                  <motion.div
                    whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.1)" }}
                    className="bg-black/40 border border-blue-800/50 rounded-lg p-6"
                  >
                    <h2 className="text-xl font-bold text-white mb-4">Revenue & Rewards</h2>
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm text-gray-400">Fees Distributed (24h)</div>
                        <div className="text-lg font-medium text-white">{platformData.feesDistributed24h}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">Historic APR Range</div>
                        <div className="text-lg font-medium text-white">{platformData.aprRange}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">Average Time to Match</div>
                        <div className="text-lg font-medium text-white">{platformData.avgMatchTime}</div>
                      </div>
                    </div>
                  </motion.div>
                </div>
                
                {/* Tab Navigation */}
                <div className="flex border-b border-blue-900/30 mb-6 overflow-x-auto">
                  <button 
                    className={`px-4 py-2 font-medium text-sm ${activeTab === 'overview' ? 'text-blue-400 border-b-2 border-blue-500' : 'text-gray-400 hover:text-white'}`}
                    onClick={() => setActiveTab('overview')}
                  >
                    Overview
                  </button>
                  <button 
                    className={`px-4 py-2 font-medium text-sm ${activeTab === 'insights' ? 'text-blue-400 border-b-2 border-blue-500' : 'text-gray-400 hover:text-white'}`}
                    onClick={() => setActiveTab('insights')}
                  >
                    Risk & Range Insights
                  </button>
                  <button 
                    className={`px-4 py-2 font-medium text-sm ${activeTab === 'updates' ? 'text-blue-400 border-b-2 border-blue-500' : 'text-gray-400 hover:text-white'}`}
                    onClick={() => setActiveTab('updates')}
                  >
                    Platform Updates
                  </button>
                </div>
                
                {/* Chart Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  {activeTab === 'overview' && (
                    <>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-black/40 border border-blue-800/50 rounded-lg p-4"
                      >
                        <h3 className="text-lg font-medium text-white mb-4">TVL Over Time</h3>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={tvlData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
                              <XAxis dataKey="day" stroke="#a0aec0" />
                              <YAxis stroke="#a0aec0" tickFormatter={(tick) => `$${tick}M`} />
                              <Tooltip content={customTooltip} />
                              <Line 
                                type="monotone" 
                                dataKey="tvl" 
                                name="TVL" 
                                stroke="#3b82f6" 
                                strokeWidth={2}
                                dot={{ fill: '#3b82f6', r: 4 }}
                                activeDot={{ fill: '#3b82f6', r: 6, stroke: '#fff', strokeWidth: 2 }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </motion.div>
                      
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="bg-black/40 border border-blue-800/50 rounded-lg p-4"
                      >
                        <h3 className="text-lg font-medium text-white mb-4">Daily Volume</h3>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={volumeData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
                              <XAxis dataKey="day" stroke="#a0aec0" />
                              <YAxis stroke="#a0aec0" tickFormatter={(tick) => `$${tick}M`} />
                              <Tooltip content={customTooltip} />
                              <Bar 
                                dataKey="volume" 
                                name="Volume" 
                                fill="#3b82f6" 
                                radius={[4, 4, 0, 0]}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </motion.div>
                    </>
                  )}
                  
                  {activeTab === 'insights' && (
                    <>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-black/40 border border-blue-800/50 rounded-lg p-4"
                      >
                        <h3 className="text-lg font-medium text-white mb-4">Price Range Selections</h3>
                        <div className="h-64 flex justify-center items-center">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={rangeData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                              >
                                {rangeData.map((_, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip 
                                formatter={(value: any) => `${value}%`} 
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </motion.div>
                      
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="bg-black/40 border border-blue-800/50 rounded-lg p-4"
                      >
                        <h3 className="text-lg font-medium text-white mb-4">Out-of-Range Positions</h3>
                        <div className="text-center p-8 flex flex-col justify-center items-center h-full">
                          <div className="inline-flex h-16 w-16 rounded-full border-4 border-blue-900/40 text-blue-500 items-center justify-center mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div className="text-white text-lg font-medium">Out-of-Range Positions (24h)</div>
                          <div className="text-3xl font-bold mt-2 text-white">6%</div>
                          <p className="text-gray-400 text-sm mt-2 max-w-xs">
                            Only 6% of positions went out of range in the last 24 hours. 
                            Lower percentages indicate more stable markets.
                          </p>
                        </div>
                      </motion.div>
                    </>
                  )}
                  
                  {activeTab === 'updates' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-black/40 border border-blue-800/50 rounded-lg p-6 col-span-1 lg:col-span-2"
                    >
                      <h3 className="text-lg font-medium text-white mb-4">Platform Updates</h3>
                      <div className="space-y-4">
                        <div className="border-l-2 border-blue-500 pl-4">
                          <div className="flex items-center">
                            <span className="text-blue-400 font-medium">July 30, 2023</span>
                            <span className="ml-2 bg-blue-500/20 text-blue-300 px-2 py-0.5 text-xs rounded-full">New</span>
                          </div>
                          <h4 className="text-white font-medium">Protocol V1.2 Deployed</h4>
                          <p className="text-gray-300 text-sm">
                            We've deployed an update that improves matching efficiency by 15% and reduces gas costs.
                            No action is required from users.
                          </p>
                        </div>
                        <div className="border-l-2 border-gray-700 pl-4">
                          <div className="text-gray-400 font-medium">July 22, 2023</div>
                          <h4 className="text-white font-medium">Liquidity Mining Rewards Increased</h4>
                          <p className="text-gray-300 text-sm">
                            Liquidity mining rewards for stable tokens have been increased by 20% to balance the pools.
                          </p>
                        </div>
                        <div className="border-l-2 border-gray-700 pl-4">
                          <div className="text-gray-400 font-medium">July 15, 2023</div>
                          <h4 className="text-white font-medium">New Token Pairs Added</h4>
                          <p className="text-gray-300 text-sm">
                            We've added support for ETH/DAI and BTC/USDT pairs. Users can now provide single-sided liquidity for these pairs.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
                
                {/* Footer Note */}
                <div className="text-center text-sm text-gray-400 mt-8">
                  <p>
                    Data updates automatically. Last updated {formatTimeSince(platformData.lastUpdate)}. 
                    For the fastest updates, refresh or <button className="text-blue-400 hover:underline">connect your wallet</button> for live event notifications.
                  </p>
                </div>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default Analytics;
