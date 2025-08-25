import React, { useState, useEffect } from 'react';
import { useInventory } from '../../contexts/InventoryContext';
import { useAuth } from '../../contexts/AuthContext';
import { Save, X, Package, Calendar, DollarSign, MapPin, Image, Upload, Trash2 } from 'lucide-react';
import { InventoryItem } from '../../types';
import { supabase } from '../../lib/supabaseClient';
import { CRUDToasts } from '../../services/toastService';
import toast from 'react-hot-toast';
import CustomDatePicker from '../common/DatePicker';
import CategoryDropdown from '../common/CategoryDropdown';
import StatusDropdown from '../common/StatusDropdown';
import ConditionDropdown from '../common/ConditionDropdown';
import UnitDropdown from '../common/UnitDropdown';
import DepartmentDropdown from '../common/DepartmentDropdown';
import DepreciationMethodDropdown from '../common/DepreciationMethodDropdown';

interface UpdateInventoryProps {
  item: InventoryItem | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedItem: InventoryItem) => void;
}

const UpdateInventory: React.FC<UpdateInventoryProps> = ({
  item,
  isOpen,
  onClose,
  onUpdate
}) => {
  const { user } = useAuth();
  const { categories } = useInventory();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<InventoryItem>>({});
  const [newAttachments, setNewAttachments] = useState<File[]>([]);
  const [removedAttachments, setRemovedAttachments] = useState<string[]>([]);

  useEffect(() => {
    if (item) {
      setFormData({
        ...item,
        dateofinvoice: item.dateofinvoice ? new Date(item.dateofinvoice) : undefined,
        dateofentry: item.dateofentry ? new Date(item.dateofentry) : undefined,
        dateofissue: item.dateofissue ? new Date(item.dateofissue) : undefined,
        expectedreturndate: item.expectedreturndate ? new Date(item.expectedreturndate) : undefined,
      });
      setNewAttachments([]);
      setRemovedAttachments([]);
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  };

  const handleDateChange = (field: string, date: Date | undefined) => {
    setFormData(prev => ({
      ...prev,
      [field]: date
    }));
  };

  const handleDropdownChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setNewAttachments(prev => [...prev, ...files]);
  };

  const removeNewAttachment = (index: number) => {
    setNewAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingAttachment = (attachmentUrl: string) => {
    setRemovedAttachments(prev => [...prev, attachmentUrl]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    const loadingToast = CRUDToasts.updating('inventory item');

    try {
      // Upload new attachments
      const uploadedFiles: { name: string; url: string }[] = [];
      
      for (const file of newAttachments) {
        const filePath = `${Date.now()}-${file.name}`;
        const { data, error } = await supabase.storage
          .from('profile-pictures')
          .upload(filePath, file);

        if (error) throw error;

        const { data: urlData } = supabase.storage
          .from('profile-pictures')
          .getPublicUrl(filePath);

        uploadedFiles.push({
          name: file.name,
          url: urlData.publicUrl
        });
      }

      // Prepare update data
      const updateData = {
        ...formData,
        lastmodifiedby: user.id,
        lastmodifieddate: new Date(),
        // For now, just use the new attachments as Files
        attachments: newAttachments
      };

      // Update in database
      const { error } = await supabase
        .from('inventory_items')
        .update(updateData)
        .eq('id', item.id);

      if (error) throw error;

      // Call the onUpdate callback
      onUpdate({
        ...item,
        ...updateData
      });

      toast.dismiss(loadingToast);
      CRUDToasts.updated('inventory item');
      onClose();
    } catch (error: any) {
      console.error('Update error:', error);
      toast.dismiss(loadingToast);
      CRUDToasts.updateError('inventory item', error.message || 'Update failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this inventory item? This action cannot be undone.')) {
      return;
    }

    setIsSubmitting(true);
    const loadingToast = CRUDToasts.deleting('inventory item');

    try {
      const { error } = await supabase
        .from('inventory_items')
        .delete()
        .eq('id', item.id);

      if (error) throw error;

      toast.dismiss(loadingToast);
      CRUDToasts.deleted('inventory item');
      onClose();
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.dismiss(loadingToast);
      CRUDToasts.deleteError('inventory item', error.message || 'Delete failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-6xl max-h-[90vh] overflow-y-auto p-8 bg-white rounded-2xl shadow-2xl mx-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-semibold text-gray-900">
            Edit Inventory Item
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 transition-colors rounded-lg hover:text-gray-600 hover:bg-gray-100"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Unique ID
              </label>
              <input
                type="text"
                name="uniqueid"
                value={formData.uniqueid || ''}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                readOnly
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Financial Year
              </label>
              <input
                type="text"
                name="financialyear"
                value={formData.financialyear || ''}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Asset Name
              </label>
              <input
                type="text"
                name="assetname"
                value={formData.assetname || ''}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Asset Category
              </label>
              <CategoryDropdown
                value={formData.assetcategory || ''}
                onChange={(value) => handleDropdownChange('assetcategory', value)}
                categories={categories}
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Location
              </label>
              <input
                type="text"
                name="locationofitem"
                value={formData.locationofitem || ''}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Status
              </label>
              <StatusDropdown
                value={formData.status || 'available'}
                onChange={(value) => handleDropdownChange('status', value)}
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Condition
              </label>
              <ConditionDropdown
                value={formData.conditionofasset || 'excellent'}
                onChange={(value) => handleDropdownChange('conditionofasset', value)}
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Quantity
              </label>
              <input
                type="number"
                name="quantityperitem"
                value={formData.quantityperitem || 0}
                onChange={handleNumberChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Unit Price
              </label>
              <input
                type="number"
                name="rateinclusivetax"
                value={formData.rateinclusivetax || 0}
                onChange={handleNumberChange}
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
                value={formData.totalcost || 0}
                onChange={handleNumberChange}
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Unit of Measurement
              </label>
              <UnitDropdown
                value={formData.unitofmeasurement || 'Pieces'}
                onChange={(value) => handleDropdownChange('unitofmeasurement', value)}
              />
            </div>
          </div>

          {/* Additional Details */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Make/Model
              </label>
              <input
                type="text"
                name="makemodel"
                value={formData.makemodel || ''}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Serial Number
              </label>
              <input
                type="text"
                name="productserialnumber"
                value={formData.productserialnumber || ''}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Vendor Name
              </label>
              <input
                type="text"
                name="vendorname"
                value={formData.vendorname || ''}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Invoice Number
              </label>
              <input
                type="text"
                name="invoicenumber"
                value={formData.invoicenumber || ''}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Asset Category ID
              </label>
              <input
                type="text"
                name="assetcategoryid"
                value={formData.assetcategoryid || ''}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Specification
              </label>
              <input
                type="text"
                name="specification"
                value={formData.specification || ''}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Balance Quantity in Stock
              </label>
              <input
                type="number"
                name="balancequantityinstock"
                value={formData.balancequantityinstock || 0}
                onChange={handleNumberChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Minimum Stock Level
              </label>
              <input
                type="number"
                name="minimumstocklevel"
                value={formData.minimumstocklevel || 0}
                onChange={handleNumberChange}
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
                value={formData.purchaseordernumber || ''}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Expected Lifespan
              </label>
              <input
                type="text"
                name="expectedlifespan"
                value={formData.expectedlifespan || ''}
                onChange={handleInputChange}
                placeholder="e.g., 5 years"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Asset Tag
              </label>
              <input
                type="text"
                name="assettag"
                value={formData.assettag || ''}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Salvage Value
              </label>
              <input
                type="number"
                name="salvagevalue"
                value={formData.salvagevalue || 0}
                onChange={handleNumberChange}
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Depreciation Method
              </label>
              <DepreciationMethodDropdown
                value={formData.depreciationmethod || 'straight-line'}
                onChange={(value) => handleDropdownChange('depreciationmethod', value)}
              />
            </div>


          </div>

          {/* Additional Information */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Warranty Information
              </label>
              <textarea
                name="warrantyinformation"
                value={formData.warrantyinformation || ''}
                onChange={handleInputChange}
                rows={3}
                placeholder="Enter warranty details..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Maintenance Schedule
              </label>
              <textarea
                name="maintenanceschedule"
                value={formData.maintenanceschedule || ''}
                onChange={handleInputChange}
                rows={3}
                placeholder="Enter maintenance schedule..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Issuance Information */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Issued To
              </label>
              <input
                type="text"
                name="issuedto"
                value={formData.issuedto || ''}
                onChange={handleInputChange}
                placeholder="Enter employee name or department"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Expected Return Date
              </label>
              <CustomDatePicker
                selected={formData.expectedreturndate}
                onChange={(date) => handleDateChange('expectedreturndate', date)}
                placeholderText="Select expected return date"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Date of Invoice
              </label>
              <CustomDatePicker
                selected={formData.dateofinvoice}
                onChange={(date) => handleDateChange('dateofinvoice', date)}
                placeholderText="Select date"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Date of Entry
              </label>
              <CustomDatePicker
                selected={formData.dateofentry}
                onChange={(date) => handleDateChange('dateofentry', date)}
                placeholderText="Select date"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Date of Issue
              </label>
              <CustomDatePicker
                selected={formData.dateofissue}
                onChange={(date) => handleDateChange('dateofissue', date)}
                placeholderText="Select date"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description || ''}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Attachments */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Attachments
            </label>
            
            {/* Existing Attachments */}
            {item.attachments && item.attachments.length > 0 && (
              <div className="mb-4">
                <h4 className="mb-2 text-sm font-medium text-gray-700">Current Attachments:</h4>
                <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                  {item.attachments.map((attachment, index) => (
                    <div key={index} className="relative group">
                      {attachment instanceof File ? (
                        <img
                          src={URL.createObjectURL(attachment)}
                          alt={attachment.name}
                          className="w-full h-24 object-cover rounded-lg border border-gray-200"
                        />
                      ) : (
                        <div className="w-full h-24 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                          <span className="text-sm text-gray-500">File</span>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => removeExistingAttachment(attachment instanceof File ? attachment.name : String(attachment))}
                        className="absolute top-1 right-1 p-1 text-white bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove attachment"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Attachments */}
            <div>
              <input
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="flex items-center justify-center w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors"
              >
                <Upload size={20} className="mr-2 text-gray-400" />
                <span className="text-gray-600">Add new attachments</span>
              </label>
            </div>

            {/* New Attachments Preview */}
            {newAttachments.length > 0 && (
              <div className="mt-4">
                <h4 className="mb-2 text-sm font-medium text-gray-700">New Attachments:</h4>
                <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                  {newAttachments.map((file, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="w-full h-24 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeNewAttachment(index)}
                        className="absolute top-1 right-1 p-1 text-white bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove attachment"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleDelete}
              disabled={isSubmitting}
              className="flex items-center px-4 py-2 space-x-2 text-white transition-colors bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 size={16} />
              <span>Delete Item</span>
            </button>

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-gray-700 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center px-4 py-2 space-x-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={16} />
                <span>{isSubmitting ? 'Updating...' : 'Update Item'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateInventory;
