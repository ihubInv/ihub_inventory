import React, { useState } from 'react';
import { useInventory } from '../../contexts/InventoryContext';
import { useAuth } from '../../contexts/AuthContext';
import CustomDatePicker from '../common/DatePicker';
import { Save, X, Package, Calendar, DollarSign, MapPin, Image, TrendingDown, CalendarIcon } from 'lucide-react';
import { InventoryItem } from '../../types';

import UploadDropzone from '../common/UploadDropzone';
import { supabase } from '../../lib/supabaseClient';
import DepreciationCalculator from '../common/DepreciationCalculator';
import CategoryDropdown from '../common/CategoryDropdown';
import StatusDropdown from '../common/StatusDropdown';
import ConditionDropdown from '../common/ConditionDropdown';
import UnitDropdown from '../common/UnitDropdown';
import DepartmentDropdown from '../common/DepartmentDropdown';
import DepreciationMethodDropdown from '../common/DepreciationMethodDropdown';

const AddInventory: React.FC = () => {
  const { addInventoryItem, categories, inventoryItems } = useInventory();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [showFinancialYearPicker, setShowFinancialYearPicker] = useState(false);

  // Function to convert date to financial year format (e.g., 2025-26)
  const getFinancialYearFromDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = date.getMonth(); // 0-11
    
    // Financial year typically runs from April to March
    // If month is April (3) or later, it's the start of financial year
    // If month is before April (0-2), it's the end of previous financial year
    if (month >= 3) { // April to December
      return `${year}-${(year + 1).toString().slice(-2)}`;
    } else { // January to March
      return `${year - 1}-${year.toString().slice(-2)}`;
    }
  };

  const [formData, setFormData] = useState({
    uniqueid: '',
    financialyear: '2024-25',
    dateofinvoice: null as Date | null,
    dateofentry: new Date(),
    invoicenumber: '',
    assetcategory: '',
    assetcategoryid: "",
    assetname: '',
    specification: '',
    makemodel: '',
    productserialnumber: '',
    vendorname: '',
    quantityperitem: 1,
    rateinclusivetax: 0,
    totalcost: 0,
    locationofitem: '',
    issuedto: '',
    dateofissue: null as Date | null,
    expectedreturndate: null as Date | null,
    balancequantityinstock: 0,
    description: '',
    unitofmeasurement: 'Pieces',
    depreciationmethod: '',
    warrantyinformation: '',
    maintenanceschedule: '',
    conditionofasset: 'excellent' as const,
    status: 'available' as 'available' | 'issued' | 'maintenance' | 'retired',
    minimumstocklevel: 5,
    purchaseordernumber: '',
    expectedlifespan: '',
    assettag: '',
    salvagevalue: 0,
    attachments: [] as File[],
  });

  // Auto-generate unique ID functions
  const generateAssetCode = (assetName: string): string => {
    if (!assetName) return '';
    // Take first 3 letters and convert to uppercase
    return assetName.replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase();
  };

  const getNextSerialNumber = (financialYear: string, assetCode: string, location: string): string => {
    if (!financialYear || !assetCode || !location) return '001';
    
    // Create the prefix pattern to match existing IDs
    const prefix = `ihub/${financialYear}/${assetCode}/${location}/`;
    
    // Find all items with the same prefix
    const matchingItems = inventoryItems.filter(item => 
      item.uniqueid && item.uniqueid.startsWith(prefix)
    );
    
    if (matchingItems.length === 0) {
      return '001';
    }
    
    // Extract serial numbers and find the highest
    const serialNumbers = matchingItems
      .map(item => {
        const parts = item.uniqueid.split('/');
        const lastPart = parts[parts.length - 1];
        return parseInt(lastPart) || 0;
      })
      .filter(num => !isNaN(num));
    
    const maxSerial = Math.max(...serialNumbers, 0);
    const nextSerial = maxSerial + 1;
    
    // Pad to 3 digits
    return nextSerial.toString().padStart(3, '0');
  };

  const generateUniqueId = (): string => {
    const { financialyear, assetname, locationofitem } = formData;
    
    // Always start with ihub prefix
    let uniqueId = 'ihub/';
    
    // Add financial year or placeholder
    if (financialyear) {
      uniqueId += financialyear;
    } else {
      uniqueId += '--';
    }
    uniqueId += '/';
    
    // Add asset code or placeholder
    if (assetname) {
      uniqueId += generateAssetCode(assetname);
    } else {
      uniqueId += '--';
    }
    uniqueId += '/';
    
    // Add location or placeholder
    if (locationofitem) {
      uniqueId += locationofitem;
    } else {
      uniqueId += '--';
    }
    uniqueId += '/';
    
    // Add serial number only if all required fields are present
    if (financialyear && assetname && locationofitem) {
      const assetCode = generateAssetCode(assetname);
      const serialNumber = getNextSerialNumber(financialyear, assetCode, locationofitem);
      uniqueId += serialNumber;
    } else {
      uniqueId += '--';
    }
    
    return uniqueId;
  };

  // Update unique ID whenever relevant fields change
  React.useEffect(() => {
    const newUniqueId = generateUniqueId();
    if (newUniqueId !== formData.uniqueid) {
      setFormData(prev => ({
        ...prev,
        uniqueid: newUniqueId
      }));
    }
  }, [formData.financialyear, formData.assetname, formData.locationofitem, inventoryItems]);

  // Close financial year picker when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showFinancialYearPicker) {
        const target = event.target as HTMLElement;
        if (!target.closest('.financial-year-picker-container')) {
          setShowFinancialYearPicker(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showFinancialYearPicker]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));



    // Auto-calculate total cost
    if (name === 'quantityperitem' || name === 'rateinclusivetax') {
      const quantity = name === 'quantityperitem' ? parseFloat(value) || 0 : formData.quantityperitem;
      const rate = name === 'rateinclusivetax' ? parseFloat(value) || 0 : formData.rateinclusivetax;
      setFormData(prev => ({
        ...prev,
        totalcost: quantity * rate,
        balancequantityinstock: quantity
      }));
    }
  };

  // const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  //   debugger
  //   const assetcategory = e.target.value;
  //   setFormData(prev => ({
  //     ...prev,
  //     assetcategory: assetcategory // Make sure this matches your form schema
  //   }));
  // };
