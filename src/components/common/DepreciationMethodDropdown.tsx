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
      value: 'written-down-value', 
      label: 'Written-Down Value (WDV)', 
      icon: <Calculator className="w-4 h-4 text-blue-500" />,
      description: 'Depreciation based on reducing balance method'
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
