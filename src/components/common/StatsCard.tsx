import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: number;
  icon: typeof LucideIcon;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo';
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
  };
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon: Icon, color, trend }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    yellow: 'from-yellow-500 to-yellow-600',
    red: 'from-red-500 to-red-600',
    purple: 'from-purple-500 to-purple-600',
    indigo: 'from-indigo-500 to-indigo-600',
  };

  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-600',
  };

  return (
    <div className="p-4 transition-shadow duration-200 bg-white border border-gray-100 shadow-sm rounded-2xl sm:p-6 hover:shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="mb-1 text-xs font-medium text-gray-600 sm:text-sm">{title}</p>
          <p className="text-2xl font-bold text-gray-900 sm:text-3xl">{value.toLocaleString()}</p>
          {trend && (
            <p className={`text-xs sm:text-sm font-medium mt-1 ${trendColors[trend.direction]}`}>
              {trend.direction === 'up' ? '↗' : trend.direction === 'down' ? '↘' : '→'} {trend.value}%
            </p>
          )}
        </div>
        <div className={`p-2 sm:p-3 rounded-xl bg-gradient-to-r ${colorClasses[color]}`}>
          <Icon className="w-5 h-5 text-white sm:h-6 sm:w-6" />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;