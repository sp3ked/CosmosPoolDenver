import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { connectWallet } from '../utils/contract';

interface WalletContextType {
  isConnected: boolean;
  address: string | null;
  connecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType>({
  isConnected: false,
  address: null,
  connecting: false,
  connect: async () => {},
  disconnect: () => {},
});

export const useWallet = () => useContext(WalletContext);

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [address, setAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState<boolean>(false);

  // Check for existing connection on page load
  useEffect(() => {
    const checkConnection = async () => {
      // Check if we have a stored address
      const storedAddress = localStorage.getItem('walletAddress');
      
      // If there's a stored address and MetaMask is available, restore the connection
      if (storedAddress && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts && accounts.length > 0) {
            setAddress(accounts[0]);
            setIsConnected(true);
          } else {
            // Clear storage if no accounts found
            localStorage.removeItem('walletAddress');
          }
        } catch (error) {
          console.error('Failed to restore wallet connection:', error);
        }
      }
    };

    checkConnection();
  }, []);

  // Listen for account changes - Fixed event handling
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          setIsConnected(false);
          setAddress(null);
          localStorage.removeItem('walletAddress');
        } else {
          setAddress(accounts[0]);
          setIsConnected(true);
          localStorage.setItem('walletAddress', accounts[0]);
        }
      };

      // Use on instead of addListener
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      
      return () => {
        if (window.ethereum?.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        }
      };
    }
  }, []);

  const connect = async (): Promise<void> => {
    if (connecting) return;
    
    setConnecting(true);
    try {
      const result = await connectWallet();
      if (result && result.address) {
        setAddress(result.address);
        setIsConnected(true);
        localStorage.setItem('walletAddress', result.address);
      }
    } catch (error) {
      console.error('Connection failed:', error);
    } finally {
      setConnecting(false);
    }
  };

  const disconnect = (): void => {
    setIsConnected(false);
    setAddress(null);
    localStorage.removeItem('walletAddress');
  };

  return (
    <WalletContext.Provider
      value={{
        isConnected,
        address,
        connecting,
        connect,
        disconnect
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
