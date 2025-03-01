import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import cosmosLogo from "../assets/cosmosLogo.png";
import { connectWallet } from "../utils/contract"; // Import real wallet connection function
import { ethers, utils } from "ethers";
import { useNotification } from "../context/NotificationContext";
import ConnectWalletButton from './ConnectWalletButton';

type WalletState = {
  connected: boolean;
  address: string | null;
  balance: string | null;
};

const DashNav: React.FC = () => {
  const location = useLocation();
  const { showNotification } = useNotification();
  const [wallet, setWallet] = useState<WalletState>({
    connected: false,
    address: null,
    balance: null,
  });
  
  // Add state for mobile menu
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleConnectWallet = async () => {
    try {
      const walletData = await connectWallet();
      if (!walletData) {
        throw new Error("Failed to retrieve wallet data");
      }
  
      const { address, signer } = walletData; // Get both address and signer
  
      if (address) {
        setWallet({
          connected: true,
          address,
          balance: "Fetching...",
        });
        await fetchBalance(address);
        showNotification(
          'success',
          `Connected to address ${address.slice(0, 6)}...${address.slice(-4)}`,
          'Wallet Connected'
        );
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      showNotification(
        'error',
        'Could not connect to wallet. Please try again.',
        'Connection Failed'
      );
    }
  };

  // ✅ Fetch Balance from Wallet
  const fetchBalance = async (address: string) => {
    try {
      if (!window.ethereum) return;
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const balance = await provider.getBalance(address);
      setWallet((prevState) => ({
        ...prevState,
        balance: utils.formatEther(balance) + " ETH", // Convert Wei to ETH
      }));
    } catch (error) {
      console.error("Failed to fetch balance:", error);
      showNotification(
        'warning',
        'Connected successfully but could not fetch balance.',
        'Balance Error'
      );
    }
  };

  const disconnectWallet = () => {
    setWallet({
      connected: false,
      address: null,
      balance: null,
    });
    showNotification(
      'info',
      'Your wallet has been disconnected.',
      'Wallet Disconnected'
    );
  };

  // Toggle mobile menu and close it when changing routes
  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

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
            {/* Desktop navigation links - keep unchanged */}
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

          {/* Mobile menu button - New addition */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-300 hover:text-white hover:bg-blue-900/30 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <span className="sr-only">Open main menu</span>
              {!mobileMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>

          {/* Desktop wallet button - Keep unchanged */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {wallet.connected ? (
              <div className="flex items-center">
                <div className="mr-4 text-sm text-gray-300">
                  <span className="hidden md:inline">Balance: </span>
                  <span className="font-medium text-white">{wallet.balance}</span>
                </div>
                <div className="relative">
                  <button
                    onClick={disconnectWallet}
                    className="bg-blue-800/40 border border-blue-700/50 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center"
                  >
                    <span className="hidden md:inline mr-2">Connected:</span>
                    <span className="font-medium">{wallet.address}</span>
                  </button>
                </div>
              </div>
            ) : (
              <ConnectWalletButton onClick={handleConnectWallet} />
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown - New addition */}
      <div className={`${mobileMenuOpen ? 'block' : 'hidden'} sm:hidden bg-gray-900/90`}>
        <div className="px-2 pt-2 pb-3 space-y-1">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              isActive || location.pathname === "/dashboard"
                ? "bg-blue-900/50 text-white block px-3 py-3 rounded-md text-base font-medium"
                : "text-gray-300 hover:bg-blue-900/30 hover:text-white block px-3 py-3 rounded-md text-base font-medium"
            }
          >
            Pooling
          </NavLink>
          <NavLink
            to="/holdings"
            className={({ isActive }) =>
              isActive
                ? "bg-blue-900/50 text-white block px-3 py-3 rounded-md text-base font-medium"
                : "text-gray-300 hover:bg-blue-900/30 hover:text-white block px-3 py-3 rounded-md text-base font-medium"
            }
          >
            My Holdings
          </NavLink>
          <NavLink
            to="/analytics"
            className={({ isActive }) =>
              isActive
                ? "bg-blue-900/50 text-white block px-3 py-3 rounded-md text-base font-medium"
                : "text-gray-300 hover:bg-blue-900/30 hover:text-white block px-3 py-3 rounded-md text-base font-medium"
            }
          >
            Analytics
          </NavLink>
          
          {/* Mobile wallet button */}
          <div className="mt-4 px-3 py-3">
            {wallet.connected ? (
              <div className="space-y-2">
                <div className="text-sm text-gray-300">
                  <span>Balance: </span>
                  <span className="font-medium text-white">{wallet.balance}</span>
                </div>
                <button
                  onClick={disconnectWallet}
                  className="w-full bg-blue-800/40 border border-blue-700/50 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Disconnect: {wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}
                </button>
              </div>
            ) : (
              <button
                onClick={handleConnectWallet}
                className="w-full bg-blue-800/40 border border-blue-700/50 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
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

export default DashNav;