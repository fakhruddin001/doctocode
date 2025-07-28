import React, { useState, useCallback } from 'react';

interface Ripple {
  x: number;
  y: number;
  size: number;
  id: number;
}

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  loading?: boolean;
  loadingText?: string;
  buttonColor?: 'green' | 'grey';
  disabled?: boolean;
}

const LoadingButton: React.FC<LoadingButtonProps> = ({ 
  children, 
  loading = false, 
  onClick,
  type = "submit",
  className = "",
  loadingText = "Generating Magic...",
  buttonColor = 'green',
  disabled: propDisabled = false,
  ...props 
}) => {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const getButtonStyles = () => {
    switch (buttonColor) {
      case 'grey':
        return {
          default: 'bg-gray-600 text-white',
          hover: 'hover:bg-gradient-to-r hover:from-gray-500 hover:to-gray-700 hover:-translate-y-1 hover:rotate-1',
          active: 'active:translate-y-0 active:rotate-0',
          loading: 'bg-gradient-to-r from-gray-400 via-gray-500 to-gray-600 text-white cursor-not-allowed animate-pulse-opacity'
        };
      case 'green':
      default:
        return {
          default: 'bg-green-600 text-white',
          hover: 'hover:bg-gradient-to-r hover:from-green-500 hover:to-emerald-600 hover:-translate-y-1 hover:rotate-1',
          active: 'active:translate-y-0 active:rotate-0',
          loading: 'bg-gradient-to-r from-green-400 via-emerald-500 to-teal-600 text-white cursor-not-allowed animate-pulse-opacity'
        };
    }
  };

  const { default: defaultStyle, hover: hoverStyle, active: activeStyle, loading: loadingStyle } = getButtonStyles();

  // Create ripple effect on click
  const createRipple = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    if (propDisabled || loading) return; // Exit early if button is disabled or loading
    
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    const newRipple: Ripple = {
      x,
      y,
      size,
      id: Date.now()
    };

    setRipples(prev => [...prev, newRipple]);
    
    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);

    if (onClick) {
      onClick(event);
    }
  }, [onClick, loading, propDisabled]);

  return (
    <>
      <style>
        {`
          @keyframes pulse-opacity {
            0% { opacity: 0.85; }
            50% { opacity: 1; }
            100% { opacity: 0.85; }
          }

          .animate-pulse-opacity {
            animation: pulse-opacity 1s infinite;
          }
        `}
      </style>
      <button
        type={type}
        onClick={createRipple}
        disabled={propDisabled || loading} // Use propDisabled or loading to determine disabled state
        className={`
          relative overflow-hidden py-3 px-6 rounded-xl text-base font-bold
          transition-all duration-500 ease-out transform-gpu
          focus:outline-none focus:ring-4 focus:ring-green-300/50
          shadow-2xl ${!propDisabled && !loading ? 'hover:shadow-green-500/25' : ''}
          ${loading ? loadingStyle : `${defaultStyle} ${!propDisabled ? `${hoverStyle} ${activeStyle}` : ''}`}
          ${className}
        `}
        {...props}
      >
        {/* Main content */}
        <span className="relative z-20 flex items-center justify-center">
          {loading ? (
            <>
              <div className="w-5 h-5 mr-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span className="animate-pulse">{loadingText}</span>
            </>
          ) : (
            children
          )}
        </span>

        {/* Click ripple effects */}
        {ripples.map((ripple) => (
          <span
            key={ripple.id}
            className="absolute bg-white/0 rounded-full animate-ripple pointer-events-none"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: ripple.size,
              height: ripple.size,
            }}
          />
        ))}

        {/* Border glow effect when loading */}
        {loading && (
          <div className="absolute inset-0 rounded-xl border-2 border-white/20 animate-pulse-opacity" />
        )}
      </button>
    </>
  );
};

export default LoadingButton;