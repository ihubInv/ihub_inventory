import React, { useState } from 'react';
import { useInventory } from '../../contexts/InventoryContext';
import { useAuth } from '../../contexts/AuthContext';
import { AssetConditionChart, CategoryDistributionChart } from '../charts/ChartComponents';
import { Search, Filter, Download, Edit, Trash2, Eye, Package, Save, X, Zap, Calculator, BarChart3, List, AlertTriangle, CheckSquare, Square } from 'lucide-react';
import ViewInventory from './ViewInventory';
import UpdateInventory from './UpdateInventory';
import StatusDropdown from '../common/StatusDropdown';
import CategoryDropdown from '../common/CategoryDropdown';
import ConditionDropdown from '../common/ConditionDropdown';
import InventoryPivotTable from './InventoryPivotTable';
// import UpdateInventory from './updateInventory';

const InventoryList: React.FC = () => {
  const { inventoryItems, addInventoryItem, deleteInventoryItem, updateInventoryItem } = useInventory();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [viewingCategory, setViewingCategory] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [activeTab, setActiveTab] = useState<'list' | 'pivot'>('list');
  
  // Delete functionality states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
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
    status: 'available' as const,
    minimumstocklevel: 5,
    purchaseordernumber: '',
             expectedlifespan: '',
             assettag: '',
    salvagevalue: 0,
  });




  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = item.assetname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.uniqueid.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.vendorname.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || item.assetcategory === filterCategory;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const categories = [...new Set(inventoryItems.map(item => item.assetcategory))];
  const statuses = ['available', 'issued', 'maintenance', 'retired'];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'issued':
        return 'bg-blue-100 text-blue-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'retired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'excellent':
        return 'bg-green-100 text-green-800';
      case 'good':
        return 'bg-blue-100 text-blue-800';
      case 'fair':
        return 'bg-yellow-100 text-yellow-800';
      case 'poor':
        return 'bg-orange-100 text-orange-800';
      case 'damaged':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };


  const handleEditCategory = (item: any) => {
    setEditingCategory(item);
    setFormData({
      // const now = new Date();


      uniqueid: item.uniqueid,
      financialyear: item.financialyear,
      dateofinvoice: item.dateofinvoice,
      dateofentry: item.dateofentry,
      invoicenumber: item.invoicenumber,
      assetcategory: item.assetcategory,
      assetcategoryid: item.assetcategoryid,
      assetname: item.assetname,
      specification: item.specification,
      makemodel: item.makemodel,
      productserialnumber: item.productserialnumber,
      vendorname: item.vendorname,
      quantityperitem: item.quantityperitem,
      rateinclusivetax: item.rateinclusivetax,
      totalcost: item.totalcost,
      locationofitem: item.locationofitem,
      issuedto: item.issuedto,
      dateofissue: item.dateofissue ?? null,
      expectedreturndate: item.expectedreturndate ?? null,
      balancequantityinstock: item.balancequantityinstock,
      description: item.description,
      unitofmeasurement: item.unitofmeasurement,
      depreciationmethod: item.depreciationmethod,
      warrantyinformation: item.warrantyinformation,
      maintenanceschedule: item.maintenanceschedule,
      conditionofasset: item.conditionofasset,
      status: item.status,
      minimumstocklevel: item.minimumstocklevel,
      purchaseordernumber: item.purchaseordernumber,
              expectedlifespan: item.expectedlifespan,
        assettag: item.assettag,
        salvagevalue: item.salvagevalue,
        attachments: item.attachments ?? [],
      lastmodifiedby: user?.id || 'unknown',
      lastmodifieddate: item.lastmodifieddate,
      createdat: item.createdat,


    });
    setShowAddModal(true);
  };

  const handleUpdateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCategory) {
      updateInventoryItem(editingCategory.id, formData);
      setEditingCategory(null);
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
        status: 'available' as const,
        minimumstocklevel: 5,
        purchaseordernumber: '',
                 expectedlifespan: '',
         assettag: '',
         salvagevalue: 0,
      });
      setShowAddModal(false);
    }
  };





  const handleAddCategory = async (e: React.FormEvent) => {
    debugger
    e.preventDefault();
    try {
      debugger;
      await addInventoryItem({
        ...formData,
        createdby: user?.id || 'unknown'
      });
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
        status: 'available' as const,
        minimumstocklevel: 5,
        purchaseordernumber: '',
                 expectedlifespan: '',
         assettag: '',
         salvagevalue: 0,
      });
      setShowAddModal(false);
    } catch (err) {
      console.error('Failed to add category:', err);
      // Optional: show toast or error message
    }
  };

 

  // Enhanced delete functionality
  const handleDeleteClick = (item: any) => {
    setItemToDelete(item);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    
    setIsDeleting(true);
    try {
      await deleteInventoryItem(itemToDelete.id);
      setShowDeleteModal(false);
      setItemToDelete(null);
      // You can add a success toast notification here if you have a notification system
    } catch (error) {
      console.error('Error deleting item:', error);
      // You can add an error toast notification here
    } finally {
      setIsDeleting(false);
    }
  };

  // Bulk delete functionality
  const handleSelectItem = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === filteredItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredItems.map(item => item.id));
    }
  };

  const handleBulkDelete = () => {
    if (selectedItems.length === 0) return;
    setShowBulkDeleteModal(true);
  };

  const handleConfirmBulkDelete = async () => {
    setIsDeleting(true);
    try {
      for (const itemId of selectedItems) {
        await deleteInventoryItem(itemId);
      }
      setShowBulkDeleteModal(false);
      setSelectedItems([]);
      // You can add a success toast notification here
    } catch (error) {
      console.error('Error deleting items:', error);
      // You can add an error toast notification here
    } finally {
      setIsDeleting(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['Unique ID', 'Asset Name', 'Category', 'Status', 'Quantity', 'Location', 'Vendor'];
    const csvContent = [
      headers.join(','),
      ...filteredItems.map(item => [
        item.uniqueid,
        item.assetname,
        item.assetcategory,
        item.status,
        item.balancequantityinstock,
        item.locationofitem,
        item.vendorname
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inventory-export.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Chart data
  const conditionData = {
    excellent: filteredItems.filter(item => item.conditionofasset === 'excellent').length,
    good: filteredItems.filter(item => item.conditionofasset === 'good').length,
    fair: filteredItems.filter(item => item.conditionofasset === 'fair').length,
    poor: filteredItems.filter(item => item.conditionofasset === 'poor').length,
    damaged: filteredItems.filter(item => item.conditionofasset === 'damaged').length,
  };

  const categoryChartData = {
    categories: categories,
    counts: categories.map(cat => filteredItems.filter(item => item.assetcategory === cat).length),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Total Inventory</h1>
          <p className="mt-1 text-gray-600">Manage, track and analyze all inventory items</p>
        </div>
        <div className="flex items-center space-x-3">
          {/* Always show bulk delete button area for debugging */}
          {(user?.role === 'admin' || user?.role === 'stock-manager') && (
            <>
              {/* Selection status indicator */}
              {selectedItems.length > 0 && (
                <div className="flex items-center px-3 py-1 text-sm bg-blue-50 border border-blue-200 rounded-lg">
                  <CheckSquare size={16} className="mr-2 text-blue-600" />
                  <span className="text-blue-700">{selectedItems.length} selected</span>
                </div>
              )}
              
              {/* Action buttons when items are selected */}
              {selectedItems.length > 0 && (
                <>
                  <button
                    onClick={() => setSelectedItems([])}
                    className="flex items-center px-3 py-2 space-x-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all duration-200"
                  >
                    <X size={16} />
                    <span>Clear</span>
                  </button>
                  
                  <button
                    onClick={handleBulkDelete}
                    className="flex items-center px-4 py-2 space-x-2 text-white transition-all duration-200 rounded-lg bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg"
                  >
                    <Trash2 size={16} />
                    <span>Delete Selected ({selectedItems.length})</span>
                  </button>
                </>
              )}
            </>
          )}
          
          {activeTab === 'list' && (
            <button
              onClick={exportToCSV}
              className="flex items-center px-4 py-2 space-x-2 text-white transition-all duration-200 rounded-lg bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700"
            >
              <Download size={16} />
              <span>Export CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('list')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'list'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <List className="w-4 h-4" />
                <span>Inventory List</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('pivot')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'pivot'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4" />
                <span>Pivot Analysis</span>
              </div>
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'list' ? (
            <div className="space-y-6">
              {/* Filters */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="relative">
            <Search className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" size={16} />
            <input
              type="text"
              placeholder="Search inventory..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="min-w-48">
            <StatusDropdown
              value={filterStatus === 'all' ? '' : filterStatus}
              onChange={(value) => setFilterStatus(value || 'all')}
              type="inventory"
              placeholder="All Status"
              size="sm"
            />
          </div>

          <CategoryDropdown
            value={filterCategory}
            onChange={setFilterCategory}
            categories={['All Categories', ...categories]}
            placeholder="Filter by category"
            size="sm"
            searchable
          />

          <div className="flex items-center space-x-2">
            <Filter size={16} className="text-gray-400" />
            <span className="text-sm text-gray-600">{filteredItems.length} items</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Asset Condition Chart */}
        <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Asset Condition Overview</h3>
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-400 to-blue-500"></div>
          </div>
          <div className="h-64">
            <AssetConditionChart data={conditionData} />
          </div>
        </div>

        {/* Category Distribution Chart */}
        <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Category Distribution</h3>
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-400 to-pink-500"></div>
          </div>
          <div className="h-64">
            <CategoryDistributionChart data={categoryChartData} />
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="overflow-hidden bg-white border border-gray-100 shadow-sm rounded-2xl">
        {filteredItems?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  {/* Select All Checkbox - only show for admins and stock managers */}
                  {(user?.role === 'admin' || user?.role === 'stock-manager') && (
                    <th className="px-4 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      <button
                        onClick={handleSelectAll}
                        className="flex items-center justify-center w-5 h-5 text-blue-600 border border-gray-300 rounded hover:bg-blue-50"
                      >
                        {selectedItems.length === filteredItems.length && filteredItems.length > 0 ? (
                          <CheckSquare size={16} />
                        ) : (
                          <Square size={16} />
                        )}
                      </button>
                    </th>
                  )}
                  <th className="px-6 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Asset</th>
                  <th className="px-6 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Condition</th>
                                     <th className="px-6 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Quantity</th>
                   <th className="px-6 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Location</th>
                   <th className="px-6 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Depreciation</th>
                   <th className="px-6 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredItems?.map((item) => (
                  <tr key={item.id} className="transition-colors hover:bg-gray-50">
                    {/* Checkbox for selection - only show for admins and stock managers */}
                    {(user?.role === 'admin' || user?.role === 'stock-manager') && (
                      <td className="px-4 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleSelectItem(item.id)}
                          className="flex items-center justify-center w-5 h-5 text-blue-600 border border-gray-300 rounded hover:bg-blue-50"
                        >
                          {selectedItems.includes(item.id) ? (
                            <CheckSquare size={16} />
                          ) : (
                            <Square size={16} />
                          )}
                        </button>
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-10 h-10">
                          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600">
                            <Package className="w-5 h-5 text-white" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{item.assetname}</div>
                          <div className="text-sm text-gray-500">{item.uniqueid}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{item.assetcategory}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getConditionColor(item.conditionofasset)}`}>
                        {item.conditionofasset.charAt(0).toUpperCase() + item.conditionofasset.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                      {item.balancequantityinstock}
                    </td>
                                         <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                       {item.locationofitem}
                     </td>
                     
                     <td className="px-6 py-4 whitespace-nowrap">
                       {item.depreciationmethod && item.expectedlifespan ? (
                         <div className="flex items-center space-x-2">
                           <Calculator className="w-4 h-4 text-blue-600" />
                           <span className="text-sm text-gray-700">
                             {item.depreciationmethod}
                           </span>
                         </div>
                       ) : (
                         <span className="text-sm text-gray-400">Not set</span>
                       )}
                     </td>
                     
                     <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <button className="p-1 text-blue-600 rounded hover:text-blue-900"
                          onClick={() => setViewingCategory(item)}
                        >
                          <Eye size={16} />
                        </button>
                        {(user?.role === 'admin' || user?.role === 'stock-manager') && (
                          <>
                            <button className="p-1 text-green-600 rounded hover:text-green-900"
                              onClick={() => handleEditCategory(item)}
                            >
                              <Edit size={16} />
                            </button>
                            {(user?.role === 'admin' || user?.role === 'stock-manager') && (
                              <button
                                onClick={() => handleDeleteClick(item)}
                                className="p-1 text-red-600 rounded hover:text-red-900 hover:bg-red-50"
                                title="Delete item"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center">
            <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="mb-2 text-lg font-medium text-gray-900">No inventory items found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
      {/* Add/Edit Category Modal */}
      {showAddModal && (
        <UpdateInventory
          showAddModal={showAddModal}
          setShowAddModal={setShowAddModal}
          editingCategory={editingCategory}
          setEditingCategory={setEditingCategory}
          formData={formData}
          setFormData={setFormData}
          handleAddCategory={handleAddCategory}
          handleUpdateCategory={handleUpdateCategory}
        />
      )}

      {/* View Category Modal */}
      {viewingCategory && (
        <ViewInventory
          viewingCategory={viewingCategory}
          onClose={() => setViewingCategory(null)}
          onEdit={handleEditCategory}
        />
      )}
            </div>
          ) : (
            <InventoryPivotTable />
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center mb-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Delete Item</h3>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700">
                Are you sure you want to delete <span className="font-semibold">"{itemToDelete?.assetname}"</span>?
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Asset ID: {itemToDelete?.uniqueid}
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setItemToDelete(null);
                }}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center mb-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Delete Multiple Items</h3>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700">
                Are you sure you want to delete <span className="font-semibold">{selectedItems.length} selected item{selectedItems.length > 1 ? 's' : ''}</span>?
              </p>
              <div className="mt-3 max-h-32 overflow-y-auto">
                <ul className="text-sm text-gray-600 space-y-1">
                  {selectedItems.slice(0, 5).map(itemId => {
                    const item = filteredItems.find(i => i.id === itemId);
                    return (
                      <li key={itemId} className="flex items-center">
                        <span className="w-2 h-2 bg-red-400 rounded-full mr-2"></span>
                        {item?.assetname} ({item?.uniqueid})
                      </li>
                    );
                  })}
                  {selectedItems.length > 5 && (
                    <li className="text-gray-400 italic">
                      ... and {selectedItems.length - 5} more items
                    </li>
                  )}
                </ul>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowBulkDeleteModal(false);
                }}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmBulkDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? 'Deleting...' : `Delete All ${selectedItems.length}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Bar - appears when items are selected */}
      {selectedItems.length > 0 && (user?.role === 'admin' || user?.role === 'stock-manager') && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40">
          <div className="flex items-center space-x-3 px-6 py-3 bg-white rounded-full shadow-2xl border border-gray-200">
            <div className="flex items-center px-3 py-1 text-sm bg-blue-50 border border-blue-200 rounded-full">
              <CheckSquare size={16} className="mr-2 text-blue-600" />
              <span className="text-blue-700 font-medium">{selectedItems.length} item{selectedItems.length > 1 ? 's' : ''} selected</span>
            </div>
            
            <button
              onClick={() => setSelectedItems([])}
              className="flex items-center px-4 py-2 space-x-2 text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200 transition-all duration-200"
            >
              <X size={16} />
              <span>Clear</span>
            </button>
            
            <button
              onClick={handleBulkDelete}
              className="flex items-center px-4 py-2 space-x-2 text-white bg-red-600 rounded-full hover:bg-red-700 transition-all duration-200 shadow-lg"
            >
              <Trash2 size={16} />
              <span>Delete Selected</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryList;