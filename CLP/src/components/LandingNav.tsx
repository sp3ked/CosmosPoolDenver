import React, { useState } from "react";
import { Link } from "react-router-dom";
import cosmosLogo from "../assets/cosmosLogo.png";
import ImprovedShimmerButton from "./ImprovedShimmerButton";

interface LandingNavProps {
  transparent?: boolean;
  isScrolled?: boolean;
}

const LandingNav: React.FC<LandingNavProps> = ({ transparent = true, isScrolled = false }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Determine background style based on scroll position
  const navBackground = isScrolled 
    ? 'bg-black/90' 
    : (transparent ? 'bg-black/30' : 'bg-black/70');

  // Smooth scroll function for navigation links
  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault();
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false); // Close mobile menu if open
    }
  };

  return (
    <nav className={`${navBackground} backdrop-blur-sm border-b border-blue-900/50 fixed w-full top-0 z-50 transition-all duration-300`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center">
                <img src={cosmosLogo} alt="Cosmos Logo" className="h-8" />
                <span className="ml-2 text-xl font-['Orbitron'] font-bold text-white tracking-wider">CosmosPool</span>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8 sm:items-center">
              <a 
                href="#what-is-clmm" 
                onClick={(e) => scrollToSection(e, 'what-is-clmm')}
                className="border-transparent text-gray-300 hover:border-blue-500 hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                What is CLMM
              </a>
              <a 
                href="#how-it-works" 
                onClick={(e) => scrollToSection(e, 'how-it-works')}
                className="border-transparent text-gray-300 hover:border-blue-500 hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                How It Works
              </a>
              <a 
                href="#advantages" 
                onClick={(e) => scrollToSection(e, 'advantages')}
                className="border-transparent text-gray-300 hover:border-blue-500 hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Advantages  
              </a>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <ImprovedShimmerButton to="/dashboard" color="blue" size="sm">
              Launch App
            </ImprovedShimmerButton>
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button 
              className="text-gray-300 hover:text-white" 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu - toggle visibility based on state */}
      <div className={`sm:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
        <div className="pt-2 pb-3 space-y-1">
          <a 
            href="#what-is-clmm" 
            onClick={(e) => scrollToSection(e, 'what-is-clmm')}
            className="border-l-4 border-transparent text-gray-300 hover:bg-blue-900/20 hover:border-blue-500 hover:text-white block pl-3 pr-4 py-2 text-base font-medium"
          >
            What is CLMM
          </a>
          <a 
            href="#how-it-works" 
            onClick={(e) => scrollToSection(e, 'how-it-works')}
            className="border-l-4 border-transparent text-gray-300 hover:bg-blue-900/20 hover:border-blue-500 hover:text-white block pl-3 pr-4 py-2 text-base font-medium"
          >
            How It Works
          </a>
          <a 
            href="#advantages" 
            onClick={(e) => scrollToSection(e, 'advantages')}
            className="border-l-4 border-transparent text-gray-300 hover:bg-blue-900/20 hover:border-blue-500 hover:text-white block pl-3 pr-4 py-2 text-base font-medium"
          >
            Advantages
          </a>
          <div className="mt-3 px-4">
            <ImprovedShimmerButton to="/dashboard" color="blue" className="w-full">
              Launch App
            </ImprovedShimmerButton>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default LandingNav;
