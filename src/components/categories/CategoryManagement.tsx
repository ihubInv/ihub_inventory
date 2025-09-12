import React, { useState } from 'react';
import { useInventory } from '../../contexts/InventoryContext';
import { useAuth } from '../../contexts/AuthContext';
import DateRangePicker from '../common/DateRangePicker';
import { CategoryDistributionChart } from '../charts/ChartComponents';
import CategoryTypeDropdown from '../common/CategoryTypeDropdown';
import FilterDropdown, { categoryTypeFilters, statusFilters } from '../common/FilterDropdown';
import AssetSelectionDropdown from '../common/AssetSelectionDropdown';
import { 
  FolderPlus, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  Calendar,
  Package,
  Zap,
  Eye,
  Save,
  X,
  Layers,
  Box
} from 'lucide-react';
import { CRUDToasts } from '../../services/toastService';
import toast from 'react-hot-toast';

const CategoryManagement: React.FC = () => {
  const { categories, addCategory, updateCategory, deleteCategory, assets, addAsset, updateAsset, deleteAsset } = useInventory();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState<'categories' | 'assets'>('categories');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddAssetModal, setShowAddAssetModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [editingAsset, setEditingAsset] = useState<any>(null);
  const [viewingCategory, setViewingCategory] = useState<any>(null);
  const [viewingAsset, setViewingAsset] = useState<any>(null);

  const [newCategory, setNewCategory] = useState({
    name: '',
    assetname: '',
    type: 'major' as const,
    description: '',
    isactive: true
  });

  const [newAsset, setNewAsset] = useState({
    name: '',
    description: ''
  });


  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         category.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || category.type === filterType;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && category.isactive) ||
                         (filterStatus === 'inactive' && !category.isactive);
    
    let matchesDate = true;
    if (startDate && endDate) {
      const categoryDate = new Date(category.createdat);
      matchesDate = categoryDate >= startDate && categoryDate <= endDate;
    }
    
    return matchesSearch && matchesType && matchesStatus && matchesDate;
  });

  

  const handleAddAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newAsset.name.trim()) {
      const loadingToast = CRUDToasts.creating('asset');
      try {
        await addAsset({
          name: newAsset.name.trim(),
          description: newAsset.description.trim(),
          isactive: true,
          createdby: user?.id || 'unknown'
        });
        toast.dismiss(loadingToast);
        setNewAsset({
          name: '',
          description: ''
        });
        setShowAddAssetModal(false);
        CRUDToasts.created('asset');
      } catch (err) {
        console.error('Failed to add asset:', err);
        toast.dismiss(loadingToast);
        CRUDToasts.createError('asset', 'Please try again');
      }
    }
  };

  const handleEditAsset = (asset: any) => {
    setEditingAsset(asset);
    setNewAsset({
      name: asset.name,
      description: asset.description || ''
    });
    setShowAddAssetModal(true);
  };

  const handleUpdateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAsset && newAsset.name.trim()) {
      const loadingToast = CRUDToasts.updating('asset');
      try {
        await updateAsset(editingAsset.id, {
          name: newAsset.name.trim(),
          description: newAsset.description.trim()
        });
        toast.dismiss(loadingToast);
        setEditingAsset(null);
        setNewAsset({
          name: '',
          description: ''
        });
        setShowAddAssetModal(false);
        CRUDToasts.updated('asset');
      } catch (err) {
        console.error('Failed to update asset:', err);
        toast.dismiss(loadingToast);
        CRUDToasts.updateError('asset', 'Please try again');
      }
    }
  };

  const handleDeleteAsset = async (assetId: string) => {
    const loadingToast = CRUDToasts.deleting('asset');
    try {
      await deleteAsset(assetId);
      toast.dismiss(loadingToast);
      CRUDToasts.deleted('asset');
    } catch (err) {
      console.error('Failed to delete asset:', err);
      toast.dismiss(loadingToast);
      CRUDToasts.deleteError('asset', 'Please try again');
    }
  };

  const handleViewAsset = (asset: any) => {
    setViewingAsset(asset);
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    debugger
    e.preventDefault();
    const loadingToast = CRUDToasts.creating('category');
    try {
      await addCategory({
        ...newCategory,
        createdby: user?.id || 'unknown'
      });
      toast.dismiss(loadingToast);
      setNewCategory({
        name: '',
        assetname: '',
        type: 'major',
        description: '',
        isactive: true
      });
      setShowAddModal(false);
      CRUDToasts.created('category');
    } catch (err) {
      console.error('Failed to add category:', err);
      toast.dismiss(loadingToast);
      CRUDToasts.createError('category', 'Please try again');
    }
  };
  
  const handleEditCategory = (category: any) => {
    setEditingCategory(category);
    setNewCategory({
      name: category.name,
      assetname: category.assetname || '',
      type: category.type,
      description: category.description || '',
      isactive: category.isactive
    });
    setShowAddModal(true);
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCategory) {
      const loadingToast = CRUDToasts.updating('category');
      try {
        await updateCategory(editingCategory.id, newCategory);
        toast.dismiss(loadingToast);
        setEditingCategory(null);
        setNewCategory({
          name: '',
          assetname: '',
          type: 'major',
          description: '',
          isactive: true
        });
        setShowAddModal(false);
        CRUDToasts.updated('category');
      } catch (err) {
        console.error('Failed to update category:', err);
        toast.dismiss(loadingToast);
        CRUDToasts.updateError('category', 'Please try again');
      }
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    // if (window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      const loadingToast = CRUDToasts.deleting('category');
      try {
        await deleteCategory(categoryId);
        toast.dismiss(loadingToast);
        CRUDToasts.deleted('category');
      } catch (err) {
        console.error('Failed to delete category:', err);
        toast.dismiss(loadingToast);
        CRUDToasts.deleteError('category', 'Please try again');
      }
    // }
  };

  const toggleCategoryStatus = (categoryId: string, currentStatus: boolean) => {
    updateCategory(categoryId, { isactive: !currentStatus });
  };

  const getTypeIcon = (type: string) => {
    return type === 'major' ? Package : Zap;
  };

  const getTypeColor = (type: string) => {
    return type === 'major' 
      ? 'bg-blue-100 text-blue-800' 
      : 'bg-purple-100 text-purple-800';
  };

  const getStatusColor = (isactive: boolean) => {
    return isactive 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  const stats = {
    total: categories.length,
    major: categories.filter(cat => cat.type === 'major').length,
    minor: categories.filter(cat => cat.type === 'minor').length,
    active: categories.filter(cat => cat.isactive).length,
    inactive: categories.filter(cat => !cat.isactive).length
  };

  // Chart data for category distribution
  const categoryChartData = {
    categories: ['Major', 'Minor'],
    counts: [stats.major, stats.minor],
  };
console.log("viewingCategory",viewingCategory)
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Category Management</h1>
          <p className="mt-1 text-gray-600">Manage inventory categories and their classifications</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('categories')}
            className={`flex items-center px-6 py-4 space-x-2 font-medium transition-all duration-200 border-b-2 ${
              activeTab === 'categories'
                ? 'text-blue-600 border-blue-600 bg-blue-50'
                : 'text-gray-600 border-transparent hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Layers size={20} />
            <span>Categories ({categories.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('assets')}
            className={`flex items-center px-6 py-4 space-x-2 font-medium transition-all duration-200 border-b-2 ${
              activeTab === 'assets'
                ? 'text-green-600 border-green-600 bg-green-50'
                : 'text-gray-600 border-transparent hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Box size={20} />
            <span>Assets ({assets.length})</span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'categories' && (
        <>
          {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">
        <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Categories</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600">
              <FolderPlus className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Major</p>
              <p className="text-2xl font-bold text-gray-900">{stats.major}</p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-teal-600">
              <Package className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Minor</p>
              <p className="text-2xl font-bold text-gray-900">{stats.minor}</p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600">
              <Zap className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600">
              <FolderPlus className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Inactive</p>
              <p className="text-2xl font-bold text-gray-900">{stats.inactive}</p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-r from-red-500 to-pink-600">
              <FolderPlus className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Category Distribution Chart */}
      <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">Category Type Distribution</h3>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-400 to-purple-500"></div>
            <span className="text-sm text-gray-600">Current data</span>
          </div>
        </div>
        <div className="h-64">
          <CategoryDistributionChart data={categoryChartData} />
        </div>
      </div>

      {/* Category Management Header */}
      <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Category Management</h3>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center px-4 py-2 space-x-2 text-white transition-all duration-200 rounded-lg shadow-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 hover:shadow-xl"
          >
            <Plus size={16} />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="relative">
            <Search className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" size={16} />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <FilterDropdown
            value={filterType}
            onChange={setFilterType}
            options={categoryTypeFilters}
            placeholder="Filter by type"
            size="sm"
          />

          <FilterDropdown
            value={filterStatus}
            onChange={setFilterStatus}
            options={statusFilters}
            placeholder="Filter by status"
            size="sm"
          />


          <div className="sm:col-span-2">
            <DateRangePicker
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
              startPlaceholder="Start Date"
              endPlaceholder="End Date"
            />
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-2">
            <Filter size={16} className="text-gray-400" />
            <span className="text-sm text-gray-600">{filteredCategories.length} categories found</span>
          </div>
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterType('all');
              setFilterStatus('all');
              setStartDate(null);
              setEndDate(null);
            }}
            className="text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Categories Table */}
      <div className="overflow-hidden bg-white border border-gray-100 shadow-sm rounded-2xl">
        {filteredCategories.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Created</th>
                  <th className="px-6 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Updated</th>
                  <th className="px-6 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                
                {filteredCategories?.map((category) => {
                  const TypeIcon = getTypeIcon(category.type);
                  
                  return (
                    <tr key={category.id} className="transition-colors hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 w-10 h-10">
                            <div className={`h-10 w-10 rounded-lg bg-gradient-to-r ${
                              category.type === 'major' 
                                ? 'from-blue-500 to-cyan-600' 
                                : 'from-purple-500 to-pink-600'
                            } flex items-center justify-center`}>
                              <TypeIcon className="w-5 h-5 text-white" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{category.name}</div>
                            <div className="max-w-xs text-sm text-gray-500 truncate">
                              {category.description || 'No description'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(category?.type)}`}>
                          {category?.type?.charAt(0)?.toUpperCase() + category?.type?.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(category?.isactive)}`}>
                          {category?.isactive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                        {new Date(category.createdat).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                        {new Date(category.updatedat).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setViewingCategory(category)}
                            className="p-1 text-blue-600 transition-colors rounded hover:text-blue-900"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleEditCategory(category)}
                            className="p-1 text-green-600 transition-colors rounded hover:text-green-900"
                            title="Edit Category"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => toggleCategoryStatus(category.id, category.isactive)}
                            className={`p-1 rounded transition-colors ${
                              category.isactive 
                                ? 'text-orange-600 hover:text-orange-900' 
                                : 'text-green-600 hover:text-green-900'
                            }`}
                            title={category.isactive ? 'Deactivate' : 'Activate'}
                          >
                            {category.isactive ? '⏸' : '▶'}
                          </button>
                          {(user?.role === 'admin' || user?.role === 'stock-manager') && (
                            <button
                              onClick={() => handleDeleteCategory(category.id)}
                              className="p-1 text-red-600 transition-colors rounded hover:text-red-900"
                              title="Delete Category"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center">
            <FolderPlus className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="mb-2 text-lg font-medium text-gray-900">No categories found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>

      {/* Add/Edit Category Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="w-full max-w-lg p-6 bg-white rounded-2xl">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </h3>
            
            <form onSubmit={editingCategory ? handleUpdateCategory : handleAddCategory} className="space-y-4">
            <div>
                <CategoryTypeDropdown
                  label="Asset Type *"
                  value={newCategory.type}
                  onChange={(value) => setNewCategory((prev:any) => ({ ...prev, type: value as 'major' | 'minor' }))}
                  placeholder="Select asset type"
                  required
                  size="sm"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Category Name *</label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Electronics, Furniture, Office Supplies"
                />
              </div>

              <div>
                <AssetSelectionDropdown
                  assets={assets}
                  value={newCategory.assetname}
                  onChange={(value) => setNewCategory(prev => ({ ...prev, assetname: value }))}
                  label="Asset Name"
                  placeholder="Select an asset"
                  required
                  searchable
                  size="sm"
                />
              </div>
              
         

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={newCategory.description}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Brief description of this category..."
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isactive"
                  checked={newCategory.isactive}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, isactive: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="isactive" className="block ml-2 text-sm text-gray-900">
                  Active Category
                </label>
              </div>

              <div className="flex items-center justify-end pt-4 space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingCategory(null);
                    setNewCategory({
                      name: '',
                      assetname: '',
                      type: 'major',
                      description: '',
                      isactive: true
                    });
                  }}
                  className="flex items-center px-4 py-2 space-x-2 text-gray-700 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <X size={16} />
                  <span>Cancel</span>
                </button>
                <button
                  type="submit"
                  className="flex items-center px-4 py-2 space-x-2 text-white transition-all duration-200 rounded-lg shadow-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 hover:shadow-xl"
                >
                  <Save size={16} />
                  <span>{editingCategory ? 'Update' : 'Add'} Category</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Category Modal */}
      {viewingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="w-full max-w-lg p-6 bg-white rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Category Details</h3>
              <button
                onClick={() => setViewingCategory(null)}
                className="text-gray-400 transition-colors hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-xl bg-gradient-to-r ${
                  viewingCategory.type === 'major' 
                    ? 'from-blue-500 to-cyan-600' 
                    : 'from-purple-500 to-pink-600'
                }`}>
                  {viewingCategory.type === 'major' ? (
                    <Package className="w-6 h-6 text-white" />
                  ) : (
                    <Zap className="w-6 h-6 text-white" />
                  )}
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-gray-900">{viewingCategory.name}</h4>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(viewingCategory?.type)}`}>
                    {viewingCategory?.type?.charAt(0)?.toUpperCase() + viewingCategory?.type?.slice(1)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Asset Name</label>
                <p className="p-3 text-gray-900 rounded-lg bg-gray-50">
                  {viewingCategory.assetname || 'No asset name provided'}
                </p>
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Description</label>
                <p className="p-3 text-gray-900 rounded-lg bg-gray-50">
                  {viewingCategory.description || 'No description provided'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Status</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(viewingCategory.isactive)}`}>
                    {viewingCategory.isactive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Category ID</label>
                  <p className="font-mono text-sm text-gray-600">{viewingCategory.id}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Created</label>
                  <p className="text-sm text-gray-900">{new Date(viewingCategory.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Last Updated</label>
                  <p className="text-sm text-gray-900">{new Date(viewingCategory.updatedAt).toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end pt-6 mt-6 space-x-3 border-t border-gray-200">
              <button
                onClick={() => {
                  setViewingCategory(null);
                  handleEditCategory(viewingCategory);
                }}
                className="flex items-center px-4 py-2 space-x-2 text-white transition-all duration-200 rounded-lg bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700"
              >
                <Edit size={16} />
                <span>Edit Category</span>
              </button>
              <button
                onClick={() => setViewingCategory(null)}
                className="px-4 py-2 text-gray-700 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
        </>
      )}

      {/* Assets Tab Content */}
      {activeTab === 'assets' && (
        <>
          {/* Asset Stats Cards */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
            <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Assets</p>
                  <p className="text-2xl font-bold text-gray-900">{assets.length}</p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-teal-600">
                  <Box className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Assets</p>
                  <p className="text-2xl font-bold text-gray-900">{assets.filter(asset => asset.isactive).length}</p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600">
                  <Box className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">With Description</p>
                  <p className="text-2xl font-bold text-gray-900">{assets.filter(asset => asset.description).length}</p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600">
                  <Box className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Added Today</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {assets.filter(asset => 
                      new Date(asset.createdat).toDateString() === new Date().toDateString()
                    ).length}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600">
                  <Box className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Asset Distribution Chart */}
          <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Asset Distribution</h3>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-400 to-teal-500"></div>
                <span className="text-sm text-gray-600">Current data</span>
              </div>
            </div>
            <div className="h-64">
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="grid grid-cols-2 gap-8 mb-6">
                    <div className="text-center">
                      <div className="w-20 h-20 mx-auto mb-2 rounded-full bg-gradient-to-r from-green-500 to-teal-600 flex items-center justify-center">
                        <Box className="w-8 h-8 text-white" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{assets.length}</p>
                      <p className="text-sm text-gray-600">Total Assets</p>
                    </div>
                    <div className="text-center">
                      <div className="w-20 h-20 mx-auto mb-2 rounded-full bg-gradient-to-r from-emerald-500 to-green-600 flex items-center justify-center">
                        <Box className="w-8 h-8 text-white" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{assets.filter(asset => asset.isactive).length}</p>
                      <p className="text-sm text-gray-600">Active Assets</p>
                    </div>
                  </div>
                  <div className="text-gray-500">
                    <p>Asset distribution visualization</p>
                    <p className="text-sm">Charts will appear here as more data is added</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Asset Management Header */}
          <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Asset Management</h3>
              <button
                onClick={() => setShowAddAssetModal(true)}
                className="flex items-center px-4 py-2 space-x-2 text-white transition-all duration-200 rounded-lg shadow-lg bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 hover:shadow-xl"
              >
                <Plus size={16} />
                <span>Add Asset</span>
              </button>
            </div>
          </div>

          {/* Assets Table */}
          <div className="overflow-hidden bg-white border border-gray-100 shadow-sm rounded-2xl">
            {assets.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-gray-200 bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Asset</th>
                      <th className="px-6 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Description</th>
                      <th className="px-6 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Added Date</th>
                      <th className="px-6 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {assets.map((asset) => (
                      <tr key={asset.id} className="transition-colors hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 w-10 h-10">
                              <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-green-500 to-teal-600 flex items-center justify-center">
                                <Box className="w-5 h-5 text-white" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{asset.name}</div>
                              <div className="text-sm text-gray-500">ID: {asset.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate">
                            {asset.description || 'No description'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            asset.isactive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {asset.isactive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                          {new Date(asset.createdat).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleViewAsset(asset)}
                              className="p-1 text-blue-600 transition-colors rounded hover:text-blue-900"
                              title="View Details"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => handleEditAsset(asset)}
                              className="p-1 text-green-600 transition-colors rounded hover:text-green-900"
                              title="Edit Asset"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteAsset(asset.id)}
                              className="p-1 text-red-600 transition-colors rounded hover:text-red-900"
                              title="Delete Asset"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center">
                <Box className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="mb-2 text-lg font-medium text-gray-900">No assets found</h3>
                <p className="text-gray-600 mb-4">Get started by adding your first asset</p>
                <button
                  onClick={() => setShowAddAssetModal(true)}
                  className="inline-flex items-center px-4 py-2 space-x-2 text-white transition-all duration-200 rounded-lg shadow-lg bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 hover:shadow-xl"
                >
                  <Plus size={16} />
                  <span>Add Asset</span>
                </button>
              </div>
            )}
          </div>

          {/* View Asset Modal */}
          {viewingAsset && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
              <div className="w-full max-w-lg p-6 bg-white rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Asset Details</h3>
                  <button
                    onClick={() => setViewingAsset(null)}
                    className="text-gray-400 transition-colors hover:text-gray-600"
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-teal-600">
                      <Box className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold text-gray-900">{viewingAsset.name}</h4>
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">Description</label>
                    <p className="p-3 text-gray-900 rounded-lg bg-gray-50">
                      {viewingAsset.description || 'No description provided'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">Asset ID</label>
                      <p className="font-mono text-sm text-gray-600">{viewingAsset.id}</p>
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">Status</label>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        viewingAsset.isactive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {viewingAsset.isactive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">Added Date</label>
                    <p className="text-sm text-gray-900">{new Date(viewingAsset.createdat).toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex items-center justify-end pt-6 mt-6 space-x-3 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setViewingAsset(null);
                      handleEditAsset(viewingAsset);
                    }}
                    className="flex items-center px-4 py-2 space-x-2 text-white transition-all duration-200 rounded-lg bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700"
                  >
                    <Edit size={16} />
                    <span>Edit Asset</span>
                  </button>
                  <button
                    onClick={() => setViewingAsset(null)}
                    className="px-4 py-2 text-gray-700 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Add Asset Modal */}
      {showAddAssetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 bg-white rounded-2xl">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              {editingAsset ? 'Edit Asset' : 'Add New Asset'}
            </h3>
            
            <form onSubmit={editingAsset ? handleUpdateAsset : handleAddAsset} className="space-y-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Asset Name *</label>
                <input
                  type="text"
                  value={newAsset.name}
                  onChange={(e) => setNewAsset(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., Dell Laptop, Office Chair, HP Printer"
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Description (Optional)</label>
                <textarea
                  value={newAsset.description}
                  onChange={(e) => setNewAsset(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Brief description of this asset..."
                />
              </div>

              <div className="flex items-center justify-end pt-4 space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddAssetModal(false);
                    setEditingAsset(null);
                    setNewAsset({
                      name: '',
                      description: ''
                    });
                  }}
                  className="flex items-center px-4 py-2 space-x-2 text-gray-700 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <X size={16} />
                  <span>Cancel</span>
                </button>
                <button
                  type="submit"
                  className="flex items-center px-4 py-2 space-x-2 text-white transition-all duration-200 rounded-lg shadow-lg bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 hover:shadow-xl"
                >
                  <Save size={16} />
                  <span>{editingAsset ? 'Update' : 'Add'} Asset</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManagement;