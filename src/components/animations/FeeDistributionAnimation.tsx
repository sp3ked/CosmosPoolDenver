import React, { useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

interface FeeDistributionAnimationProps {
  className?: string;
}

const FeeDistributionAnimation: React.FC<FeeDistributionAnimationProps> = ({ className = '' }) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({ threshold: 0.3, triggerOnce: false });
  const [feeAmount, setFeeAmount] = useState(0);
  const [volatileShare, setVolatileShare] = useState(60);
  const [stableShare, setStableShare] = useState(40);
  
  useEffect(() => {
    if (inView) {
      controls.start('visible');
      
      // Simulate increasing fees
      const interval = setInterval(() => {
        setFeeAmount(prev => {
          if (prev >= 100) return 0;
          return prev + 2;
        });
      }, 200);
      
      return () => clearInterval(interval);
    } else {
      controls.start('hidden');
      setFeeAmount(0);
    }
  }, [inView, controls]);
  
  // Adjust shares with a slider
  const handleShareChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const volatile = parseInt(e.target.value);
    const stable = 100 - volatile;
    setVolatileShare(volatile);
    setStableShare(stable);
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };
  
  // Calculate rewards
  const volatileReward = (feeAmount * volatileShare / 100).toFixed(2);
  const stableReward = (feeAmount * stableShare / 100).toFixed(2);
  
  return (
    <div ref={ref} className={`${className}`}>
      <motion.div 
        className="bg-gray-900/60 backdrop-blur-sm rounded-lg p-6 border border-blue-800/50"
        variants={containerVariants}
        initial="hidden"
        animate={controls}
      >
        <h3 className="text-xl text-white font-bold mb-4 text-center">Dynamic Fee Distribution</h3>
        
        {/* Distribution Visualization */}
        <div className="flex flex-col md:flex-row gap-10 items-center justify-center">
          {/* Token A / Volatile */}
          <motion.div 
            className="flex flex-col items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="relative p-4 bg-blue-700/30 border border-blue-500 rounded-full shadow-lg shadow-blue-500/20 mb-2">
              <svg width="40" height="40" viewBox="0 0 256 417" className="h-10 w-10">
                <path fill="#343434" d="M127.961 0l-2.795 9.5v275.668l2.795 2.79 127.962-75.638z" />
                <path fill="#8C8C8C" d="M127.962 0L0 212.32l127.962 75.639V154.158z" />
                <path fill="#3C3C3B" d="M127.961 312.187l-1.575 1.92v98.199l1.575 4.6L256 236.587z" />
                <path fill="#8C8C8C" d="M127.962 416.905v-104.72L0 236.585z" />
                <path fill="#141414" d="M127.961 287.958l127.96-75.637-127.96-58.162z" />
                <path fill="#393939" d="M0 212.32l127.96 75.638v-133.8z" />
              </svg>
              <motion.div
                className="absolute -right-2 -top-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-xs text-white font-bold"
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ delay: 1, duration: 0.5 }}
              >
                {volatileShare}%
              </motion.div>
            </div>
            <div className="text-white font-medium">Volatile Side</div>
            <div className="text-green-400 mt-2 font-bold">${volatileReward}</div>
          </motion.div>
          
          {/* Central Fee Pool */}
          <motion.div 
            className="flex flex-col items-center relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="text-gray-300 text-sm mb-1">Trading Fees</div>
            <div className="p-4 bg-blue-900/50 border border-blue-500 rounded-full shadow-lg shadow-blue-500/30 flex items-center justify-center mb-3">
              <span className="text-3xl font-bold text-white">${feeAmount}</span>
            </div>
            
            {/* Distribution Lines */}
            <div className="absolute w-full h-full flex items-center justify-center">
              {/* Left Distribution */}
              <motion.div 
                className="absolute left-0 right-1/2 h-0.5 bg-gradient-to-r from-blue-700 to-blue-500"
                style={{ width: '150px', left: '-150px', top: '50px' }}
                initial={{ scaleX: 0, originX: 1 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.7, duration: 0.5 }}
              />
              
              {/* Right Distribution */}
              <motion.div 
                className="absolute left-1/2 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-blue-700"
                style={{ width: '150px', left: '100%', top: '50px' }}
                initial={{ scaleX: 0, originX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.7, duration: 0.5 }}
              />
            </div>
            
            {/* Distribution Percentage Slider */}
            <div className="mt-10 w-full max-w-xs">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Volatile %</span>
                <span>Stable %</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-blue-400 text-sm">{volatileShare}%</span>
                <input
                  type="range"
                  min="50"
                  max="70"
                  value={volatileShare}
                  onChange={handleShareChange}
                  className="w-full h-2 rounded-full appearance-none bg-gray-700 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500"
                />
                <span className="text-blue-400 text-sm">{stableShare}%</span>
              </div>
            </div>
          </motion.div>
          
          {/* Token B / Stable */}
          <motion.div 
            className="flex flex-col items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="relative p-4 bg-blue-500/30 border border-blue-300 rounded-full shadow-lg shadow-blue-300/20 mb-2">
              <svg width="40" height="40" viewBox="0 0 32 32">
                <circle cx="16" cy="16" r="16" fill="#2775CA"/>
                <path d="M20.022 15.746c0-2.465-1.478-3.323-4.433-3.674-2.12-.258-2.54-.775-2.54-1.704 0-.93.775-1.548 2.325-1.548 1.377 0 2.153.431 2.54 1.445.086.258.344.43.603.43h1.378c.43 0 .775-.344.775-.774 0-.172 0-.258-.086-.43-.517-1.634-2.066-2.841-4.176-3.013V4.607c0-.431-.344-.775-.775-.775h-1.377c-.431 0-.775.344-.775.775v1.873c-2.497.259-4.090 1.807-4.090 3.873 0 2.464 1.463 3.335 4.433 3.674 1.978.345 2.54.775 2.54 1.772 0 .997-.938 1.703-2.368 1.703-1.893 0-2.541-.774-2.713-1.806-.085-.258-.344-.43-.688-.43H9.276a.782.782 0 00-.775.775c0 .086 0 .258.086.344.517 1.892 2.066 3.013 4.347 3.271v1.873c0 .43.344.774.775.774h1.377c.431 0 .775-.344.775-.774v-1.873c2.497-.258 4.161-1.892 4.161-3.959z" fill="#FFF"/>
              </svg>
              <motion.div
                className="absolute -right-2 -top-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-xs text-white font-bold"
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ delay: 1, duration: 0.5 }}
              >
                {stableShare}%
              </motion.div>
            </div>
            <div className="text-white font-medium">Stable Side</div>
            <div className="text-green-400 mt-2 font-bold">${stableReward}</div>
          </motion.div>
        </div>
        
        {/* Explanation */}
        <div className="mt-10 text-gray-300 text-sm max-w-3xl mx-auto">
          <h4 className="text-white text-base font-semibold mb-2">Why the uneven split?</h4>
          <p className="mb-3">
            Volatile assets take on more risk in a liquidity pool. When prices change significantly, 
            volatile token providers are more exposed to impermanent loss than stable token providers.
          </p>
          <p>
            To compensate for this additional risk, our protocol intelligently allocates a greater 
            percentage of trading fees to the volatile side (typically 60%) while the stable side 
            receives a smaller percentage (typically 40%), creating a balanced risk-reward model.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default FeeDistributionAnimation;