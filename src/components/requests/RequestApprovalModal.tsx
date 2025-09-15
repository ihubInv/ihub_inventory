import React, { useState, useEffect } from 'react';
import { 
  useGetInventoryItemsQuery,
  useUpdateInventoryItemMutation,
  useUpdateRequestStatusMutation
} from '../../store/api';
import { useAppSelector } from '../../store/hooks';
import { supabase } from '../../lib/supabaseClient';
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
  const { data: inventoryItems = [] } = useGetInventoryItemsQuery();
  const [updateInventoryItem] = useUpdateInventoryItemMutation();
  const [updateRequestStatus] = useUpdateRequestStatusMutation();
  const { user } = useAppSelector((state) => state.auth);
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

  // Debug function to check database state
  const debugDatabaseState = async () => {
    try {
      console.log('🔍 Debugging database state...');
      
      // Check if requests table exists and has data
      const { data: requestsData, error: requestsError } = await supabase
        .from('requests')
        .select('*')
        .limit(5);
      
      console.log('📋 Requests table check:', { requestsData, requestsError });
      
      // If requests table doesn't exist, try to create it
      if (requestsError && requestsError.code === 'PGRST116') {
        console.log('🔧 Requests table not found, attempting to create...');
        try {
          const { error: createError } = await supabase.rpc('create_requests_table');
          if (createError) {
            console.log('❌ Failed to create requests table via RPC, trying direct SQL...');
            // We'll handle this in the fallback update method
          } else {
            console.log('✅ Requests table created successfully');
          }
        } catch (createError) {
          console.log('❌ RPC creation failed:', createError);
        }
      }
      
      // Check if inventory_items table has data
      const { data: inventoryData, error: inventoryError } = await supabase
        .from('inventory_items')
        .select('id, assetname, status, issuedto, issuedby')
        .limit(5);
      
      console.log('📦 Inventory table check:', { inventoryData, inventoryError });
      
      // Check current user
      const { data: userData, error: userError } = await supabase.auth.getUser();
      console.log('👤 Current user check:', { userData, userError });
      
    } catch (error) {
      console.error('❌ Database debug error:', error);
    }
  };

  const handleApproval = async () => {
    if (!reason.trim()) {
      toast.error('Please provide a reason for approval');
      return;
    }

    if (!request || !request.id) {
      toast.error('Invalid request data. Please refresh and try again.');
      console.error('Request data is missing:', request);
      return;
    }

    if (action === 'approve' && !selectedAsset) {
      toast.error('Please select an asset to issue');
      return;
    }

    // Debug database state before proceeding
    await debugDatabaseState();

    setIsProcessing(true);
    const loadingToast = CRUDToasts.updating('request');

    try {
      console.log('🚀 Starting approval process:', { action, request, selectedAsset, reason });
      console.log('👤 Current user:', { id: user?.id, name: user?.name, role: user?.role });
      console.log('📋 Request details:', { id: request.id, status: request.status, employeeid: request.employeeid });
      console.log('🔍 Request object keys:', Object.keys(request));
      console.log('🔍 Request object values:', request);
      
      // Step 1: Update request status first
      console.log('Step 1: Updating request status...');
      
      // Try multiple approaches to update the request
      let requestUpdateResult;
      try {
        requestUpdateResult = await updateRequestStatus({
          id: request.id,
          status: action === 'approve' ? 'approved' : 'rejected',
          remarks: reason,
          reviewerid: user?.id
        }).unwrap();
        console.log('✅ Request status updated successfully:', requestUpdateResult);
      } catch (updateError) {
        console.error('❌ Request update failed, trying direct database update:', updateError);
        
        // Fallback: Try direct database update
        try {
          const { data: directUpdateData, error: directUpdateError } = await supabase
            .from('requests')
            .update({
              status: action === 'approve' ? 'approved' : 'rejected',
              remarks: reason,
              reviewedby: user?.id,
              reviewedat: new Date().toISOString()
            })
            .eq('id', request.id)
            .select();
          
          if (directUpdateError) {
            console.error('❌ Direct database update also failed:', directUpdateError);
            throw new Error(`Direct database update failed: ${directUpdateError.message}`);
          }
          
          if (!directUpdateData || directUpdateData.length === 0) {
            throw new Error('No rows were updated. Request may not exist or you may not have permission.');
          }
          
          requestUpdateResult = directUpdateData[0];
          console.log('✅ Direct database update successful:', requestUpdateResult);
        } catch (directError) {
          console.error('❌ All update methods failed:', directError);
          throw new Error(`Failed to update request: ${directError instanceof Error ? directError.message : String(directError)}`);
        }
      }

      // Step 2: If approving, issue the selected asset
      if (action === 'approve' && selectedAsset) {
        console.log('Step 2: Issuing inventory item...');
        
        // Validate that the asset is still available
        if (selectedAsset.status !== 'available') {
          throw new Error(`Asset "${selectedAsset.assetname}" is no longer available. Current status: ${selectedAsset.status}`);
        }

        // Validate that the asset has a unique ID
        if (!selectedAsset.uniqueid || selectedAsset.uniqueid.trim() === '') {
          throw new Error(`Asset "${selectedAsset.assetname}" does not have a valid unique ID`);
        }

        // Create comprehensive audit trail entry
        const auditEntry = {
          action: 'issue',
          itemId: selectedAsset.id,
          itemName: selectedAsset.assetname,
          issuedTo: request.employeename,
          issuedBy: user?.name || 'Admin',
          issuedById: user?.id || 'unknown',
          issuedDate: new Date().toISOString(),
          requestId: request.id,
          purpose: request.purpose || 'Direct Issue',
          expectedReturnDate: request.expectedreturndate ? new Date(request.expectedreturndate).toISOString() : undefined,
          notes: reason,
          previousStatus: 'available',
          newStatus: 'issued',
          department: request.department || 'Unknown',
          location: selectedAsset.locationofitem,
          itemValue: selectedAsset.totalcost || 0,
          itemCategory: selectedAsset.assetcategory,
          uniqueId: selectedAsset.uniqueid
        };

        // Store audit trail in localStorage (in production, this should be stored in database)
        try {
          const existingAudit = JSON.parse(localStorage.getItem('issuanceAuditTrail') || '[]');
          existingAudit.push(auditEntry);
          localStorage.setItem('issuanceAuditTrail', JSON.stringify(existingAudit));
          console.log('✅ Audit trail entry created');
        } catch (auditError) {
          console.warn('Failed to create audit trail entry:', auditError);
          // Don't fail the entire process for audit trail issues
        }

        // Update inventory item with comprehensive data
        // Use description field for issuance tracking until database columns are added
        const inventoryUpdateData = {
          status: 'issued' as const,
          lastmodifiedby: user?.name || 'Admin',
          lastmodifieddate: new Date(),
          description: `${selectedAsset.description || ''}\n\nISSUED TO: ${request.employeename}\nISSUED BY: ${user?.name || 'Admin'}\nISSUE DATE: ${new Date().toISOString()}\nPURPOSE: ${request.purpose || 'Direct Issue'}\nEXPECTED RETURN: ${request.expectedreturndate ? new Date(request.expectedreturndate).toISOString() : 'Not specified'}\nUNIQUE ID: ${selectedAsset.uniqueid}`
        };

        console.log('Updating inventory item with data:', inventoryUpdateData);
        
        // Try multiple approaches to update inventory
        let inventoryUpdateResult;
        try {
          inventoryUpdateResult = await updateInventoryItem({
            id: selectedAsset.id,
            updates: inventoryUpdateData
          }).unwrap();
          console.log('✅ Inventory item updated successfully:', inventoryUpdateResult);
        } catch (inventoryError) {
          console.error('❌ Inventory update failed, trying direct database update:', inventoryError);
          
          // Fallback: Try direct database update
          try {
            const { data: directInventoryData, error: directInventoryError } = await supabase
              .from('inventory_items')
              .update(inventoryUpdateData)
              .eq('id', selectedAsset.id)
              .select();
            
            if (directInventoryError) {
              console.error('❌ Direct inventory update also failed:', directInventoryError);
              throw new Error(`Direct inventory update failed: ${directInventoryError.message}`);
            }
            
            if (!directInventoryData || directInventoryData.length === 0) {
              throw new Error('No inventory rows were updated. Item may not exist or you may not have permission.');
            }
            
            inventoryUpdateResult = directInventoryData[0];
            console.log('✅ Direct inventory update successful:', inventoryUpdateResult);
          } catch (directInventoryError) {
            console.error('❌ All inventory update methods failed:', directInventoryError);
            throw new Error(`Failed to update inventory: ${directInventoryError instanceof Error ? directInventoryError.message : String(directInventoryError)}`);
          }
        }
        
        // Send success notification with detailed information
        toast.success(`✅ Request approved and "${selectedAsset.assetname}" (${selectedAsset.uniqueid}) issued to ${request.employeename}`, {
          duration: 5000,
          style: {
            background: '#10B981',
            color: 'white',
          },
        });
        
        // Log the issuance for tracking
        console.log('Item issuance completed:', {
          item: selectedAsset.assetname,
          uniqueId: selectedAsset.uniqueid,
          issuedTo: request.employeename,
          issuedBy: user?.name,
          purpose: request.purpose,
          value: selectedAsset.totalcost
        });
      } else if (action === 'reject') {
        toast.success(`✅ Request rejected: ${reason}`, {
          duration: 4000,
          style: {
            background: '#EF4444',
            color: 'white',
          },
        });
      }

      toast.dismiss(loadingToast);
      onClose();
    } catch (error) {
      console.error(`❌ Error ${action}ing request:`, error);
      console.error('Error details:', {
        action,
        request: request.id,
        selectedAsset: selectedAsset?.id,
        reason,
        error: error instanceof Error ? error.message : String(error)
      });
      toast.dismiss(loadingToast);
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('no longer available')) {
          CRUDToasts.updateError('request', error.message);
        } else if (error.message.includes('does not have a valid unique ID')) {
          CRUDToasts.updateError('request', error.message);
        } else if (error.message.includes('duplicate')) {
          CRUDToasts.updateError('request', 'This asset is already issued to another employee');
        } else if (error.message.includes('permission') || error.message.includes('No rows were updated')) {
          CRUDToasts.updateError('request', 'You do not have permission to approve/reject requests. Please contact your administrator.');
        } else if (error.message.includes('constraint')) {
          CRUDToasts.updateError('request', 'Database constraint violation. Please check the data and try again.');
        } else if (error.message.includes('Database error')) {
          CRUDToasts.updateError('request', `Database error: ${error.message}`);
        } else if (error.message.includes('PGRST301') || error.message.includes('RLS')) {
          CRUDToasts.updateError('request', 'Row Level Security policy violation. You may not have permission to update this request.');
        } else {
          CRUDToasts.updateError('request', `Failed to ${action} request: ${error.message}`);
        }
      } else {
        CRUDToasts.updateError('request', `Failed to ${action} request. Please try again.`);
      }
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
            <XCircle size={20} className="text-red-500" />
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
            <XCircle size={16} className="text-red-500" />
            <span>Cancel</span>
          </button>
          <button
            onClick={handleApproval}
            disabled={!reason.trim() || (action === 'approve' && !selectedAsset) || isProcessing}
            className={`flex items-center justify-center px-4 py-2 space-x-2 text-white transition-all duration-200 rounded-lg ${
              action === 'approve' 
                ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {action === 'approve' ? <CheckCircle size={16} className="text-green-500" /> : <XCircle size={16} className="text-red-500" />}
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
