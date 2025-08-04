import React, { useState } from 'react';
import { useInventory } from '../../contexts/InventoryContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { sendNotificationEmail } from '../../services/emailService';
import { Send, X, FileText, Package } from 'lucide-react';

const CreateRequest: React.FC = () => {
  const { submitRequest } = useInventory();
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
    debugger;
    e.preventDefault();
    setIsSubmitting(true);
    const data =user
    console.log(data)
    try {
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

     
      // const adminUsers = users.filter(u => u.role === 'admin' || u.role === 'stock-manager');

      // adminUsers.forEach(admin => {
      //   sendNotificationEmail('newRequest', admin.email, admin.name, {
      //     employeename: user?.name || '',
      //     itemtype: formData.itemtype,
      //     quantity: formData.quantity,
      //     purpose: formData.purpose,
      //     from_name: user?.name || 'Employee',   // ✅ who is sending this request
      //   });
      // });

      // Reset form
      setFormData({
        itemtype: '',
        quantity: 1,
        purpose: '',
        justification: '',
      });

      alert('Request submitted successfully! You will be notified once it is reviewed.');
    } catch (error) {
      alert('Error submitting request. Please try again.');
    }

    setIsSubmitting(false);
  };

  const commonItems = [
    'Laptop',
    'Desktop Computer',
    'Monitor',
    'Keyboard',
    'Mouse',
    'Office Chair',
    'Desk',
    'Printer',
    'Mobile Phone',
    'Tablet',
    'Headphones',
    'Webcam',
    'Software License',
    'Office Supplies',
    'Other'
  ];

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
      <div className="p-6 border border-blue-100 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl">
        <div className="flex items-start space-x-3">
          <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600">
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
            <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600">
              <Package className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Request Details</h2>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Item Type */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Item Type *
            </label>
            <select
              name="itemtype"
              value={formData.itemtype}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select an item type</option>
              {commonItems.map(item => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
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
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Purpose *
            </label>
            <select
              name="purpose"
              value={formData.purpose}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select purpose</option>
              {commonPurposes.map(purpose => (
                <option key={purpose} value={purpose}>{purpose}</option>
              ))}
            </select>
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
              <X size={16} />
              <span>Clear</span>
            </button>
            <button
              type="submit"
              disabled={isSubmitting || formData.justification.length < 5}
              className="flex items-center px-6 py-2 space-x-2 text-white transition-all duration-200 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
            <div className="flex items-center justify-center w-8 h-8 text-sm font-medium text-white rounded-full bg-gradient-to-r from-blue-500 to-cyan-600">1</div>
            <p className="text-sm text-gray-700">Your request will be reviewed by the admin or stock manager</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-8 h-8 text-sm font-medium text-white rounded-full bg-gradient-to-r from-green-500 to-teal-600">2</div>
            <p className="text-sm text-gray-700">You'll receive a notification with the approval decision</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-8 h-8 text-sm font-medium text-white rounded-full bg-gradient-to-r from-purple-500 to-pink-600">3</div>
            <p className="text-sm text-gray-700">If approved, the item will be allocated and ready for pickup</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateRequest;