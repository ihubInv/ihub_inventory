import React from 'react';
import { MapPin, Building } from 'lucide-react';
import AttractiveDropdown from './AttractiveDropdown';
import { InventoryItem } from '../../types';
import { useLocation } from '../../contexts/LocationContext';

interface LocationDropdownProps {
  inventoryItems: InventoryItem[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  error?: string;
  searchable?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const LocationDropdown: React.FC<LocationDropdownProps> = ({
  inventoryItems,
  value,
  onChange,
  placeholder = "Select location",
  searchable = true,
  ...props
}) => {
  const { locations } = useLocation();
  
  // Get all active locations from database
  const activeLocations = locations.filter(location => location.isactive);
  
  // Create location options with inventory data
  const options = activeLocations.map(location => {
    const itemsInLocation = inventoryItems.filter(item => item.locationofitem === location.name);
    const availableItems = itemsInLocation.filter(item => item.status === 'available').length;
    const issuedItems = itemsInLocation.filter(item => item.status === 'issued').length;
    
    return {
      value: location.name,
      label: location.name,
      icon: <MapPin className="w-4 h-4 text-blue-500" />,
      description: `${itemsInLocation.length} items (${availableItems} available, ${issuedItems} issued)`
    };
  });

  // Show placeholder message if no options available
  const displayPlaceholder = options.length === 0 
    ? "No locations available - Add locations in Location Management"
    : placeholder;

  return (
    <AttractiveDropdown
      options={options}
      value={value}
      onChange={onChange}
      placeholder={displayPlaceholder}
      icon={<Building className="w-4 h-4" />}
      searchable={searchable}
      disabled={options.length === 0}
      {...props}
    />
  );
};

export default LocationDropdown;
