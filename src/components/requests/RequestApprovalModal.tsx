import React, { useState, useEffect } from 'react';
import { useInventory } from '../../contexts/InventoryContext';
import { useAuth } from '../../contexts/AuthContext';
import { 
  CheckCircle, 
  XCircle, 
  Package, 
  User, 
  Calendar,
  AlertCircle,
  ArrowRight,
  Search
} from 'lucide-react';
import { CRUDToasts } from '../../services/toastService';
import toast from 'react-hot-toast';

interface RequestApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: any;
  action: 'approve' | 'reject';
}

const RequestApprovalModal: React.FC<RequestApprovalModalProps> = ({ 
  isOpen, 
  onClose, 
  request, 
  action 
}) => {
  const { inventoryItems, updateInventoryItem, updateRequestStatus } = useInventory();
  const { user } = useAuth();
  const [reason, setReason] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter available items that match the request
  const availableItems = inventoryItems.filter(item => {
    const matchesStatus = item.status === 'available';
    const matchesType = item.assetname.toLowerCase().includes(request?.itemtype?.toLowerCase()) ||
                       item.assetcategory.toLowerCase().includes(request?.itemtype?.toLowerCase());
    const matchesSearch = item.assetname.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.assetcategory.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && (matchesType || matchesSearch);
  });

  useEffect(() => {
    if (isOpen && request) {
      setReason('');
      setSelectedAsset(null);
      setSearchTerm(request.itemtype || '');
    }
  }, [isOpen, request]);

  const handleApproval = async () => {
    if (!reason.trim()) {
      toast.error('Please provide a reason for approval');
      return;
    }

    if (action === 'approve' && !selectedAsset) {
      toast.error('Please select an asset to issue');
      return;
    }

    setIsProcessing(true);
    const loadingToast = CRUDToasts.updating('request');

    try {
      console.log('Starting approval process:', { action, request, selectedAsset, reason });
      
      // Update request status
      await updateRequestStatus(request.id, action === 'approve' ? 'approved' : 'rejected', reason, user?.id);
      console.log('Request status updated successfully');

      // If approving, issue the selected asset
      if (action === 'approve' && selectedAsset) {
        console.log('Updating inventory item:', selectedAsset.id, {
          status: 'issued',
          issuedto: request.employeename,
          issuedby: user?.name || 'Admin',
          issueddate: new Date().toISOString(),
          dateofissue: new Date().toISOString()
        });
        
        await updateInventoryItem(selectedAsset.id, {
          status: 'issued',
          issuedto: request.employeename,
          issuedby: user?.name || 'Admin',
          issueddate: new Date().toISOString(),
          dateofissue: new Date().toISOString()
        });
        
        console.log('Inventory item updated successfully');
        // Send success notification
        toast.success(`Request approved and ${selectedAsset.assetname} issued to ${request.employeename}`);
      } else if (action === 'reject') {
        toast.success(`Request rejected`);
      }

      toast.dismiss(loadingToast);
      onClose();
    } catch (error) {
      console.error(`Error ${action}ing request:`, error);
      toast.dismiss(loadingToast);
      CRUDToasts.updateError('request', 'Please try again');
    }

    setIsProcessing(false);
  };

  if (!isOpen || !request) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black bg-opacity-50 overflow-y-auto">
      <div className="w-full max-w-4xl max-h-[95vh] bg-white rounded-2xl shadow-xl overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">
            {action === 'approve' ? 'Approve Request & Issue Asset' : 'Reject Request'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 transition-colors rounded-lg hover:text-gray-600 hover:bg-gray-100"
          >
            <XCircle size={20} />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Request Details */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h4 className="mb-3 text-lg font-medium text-gray-900">Request Details</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Employee</label>
                <p className="text-sm text-gray-900">{request.employeename}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Item Type</label>
                <p className="text-sm text-gray-900">{request.itemtype}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Quantity</label>
                <p className="text-sm text-gray-900">{request.quantity}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Purpose</label>
                <p className="text-sm text-gray-900">{request.purpose}</p>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Justification</label>
                <p className="text-sm text-gray-900">{request.justification}</p>
              </div>
            </div>
          </div>

          {/* Asset Selection (only for approval) */}
          {action === 'approve' && (
            <div>
              <h4 className="mb-3 text-lg font-medium text-gray-900 flex items-center">
                <Package className="w-5 h-5 mr-2 text-blue-600" />
                Select Asset to Issue
              </h4>
              
              {/* Search */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" size={16} />
                  <input
                    type="text"
                    placeholder="Search available assets..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Available Assets */}
              <div className="max-h-48 sm:max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
                {availableItems.length > 0 ? (
                  <div className="divide-y divide-gray-200">
                    {availableItems.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => setSelectedAsset(item)}
                        className={`p-4 cursor-pointer transition-colors ${
                          selectedAsset?.id === item.id
                            ? 'bg-blue-50 border-blue-200'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900">{item.assetname}</h5>
                            <p className="text-sm text-gray-600">{item.assetcategory}</p>
                            <p className="text-sm text-gray-500">
                              Stock: {item.balancequantityinstock} | Location: {item.locationofitem}
                            </p>
                          </div>
                          <div className="text-left sm:text-right">
                            <p className="text-sm font-medium text-gray-900">₹{item.totalcost?.toLocaleString()}</p>
                            <p className="text-xs text-gray-500">{item.status}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    <AlertCircle className="mx-auto w-8 h-8 mb-2" />
                    <p>No available assets found</p>
                    <p className="text-sm">Add inventory items or check stock levels</p>
                  </div>
                )}
              </div>

              {/* Selected Asset Summary */}
              {selectedAsset && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h5 className="font-medium text-blue-900 mb-2">Selected Asset:</h5>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <p className="text-blue-800">{selectedAsset.assetname}</p>
                      <p className="text-sm text-blue-600">{selectedAsset.assetcategory}</p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-blue-800 font-medium">₹{selectedAsset.totalcost?.toLocaleString()}</p>
                      <p className="text-sm text-blue-600">Stock: {selectedAsset.balancequantityinstock}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Reason/Remarks */}
          <div>
            <h4 className="mb-3 text-lg font-medium text-gray-900 flex items-center">
              <User className="w-5 h-5 mr-2 text-green-600" />
              {action === 'approve' ? 'Approval Remarks' : 'Rejection Reason'}
            </h4>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={`Enter ${action === 'approve' ? 'approval remarks' : 'rejection reason'}...`}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end pt-4 sm:pt-6 mt-4 sm:mt-6 space-y-2 sm:space-y-0 sm:space-x-3 border-t border-gray-200">
          <button
            onClick={onClose}
            className="flex items-center justify-center px-4 py-2 space-x-2 text-gray-700 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <XCircle size={16} />
            <span>Cancel</span>
          </button>
          <button
            onClick={handleApproval}
            disabled={!reason.trim() || (action === 'approve' && !selectedAsset) || isProcessing}
            className={`flex items-center justify-center px-4 py-2 space-x-2 text-white transition-all duration-200 rounded-lg ${
              action === 'approve' 
                ? 'bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700'
                : 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {action === 'approve' ? <CheckCircle size={16} /> : <XCircle size={16} />}
            <span>
              {isProcessing 
                ? (action === 'approve' ? 'Approving & Issuing...' : 'Rejecting...') 
                : (action === 'approve' ? 'Approve & Issue Asset' : 'Reject Request')
              }
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RequestApprovalModal;
