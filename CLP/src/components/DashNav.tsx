import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { Link, useLocation } from 'react-router-dom';
import cosmosLogo from "../assets/cosmosLogo.png";

const DashNav: React.FC = () => {
  const { isConnected, address, connect, disconnect } = useWallet();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const formatAddress = (address: string | null) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Navigation items with their respective routes
  const navItems = [
    { name: 'Pooling', path: '/dashboard' },
    { name: 'My Holdings', path: '/holdings' },
    { name: 'Analytics', path: '/analytics' }
  ];

  // Determine if a nav item is active
  const isActive = (path: string) => {
    if (path === '/dashboard' && (location.pathname === '/' || location.pathname === '/dashboard')) {
      return true;
    }
    return location.pathname === path;
  };

  return (
    <nav className="bg-black/40 backdrop-blur-md border-b border-blue-800/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Navigation */}
          <div className="flex items-center">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center">
                <img src={cosmosLogo} alt="Cosmos Logo" className="h-8" />
                <span className="ml-2 text-xl font-['Orbitron'] font-bold text-white tracking-wider">CosmosPool</span>
              </Link>
            </div>
            
            {/* Updated Desktop Navigation */}
            <div className="hidden md:block ml-10">
              <div className="flex space-x-2">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`px-4 py-2 text-sm font-medium transition-all duration-200 ${
                      isActive(item.path)
                        ? 'text-blue-400 border-b border-blue-400'
                        : 'text-gray-300 hover:text-blue-400 hover:border-b border-blue-400'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          
          {/* Wallet Connection - removed network status */}
          <div className="hidden md:flex items-center">
            {isConnected ? (
              <div className="flex items-center bg-blue-900/20 border border-blue-700/30 rounded-lg overflow-hidden">
                <div className="px-3 py-2 flex items-center">
                  <div className="w-2 h-2 rounded-full bg-green-400 mr-2 relative">
                    <div className="absolute w-2 h-2 rounded-full bg-green-400 animate-ping opacity-75"></div>
                  </div>
                  <span className="text-gray-300 text-sm font-medium">{formatAddress(address)}</span>
                </div>
                <button 
                  onClick={disconnect}
                  className="h-full px-3 bg-red-900/20 hover:bg-red-900/40 text-red-400 border-l border-blue-700/30 text-sm transition-colors cursor-pointer"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={connect}
                className="relative inline-flex h-9 overflow-hidden rounded-lg p-[1px] focus:outline-none"
              >
                <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#3B82F6_0%,#1E40AF_50%,#3B82F6_100%)]" />
                <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-lg bg-slate-950 px-4 py-1 text-sm font-medium text-white backdrop-blur-3xl">
                  Connect Wallet
                </span>
              </button>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-blue-900/20"
            >
              <span className="sr-only">Open main menu</span>
              {!mobileMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu - updated hover styles */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-black/50 backdrop-blur-sm border-t border-blue-800/30">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`block px-3 py-2 text-base font-medium ${
                  isActive(item.path)
                    ? 'text-blue-400 border-b border-blue-400'
                    : 'text-gray-300 hover:text-blue-400 hover:border-b border-blue-400'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            
            {/* Mobile Wallet Connect - removed network status */}
            <div className="px-3 py-2">
              {isConnected ? (
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center bg-blue-900/20 px-3 py-2 rounded-lg border border-blue-800/30">
                    <div className="w-2 h-2 rounded-full bg-green-400 mr-2 relative">
                      <div className="absolute w-2 h-2 rounded-full bg-green-400 animate-ping opacity-75"></div>
                    </div>
                    <span className="text-gray-300 text-sm">{formatAddress(address)}</span>
                  </div>
                  <button
                    onClick={() => {
                      disconnect();
                      setMobileMenuOpen(false);
                    }}
                    className="bg-red-900/20 hover:bg-red-900/30 text-red-400 border border-red-900/30 px-3 py-2 rounded-lg text-sm"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    connect();
                    setMobileMenuOpen(false);
                  }}
                  className="relative inline-flex w-full h-10 overflow-hidden rounded-lg p-[1px] focus:outline-none"
                >
                  <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#3B82F6_0%,#1E40AF_50%,#3B82F6_100%)]" />
                  <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-lg bg-slate-950 px-4 py-1 text-sm font-medium text-white backdrop-blur-3xl">
                    Connect Wallet
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default DashNav;