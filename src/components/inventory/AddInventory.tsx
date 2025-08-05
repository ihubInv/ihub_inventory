import React, { useState } from 'react';
import { useInventory } from '../../contexts/InventoryContext';
import { useAuth } from '../../contexts/AuthContext';
import CustomDatePicker from '../common/DatePicker';
import { Save, X, Package, Calendar, DollarSign, MapPin, Image } from 'lucide-react';
import { InventoryItem } from '../../types';

import UploadDropzone from '../common/UploadDropzone';
import { supabase } from '../../lib/supabaseClient';

const AddInventory: React.FC = () => {
  const { addInventoryItem } = useInventory();
  const { categories } = useInventory();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
const [uploadSuccess, setUploadSuccess] = useState(false)

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
  });

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
    debugger
  e.preventDefault();
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
      // reset all other fields...
      attachments: [],
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
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Unique ID *
              </label>
              <input
                type="text"
                name="uniqueid"
                value={formData.uniqueid}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., IT-LAP-001"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Financial Year
              </label>
              <input
                type="text"
                name="financialyear"
                value={formData.financialyear}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Asset Category *
              </label>
              <select
                name="assetcategory"
                value={formData.assetcategory}
                onChange={handleCategoryChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Category</option>

                {availableCategories.map(category => (
                  <option key={category.id} value={category.name}>{category.name}</option>
                ))}
              </select>
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
                placeholder="e.g., Dell Laptop"
              />
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
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Unit of Measurement
                </label>
                <select
                  name="unitofmeasurement"
                  value={formData.unitofmeasurement}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {units.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
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
                  placeholder="e.g., IT Department"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Condition
                </label>
                <select
                  name="conditionofasset"
                  value={formData.conditionofasset}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {conditions.map(condition => (
                    <option key={condition} value={condition}>
                      {condition.charAt(0).toUpperCase() + condition.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Dropdown */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {statuses.map(status => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
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