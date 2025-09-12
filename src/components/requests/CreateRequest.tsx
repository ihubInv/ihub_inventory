import React, { useState } from 'react';
import { useInventory } from '../../contexts/InventoryContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { sendNotificationEmail } from '../../services/emailService';
import { Send, X, FileText, Package } from 'lucide-react';
import { CRUDToasts } from '../../services/toastService';
import toast from 'react-hot-toast';
import RequestItemDropdown from '../common/RequestItemDropdown';
import PurposeDropdown from '../common/PurposeDropdown';

const CreateRequest: React.FC = () => {
  const { submitRequest, inventoryItems } = useInventory();
  const { users } = useInventory();
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    itemtype: '',
    quantity: 1,
    purpose: '',
    justification: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 1 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    ;
    e.preventDefault();
    setIsSubmitting(true);
    const data =user
    console.log(data)
    try {
      const loadingToast = CRUDToasts.creating('request');
      await submitRequest({
        employeeid: user?.id || '',
        employeename: user?.name || '',
        ...formData
      });

      // Add notification for admins and stock managers
      addNotification({
        userid: 'admin', // This would be sent to all admins/stock managers in a real system
        type: 'request',
        title: 'New Inventory Request',
        message: `${user?.name} has requested ${formData.quantity} ${formData.itemtype} for ${formData.purpose}`
      });

      const adminUsers = users.filter(u => u.role === 'admin' || u.role === 'stock-manager');

      adminUsers.forEach(admin => {
        sendNotificationEmail('newRequest', admin.email, admin.name, {
          employeename: user?.name || '',
          itemtype: formData.itemtype,
          quantity: formData.quantity,
          purpose: formData.purpose,
          from_name: user?.name || 'Employee',   // ✅ who is sending this request
        });
      });

      // Reset form
      setFormData({
        itemtype: '',
        quantity: 1,
        purpose: '',
        justification: '',
      });

      toast.dismiss(loadingToast);
      CRUDToasts.created('request');
    } catch (error) {
      toast.dismiss(loadingToast);
      CRUDToasts.createError('request', 'Please try again');
    }

    setIsSubmitting(false);
  };

  // Get asset categories from inventory
  const getAssetCategories = () => {
    const assetCategories = new Set<string>();
    
    // Add asset categories from inventory
    inventoryItems.forEach(item => {
      if (item.assetcategory && item.assetcategory.trim()) {
        assetCategories.add(item.assetcategory.trim());
      }
    });
    
    // Add 'Other' option for items not in inventory
    assetCategories.add('Other');
    
    return Array.from(assetCategories).sort();
  };

  const availableAssetCategories = getAssetCategories();

  const commonPurposes = [
    'New Employee Setup',
    'Replacement for Damaged Item',
    'Upgrade Existing Equipment',
    'Project Requirements',
    'Remote Work Setup',
    'Training Purposes',
    'Temporary Assignment',
    'Department Expansion',
    'Other'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create Request</h1>
          <p className="mt-1 text-gray-600">Submit a new inventory request for approval</p>
        </div>
      </div>

      {/* Guidelines */}
      <div className="p-6 border border-[#0d559e]/20 bg-gradient-to-r from-[#0d559e]/10 to-[#1a6bb8]/10 rounded-2xl">
        <div className="flex items-start space-x-3">
          <div className="p-2 rounded-lg bg-gradient-to-r from-[#0d559e] to-[#1a6bb8]">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">Request Guidelines</h3>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>• Provide detailed justification for your request</li>
              <li>• Include exact specifications when needed</li>
              <li>• Allow 2-3 business days for approval</li>
              <li>• Contact your manager for urgent requests</li>
              <li>• Ensure the requested quantity is reasonable</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Request Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-gray-100 shadow-sm rounded-2xl">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-[#0d559e] to-[#1a6bb8]">
              <Package className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Request Details</h2>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Item Type */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Item Type *
              </label>
              <span className="text-xs text-gray-500">
                {availableAssetCategories.length - 1} categories available
              </span>
            </div>
            <RequestItemDropdown
              options={availableAssetCategories}
              value={formData.itemtype}
              onChange={(value) => setFormData(prev => ({ ...prev, itemtype: value }))}
              placeholder="Select an item type"
              required
              searchable
            />
            {formData.itemtype === 'Other' && (
              <input
                type="text"
                placeholder="Please specify the item type"
                className="w-full px-4 py-3 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onChange={(e) => setFormData(prev => ({ ...prev, itemtype: e.target.value }))}
              />
            )}
          </div>

          {/* Quantity */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Quantity *
            </label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleInputChange}
              min="1"
              max="100"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="mt-1 text-xs text-gray-500">Maximum 100 items per request</p>
          </div>

          {/* Purpose */}
          <div>
            <PurposeDropdown
              label="Purpose *"
              value={formData.purpose}
              onChange={(value) => setFormData(prev => ({ ...prev, purpose: value }))}
              placeholder="Select purpose"
              required
              searchable
            />
            {formData.purpose === 'Other' && (
              <input
                type="text"
                placeholder="Please specify the purpose"
                className="w-full px-4 py-3 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
              />
            )}
          </div>

          {/* Justification */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Justification *
            </label>
            <textarea
              name="justification"
              value={formData.justification}
              onChange={handleInputChange}
              required
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Please provide a detailed justification for this request. Include any specific requirements, urgency, or business impact..."
            />
            <p className="mt-1 text-xs text-gray-500">
              Minimum 20 characters. Be specific about why you need this item.
            </p>
          </div>

          {/* Employee Information (Read-only) */}
          <div className="p-4 rounded-lg bg-gray-50">
            <h3 className="mb-3 text-sm font-medium text-gray-700">Requester Information</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block mb-1 text-xs font-medium text-gray-500">Name</label>
                <p className="text-sm text-gray-900">{user?.name}</p>
              </div>
              <div>
                <label className="block mb-1 text-xs font-medium text-gray-500">Department</label>
                <p className="text-sm text-gray-900">{user?.department || 'N/A'}</p>
              </div>
              <div>
                <label className="block mb-1 text-xs font-medium text-gray-500">Email</label>
                <p className="text-sm text-gray-900">{user?.email}</p>
              </div>
              <div>
                <label className="block mb-1 text-xs font-medium text-gray-500">Request Date</label>
                <p className="text-sm text-gray-900">{new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <div className="flex items-center justify-end space-x-4">
            <button
              type="button"
              onClick={() => setFormData({
                itemtype: '',
                quantity: 1,
                purpose: '',
                justification: '',
              })}
              className="flex items-center px-6 py-2 space-x-2 text-gray-700 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <X size={16} className="text-red-500" />
              <span>Clear</span>
            </button>
            <button
              type="submit"
              disabled={isSubmitting || formData.justification.length < 5}
              className="flex items-center px-6 py-2 space-x-2 text-white transition-all duration-200 rounded-lg bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={16} />
              <span>{isSubmitting ? 'Submitting...' : 'Submit Request'}</span>
            </button>
          </div>
        </div>
      </form>

      {/* Recent Requests Preview */}
      <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">What happens next?</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-8 h-8 text-sm font-medium text-white rounded-full bg-gradient-to-r from-[#0d559e] to-[#1a6bb8]">1</div>
            <p className="text-sm text-gray-700">Your request will be reviewed by the admin or stock manager</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-8 h-8 text-sm font-medium text-white rounded-full bg-gradient-to-r from-[#0d559e] to-[#1a6bb8]">2</div>
            <p className="text-sm text-gray-700">You'll receive a notification with the approval decision</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-8 h-8 text-sm font-medium text-white rounded-full bg-gradient-to-r from-[#0d559e] to-[#1a6bb8]">3</div>
            <p className="text-sm text-gray-700">If approved, the item will be allocated and ready for pickup</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateRequest;