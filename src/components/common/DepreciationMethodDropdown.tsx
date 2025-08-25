import React from 'react';
import { TrendingDown, Calculator, BarChart3 } from 'lucide-react';
import AttractiveDropdown from './AttractiveDropdown';

interface DepreciationMethodDropdownProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  error?: string;
  size?: 'sm' | 'md' | 'lg';
}

const DepreciationMethodDropdown: React.FC<DepreciationMethodDropdownProps> = ({
  value,
  onChange,
  placeholder = "Select depreciation method",
  ...props
}) => {
  const options = [
    { 
      value: 'straight-line', 
      label: 'Straight Line', 
      icon: <TrendingDown className="w-4 h-4 text-blue-500" />,
      description: 'Equal depreciation each year'
    },
    { 
      value: 'declining-balance', 
      label: 'Declining Balance', 
      icon: <BarChart3 className="w-4 h-4 text-orange-500" />,
      description: 'Higher depreciation in early years'
    },
    { 
      value: 'sum-of-years', 
      label: 'Sum of Years Digits', 
      icon: <Calculator className="w-4 h-4 text-green-500" />,
      description: 'Accelerated depreciation method'
    }
  ];

  return (
    <AttractiveDropdown
      options={options}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      icon={<TrendingDown className="w-4 h-4" />}
      {...props}
    />
  );
};

export default DepreciationMethodDropdown;
