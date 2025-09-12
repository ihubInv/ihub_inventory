import React from 'react';
import { Package, Tag } from 'lucide-react';
import AttractiveDropdown from './AttractiveDropdown';
import { Category } from '../../types';

interface AssetNameDropdownProps {
  categories: Category[];
  categoryType: string;
  assetCategory: string;
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

const AssetNameDropdown: React.FC<AssetNameDropdownProps> = ({
  categories,
  categoryType,
  assetCategory,
  value,
  onChange,
  placeholder = "Select asset name",
  searchable = true,
  ...props
}) => {
  // Filter categories based on selected type and category
  const filteredCategories = categories.filter(category => {
    const matchesType = !categoryType || category.type === categoryType;
    const matchesCategory = !assetCategory || category.name === assetCategory;
    return matchesType && matchesCategory && category.isactive;
  });

  // Extract unique asset names from filtered categories
  const assetNames = [...new Set(
    filteredCategories
      .flatMap(category => category.assetnames || []) // Use assetnames array and flatten
      .filter(Boolean)
  )];

  // Debug logging
  console.log('AssetNameDropdown Debug:', {
    categoryType,
    assetCategory,
    categoriesCount: categories.length,
    filteredCategoriesCount: filteredCategories.length,
    filteredCategories: filteredCategories.map(c => ({ name: c.name, type: c.type, assetnames: c.assetnames })),
    assetNames
  });

  const options = assetNames.map(assetName => ({
    value: assetName,
    label: assetName,
    icon: <Package className="w-4 h-4 text-blue-500" />,
    description: `${categoryType === 'major' ? 'Major' : 'Minor'} asset`
  }));

  // Show placeholder message if no options available
  const displayPlaceholder = !categoryType || !assetCategory 
    ? "Select category type and asset category first"
    : options.length === 0 
      ? "No asset names available for this category. Add asset names in Category Management."
      : placeholder;

  return (
    <AttractiveDropdown
      options={options}
      value={value}
      onChange={onChange}
      placeholder={displayPlaceholder}
      icon={<Package className="w-4 h-4" />}
      searchable={searchable}
      disabled={!categoryType || !assetCategory || options.length === 0}
      {...props}
    />
  );
};

export default AssetNameDropdown;
