import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { ethers } from "ethers";
import { useNotification } from "../context/NotificationContext";
import { useWallet } from '../context/WalletContext';
import cosmosLogo from "../assets/cosmosLogo.png";

const DashNav: React.FC = () => {
  const location = useLocation();
  const { showNotification } = useNotification();
  const { isConnected, address, connect, disconnect } = useWallet();
  const [balance, setBalance] = useState<string | null>(null);

  // Fetch real balance when address changes
  useEffect(() => {
    const fetchBalance = async () => {
      if (isConnected && address && window.ethereum) {
        try {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const rawBalance = await provider.getBalance(address);
          const formattedBalance = parseFloat(ethers.utils.formatEther(rawBalance)).toFixed(4);
          setBalance(`${formattedBalance} ETH`);
        } catch (error) {
          console.error("Error fetching balance:", error);
          setBalance(null);
        }
      } else {
        setBalance(null);
      }
    };

    fetchBalance();
    // Set up balance refresh interval
    const intervalId = setInterval(fetchBalance, 10000); // Refresh every 10 seconds

    return () => clearInterval(intervalId);
  }, [isConnected, address]);

  const handleConnect = async () => {
    try {
      await connect();
      showNotification(
        'success',
        'Wallet connected successfully',
        'Connected'
      );
    } catch (error) {
      showNotification(
        'error',
        'Failed to connect wallet',
        'Error'
      );
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setBalance(null);
    showNotification(
      'info',
      'Wallet disconnected',
      'Disconnected'
    );
  };

  return (
    <nav className="bg-black/30 backdrop-blur-sm border-b border-blue-900/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <NavLink to="/" className="flex items-center">
                <img src={cosmosLogo} alt="Cosmos Logo" className="h-8" />
                <span className="ml-2 text-xl font-['Orbitron'] font-bold text-white tracking-wider">
                  CosmosPool
                </span>
              </NavLink>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  isActive || location.pathname === "/dashboard"
                    ? "border-blue-500 text-blue-500 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                    : "border-transparent text-gray-300 hover:border-gray-300 hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                }
              >
                Pooling
              </NavLink>
              <NavLink
                to="/holdings"
                className={({ isActive }) =>
                  isActive
                    ? "border-blue-500 text-blue-500 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                    : "border-transparent text-gray-300 hover:border-gray-300 hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                }
              >
                My Holdings
              </NavLink>
              <NavLink
                to="/analytics"
                className={({ isActive }) =>
                  isActive
                    ? "border-blue-500 text-blue-500 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                    : "border-transparent text-gray-300 hover:border-gray-300 hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                }
              >
                Analytics
              </NavLink>
            </div>
          </div>

          {/* Wallet section */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {isConnected ? (
              <div className="flex items-center">
                {balance && (
                  <div className="mr-4 text-sm text-gray-300">
                    <span className="hidden md:inline">Balance: </span>
                    <span className="font-medium text-white">{balance}</span>
                  </div>
                )}
                <div className="relative">
                  <button
                    onClick={handleDisconnect}
                    className="bg-blue-800/40 border border-blue-700/50 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center"
                  >
                    <span className="hidden md:inline mr-2">Connected:</span>
                    <span className="font-medium">{formatAddress(address!)}</span>
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={handleConnect}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

// Helper function to format address
function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default DashNav;