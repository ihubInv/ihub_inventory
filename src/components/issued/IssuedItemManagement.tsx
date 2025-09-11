import React, { useState, useEffect } from 'react';
import { useInventory } from '../../contexts/InventoryContext';
import { useAuth } from '../../contexts/AuthContext';
import DateRangePicker from '../common/DateRangePicker';
import FilterDropdown, { statusFilters } from '../common/FilterDropdown';
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
  AlertCircle
} from 'lucide-react';
import { CRUDToasts } from '../../services/toastService';
import toast from 'react-hot-toast';

const IssuedItemManagement: React.FC = () => {
  const { inventoryItems, updateInventoryItem } = useInventory();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('issued');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [viewingItem, setViewingItem] = useState<any>(null);

  // Filter issued items
  const issuedItems = inventoryItems.filter(item => item.status === 'issued');

  const filteredItems = issuedItems.filter(item => {
    const matchesSearch = item.assetname.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.locationofitem.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.issuedto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.issuedby?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    
    let matchesDate = true;
    if (startDate && endDate) {
      const itemDate = new Date(item.issueddate);
      matchesDate = itemDate >= startDate && itemDate <= endDate;
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const handleReturnItem = async (itemId: string) => {
    const loadingToast = CRUDToasts.updating('item');
    try {
      await updateInventoryItem(itemId, {
        status: 'available',
        issuedto: null,
        issuedby: null,
        issueddate: null,
        returndate: new Date().toISOString(),
        returnedby: user?.id || 'unknown'
      });
      toast.dismiss(loadingToast);
      CRUDToasts.updated('item');
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

  const stats = {
    total: issuedItems.length,
    overdue: issuedItems.filter(item => {
      if (!item.issueddate) return false;
      const issuedDate = new Date(item.issueddate);
      const daysSinceIssued = Math.floor((Date.now() - issuedDate.getTime()) / (1000 * 60 * 60 * 24));
      return daysSinceIssued > 30; // Consider overdue after 30 days
    }).length,
    recent: issuedItems.filter(item => {
      if (!item.issueddate) return false;
      const issuedDate = new Date(item.issueddate);
      const daysSinceIssued = Math.floor((Date.now() - issuedDate.getTime()) / (1000 * 60 * 60 * 24));
      return daysSinceIssued <= 7; // Recent within 7 days
    }).length,
    totalValue: issuedItems.reduce((sum, item) => sum + (item.totalcost || 0), 0)
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Issued Items Management</h1>
          <p className="mt-1 text-gray-600">Track and manage all issued inventory items</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => window.location.reload()}
            className="flex items-center px-4 py-2 space-x-2 text-gray-700 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
          <button className="flex items-center px-4 py-2 space-x-2 text-white transition-all duration-200 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
            <Download size={16} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Issued</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-600">
              <UserCheck className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overdue Items</p>
              <p className="text-2xl font-bold text-gray-900">{stats.overdue}</p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-r from-red-500 to-pink-600">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Recent Issues</p>
              <p className="text-2xl font-bold text-gray-900">{stats.recent}</p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-teal-600">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">₹{stats.totalValue.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600">
              <Package className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <Search className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" size={16} />
            <input
              type="text"
              placeholder="Search items..."
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

      {/* Items Table */}
      <div className="overflow-hidden bg-white border border-gray-100 shadow-sm rounded-2xl">
        {filteredItems.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Item</th>
                  <th className="px-6 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Issued To</th>
                  <th className="px-6 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Issued By</th>
                  <th className="px-6 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Issue Date</th>
                  <th className="px-6 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Location</th>
                  <th className="px-6 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="transition-colors hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-10 h-10">
                          <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center">
                            <Package className="w-5 h-5 text-white" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{item.assetname}</div>
                          <div className="text-sm text-gray-500">{item.categoryname}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.issuedto || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.issuedby || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                      {item.issueddate ? new Date(item.issueddate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                      {item.locationofitem}
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
                          onClick={() => handleReturnItem(item.id)}
                          className="p-1 text-green-600 transition-colors rounded hover:text-green-900"
                          title="Return Item"
                        >
                          <CheckCircle size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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

      {/* View Item Modal */}
      {viewingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Item Details</h3>
              <button
                onClick={() => setViewingItem(null)}
                className="p-2 text-gray-400 transition-colors rounded-lg hover:text-gray-600 hover:bg-gray-100"
              >
                <XCircle size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Item Name</label>
                  <p className="text-sm text-gray-900">{viewingItem.assetname}</p>
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Category</label>
                  <p className="text-sm text-gray-900">{viewingItem.categoryname}</p>
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Issued To</label>
                  <p className="text-sm text-gray-900">{viewingItem.issuedto || 'N/A'}</p>
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Issued By</label>
                  <p className="text-sm text-gray-900">{viewingItem.issuedby || 'N/A'}</p>
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Issue Date</label>
                  <p className="text-sm text-gray-900">
                    {viewingItem.issueddate ? new Date(viewingItem.issueddate).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Location</label>
                  <p className="text-sm text-gray-900">{viewingItem.locationofitem}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end pt-6 mt-6 space-x-3 border-t border-gray-200">
              <button
                onClick={() => setViewingItem(null)}
                className="flex items-center px-4 py-2 space-x-2 text-gray-700 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <XCircle size={16} />
                <span>Close</span>
              </button>
              <button
                onClick={() => {
                  setViewingItem(null);
                  handleReturnItem(viewingItem.id);
                }}
                className="flex items-center px-4 py-2 space-x-2 text-white transition-all duration-200 rounded-lg bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700"
              >
                <CheckCircle size={16} />
                <span>Return Item</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IssuedItemManagement;
