import React, { useState, useEffect } from 'react';
import { 
  useGetInventoryItemsQuery,
  useUpdateInventoryItemMutation,
  useGetRequestsQuery,
  useGetUsersQuery
} from '../../store/api';
import { useAppSelector } from '../../store/hooks';
import DateRangePicker from '../common/DateRangePicker';
import FilterDropdown, { statusFilters } from '../common/FilterDropdown';
import IssueItemModal from './IssueItemModal';
import AuditTrailViewer from './AuditTrailViewer';
import { 
  UserCheck, 
  Search, 
  Filter,
  Calendar,
  Package,
  User,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  RefreshCw,
  Download,
  AlertCircle,
  Plus,
  History,
  FileText,
  ArrowRight,
  ArrowLeft,
  Shield,
  UserPlus,
  Calendar as CalendarIcon,
  MapPin,
  Tag,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity
} from 'lucide-react';
import { CRUDToasts } from '../../services/toastService';
import toast from 'react-hot-toast';

interface IssuanceRecord {
  id: string;
  itemId: string;
  itemName: string;
  issuedTo: string;
  issuedBy: string;
  issuedById: string;
  issuedDate: string;
  requestId?: string;
  purpose?: string;
  expectedReturnDate?: string;
  actualReturnDate?: string;
  status: 'active' | 'returned' | 'overdue';
  notes?: string;
  department?: string;
  location?: string;
}

