import React from 'react';
import ImprovedShimmerButton from './ImprovedShimmerButton';

interface ConnectWalletButtonProps {
  onClick: () => void;
}

const ConnectWalletButton: React.FC<ConnectWalletButtonProps> = ({ onClick }) => {
  return (
    <ImprovedShimmerButton 
      to="#" 
      onClick={onClick}
      size="md"
      className="bg-blue-600 hover:bg-blue-950 text-white"
    >
      Connect Wallet
    </ImprovedShimmerButton>
  );
};

export default ConnectWalletButton;