const handleFile = (file?: File) => {
  if (file) {
    setFormData(prev => ({
      ...prev,
      attachments: [...(prev?.attachments || []), file],
    }));
    setUploadSuccess(true);
  }
};


  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    debugger
    const selectedName = e.target.value;

    // Find the full category object by name
    const selectedCategory = availableCategories.find(cat => cat.name === selectedName);

    if (selectedCategory) {
      setFormData(prev => ({
        ...prev,
        assetcategoryid: selectedCategory.id,  // ✅ store the ID
        assetcategory: selectedCategory.name   // optional if needed for display
      }));
    }
  };



  // const handleSubmit = async (e: React.FormEvent) => {
  //   debugger
  //   e.preventDefault();
  //   setIsSubmitting(true);
  //   const payload: any = {
  //     ...formData,
  //     assetcategoryid: formData.assetcategoryid, // ✅ explicitly include ID
  //     dateofinvoice: formData.dateofinvoice || new Date(),
  //     dateofentry: formData.dateofentry,
  //     dateofissue: formData.dateofissue,
  //     expectedreturndate: formData.expectedreturndate,
  //     lastmodifiedby: user?.id || 'unknown',
  //     attachments: []
  //   };
  //   try {
  //     await addInventoryItem(payload);

  //     // Reset form
  //     setFormData({
  //       uniqueid: '',
  //       financialyear: '2024-25',
  //       dateofinvoice: null,
  //       dateofentry: new Date(),
  //       invoicenumber: '',
  //       assetcategory: '',
  //       assetcategoryid: '', // ✅ reset ID too
  //       assetname: '',
  //       specification: '',
  //       makemodel: '',
  //       productserialnumber: '',
  //       vendorname: '',
  //       quantityperitem: 1,
  //       rateinclusivetax: 0,
  //       totalcost: 0,
  //       locationofitem: '',
  //       issuedto: '',
  //       dateofissue: null,
  //       expectedreturndate: null,
  //       balancequantityinstock: 0,
  //       description: '',
  //       unitofmeasurement: 'Pieces',
  //       depreciationmethod: '',
  //       warrantyinformation: '',
  //       maintenanceschedule: '',
  //       conditionofasset: 'excellent',
  //       status: 'available' as 'available' | 'issued' | 'maintenance' | 'retired',
  //       minimumstocklevel: 5,
  //       purchaseordernumber: '',
  //       expectedlifespan: '',
  //       assettag: ''
  //     });

  //     alert('Inventory item added successfully!');
  //   } catch (error) {
  //     alert('Error adding inventory item. Please try again.');
  //   }

  //   setIsSubmitting(false);
  // };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate that unique ID is complete (no placeholders)
    if (formData.uniqueid.includes('--')) {
      alert('Please fill in all required fields (Financial Year, Asset Name, and Location) to generate a complete unique ID.');
      return;
    }
    
    setIsSubmitting(true);

  // 1. Upload files to Supabase
  const uploadedFiles: { name: string; url: string }[] = [];

  for (const file of formData.attachments || []) {
    const filePath = `attachments/${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from('inventory-invoice-images')
      .upload(filePath, file);

    if (error) {
      console.error('File upload error:', error.message);
      alert(`Failed to upload file: ${file.name}`);
      setIsSubmitting(false);
      return;
    }

    const { data: urlData } = supabase
      .storage
      .from('inventory-invoice-images')
      .getPublicUrl(filePath);

    if (urlData?.publicUrl) {
      uploadedFiles.push({
        name: file.name,
        url: urlData.publicUrl,
      });
    }
  }

  // 2. Build the payload
  const payload: any = {
    ...formData,
    assetcategoryid: formData.assetcategoryid,
    dateofinvoice: formData.dateofinvoice || new Date(),
    dateofentry: formData.dateofentry,
    dateofissue: formData.dateofissue,
    expectedreturndate: formData.expectedreturndate,
    lastmodifiedby: user?.id || 'unknown',
    attachments: uploadedFiles, // ✅ use uploaded URLs instead of raw files
  };

  try {
    await addInventoryItem(payload);

    // 3. Reset form
    setFormData({
      uniqueid: '',
      financialyear: '2024-25',
      dateofinvoice: null as Date | null,
      dateofentry: new Date(),
      invoicenumber: '',
      assetcategory: '',
      assetcategoryid: "",
      assetname: '',
      specification: '',
      makemodel: '',
      productserialnumber: '',
      vendorname: '',
      quantityperitem: 1,
      rateinclusivetax: 0,
      totalcost: 0,
      locationofitem: '',
      issuedto: '',
      dateofissue: null as Date | null,
      expectedreturndate: null as Date | null,
      balancequantityinstock: 0,
      description: '',
      unitofmeasurement: 'Pieces',
      depreciationmethod: '',
      warrantyinformation: '',
      maintenanceschedule: '',
      conditionofasset: 'excellent' as const,
      status: 'available' as 'available' | 'issued' | 'maintenance' | 'retired',
      minimumstocklevel: 5,
      purchaseordernumber: '',
      expectedlifespan: '',
      assettag: '',
      salvagevalue: 0,
      attachments: [] as File[],
    });

    alert('Inventory item added successfully!');
  } catch (error) {
    console.error(error);
    alert('Error adding inventory item. Please try again.');
  }

  setIsSubmitting(false);
};


  


  const availableCategories = categories.filter(cat => cat.isactive);
  const units = ['Pieces', 'Kg', 'Liters', 'Meters', 'Sets', 'Boxes'];
  const conditions = ['excellent', 'good', 'fair', 'poor', 'damaged'];
  const statuses = ['available', 'issued', 'maintenance', 'retired'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add Inventory Item</h1>
          <p className="mt-1 text-gray-600">Add new assets to your inventory system</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-gray-100 shadow-sm rounded-2xl">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600">
                      <Package className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">Asset Information</h2>
                  </div>
                </div>

                <div className="p-6 space-y-8">
          {/* Basic Information */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="flex items-center mb-2 text-sm font-medium text-gray-700">
                <span>Unique ID *</span>
                <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">Auto-Generated</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="uniqueid"
                  value={formData.uniqueid}
                  readOnly
                  required
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-not-allowed"
                  placeholder="Will be generated automatically..."
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <Package className="w-4 h-4 text-gray-400" />
                </div>
              </div>
              {formData.uniqueid && (
                <div className="mt-2 p-2 bg-gradient-to-r from-blue-50 to-green-50 rounded-md border border-blue-200">
                  <div className="text-xs text-blue-600 font-medium mb-2">🔄 Real-time ID Generation:</div>
                  <div className="text-xs text-gray-700 mt-1 space-y-1">
                    <div className="flex items-center flex-wrap gap-1">
                      <span className="font-mono bg-white px-2 py-1 rounded border border-gray-200 text-blue-600 font-semibold">ihub</span>
                      <span className="text-gray-400">/</span>
                      <span className={`font-mono px-2 py-1 rounded border ${
                        formData.financialyear 
                          ? 'bg-green-100 border-green-300 text-green-700' 
                          : 'bg-red-100 border-red-300 text-red-500'
                      }`}>
                        {formData.financialyear || '--'}
                      </span>
                      <span className="text-gray-400">/</span>
                      <span className={`font-mono px-2 py-1 rounded border ${
                        formData.assetname 
                          ? 'bg-green-100 border-green-300 text-green-700' 
                          : 'bg-red-100 border-red-300 text-red-500'
                      }`}>
                        {generateAssetCode(formData.assetname) || '--'}
                      </span>
                      <span className="text-gray-400">/</span>
                      <span className={`font-mono px-2 py-1 rounded border ${
                        formData.locationofitem 
                          ? 'bg-green-100 border-green-300 text-green-700' 
                          : 'bg-red-100 border-red-300 text-red-500'
                      }`}>
                        {formData.locationofitem || '--'}
                      </span>
                      <span className="text-gray-400">/</span>
                      <span className={`font-mono px-2 py-1 rounded border ${
                        formData.financialyear && formData.assetname && formData.locationofitem
                          ? 'bg-green-100 border-green-300 text-green-700' 
                          : 'bg-red-100 border-red-300 text-red-500'
                      }`}>
                        {formData.uniqueid.split('/').pop()}
                      </span>
                    </div>
                  </div>
                  
                  {/* Progress indicator */}
                  <div className="mt-2 flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${[
                            formData.financialyear,
                            formData.assetname,
                            formData.locationofitem
                          ].filter(Boolean).length * 25 + 25}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500 font-medium">
                      {[formData.financialyear, formData.assetname, formData.locationofitem].filter(Boolean).length + 1}/4 Complete
                    </span>
                  </div>
                  
                  {/* Missing fields reminder */}
                  {(!formData.financialyear || !formData.assetname || !formData.locationofitem) && (
                    <div className="mt-2 text-xs text-amber-600">
                      ⚠️ Missing: {[
                        !formData.financialyear && 'Financial Year',
                        !formData.assetname && 'Asset Name',
                        !formData.locationofitem && 'Location'
                      ].filter(Boolean).join(', ')}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Financial Year *
              </label>
              <div className="relative financial-year-picker-container">
                <input
                  type="text"
                  name="financialyear"
                  value={formData.financialyear}
                  onClick={() => setShowFinancialYearPicker(true)}
                  readOnly
                  required
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer bg-white"
                  placeholder="Select Financial Year"
                />
                <div 
                  className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                  onClick={() => setShowFinancialYearPicker(true)}
                >
                  <CalendarIcon className="w-4 h-4 text-gray-400" />
                </div>
                
                {/* Financial Year Picker Dropdown */}
                {showFinancialYearPicker && (
                  <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
                    <div className="p-4">
                      <div className="text-sm font-medium text-gray-700 mb-3">Select a date to determine Financial Year</div>
                      <div className="border border-gray-200 rounded-md p-2">
                        <CustomDatePicker
                          selected={new Date()}
                          onChange={(date: Date | null) => {
                            if (date) {
                              const financialYear = getFinancialYearFromDate(date);
                              setFormData(prev => ({
                                ...prev,
                                financialyear: financialYear
                              }));
                              setShowFinancialYearPicker(false);
                            }
                          }}
                        />
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="text-xs text-gray-600 mb-2">Or choose from recent years:</div>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            '2024-25',
                            '2025-26',
                            '2026-27',
                            '2027-28'
                          ].map(year => (
                            <button
                              key={year}
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  financialyear: year
                                }));
                                setShowFinancialYearPicker(false);
                              }}
                              className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-blue-50 hover:border-blue-300 transition-colors"
                            >
                              {year}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-200 flex justify-end">
                        <button
                          type="button"
                          onClick={() => setShowFinancialYearPicker(false)}
                          className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-500">
                📅 Click to select date or choose from preset years • Currently: <span className="font-semibold text-blue-600">{formData.financialyear}</span>
              </p>
            </div>

            <div>
              <CategoryDropdown
                label="Asset Category *"
                categories={availableCategories}
                value={formData.assetcategory}
                onChange={(value) => {
                  const category = availableCategories.find(cat => cat.name === value);
                  setFormData(prev => ({
                    ...prev,
                    assetcategory: value,
                    assetcategoryid: category?.id || ""
                  }));
                }}
                required
                placeholder="Select Category"
                searchable
              />
            </div>



            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Asset Name *
              </label>
              <input
                type="text"
                name="assetname"
                value={formData.assetname}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Computer, Laptop, Printer"
              />
              <p className="mt-1 text-xs text-gray-500">
                🔤 First 3 letters will be used as asset code: <span className="font-mono font-semibold text-blue-600">{generateAssetCode(formData.assetname) || 'XXX'}</span>
              </p>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Make/Model
              </label>
              <input
                type="text"
                name="makemodel"
                value={formData.makemodel}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Dell Inspiron 15"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Serial Number
              </label>
              <input
                type="text"
                name="productserialnumber"
                value={formData.productserialnumber}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Invoice Information */}
          <div className="pt-6 border-t border-gray-200">
            <div className="flex items-center mb-4 space-x-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-green-500 to-teal-600">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Invoice Details</h3>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Invoice Number
                </label>
                <input
                  type="text"
                  name="invoicenumber"
                  value={formData.invoicenumber}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Date of Invoice
                </label>
                <CustomDatePicker
                  selected={formData.dateofinvoice}
                  onChange={(date) => setFormData(prev => ({ ...prev, dateofinvoice: date }))}
                  placeholder="Select invoice date"
                  maxDate={new Date()}
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Date of Entry
                </label>
                <CustomDatePicker
                  selected={formData.dateofentry}
                  onChange={(date) => setFormData(prev => ({ ...prev, dateofentry: date || new Date() }))}
                  placeholder="Select entry date"
                  maxDate={new Date()}
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Vendor Name
                </label>
                <input
                  type="text"
                  name="vendorname"
                  value={formData.vendorname}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                Purchase Order Number
                </label>
                <input
                  type="text"
                  name="purchaseordernumber"
                  value={formData.purchaseordernumber}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Financial Information */}
          <div className="pt-6 border-t border-gray-200">
            <div className="flex items-center mb-4 space-x-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-600">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Financial Details</h3>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Quantity *
                </label>
                <input
                  type="number"
                  name="quantityperitem"
                  value={formData.quantityperitem}
                  onChange={handleInputChange}
                  min="1"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <UnitDropdown
                  label="Unit of Measurement"
                  value={formData.unitofmeasurement}
                  onChange={(value) => setFormData(prev => ({
                    ...prev,
                    unitofmeasurement: value
                  }))}
                  placeholder="Select unit"
                  searchable
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Rate (Inclusive Tax)
                </label>
                <input
                  type="number"
                  name="rateinclusivetax"
                  value={formData.rateinclusivetax}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Total Cost
                </label>
                <input
                  type="number"
                  name="totalcost"
                  value={formData.totalcost}
                  readOnly
                  className="w-full px-4 py-2 text-gray-600 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
            </div>
          </div>

          {/* Location and Status */}
          <div className="pt-6 border-t border-gray-200">
            <div className="flex items-center mb-4 space-x-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Location & Status</h3>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Location *
                </label>
                <input
                  type="text"
                  name="locationofitem"
                  value={formData.locationofitem}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Workstation-2, IT-Department"
                />
                <p className="mt-1 text-xs text-gray-500">
                  📍 Used as-is in unique ID
                </p>
              </div>

              <div>
                <ConditionDropdown
                  label="Condition"
                  value={formData.conditionofasset}
                  onChange={(value) => setFormData(prev => ({
                    ...prev,
                    conditionofasset: value as any
                  }))}
                  placeholder="Select condition"
                />
              </div>

              {/* Status Dropdown */}
              <div>
                <StatusDropdown
                  label="Status"
                  value={formData.status}
                  onChange={(value) => setFormData(prev => ({
                    ...prev,
                    status: value as any
                  }))}
                  type="inventory"
                  placeholder="Select status"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Minimum Stock Level
                </label>
                <input
                  type="number"
                  name="minimumstocklevel"
                  value={formData.minimumstocklevel}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {formData.status === "issued" && (         <>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Issued To
                  </label>
                  <input
                    type="text"
                    name="issuedto"
                    value={formData.issuedto || ""}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Rohit Kumar"
                  />
                </div>
               
                 <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                 Date of Issue
                </label>
                <CustomDatePicker
                  selected={formData.dateofissue}
                  onChange={(date) => setFormData(prev => ({ ...prev, dateofissue: date || new Date() }))}
                  placeholder="Select issue date"
                  maxDate={new Date()}
                />
              </div>

               <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Expected Return Date
                  </label>
                  <CustomDatePicker
                    selected={formData.expectedreturndate}
                    onChange={(date) => setFormData(prev => ({ ...prev, expectedreturndate: date || new Date() }))}
                    placeholder="Select return date"
                    minDate={new Date()}
                  />
                  </div>
     </>)}



            </div>
          </div>

          {/* Additional Information */}
          <div className="pt-6 border-t border-gray-200">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Additional Information</h3>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Specification
                </label>
                <textarea
                  name="specification"
                  value={formData.specification}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Technical specifications..."
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Description/Purpose
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Purpose and description..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 mt-6 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Warranty Information
                </label>
                <input
                  type="text"
                  name="warrantyinformation"
                  value={formData.warrantyinformation}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 3 years"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Expected Lifespan
                </label>
                <input
                  type="text"
                  name="expectedlifespan"
                  value={formData.expectedlifespan}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 5 years"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Asset Tag/Barcode
                </label>
                <input
                  type="text"
                  name="assettag"
                  value={formData.assettag}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

            </div>

            {/* Depreciation Section */}
            <div className="pt-6 border-t border-gray-200">
              <div className="flex items-center mb-4 space-x-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600">
                  <TrendingDown className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Depreciation Information</h3>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
                <div>
                  <DepreciationMethodDropdown
                    label="Depreciation Method"
                    value={formData.depreciationmethod}
                    onChange={(value) => setFormData(prev => ({
                      ...prev,
                      depreciationmethod: value
                    }))}
                    placeholder="Select depreciation method"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Useful Life (Years)
                  </label>
                  <input
                    type="number"
                    name="expectedlifespan"
                    value={formData.expectedlifespan}
                    onChange={handleInputChange}
                    min="1"
                    max="50"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 5"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Salvage Value (₹)
                  </label>
                  <input
                    type="number"
                    name="salvagevalue"
                    value={formData.salvagevalue || ''}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 1000"
                  />
                </div>
              </div>

              {/* Depreciation Calculator */}
              {formData.depreciationmethod && formData.expectedlifespan && formData.rateinclusivetax > 0 && (
                <div className="mt-6">
                  <DepreciationCalculator
                    assetValue={formData.rateinclusivetax}
                    salvageValue={formData.salvagevalue || 0}
                    usefulLife={Number(formData.expectedlifespan)}
                    purchaseDate={formData.dateofinvoice || new Date()}
                    method={formData.depreciationmethod as 'straight-line' | 'declining-balance' | 'sum-of-years'}
                    onCalculate={(depreciation) => {
                      console.log('Depreciation calculated:', depreciation);
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="pt-6 border-t border-gray-200">
            <div className="flex items-center mb-4 space-x-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600">
                <Image className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Upload Your File</h3>
            </div>
            <div className="pt-6 border-t border-gray-200">
              {/* <h3 className="mb-4 text-lg font-semibold text-gray-900">Upload Your File</h3> */}
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Upload Your File
              </label>

              <UploadDropzone
                label="Upload File"
                subtext="Accepted: PNG, JPG, PDF"
                height="h-20"
                acceptedTypes="image/png, image/jpeg, application/pdf"
                onFileChange={handleFile}
                
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <div className="flex items-center justify-end space-x-4">
            <button
              type="button"
              className="flex items-center px-6 py-2 space-x-2 text-gray-700 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <X size={16} />
              <span>Cancel</span>
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center px-6 py-2 space-x-2 text-white transition-all duration-200 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={16} />
              <span>{isSubmitting ? 'Adding...' : 'Add Item'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddInventory;