import React, { useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

interface MatchingAnimationProps {
  className?: string;
}

const MatchingAnimation: React.FC<MatchingAnimationProps> = ({ className = '' }) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({ threshold: 0.3, triggerOnce: true });
  const animationRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  useEffect(() => {
    if (inView) {
      // Start the animation cycle when in view
      startAnimationCycle();
    } else {
      // Reset animation when out of view
      controls.start("hidden");
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    }
    
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, [inView, controls]);
  
  const startAnimationCycle = () => {
    // Initial state
    controls.start("step1");
    
    // Step 2: Token A moves to center
    animationRef.current = setTimeout(() => {
      controls.start("step2");
    }, 1500);
    
    // Step 3: Token B moves to center
    animationRef.current = setTimeout(() => {
      controls.start("step3");
    }, 3000);
    
    // Step 4: Tokens combine to form LP token
    animationRef.current = setTimeout(() => {
      controls.start("step4");
    }, 4500);
    
    // Step 5: LP token expands showing returns
    animationRef.current = setTimeout(() => {
      controls.start("step5");
    }, 6000);
    
    // Step 6: Returns are distributed back to providers
    animationRef.current = setTimeout(() => {
      controls.start("step6");
    }, 7500);
    
    // Reset animation cycle after delay
    animationRef.current = setTimeout(() => {
      startAnimationCycle();
    }, 10000); // Longer full cycle for better readability
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    step1: { opacity: 1, transition: { duration: 0.5 } }
  };
  
  const tokenAVariants = {
    hidden: { x: -200, y: 0, opacity: 0 },
    step1: { x: -200, y: 0, opacity: 1, transition: { duration: 0.5 } },
    step2: { x: 0, y: 0, transition: { duration: 1, type: "spring" } },
    step3: { x: 0, y: 0 },
    step4: { x: 0, y: 0, scale: 0.8, transition: { duration: 0.5 } },
    step5: { x: 0, y: 0, scale: 0.8 },
    step6: { x: -120, y: 60, scale: 1, transition: { duration: 1, type: "spring" } }
  };
  
  const tokenBVariants = {
    hidden: { x: 200, y: 0, opacity: 0 },
    step1: { x: 200, y: 0, opacity: 1, transition: { duration: 0.5 } },
    step2: { x: 200, y: 0 },
    step3: { x: 0, y: 0, transition: { duration: 1, type: "spring" } },
    step4: { x: 0, y: 0, scale: 0.8, transition: { duration: 0.5 } },
    step5: { x: 0, y: 0, scale: 0.8 },
    step6: { x: 120, y: 60, scale: 1, transition: { duration: 1, type: "spring" } }
  };
  
  // Updated LP token variants with increased upward movement
  const lpTokenVariants = {
    hidden: { opacity: 0, scale: 0 },
    step1: { opacity: 0, scale: 0 },
    step2: { opacity: 0, scale: 0 },
    step3: { opacity: 0, scale: 0 },
    step4: { opacity: 1, scale: 1.5, transition: { duration: 0.7, type: "spring" } },
    step5: { opacity: 1, scale: 1.5, transition: { duration: 0.5 } },
    step6: { opacity: 1, scale: 1.5, y: -60, transition: { duration: 1, type: "spring" } } // moved up (negative offset)
  };
  
  const returnsVariants = {
    hidden: { opacity: 0, scale: 0 },
    step1: { opacity: 0, scale: 0 },
    step2: { opacity: 0, scale: 0 },
    step3: { opacity: 0, scale: 0 },
    step4: { opacity: 0, scale: 0 },
    step5: { opacity: 1, scale: 1, transition: { delay: 0.2, duration: 0.5 } },
    step6: { opacity: 0, transition: { duration: 0.3 } }
  };
  
  const returnAVariants = {
    hidden: { opacity: 0, x: 0, y: 0 },
    step1: { opacity: 0, x: 0, y: 0 },
    step2: { opacity: 0, x: 0, y: 0 },
    step3: { opacity: 0, x: 0, y: 0 },
    step4: { opacity: 0, x: 0, y: 0 },
    step5: { opacity: 0, x: 0, y: 0 },
    step6: { opacity: 1, x: -120, y: -30, transition: { duration: 0.5, delay: 0.1 } }
  };
  
  const returnBVariants = {
    hidden: { opacity: 0, x: 0, y: 0 },
    step1: { opacity: 0, x: 0, y: 0 },
    step2: { opacity: 0, x: 0, y: 0 },
    step3: { opacity: 0, x: 0, y: 0 },
    step4: { opacity: 0, x: 0, y: 0 },
    step5: { opacity: 0, x: 0, y: 0 },
    step6: { opacity: 1, x: 120, y: -30, transition: { duration: 0.5, delay: 0.1 } }
  };

  // Step descriptions for each animation phase
  const stepDescriptions = [
    "1. Users deposit a single token of their choice",
    "2. ETH holder moves their deposit to the matching pool", 
    "3. USDC holder joins, creating a potential match",
    "4. System combines deposits into a concentrated LP position",
    "5. Position earns trading fees from the liquidity pool",
    "6. Fee income is distributed back to both providers"
  ];

  // Track current step for description text
  const [currentStep, setCurrentStep] = React.useState(0);
  
  // Update description text when animation step changes
  React.useEffect(() => {
    const stepChangeListeners = [
      setTimeout(() => setCurrentStep(0), 0),
      setTimeout(() => setCurrentStep(1), 1500),
      setTimeout(() => setCurrentStep(2), 3000),  
      setTimeout(() => setCurrentStep(3), 4500),
      setTimeout(() => setCurrentStep(4), 6000),
      setTimeout(() => setCurrentStep(5), 7500),
      setTimeout(() => setCurrentStep(0), 10000),
    ];
    
    return () => stepChangeListeners.forEach(t => clearTimeout(t));
  }, [inView]);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <div className="text-center mb-8">
        <h3 className="text-xl font-bold text-white">How Single-Sided Liquidity Works</h3>
        <p className="text-blue-400 mt-2">Follow the animation to see the process</p>
      </div>
      
      <motion.div
        className="relative h-96 w-full flex items-center justify-center"
        variants={containerVariants}
        initial="hidden"
        animate={controls}
      >
        {/* Token A (ETH) */}
        <motion.div 
          className="absolute flex flex-col items-center"
          variants={tokenAVariants}
        >
          <div className="p-5 bg-blue-700/30 border-2 border-blue-500 rounded-full shadow-lg shadow-blue-500/20">
            <svg width="40" height="40" viewBox="0 0 256 417" className="h-12 w-12">
              <path fill="#343434" d="M127.961 0l-2.795 9.5v275.668l2.795 2.79 127.962-75.638z" />
              <path fill="#8C8C8C" d="M127.962 0L0 212.32l127.962 75.639V154.158z" />
              <path fill="#3C3C3B" d="M127.961 312.187l-1.575 1.92v98.199l1.575 4.6L256 236.587z" />
              <path fill="#8C8C8C" d="M127.962 416.905v-104.72L0 236.585z" />
              <path fill="#141414" d="M127.961 287.958l127.96-75.637-127.96-58.162z" />
              <path fill="#393939" d="M0 212.32l127.96 75.638v-133.8z" />
            </svg>
          </div>
          <div className="mt-3 text-white font-semibold text-lg">ETH</div>
          <div className="mt-1 text-blue-300 text-sm">Volatile Token</div>
        </motion.div>
        
        {/* Token B (USDC) */}
        <motion.div 
          className="absolute flex flex-col items-center"
          variants={tokenBVariants}
        >
          <div className="p-5 bg-blue-500/30 border-2 border-blue-300 rounded-full shadow-lg shadow-blue-300/20">
            <svg width="40" height="40" viewBox="0 0 32 32" className="h-12 w-12">
              <circle cx="16" cy="16" r="16" fill="#2775CA"/>
              <path d="M20.022 15.746c0-2.465-1.478-3.323-4.433-3.674-2.12-.258-2.54-.775-2.54-1.704 0-.93.775-1.548 2.325-1.548 1.377 0 2.153.431 2.54 1.445.086.258.344.43.603.43h1.378c.43 0 .775-.344.775-.774 0-.172 0-.258-.086-.43-.517-1.634-2.066-2.841-4.176-3.013V4.607c0-.431-.344-.775-.775-.775h-1.377c-.431 0-.775.344-.775.775v1.873c-2.497.259-4.090 1.807-4.090 3.873 0 2.464 1.463 3.335 4.433 3.674 1.978.345 2.54.775 2.54 1.772 0 .997-.938 1.703-2.368 1.703-1.893 0-2.541-.774-2.713-1.806-.085-.258-.344-.43-.688-.43H9.276a.782.782 0 00-.775.775c0 .086 0 .258.086.344.517 1.892 2.066 3.013 4.347 3.271v1.873c0 .43.344.774.775.774h1.377c.431 0 .775-.344.775-.774v-1.873c2.497-.258 4.161-1.892 4.161-3.959z" fill="#FFF"/>
            </svg>
          </div>
          <div className="mt-3 text-white font-semibold text-lg">USDC</div>
          <div className="mt-1 text-blue-300 text-sm">Stable Token</div>
        </motion.div>
        
        {/* LP Token */}
        <motion.div
          className="absolute flex flex-col items-center z-50"
          variants={lpTokenVariants}
        >
          <div className="p-3 bg-violet-600 border-2 border-violet-400 rounded-full shadow-lg shadow-violet-500/20 relative">
            <div className="absolute -top-2 -left-2 rounded-full bg-blue-700/30 border-2 border-blue-500 h-8 w-8 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 256 417">
                <path fill="#343434" d="M127.961 0l-2.795 9.5v275.668l2.795 2.79 127.962-75.638z" />
                <path fill="#8C8C8C" d="M127.962 0L0 212.32l127.962 75.639V154.158z" />
                <path fill="#3C3C3B" d="M127.961 312.187l-1.575 1.92v98.199l1.575 4.6L256 236.587z" />
                <path fill="#8C8C8C" d="M127.962 416.905v-104.72L0 236.585z" />
                <path fill="#141414" d="M127.961 287.958l127.96-75.637-127.96-58.162z" />
                <path fill="#393939" d="M0 212.32l127.96 75.638v-133.8z" />
              </svg>
            </div>
            <div className="absolute -top-2 -right-2 rounded-full bg-blue-500/30 border-2 border-blue-300 h-8 w-8 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 32 32">
                <circle cx="16" cy="16" r="16" fill="#2775CA"/>
                <path d="M20.022 15.746c0-2.465-1.478-3.323-4.433-3.674-2.12-.258-2.54-.775-2.54-1.704 0-.93.775-1.548 2.325-1.548 1.377 0 2.153.431 2.54 1.445.086.258.344.43.603.43h1.378c.43 0 .775-.344.775-.774 0-.172 0-.258-.086-.43-.517-1.634-2.066-2.841-4.176-3.013V4.607c0-.431-.344-.775-.775-.775h-1.377c-.431 0-.775.344-.775.775v1.873c-2.497.259-4.090 1.807-4.090 3.873 0 2.464 1.463 3.335 4.433 3.674 1.978.345 2.54.775 2.54 1.772 0 .997-.938 1.703-2.368 1.703-1.893 0-2.541-.774-2.713-1.806-.085-.258-.344-.43-.688-.43H9.276a.782.782 0 00-.775.775c0 .086 0 .258.086.344.517 1.892 2.066 3.013 4.347 3.271v1.873c0 .43.344.774.775.774h1.377c.431 0 .775-.344.775-.774v-1.873c2.497-.258 4.161-1.892 4.161-3.959z" fill="#FFF"/>
              </svg>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-violet-400" viewBox="0 0 20 20" fill="currentColor">
              <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" />
            </svg>
          </div>
          <div className="mt-2 text-white font-semibold text-xs">ETH-USDC LP</div>
          <div className="mt-0.5 text-blue-300 text-[8px]">Concentrated Position</div>
        </motion.div>
        
        {/* Returns */}
        <motion.div
          className="absolute bg-green-900 border border-green-500 rounded-lg py-3 px-6 z-50"
          variants={returnsVariants}
          style={{ top: "30%" }} // moved up beyond the midpoint
        >
          <div className="text-green-400 text-2xl font-bold">+8.2% APR</div>
          <div className="text-green-500 text-sm">Trading Fee Income</div>
        </motion.div>
        
        {/* Return to Token A */}
        <motion.div
          className="absolute text-green-400 font-bold px-3 py-1 bg-green-900/30 border border-green-500 rounded-full z-10"
          variants={returnAVariants}
        >
          +4.9% (60%)
        </motion.div>
        
        {/* Return to Token B */}
        <motion.div
          className="absolute text-green-400 font-bold px-3 py-1 bg-green-900/30 border border-green-500 rounded-full z-10"
          variants={returnBVariants}
        >
          +3.3% (40%) 
        </motion.div>
      </motion.div>
      
      {/* Current step description */}
      <div className="mt-8 bg-blue-900/20 border border-blue-800 rounded-lg py-4 px-6 text-center max-w-3xl mx-auto">
        <motion.p 
          key={currentStep}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-white text-lg"
        >
          {stepDescriptions[currentStep]}
        </motion.p>
      </div>
      
      {/* Timeline steps */}
      <div className="mt-10">
        <div className="flex justify-between max-w-4xl mx-auto">
          <div className={`w-1/6 text-center ${currentStep === 0 ? 'text-blue-400 font-medium' : 'text-gray-400'}`}>
            Deposit
          </div>
          <div className={`w-1/6 text-center ${currentStep === 1 ? 'text-blue-400 font-medium' : 'text-gray-400'}`}>
            First Token
          </div>
          <div className={`w-1/6 text-center ${currentStep === 2 ? 'text-blue-400 font-medium' : 'text-gray-400'}`}>
            Second Token
          </div>
          <div className={`w-1/6 text-center ${currentStep === 3 ? 'text-blue-400 font-medium' : 'text-gray-400'}`}>
            Combine
          </div>
          <div className={`w-1/6 text-center ${currentStep === 4 ? 'text-blue-400 font-medium' : 'text-gray-400'}`}>
            Earn Fees
          </div>
          <div className={`w-1/6 text-center ${currentStep === 5 ? 'text-blue-400 font-medium' : 'text-gray-400'}`}>
            Distribute
          </div>
        </div>
        <div className="h-1 bg-gray-700 mt-2 max-w-4xl mx-auto relative">
          <motion.div 
            className="absolute top-0 left-0 h-full bg-blue-500 rounded"
            animate={{ width: `${(currentStep / 5) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>
    </div>
  );
};

export default MatchingAnimation;