const IssuedItemManagement: React.FC = () => {
  const { data: inventoryItems = [] } = useGetInventoryItemsQuery();
  const { data: requests = [] } = useGetRequestsQuery();
  const { data: users = [] } = useGetUsersQuery();
  const [updateInventoryItem] = useUpdateInventoryItemMutation();
  const { user } = useAppSelector((state) => state.auth);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('issued');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [viewingItem, setViewingItem] = useState<any>(null);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showAuditTrail, setShowAuditTrail] = useState(false);
  const [selectedItemForAudit, setSelectedItemForAudit] = useState<any>(null);

  // Filter issued items
  const issuedItems = inventoryItems.filter(item => item.status === 'issued');
  
  // Get available items for issuing
  const availableItems = inventoryItems.filter(item => item.status === 'available');

  // Create comprehensive issuance records
  const issuanceRecords: IssuanceRecord[] = issuedItems.map(item => {
    // Use actual database columns instead of parsing description
    const issuedTo = item.issuedto || 'Unknown';
    const issuedBy = item.issuedby || 'Unknown';
    const issueDate = item.issueddate?.toISOString() || 
                     item.dateofissue?.toISOString() || 
                     (item.lastmodifieddate ? new Date(item.lastmodifieddate).toISOString() : new Date().toISOString());
    const expectedReturn = item.expectedreturndate?.toISOString();
    
    // Parse purpose from description as fallback (for backward compatibility)
    const description = item.description || '';
    const purposeMatch = description.match(/PURPOSE: (.+)/);
    const purpose = purposeMatch ? purposeMatch[1] : 'Direct Issue';
    
    const relatedRequest = requests.find(req => 
      req.employeename === issuedTo && 
      req.itemtype === item.assetname &&
      req.status === 'approved'
    );
    
    const issuedByUser = users.find(u => u.name === issuedBy);
    const issuedToUser = users.find(u => u.name === issuedTo);
    
    const daysSinceIssued = issueDate ? 
      Math.floor((Date.now() - new Date(issueDate).getTime()) / (1000 * 60 * 60 * 24)) : 0;
    
    return {
      id: item.id,
      itemId: item.id,
      itemName: item.assetname,
      issuedTo,
      issuedBy,
      issuedById: issuedByUser?.id || 'unknown',
      issuedDate: issueDate,
      requestId: relatedRequest?.id,
      purpose,
      expectedReturnDate: expectedReturn,
      actualReturnDate: undefined, // Will be set when item is returned
      status: daysSinceIssued > 30 ? 'overdue' : 'active',
      notes: relatedRequest?.remarks || '',
      department: issuedToUser?.department || 'Unknown',
      location: item.locationofitem
    };
  });

  const filteredItems = issuedItems.filter(item => {
    // Use actual database columns instead of parsing description
    const issuedTo = item.issuedto || 'Unknown';
    const issuedBy = item.issuedby || 'Unknown';
    const issueDate = item.issueddate?.toISOString() || 
                     item.dateofissue?.toISOString() || 
                     (item.lastmodifieddate ? new Date(item.lastmodifieddate).toISOString() : new Date().toISOString());
    
    const matchesSearch = item.assetname.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.locationofitem.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         issuedTo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         issuedBy.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    
    let matchesDate = true;
    if (startDate && endDate && issueDate) {
      const itemDate = new Date(issueDate);
      matchesDate = itemDate >= startDate && itemDate <= endDate;
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const handleReturnItem = async (itemId: string, notes?: string) => {
    const loadingToast = CRUDToasts.updating('item');
    try {
      const item = inventoryItems.find(i => i.id === itemId);
      if (!item) {
        throw new Error('Item not found');
      }

      // Parse current issuance info
      const description = item.description || '';
      const issuedToMatch = description.match(/ISSUED TO: (.+)/);
      const issuedByMatch = description.match(/ISSUED BY: (.+)/);
      const issueDateMatch = description.match(/ISSUE DATE: (.+)/);
      
      const issuedTo = issuedToMatch ? issuedToMatch[1] : 'Unknown';
      const issuedBy = issuedByMatch ? issuedByMatch[1] : 'Unknown';
      const issueDate = issueDateMatch ? issueDateMatch[1] : 'Unknown';

      // Create audit trail entry
      const auditEntry = {
        action: 'return',
        itemId: itemId,
        itemName: item.assetname,
        issuedTo: issuedTo,
        issuedBy: issuedBy,
        returnedBy: user?.name || 'Unknown',
        returnedById: user?.id || 'unknown',
        returnDate: new Date().toISOString(),
        notes: notes || 'Item returned to inventory',
        previousStatus: 'issued',
        newStatus: 'available'
      };

      // Store audit trail in localStorage (in production, this should be stored in database)
      const existingAudit = JSON.parse(localStorage.getItem('issuanceAuditTrail') || '[]');
      existingAudit.push(auditEntry);
      localStorage.setItem('issuanceAuditTrail', JSON.stringify(existingAudit));

      // Create return record in description
      const returnRecord = `\n\nRETURNED ON: ${new Date().toISOString()}\nRETURNED BY: ${user?.name || 'Unknown'}\nRETURN NOTES: ${notes || 'Item returned to inventory'}`;
      
      await updateInventoryItem({
        id: itemId,
        updates: {
          status: 'available',
          lastmodifiedby: user?.name || 'Admin',
          description: description + returnRecord
        }
      }).unwrap();
      
      toast.dismiss(loadingToast);
      CRUDToasts.updated('item');
      
      // Send notification to original requester if available
      const relatedRequest = requests.find(req => 
        req.employeename === issuedTo && 
        req.itemtype === item.assetname
      );
      
      if (relatedRequest) {
        toast.success(`Item ${item.assetname} has been returned to inventory`);
      }
    } catch (err) {
      console.error('Failed to return item:', err);
      toast.dismiss(loadingToast);
      CRUDToasts.updateError('item', 'Please try again');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'issued':
        return 'bg-orange-100 text-orange-800';
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Enhanced stats calculation
  const stats = {
    total: issuedItems.length,
    overdue: issuanceRecords.filter(record => record.status === 'overdue').length,
    recent: issuanceRecords.filter(record => {
      const daysSinceIssued = Math.floor((Date.now() - new Date(record.issuedDate).getTime()) / (1000 * 60 * 60 * 24));
      return daysSinceIssued <= 7;
    }).length,
    totalValue: issuedItems.reduce((sum, item) => sum + (item.totalcost || 0), 0),
    activeIssuances: issuanceRecords.filter(record => record.status === 'active').length,
    departments: [...new Set(issuanceRecords.map(record => record.department))].length,
    avgDaysOut: issuedItems.length > 0 ? 
      Math.round(issuedItems.reduce((sum, item) => {
        if (!item.issueddate) return sum;
        const daysSinceIssued = Math.floor((Date.now() - new Date(item.issueddate).getTime()) / (1000 * 60 * 60 * 24));
        return sum + daysSinceIssued;
      }, 0) / issuedItems.length) : 0
  };

  // Get audit trail for an item
  const getItemAuditTrail = (itemId: string) => {
    const auditTrail = JSON.parse(localStorage.getItem('issuanceAuditTrail') || '[]');
    return auditTrail.filter((entry: any) => entry.itemId === itemId);
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Issued Items Management</h1>
          <p className="mt-1 text-gray-600">Track and manage all issued inventory items with comprehensive audit trail</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowIssueModal(true)}
            className="flex items-center px-4 py-2 space-x-2 text-white transition-all duration-200 rounded-lg bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
          >
            <Plus size={16} />
            <span>Issue Item</span>
          </button>
          <button
            onClick={() => {
              toast.success('Data refreshed successfully');
            }}
            className="flex items-center px-4 py-2 space-x-2 text-gray-700 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
          <button className="flex items-center px-4 py-2 space-x-2 text-white transition-all duration-200 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
            <Download size={16} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Issued</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-xs text-gray-500">{stats.activeIssuances} active</p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-r from-[#0d559e] to-[#1a6bb8]">
              <UserCheck className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overdue Items</p>
              <p className="text-2xl font-bold text-gray-900">{stats.overdue}</p>
              <p className="text-xs text-gray-500">&gt;30 days out</p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Recent Issues</p>
              <p className="text-2xl font-bold text-gray-900">{stats.recent}</p>
              <p className="text-xs text-gray-500">Last 7 days</p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Days Out</p>
              <p className="text-2xl font-bold text-gray-900">{stats.avgDaysOut}</p>
              <p className="text-xs text-gray-500">Across all items</p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-xl font-bold text-gray-900">₹{stats.totalValue.toLocaleString()}</p>
              <p className="text-xs text-gray-500">Issued items value</p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-r from-yellow-500 to-yellow-600">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Departments</p>
              <p className="text-xl font-bold text-gray-900">{stats.departments}</p>
              <p className="text-xs text-gray-500">With issued items</p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600">
              <UserPlus className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Issuances</p>
              <p className="text-xl font-bold text-gray-900">{stats.activeIssuances}</p>
              <p className="text-xs text-gray-500">Currently out</p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600">
              <Activity className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Filters */}
      <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <Search className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" size={16} />
            <input
              type="text"
              placeholder="Search items, users, departments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <FilterDropdown
            value={filterStatus}
            onChange={setFilterStatus}
            options={[
              { value: 'issued', label: 'Issued' },
              { value: 'all', label: 'All Status' }
            ]}
            placeholder="Filter by status"
            size="sm"
          />

          <div className="sm:col-span-2">
            <DateRangePicker
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
              startPlaceholder="Issue Start Date"
              endPlaceholder="Issue End Date"
            />
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-2">
            <Filter size={16} className="text-gray-400" />
            <span className="text-sm text-gray-600">{filteredItems.length} items found</span>
          </div>
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterStatus('issued');
              setStartDate(null);
              setEndDate(null);
            }}
            className="text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Enhanced Items Table */}
      <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Issued Items</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowAuditTrail(true)}
              className="flex items-center px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <History size={14} className="mr-1" />
              View All Audit Trail
            </button>
          </div>
        </div>
        
        {filteredItems.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Item Details</th>
                  <th className="px-6 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Issued To</th>
                  <th className="px-6 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Issued By</th>
                  <th className="px-6 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Issue Date</th>
                  <th className="px-6 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Days Out</th>
                  <th className="px-6 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Purpose</th>
                  <th className="px-6 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredItems.map((item) => {
                  const issuanceRecord = issuanceRecords.find(record => record.itemId === item.id);
                  const daysOut = item.issueddate ? 
                    Math.floor((Date.now() - new Date(item.issueddate).getTime()) / (1000 * 60 * 60 * 24)) : 0;
                  
                  return (
                    <tr key={item.id} className="transition-colors hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 w-10 h-10">
                            <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-[#0d559e] to-[#1a6bb8] flex items-center justify-center">
                              <Package className="w-5 h-5 text-white" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{item.assetname}</div>
                            <div className="text-sm text-gray-500">{item.categoryname}</div>
                            <div className="flex items-center text-xs text-gray-400">
                              <MapPin size={12} className="mr-1" />
                              {item.locationofitem}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{item.issuedto || 'N/A'}</div>
                        <div className="text-xs text-gray-500">{issuanceRecord?.department || 'Unknown Dept'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Shield size={14} className="mr-1 text-gray-400" />
                          <div className="text-sm text-gray-900">{item.issuedby || 'N/A'}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                        <div className="flex items-center">
                          <CalendarIcon size={14} className="mr-1 text-gray-400" />
                          {item.issueddate ? new Date(item.issueddate).toLocaleDateString() : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          daysOut > 30
                            ? 'bg-red-100 text-red-800'
                            : daysOut > 15
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {daysOut} days
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                        <div className="max-w-xs truncate">
                          {issuanceRecord?.purpose || 'Direct Issue'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          issuanceRecord?.status === 'overdue'
                            ? 'bg-red-100 text-red-800'
                            : issuanceRecord?.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {issuanceRecord?.status || 'active'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setViewingItem(item)}
                            className="p-1 text-blue-600 transition-colors rounded hover:text-blue-900"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedItemForAudit(item);
                              setShowAuditTrail(true);
                            }}
                            className="p-1 text-purple-600 transition-colors rounded hover:text-purple-900"
                            title="View Audit Trail"
                          >
                            <History size={16} />
                          </button>
                          <button
                            onClick={() => handleReturnItem(item.id)}
                            className="p-1 text-green-600 transition-colors rounded hover:text-green-900"
                            title="Return Item"
                          >
                            <ArrowLeft size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <UserCheck className="mx-auto w-12 h-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No issued items found</h3>
            <p className="mt-2 text-gray-500">No items match your current filters.</p>
          </div>
        )}
      </div>

      {/* Enhanced View Item Modal */}
      {viewingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black bg-opacity-50">
          <div className="w-full max-w-4xl max-h-[90vh] bg-white rounded-lg sm:rounded-2xl shadow-xl overflow-hidden">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Item Details & Tracking</h3>
              <button
                onClick={() => setViewingItem(null)}
                className="p-2 text-gray-400 transition-colors rounded-lg hover:text-gray-600 hover:bg-gray-100"
              >
                <XCircle size={20} />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* Item Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Item Name</label>
                  <p className="text-sm text-gray-900 break-words">{viewingItem.assetname}</p>
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Category</label>
                  <p className="text-sm text-gray-900 break-words">{viewingItem.assetcategory || 'N/A'}</p>
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Issued To</label>
                  <p className="text-sm text-gray-900 break-words">
                    {(() => {
                      const issuedToUser = users.find(u => u.id === viewingItem.issuedto);
                      return issuedToUser ? `${issuedToUser.name} (${issuedToUser.department || 'No Department'})` : viewingItem.issuedto || 'N/A';
                    })()}
                  </p>
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Issued By</label>
                  <p className="text-sm text-gray-900 break-words">
                    {(() => {
                      const issuedByUser = users.find(u => u.id === viewingItem.issuedby);
                      return issuedByUser ? `${issuedByUser.name} (${issuedByUser.role})` : viewingItem.issuedby || 'N/A';
                    })()}
                  </p>
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Issue Date</label>
                  <p className="text-sm text-gray-900">
                    {(() => {
                      const issueDate = viewingItem.dateofissue || viewingItem.issueddate || viewingItem.lastmodifieddate;
                      return issueDate ? new Date(issueDate).toLocaleDateString() : 'N/A';
                    })()}
                  </p>
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Location</label>
                  <p className="text-sm text-gray-900 break-words">{viewingItem.locationofitem || 'N/A'}</p>
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Expected Return Date</label>
                  <p className="text-sm text-gray-900">
                    {viewingItem.expectedreturndate ? new Date(viewingItem.expectedreturndate).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Status</label>
                  <p className="text-sm text-gray-900 capitalize">{viewingItem.status || 'N/A'}</p>
                </div>
              </div>

              {/* Audit Trail */}
              <div>
                <h4 className="mb-3 text-base sm:text-lg font-medium text-gray-900">Audit Trail</h4>
                <div className="space-y-2 sm:space-y-3">
                  {(() => {
                    // Create audit trail from actual database data
                    const auditEntries = [];
                    
                    // Add creation entry
                    if (viewingItem.createdat) {
                      auditEntries.push({
                        action: 'Item Created',
                        date: viewingItem.createdat,
                        user: users.find(u => u.id === viewingItem.createdby)?.name || 'System',
                        notes: `Item "${viewingItem.assetname}" was added to inventory`
                      });
                    }
                    
                    // Add issuance entry
                    if (viewingItem.status === 'issued' && viewingItem.dateofissue) {
                      const issuedToUser = users.find(u => u.id === viewingItem.issuedto);
                      const issuedByUser = users.find(u => u.id === viewingItem.issuedby);
                      auditEntries.push({
                        action: 'Item Issued',
                        date: viewingItem.dateofissue,
                        user: issuedByUser?.name || 'Unknown',
                        notes: `Issued to ${issuedToUser?.name || 'Unknown'} (${issuedToUser?.department || 'No Department'})`
                      });
                    }
                    
                    // Add last modification entry
                    if (viewingItem.lastmodifieddate && viewingItem.lastmodifiedby) {
                      const modifiedByUser = users.find(u => u.id === viewingItem.lastmodifiedby);
                      auditEntries.push({
                        action: 'Item Updated',
                        date: viewingItem.lastmodifieddate,
                        user: modifiedByUser?.name || 'Unknown',
                        notes: 'Item details were modified'
                      });
                    }
                    
                    // Sort by date (newest first)
                    auditEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                    
                    return auditEntries.length > 0 ? auditEntries.map((entry, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div className="flex items-center space-x-2">
                            <Activity size={16} className="text-gray-400 flex-shrink-0" />
                            <span className="text-sm font-medium text-gray-900">{entry.action}</span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(entry.date).toLocaleString()}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-600">
                          <strong>By:</strong> {entry.user}
                        </p>
                        <p className="mt-1 text-sm text-gray-600 break-words">{entry.notes}</p>
                      </div>
                    )) : (
                      <div className="p-4 text-center bg-gray-50 rounded-lg">
                        <Activity size={24} className="mx-auto text-gray-400" />
                        <p className="mt-2 text-sm text-gray-500">No audit trail available for this item.</p>
                        <p className="text-xs text-gray-400">Audit trail will be generated as actions are performed.</p>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end pt-4 sm:pt-6 mt-4 sm:mt-6 space-y-2 sm:space-y-0 sm:space-x-3 border-t border-gray-200">
              <button
                onClick={() => setViewingItem(null)}
                className="flex items-center justify-center px-4 py-2 space-x-2 text-gray-700 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <XCircle size={16} />
                <span>Close</span>
              </button>
              <button
                onClick={() => {
                  setViewingItem(null);
                  handleReturnItem(viewingItem.id);
                }}
                className="flex items-center justify-center px-4 py-2 space-x-2 text-white transition-all duration-200 rounded-lg bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
              >
                <ArrowLeft size={16} />
                <span>Return Item</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Issue Item Modal */}
      <IssueItemModal
        isOpen={showIssueModal}
        onClose={() => setShowIssueModal(false)}
        availableItems={availableItems}
      />

      {/* Audit Trail Viewer */}
      <AuditTrailViewer
        isOpen={showAuditTrail}
        onClose={() => {
          setShowAuditTrail(false);
          setSelectedItemForAudit(null);
        }}
        selectedItem={selectedItemForAudit}
      />
    </div>
  );
};

export default IssuedItemManagement;