import React, { useState } from 'react';
import { useInventory } from '../../contexts/InventoryContext';
import { useAuth } from '../../contexts/AuthContext';
import { AssetConditionChart, CategoryDistributionChart } from '../charts/ChartComponents';
import { Search, Filter, Download, Edit, Trash2, Eye, Package, Save, X, Zap } from 'lucide-react';
// import UpdateInventory from './updateInventory';

const InventoryList: React.FC = () => {
  const { inventoryItems,addInventoryItem, deleteInventoryItem, updateInventoryItem } = useInventory();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [viewingCategory, setViewingCategory] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [formData, setFormData] = useState({
    uniqueid: '',
    financialyear: '2024-25',
    dateofinvoice: null as Date | null,
    dateofentry: new Date(),
    invoicenumber: '',
    assetcategory: '',
    assetcategoryid:"",
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
        assetcategoryid:"",
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
        createdBy: user?.id || 'unknown'
      });
      setFormData({
        uniqueid: '',
        financialyear: '2024-25',
        dateofinvoice: null as Date | null,
        dateofentry: new Date(),
        invoicenumber: '',
        assetcategory: '',
        assetcategoryid:"",
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
      });
      setShowAddModal(false);
    } catch (err) {
      console.error('Failed to add category:', err);
      // Optional: show toast or error message
    }
  };
  
  // const handleDeleteCategory = (categoryId: string) => {
  //   if (window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
  //     // deleteCategory(categoryId);
  //   }
  // };
  
  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      deleteInventoryItem(id);
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
          <p className="mt-1 text-gray-600">Manage and track all inventory items</p>
        </div>
        <button
          onClick={exportToCSV}
          className="flex items-center px-4 py-2 space-x-2 text-white transition-all duration-200 rounded-lg bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700"
        >
          <Download size={16} />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filters */}
      <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
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

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            {statuses.map(status => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

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
                  <th className="px-6 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Asset</th>
                  <th className="px-6 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Condition</th>
                  <th className="px-6 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Quantity</th>
                  <th className="px-6 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Location</th>
                  <th className="px-6 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredItems?.map((item) => (
                  <tr key={item.id} className="transition-colors hover:bg-gray-50">
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
                            {user?.role === 'admin' && (
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="p-1 text-red-600 rounded hover:text-red-900"
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
  <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black bg-opacity-50">
    <div className="w-full max-w-6xl max-h-[90vh] overflow-y-auto p-8 bg-white rounded-2xl shadow-xl">
      <h3 className="mb-6 text-2xl font-semibold text-gray-900">
        {editingCategory ? 'Edit Inventory Asset' : 'Add New Inventory Asset'}
      </h3>

      <form
        onSubmit={editingCategory ? handleUpdateCategory : handleAddCategory}
        className="grid grid-cols-1 gap-6 md:grid-cols-3"
      >
        {/* Row 1 */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Asset Name *</label>
          <input
            type="text"
            value={formData.assetname}
            onChange={(e) => setFormData(prev => ({ ...prev, assetname: e.target.value }))}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            placeholder="e.g., Computer Mouse"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Asset Category</label>
          <input
            type="text"
            value={formData.assetcategory}
            onChange={(e) => setFormData(prev => ({ ...prev, assetcategory: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            placeholder="Category"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Invoice Number</label>
          <input
            type="text"
            value={formData.invoicenumber}
            onChange={(e) => setFormData(prev => ({ ...prev, invoicenumber: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            placeholder="Invoice #"
          />
        </div>

        {/* Row 2 */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Specification</label>
          <input
            type="text"
            value={formData.specification}
            onChange={(e) => setFormData(prev => ({ ...prev, specification: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Make/Model</label>
          <input
            type="text"
            value={formData.makemodel}
            onChange={(e) => setFormData(prev => ({ ...prev, makemodel: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Product Serial Number</label>
          <input
            type="text"
            value={formData.productserialnumber}
            onChange={(e) => setFormData(prev => ({ ...prev, productserialnumber: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        {/* Row 3 */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Asset Type</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="tangible">Tangible</option>
            <option value="intangible">Intangible</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block mb-1 text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            placeholder="Brief description of this asset..."
          />
        </div>

        {/* Active checkbox */}
        <div className="flex items-center mt-2 md:col-span-3">
          <input
            type="checkbox"
            id="isActive"
            className="w-4 h-4 text-blue-600 border-gray-300 rounded"
          />
          <label htmlFor="isActive" className="ml-2 text-sm text-gray-900">Active Asset</label>
        </div>

        {/* Buttons */}
        <div className="flex justify-end pt-4 space-x-3 md:col-span-3">
          <button
            type="button"
            onClick={() => {
              setShowAddModal(false);
              setEditingCategory(null);
            }}
            className="flex items-center px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100"
          >
            <X size={16} className="mr-1" />
            Cancel
          </button>

          <button
            type="submit"
            className="flex items-center px-4 py-2 space-x-2 text-white transition-all duration-200 rounded-lg shadow-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 hover:shadow-xl"

          >
            <Save size={16} className="mr-1" />
            {editingCategory ? 'Update' : 'Add'} Inventory Asset
          </button>
        </div>
      </form>
    </div>
  </div>
)}


       
       
      
        
  
       
      

      {/* View Category Modal */}
      {viewingCategory && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black bg-opacity-50">
    <div className="w-full max-w-6xl max-h-[90vh] overflow-y-auto p-8 bg-white rounded-2xl shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-semibold text-gray-900">Inventory Asset Details</h3>
        <button onClick={() => setViewingCategory(null)} className="text-gray-500 hover:text-gray-700">
          <X size={24} />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 text-sm text-gray-800 md:grid-cols-3">
        {/* Row 1 */}
        <div>
          <label className="block mb-1 font-medium">Asset Name</label>
          <p className="p-3 bg-gray-100 rounded-lg">{viewingCategory.assetname || '—'}</p>
        </div>
        <div>
          <label className="block mb-1 font-medium">Asset Category</label>
          <p className="p-3 bg-gray-100 rounded-lg">{viewingCategory.assetcategory || '—'}</p>
        </div>
        <div>
          <label className="block mb-1 font-medium">Invoice Number</label>
          <p className="p-3 bg-gray-100 rounded-lg">{viewingCategory.invoicenumber || '—'}</p>
        </div>

        {/* Row 2 */}
        <div>
          <label className="block mb-1 font-medium">Specification</label>
          <p className="p-3 bg-gray-100 rounded-lg">{viewingCategory.specification || '—'}</p>
        </div>
        <div>
          <label className="block mb-1 font-medium">Make/Model</label>
          <p className="p-3 bg-gray-100 rounded-lg">{viewingCategory.makemodel || '—'}</p>
        </div>
        <div>
          <label className="block mb-1 font-medium">Serial Number</label>
          <p className="p-3 bg-gray-100 rounded-lg">{viewingCategory.productserialnumber || '—'}</p>
        </div>

        {/* Row 3 */}
        <div>
          <label className="block mb-1 font-medium">Location</label>
          <p className="p-3 bg-gray-100 rounded-lg">{viewingCategory.locationofitem || '—'}</p>
        </div>
        <div>
          <label className="block mb-1 font-medium">Vendor</label>
          <p className="p-3 bg-gray-100 rounded-lg">{viewingCategory.vendorname || '—'}</p>
        </div>
        <div>
          <label className="block mb-1 font-medium">Status</label>
          <p className="p-3 capitalize bg-gray-100 rounded-lg">{viewingCategory.status || '—'}</p>
        </div>

        {/* Row 4 */}
        <div>
          <label className="block mb-1 font-medium">Condition</label>
          <p className="p-3 capitalize bg-gray-100 rounded-lg">{viewingCategory.conditionofasset || '—'}</p>
        </div>
        <div>
          <label className="block mb-1 font-medium">Quantity In Stock</label>
          <p className="p-3 bg-gray-100 rounded-lg">{viewingCategory.balancequantityinstock ?? '—'}</p>
        </div>
        <div>
          <label className="block mb-1 font-medium">Unit</label>
          <p className="p-3 bg-gray-100 rounded-lg">{viewingCategory.unitofmeasurement || '—'}</p>
        </div>

        {/* Row 5 */}
        <div>
          <label className="block mb-1 font-medium">Description</label>
          <p className="p-3 bg-gray-100 rounded-lg">{viewingCategory.description || '—'}</p>
        </div>
        <div>
          <label className="block mb-1 font-medium">Purchase Order #</label>
          <p className="p-3 bg-gray-100 rounded-lg">{viewingCategory.purchaseordernumber || '—'}</p>
        </div>
        <div>
          <label className="block mb-1 font-medium">Expected Lifespan</label>
          <p className="p-3 bg-gray-100 rounded-lg">{viewingCategory.expectedlifespan || '—'}</p>
        </div>

        {/* Row 6 */}
        <div>
          <label className="block mb-1 font-medium">Created At</label>
          <p className="p-3 bg-gray-100 rounded-lg">
            {new Date(viewingCategory.createdat).toLocaleString()}
          </p>
        </div>
        <div>
          <label className="block mb-1 font-medium">Last Updated</label>
          <p className="p-3 bg-gray-100 rounded-lg">
            {new Date(viewingCategory.lastmodifieddate).toLocaleString()}
          </p>
        </div>
        <div>
          <label className="block mb-1 font-medium">Asset ID</label>
          <p className="p-3 font-mono bg-gray-100 rounded-lg">{viewingCategory.id}</p>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 mt-8 border-t">
        <button
          onClick={() => {
            setViewingCategory(null);
            handleEditCategory(viewingCategory);
          }}
          className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700"
        >
          <Edit size={16} className="inline mr-1" />
          Edit Asset
        </button>
        <button
          onClick={() => setViewingCategory(null)}
          className="px-4 py-2 text-gray-700 border rounded-lg hover:bg-gray-100"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}

      
    </div>
  
  );
};

export default InventoryList;