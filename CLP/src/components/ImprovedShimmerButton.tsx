import React from 'react';
import { Link } from 'react-router-dom';

interface ImprovedShimmerButtonProps {
  to?: string;
  onClick?: () => void;
  children: React.ReactNode;
  variant?: 'filled' | 'outline';
  color?: 'blue' | 'purple';
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const ImprovedShimmerButton: React.FC<ImprovedShimmerButtonProps> = ({ 
  to, 
  onClick, 
  children, 
  variant = 'filled', 
  color = 'blue',
  className = '',
  size = 'md',
}) => {
  // Size classes - added xl size to match the Learn More button
  const sizeClasses = {
    sm: 'h-10 px-4 text-sm',
    md: 'h-12 px-6 text-base',
    lg: 'h-14 px-8 text-lg',
    xl: 'px-8 py-3 md:py-4 md:text-lg md:px-10 text-base font-medium' // Matches Learn More button
  };
  
  // Updated variant classes to make buttons hollow
  const variantClasses = {
    filled: {
      blue: 'bg-transparent border-2 border-blue-500 text-blue-400',
      purple: 'bg-transparent border-2 border-purple-500 text-purple-400'
    },
    outline: {
      blue: 'bg-transparent border-2 border-blue-500 text-blue-400',
      purple: 'bg-transparent border-2 border-purple-500 text-purple-400'
    }
  };

  // Shimmer effect color with higher opacity
  const shimmerColor = {
    blue: 'via-blue-400',
    purple: 'via-purple-400'
  };

  const buttonContent = (
    <button 
      onClick={onClick}
      className={`relative overflow-hidden rounded-md font-bold cursor-pointer hover:opacity-90 transition-opacity ${sizeClasses[size]} ${variantClasses[variant][color]} ${className}`}
    >
      <span className="relative z-10">{children}</span>
      
      {/* Shimmer effect with higher opacity for more visibility */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div 
          className={`absolute top-0 -inset-x-full w-1/2 h-full bg-gradient-to-r from-transparent ${shimmerColor[color]} to-transparent opacity-50`}
          style={{
            animation: variant === 'outline' ? 'sweep 3.5s infinite' : 'sweep 2.5s infinite',
            transformOrigin: 'center'
          }}
        />
      </div>
    </button>
  );

  // Add global style for shimmer animation
  React.useEffect(() => {
    // Check if the style is already added
    if (!document.getElementById('shimmer-style')) {
      const styleEl = document.createElement('style');
      styleEl.id = 'shimmer-style';
      styleEl.textContent = `
        @keyframes sweep {
          0% {
            transform: translateX(-100%) skewX(-15deg);
          }
          100% {
            transform: translateX(400%) skewX(-15deg);
          }
        }
      `;
      document.head.appendChild(styleEl);
    }
    
    // Cleanup
    return () => {
      // Only remove if no other buttons are using it
      if (document.querySelectorAll('.shimmer-button').length === 1) {
        const styleEl = document.getElementById('shimmer-style');
        if (styleEl) styleEl.remove();
      }
    };
  }, []);

  // Return as Link if 'to' prop is provided, otherwise as button
  if (to) {
    return (
      <Link to={to} className="inline-block cursor-pointer">
        {buttonContent}
      </Link>
    );
  }

  return buttonContent;
};

export default ImprovedShimmerButton;
