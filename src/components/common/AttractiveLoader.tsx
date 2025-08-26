import React from 'react';
import { Package, TrendingUp, Users, BarChart3 } from 'lucide-react';

interface AttractiveLoaderProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'minimal' | 'fullscreen';
}

const AttractiveLoader: React.FC<AttractiveLoaderProps> = ({ 
  message = "Loading dashboard data...", 
  size = 'md',
  variant = 'default'
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-8 h-8';
      case 'lg':
        return 'w-16 h-16';
      default:
        return 'w-12 h-12';
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'sm':
        return 'text-sm';
      case 'lg':
        return 'text-xl';
      default:
        return 'text-base';
    }
  };

  if (variant === 'minimal') {
    return (
      <div className="flex items-center justify-center">
        <div className={`${getSizeClasses()} relative`}>
          <div className="absolute inset-0 rounded-full border-4 border-blue-200"></div>
          <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  if (variant === 'fullscreen') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          {/* Animated Icons */}
          <div className="relative mb-8">
            <div className="flex items-center justify-center space-x-4">
              <div className="animate-bounce">
                <Package className="w-8 h-8 text-blue-500" />
              </div>
              <div className="animate-bounce" style={{ animationDelay: '0.1s' }}>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
              <div className="animate-bounce" style={{ animationDelay: '0.2s' }}>
                <Users className="w-8 h-8 text-purple-500" />
              </div>
              <div className="animate-bounce" style={{ animationDelay: '0.3s' }}>
                <BarChart3 className="w-8 h-8 text-orange-500" />
              </div>
            </div>
          </div>

          {/* Main Spinner */}
          <div className="relative mb-6">
            <div className="w-20 h-20 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-blue-200"></div>
              <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
              <div className="absolute inset-2 rounded-full border-4 border-purple-200"></div>
              <div className="absolute inset-2 rounded-full border-4 border-purple-600 border-t-transparent animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
            </div>
          </div>

          {/* Loading Text */}
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-gray-800">{message}</h3>
            <p className="text-gray-600">Please wait while we prepare your dashboard</p>
          </div>

          {/* Progress Dots */}
          <div className="flex justify-center space-x-2 mt-6">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="text-center">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        {/* Main Content */}
        <div className="relative z-10">
          {/* Animated Icons */}
          <div className="relative mb-8">
            <div className="flex items-center justify-center space-x-6">
              <div className="animate-bounce">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="animate-bounce" style={{ animationDelay: '0.1s' }}>
                <div className="p-3 bg-green-100 rounded-full">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="animate-bounce" style={{ animationDelay: '0.2s' }}>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div className="animate-bounce" style={{ animationDelay: '0.3s' }}>
                <div className="p-3 bg-orange-100 rounded-full">
                  <BarChart3 className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Main Spinner */}
          <div className="relative mb-6">
            <div className="w-16 h-16 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-blue-200"></div>
              <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
              <div className="absolute inset-2 rounded-full border-4 border-purple-200"></div>
              <div className="absolute inset-2 rounded-full border-4 border-purple-600 border-t-transparent animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
            </div>
          </div>

          {/* Loading Text */}
          <div className="space-y-2">
            <h3 className={`font-semibold text-gray-800 ${getTextSize()}`}>{message}</h3>
            <p className="text-gray-600 text-sm">Please wait while we prepare your dashboard</p>
          </div>

          {/* Progress Dots */}
          <div className="flex justify-center space-x-2 mt-6">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttractiveLoader;
