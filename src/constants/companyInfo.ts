// Company Information Constants
export const COMPANY_INFO = {
  // Company incorporation date - September 24, 2020
  INCORPORATION_DATE: new Date('2020-09-24'),
  
  // Company name
  NAME: 'iHub Inventory Management',
  
  // Minimum date for all inventory operations
  MIN_INVENTORY_DATE: new Date('2020-09-24'),
  
  // Maximum date (current date)
  MAX_INVENTORY_DATE: new Date(),
  
  // Minimum year for all operations (2020)
  MIN_YEAR: 2020,
  
  // Current year
  CURRENT_YEAR: new Date().getFullYear(),
} as const;

// Helper function to validate inventory dates
export const validateInventoryDate = (date: Date | null | undefined): boolean => {
  if (!date) return true; // Allow null/undefined dates
  return date >= COMPANY_INFO.MIN_INVENTORY_DATE && date <= COMPANY_INFO.MAX_INVENTORY_DATE;
};

// Helper function to get valid date or default to incorporation date
export const getValidInventoryDate = (date: Date | null | undefined): Date => {
  if (!date || date < COMPANY_INFO.MIN_INVENTORY_DATE) {
    return COMPANY_INFO.MIN_INVENTORY_DATE;
  }
  if (date > COMPANY_INFO.MAX_INVENTORY_DATE) {
    return COMPANY_INFO.MAX_INVENTORY_DATE;
  }
  return date;
};

// Helper function to format incorporation date for display
export const getIncorporationDateString = (): string => {
  return COMPANY_INFO.INCORPORATION_DATE.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Helper function to validate year (must be 2020 or later)
export const validateYear = (year: number): boolean => {
  return year >= COMPANY_INFO.MIN_YEAR && year <= COMPANY_INFO.CURRENT_YEAR;
};

// Helper function to get valid year or default to minimum year
export const getValidYear = (year: number | null | undefined): number => {
  if (!year || year < COMPANY_INFO.MIN_YEAR) {
    return COMPANY_INFO.MIN_YEAR;
  }
  if (year > COMPANY_INFO.CURRENT_YEAR) {
    return COMPANY_INFO.CURRENT_YEAR;
  }
  return year;
};

// Helper function to generate year range from 2020 to current year
export const getYearRange = (): number[] => {
  const years = [];
  for (let year = COMPANY_INFO.CURRENT_YEAR; year >= COMPANY_INFO.MIN_YEAR; year--) {
    years.push(year);
  }
  return years;
};
