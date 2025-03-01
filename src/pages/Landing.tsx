import { useEffect, useState } from "react";
import LandingNav from "../components/LandingNav";
import SpaceBackground from "../components/backgrounds/spaceBg";
import ImprovedShimmerButton from "../components/ImprovedShimmerButton";
import MatchingAnimation from "../components/animations/MatchingAnimation";
import PriceRangeAnimation from "../components/animations/PriceRangeAnimation";
import FeeDistributionAnimation from "../components/animations/FeeDistributionAnimation";

function Landing() {
  const [isScrolled, setIsScrolled] = useState(false);
  
  useEffect(() => {
    // Handle scroll for sticky nav effects
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    
    // Cleanup
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      <div className="min-h-screen bg-black text-white">
        {/* Space Background */}
        <SpaceBackground />
        
        {/* Content Container */}
        <div className="relative z-10">
          <LandingNav isScrolled={isScrolled} />

          {/* Hero Section - Modified to take full viewport height */}
          <div className="relative h-screen flex items-center justify-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <h1 className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl">
                  <span className="block">Single-Sided Liquidity</span>
                  <span className="block text-blue-400">Meets Concentrated Pools</span>
                </h1>
                <p className="mt-3 max-w-md mx-auto text-base text-gray-300 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                  Provide just <strong>one</strong> token and let our platform handle the rest. 
                  We match you with a counterparty so you can enjoy the benefits of 
                  concentrated liquidity—without needing to supply two tokens.
                </p>
                <div className="mt-5 flex flex-row gap-4 justify-center md:mt-8">
                  <div>
                    <a
                      href="#what-is-clmm"
                      className="inline-flex items-center justify-center px-8 py-3 border border-blue-900 text-base font-medium rounded-md text-white bg-blue-900/50 hover:bg-blue-800/60 md:py-4 md:text-lg md:px-10 transition-colors"
                    >
                      Learn More
                    </a>
                  </div>
                  <div>
                    <ImprovedShimmerButton to="/dashboard" size="xl">
                      Launch App
                    </ImprovedShimmerButton>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Scroll Down Indicator */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center animate-bounce">
              <span className="text-gray-400 mb-1">Scroll Down</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>

          {/* What is CLMM Section */}
          <div id="what-is-clmm" className="py-16 bg-black/60 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="lg:text-center">
                <h2 className="text-base text-blue-400 font-semibold tracking-wide uppercase">
                  Understand the Technology
                </h2>
                <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-white sm:text-4xl">
                  Single-Sided Liquidity in a Concentrated Market Maker
                </p>
                <div className="mt-8 text-xl text-gray-300 lg:mx-auto">
                  <p className="mb-6">
                    <strong>Single-Sided Liquidity</strong> (SSLP) solves a big hurdle in 
                    Concentrated Liquidity Market Makers (CLMMs). Usually, you must deposit both 
                    tokens in a pair, but we let you deposit just one side. Our smart matching 
                    engine pairs you with another user providing the opposite token.
                  </p>
                  <p>
                    Concentrated Liquidity (CLMM) further amplifies capital efficiency by 
                    allowing providers to allocate funds within specific price ranges. 
                    Combining single-sided deposits with CLMM technology can drastically 
                    lower the barrier to entry.
                  </p>
                </div>
              </div>
              
              {/* Matching Animation - Add it here */}
              <MatchingAnimation className="mt-12" />
              
              <div className="mt-16">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                  <div className="bg-blue-900/20 backdrop-blur-sm p-6 rounded-lg border border-blue-800/50 shadow-lg hover:shadow-blue-900/20 transition-all">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-6 w-6">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Matchmaking Engine</h3>
                    <p className="text-gray-300">
                      Our protocol automatically pairs you with another 
                      depositor from the opposite side of the token pair. 
                      That way, no one has to juggle multiple coins.
                    </p>
                  </div>
                  
                  <div className="bg-blue-900/20 backdrop-blur-sm p-6 rounded-lg border border-blue-800/50 shadow-lg hover:shadow-blue-900/20 transition-all">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-6 w-6">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Simple Deposits</h3>
                    <p className="text-gray-300">
                      Deposit a single token (e.g., stablecoin or a more volatile 
                      asset) and let us handle the complexities of creating 
                      balanced liquidity positions within a specified price range.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* How It Works Section */}
          <div id="how-it-works" className="py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="lg:text-center">
                <h2 className="text-base text-blue-400 font-semibold tracking-wide uppercase">
                  Our Technology
                </h2>
                <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-white sm:text-4xl">
                  How Our Matching System Works
                </p>
                <p className="mt-4 max-w-2xl text-xl text-gray-300 lg:mx-auto">
                  Our platform employs sophisticated algorithms to match single-token 
                  depositors and allocate liquidity across optimized price ranges.
                </p>
              </div>

              {/* Price Range Animation - Add it here */}
              <PriceRangeAnimation className="mt-12" />

              <div className="mt-16">
                <div className="space-y-12">
                  <div className="flex flex-col md:flex-row gap-8 items-center">
                    <div className="md:w-1/2 bg-blue-900/20 backdrop-blur-sm p-6 rounded-lg border border-blue-800/50 shadow-lg hover:shadow-blue-900/20 transition-all">
                      <h3 className="text-2xl font-bold text-white mb-4">Price Range Selection</h3>
                      <p className="text-gray-300">
                        Our platform may suggest ±10%, ±30%, or custom 
                        ranges based on market data. By focusing liquidity 
                        in narrower bands, you earn higher fees on 
                        trades that happen within your chosen range.
                      </p>
                    </div>
                    <div className="md:w-1/2 bg-blue-900/20 backdrop-blur-sm p-6 rounded-lg border border-blue-800/50 shadow-lg hover:shadow-blue-900/20 transition-all">
                      <h3 className="text-2xl font-bold text-white mb-4">Seamless Matching</h3>
                      <p className="text-gray-300">
                        Once you deposit (say, just ETH), our system 
                        looks for someone depositing an equivalent 
                        stable asset. If a suitable match is found, 
                        both deposits are combined into a CLMM position.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col md:flex-row gap-8 items-center">
                    <div className="md:w-1/2 bg-blue-900/20 backdrop-blur-sm p-6 rounded-lg border border-blue-800/50 shadow-lg hover:shadow-blue-900/20 transition-all">
                      <h3 className="text-2xl font-bold text-white mb-4">Dynamic Fee Structure</h3>
                      <p className="text-gray-300">
                        We factor in volatility and demand to split 
                        fees fairly (e.g., 60/40) between depositors, 
                        reflecting the difference in risk between 
                        stable and volatile assets.
                      </p>
                    </div>
                    <div className="md:w-1/2 bg-blue-900/20 backdrop-blur-sm p-6 rounded-lg border border-blue-800/50 shadow-lg hover:shadow-blue-900/20 transition-all">
                      <h3 className="text-2xl font-bold text-white mb-4">Automated Rebalancing</h3>
                      <p className="text-gray-300">
                        For matched positions, our optional automated 
                        rebalancing adjusts price ranges if the market 
                        moves significantly—so your funds can keep 
                        earning rather than sitting idle out of range.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Advantages Section */}
          <div id="advantages" className="py-16 bg-black/60 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="lg:text-center">
                <h2 className="text-base text-blue-400 font-semibold tracking-wide uppercase">
                  Benefits
                </h2>
                <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-white sm:text-4xl">
                  Why Single-Sided + CLMM?
                </p>
                <p className="mt-4 max-w-2xl text-xl text-gray-300 lg:mx-auto">
                  We combine the convenience of single-token deposits 
                  with the profitability and efficiency of concentrated liquidity.
                </p>
              </div>
              
              {/* Fee Distribution Animation - Add it here */}
              <FeeDistributionAnimation className="mt-12" />

              <div className="mt-10">
                <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10">
                  <div className="bg-blue-900/20 backdrop-blur-sm p-6 rounded-lg border border-blue-800/50 shadow-lg hover:shadow-blue-900/20 transition-all">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mb-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        className="h-6 w-6"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Lower Entry Barrier</h3>
                    <p className="text-gray-300">
                      Provide <strong>one</strong> token instead of two, so you don't 
                      have to rebalance your assets just to start providing 
                      liquidity.
                    </p>
                  </div>

                  <div className="bg-blue-900/20 backdrop-blur-sm p-6 rounded-lg border border-blue-800/50 shadow-lg hover:shadow-blue-900/20 transition-all">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mb-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        className="h-6 w-6"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      Reduced Exposure
                    </h3>
                    <p className="text-gray-300">
                      If you prefer stable assets, deposit only that. 
                      If you prefer a token you already hold, deposit 
                      it alone. Our system handles pairing to 
                      streamline risk.
                    </p>
                  </div>

                  <div className="bg-blue-900/20 backdrop-blur-sm p-6 rounded-lg border border-blue-800/50 shadow-lg hover:shadow-blue-900/20 transition-all">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mb-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        className="h-6 w-6"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">High Efficiency</h3>
                    <p className="text-gray-300">
                      Concentrated liquidity yields higher fee returns 
                      than many traditional AMMs. Single-sided entry 
                      means you won't miss out just because you lack 
                      the other token.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Supported Exchanges */}
          <div className="py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="lg:text-center">
                <h2 className="text-base text-blue-400 font-semibold tracking-wide uppercase">
                  Ecosystem
                </h2>
                <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-white sm:text-4xl">
                  Supported Exchanges
                </p>
                <p className="mt-4 max-w-2xl text-xl text-gray-300 lg:mx-auto mb-10">
                  Our platform integrates with top DEXes to facilitate advanced 
                  single-sided concentrated liquidity.
                </p>
              </div>
              
              
              {/* Large shimmer button with improved animation */}
              <div className="mt-16 text-center">
                <ImprovedShimmerButton 
                  to="/dashboard" 
                  size="xl" 
                  className="px-16 text-xl shadow-2xl shadow-blue-900/20"
                >
                  Launch App Now
                </ImprovedShimmerButton>
              </div>
            </div>
          </div>
          
          {/* Risk Disclosure */}
          <div id="risk-disclosure" className="py-8 bg-black/40 text-white text-sm rounded border border-red-500 border-b-0 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="lg:text-center">
              <h2 className="text-base font-semibold tracking-wide uppercase text-red-500">Important Information</h2>
              <p className="mt-2 text-lg font-bold text-red-500">Risk Disclosure</p>
            </div>
            <div className="mt-4 space-y-2">
              <p>
                <strong>Impermanent Loss:</strong> With concentrated liquidity, impermanent loss can be more pronounced if the price moves outside your selected range.
              </p>
              <p>
                <strong>Matching Delays:</strong> Your deposit might remain unmatched if no suitable counterparty exists.
              </p>
              <p>
                <strong>Smart Contract Risk:</strong> All DeFi protocols have inherent smart contract risks. Audits reduce but do not eliminate this risk.
              </p>
              <p>
                <strong>Reward Structure:</strong> Fees are split according to risk (e.g. 60/40) and market conditions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Landing;