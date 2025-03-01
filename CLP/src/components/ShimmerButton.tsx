import React from 'react';
import { Link } from 'react-router-dom';

interface ShimmerButtonProps {
  to: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const ShimmerButton: React.FC<ShimmerButtonProps> = ({ to, children, size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'h-10 px-4 text-sm',
    md: 'h-12 px-6 text-base',
    lg: 'h-16 px-10 text-lg'
  };

  return (
    <Link
      to={to}
      className={`
        inline-flex ${sizeClasses[size]} animate-shimmer items-center justify-center 
        rounded-md border border-blue-800 
        bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] 
        bg-[length:200%_100%] font-medium text-blue-400 
        transition-colors hover:text-blue-300 ${className}
      `}
    >
      {children}
    </Link>
  );
};

export default ShimmerButton;
