import React from 'react';
import { Calendar } from 'lucide-react';
import AttractiveDropdown from './AttractiveDropdown';
import { COMPANY_INFO } from '../../constants/companyInfo';

interface YearDropdownProps {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  error?: string;
  size?: 'sm' | 'md' | 'lg';
  startYear?: number;
  endYear?: number;
  yearsBack?: number;
  yearsForward?: number;
}

const YearDropdown: React.FC<YearDropdownProps> = ({
  value,
  onChange,
  placeholder = "Select year",
  startYear,
  endYear,
  yearsBack = 10,
  yearsForward = 2,
  ...props
}) => {
  const currentYear = COMPANY_INFO.CURRENT_YEAR;
  
  // Generate year options - always start from 2020
  const generateYears = () => {
    const start = startYear || COMPANY_INFO.MIN_YEAR;
    const end = endYear || currentYear;
    
    // Ensure we don't go below 2020
    const validStart = Math.max(start, COMPANY_INFO.MIN_YEAR);
    const validEnd = Math.min(end, currentYear);
    
    const years = [];
    for (let year = validEnd; year >= validStart; year--) {
      years.push({
        value: year.toString(),
        label: year.toString(),
        icon: <Calendar className="w-4 h-4 text-blue-500" />,
        description: year === currentYear ? 'Current year' : undefined
      });
    }
    return years;
  };

  const options = generateYears();

  return (
    <AttractiveDropdown
      options={options}
      value={value.toString()}
      onChange={(stringValue) => onChange(Number(stringValue))}
      placeholder={placeholder}
      icon={<Calendar className="w-4 h-4" />}
      searchable
      {...props}
    />
  );
};

export default YearDropdown;
