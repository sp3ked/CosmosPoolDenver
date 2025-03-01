import React, { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

interface PriceRangeAnimationProps {
  className?: string;
}

const PriceRangeAnimation: React.FC<PriceRangeAnimationProps> = ({ className = '' }) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({ threshold: 0.3, triggerOnce: false });
  const [pricePoint, setPricePoint] = useState(50);
  const [selectedRange, setSelectedRange] = useState<'narrow' | 'medium' | 'wide'>('medium');
  
  // Range boundaries 
  const ranges = {
    narrow: { min: 40, max: 60 }, // ±10%
    medium: { min: 30, max: 70 }, // ±20%
    wide: { min: 20, max: 80 }    // ±30%
  };
  
  // Price movement simulation
  useEffect(() => {
    if (inView) {
      controls.start({ opacity: 1, y: 0 });
      
      // Start price movement simulation
      const interval = setInterval(() => {
        setPricePoint(prev => {
          // Random walk with mean reversion
          const direction = Math.random() > 0.5 ? 1 : -1;
          const moveAmount = Math.random() * 3;
          const meanReversionStrength = 0.1;
          const meanReversion = (50 - prev) * meanReversionStrength;
          
          // Combine random walk with mean reversion
          const newValue = prev + (direction * moveAmount) + meanReversion;
          return Math.max(10, Math.min(90, newValue)); // Clamp between 10-90
        });
      }, 300);
      
      return () => clearInterval(interval);
    } else {
      controls.start({ opacity: 0, y: 50 });
    }
  }, [inView, controls]);
  
  // Calculate whether price is in range
  const isPriceInRange = pricePoint >= ranges[selectedRange].min && pricePoint <= ranges[selectedRange].max;
  
  // Calculate fee efficiency based on range and price
  const calculateEfficiency = () => {
    if (!isPriceInRange) return 0;
    
    // Wider ranges are less efficient when price is in range
    const baseEfficiency = 100; // Base efficiency percentage
    
    // Efficiency decreases as range width increases 
    const efficiencyFactor = {
      narrow: 1, // 100% efficiency for narrow range
      medium: 0.7, // 70% efficiency for medium range
      wide: 0.4 // 40% efficiency for wide range
    };
    
    return baseEfficiency * efficiencyFactor[selectedRange];
  };
  
  const efficiency = calculateEfficiency();

  return (
    <div ref={ref} className={`${className}`}>
      <motion.div 
        className="relative bg-gray-900/60 backdrop-blur-sm rounded-lg p-6 border border-blue-800/50"
        initial={{ opacity: 0, y: 50 }}
        animate={controls}
        transition={{ duration: 0.5 }}
      >
        <h3 className="text-xl text-white font-bold mb-4 text-center">Price Range Selection</h3>
        
        {/* Range selector */}
        <div className="flex justify-center gap-4 mb-6">
          <button 
            onClick={() => setSelectedRange('narrow')}
            className={`px-3 py-1 rounded ${selectedRange === 'narrow' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
          >
            Narrow (±10%)
          </button>
          <button 
            onClick={() => setSelectedRange('medium')}
            className={`px-3 py-1 rounded ${selectedRange === 'medium' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
          >
            Medium (±20%)
          </button>
          <button 
            onClick={() => setSelectedRange('wide')}
            className={`px-3 py-1 rounded ${selectedRange === 'wide' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
          >
            Wide (±30%)
          </button>
        </div>
        
        {/* Price chart */}
        <div className="relative h-32 bg-black/40 rounded border border-gray-800 mb-2">
          {/* Range zone */}
          <div 
            className="absolute h-full bg-blue-500/20 border-l border-r border-blue-500/50"
            style={{ 
              left: `${ranges[selectedRange].min}%`, 
              width: `${ranges[selectedRange].max - ranges[selectedRange].min}%` 
            }}
          />
          
          {/* Price indicator */}
          <motion.div 
            className={`absolute h-full w-0.5 bg-white ${isPriceInRange ? 'shadow-[0_0_10px_rgba(59,130,246,0.7)]' : ''}`}
            style={{ left: `${pricePoint}%` }}
            initial={{ height: 0 }}
            animate={{ height: '100%' }}
            transition={{ duration: 0.5 }}
          >
            <div className={`absolute -top-6 -translate-x-1/2 px-2 py-1 rounded ${isPriceInRange ? 'bg-blue-600' : 'bg-gray-700'}`}>
              ${(1000 + (pricePoint - 50) * 20).toFixed(2)}
            </div>
            <div className={`absolute -bottom-6 -translate-x-1/2 px-2 py-1 rounded-full ${isPriceInRange ? 'bg-blue-600' : 'bg-gray-700'}`}>
              <div className="w-2 h-2 rounded-full bg-white" />
            </div>
          </motion.div>
          
          {/* Min/max labels */}
          <div className="absolute top-0 text-xs text-blue-400" style={{ left: `${ranges[selectedRange].min}%`, transform: 'translateX(-50%)' }}>
            Min: ${(1000 + (ranges[selectedRange].min - 50) * 20).toFixed(0)}
          </div>
          <div className="absolute top-0 text-xs text-blue-400" style={{ left: `${ranges[selectedRange].max}%`, transform: 'translateX(-50%)' }}>
            Max: ${(1000 + (ranges[selectedRange].max - 50) * 20).toFixed(0)}
          </div>
        </div>
        
        {/* Status and metrics */}
        <div className="grid grid-cols-2 gap-4 mt-8">
          <div className="bg-black/40 p-4 rounded border border-gray-800">
            <h4 className="text-gray-400 text-sm">Status</h4>
            <div className={`text-lg font-bold ${isPriceInRange ? 'text-green-500' : 'text-red-500'}`}>
              {isPriceInRange ? 'In Range (Earning Fees)' : 'Out of Range (Idle)'}
            </div>
          </div>
          
          <div className="bg-black/40 p-4 rounded border border-gray-800">
            <h4 className="text-gray-400 text-sm">Capital Efficiency</h4>
            <div className="text-lg font-bold text-blue-400">{efficiency.toFixed(0)}%</div>
          </div>
        </div>
        
        {/* Explanation text */}
        <div className="mt-6 text-gray-300 text-sm">
          <p className="mb-2">
            <span className="text-white font-semibold">How it works:</span> Concentrated liquidity lets you focus your capital in specific price ranges. 
            {isPriceInRange 
              ? ' Your position is currently earning fees because the price is within your selected range.' 
              : ' Your position is currently idle because the price is outside your selected range.'}
          </p>
          <p>
            <span className="text-white font-semibold">Trade-off:</span> Narrower ranges give higher capital efficiency when in range, but may go out of range more often.
            Wider ranges have lower capital efficiency but stay in range more consistently.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default PriceRangeAnimation;
