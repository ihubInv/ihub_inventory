import React, { useState } from 'react';
import { useInventory } from '../../contexts/InventoryContext';
import { useAuth } from '../../contexts/AuthContext';
import DateRangePicker from '../common/DateRangePicker';
import { CategoryDistributionChart } from '../charts/ChartComponents';
import CategoryTypeDropdown from '../common/CategoryTypeDropdown';
import FilterDropdown, { categoryTypeFilters, statusFilters } from '../common/FilterDropdown';
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
  X
} from 'lucide-react';

const CategoryManagement: React.FC = () => {
  const { categories, addCategory, updateCategory, deleteCategory } = useInventory();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [viewingCategory, setViewingCategory] = useState<any>(null);

  const [newCategory, setNewCategory] = useState({
    name: '',
    type: 'tangible' as const,
    description: '',
    isactive: true
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

  

  const handleAddCategory = async (e: React.FormEvent) => {
    debugger
    e.preventDefault();
    try {
      debugger;
      await addCategory({
        ...newCategory,
        createdby: user?.id || 'unknown'
      });
      setNewCategory({
        name: '',
        type: 'tangible',
        description: '',
        isactive: true
      });
      setShowAddModal(false);
    } catch (err) {
      console.error('Failed to add category:', err);
      // Optional: show toast or error message
    }
  };
  
  const handleEditCategory = (category: any) => {
    setEditingCategory(category);
    setNewCategory({
      name: category.name,
      type: category.type,
      description: category.description || '',
      isactive: category.isactive
    });
    setShowAddModal(true);
  };

  const handleUpdateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCategory) {
      updateCategory(editingCategory.id, newCategory);
      setEditingCategory(null);
      setNewCategory({
        name: '',
        type: 'tangible',
        description: '',
        isactive: true
      });
      setShowAddModal(false);
    }
  };

  const handleDeleteCategory = (categoryId: string) => {
    if (window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      deleteCategory(categoryId);
    }
  };

  const toggleCategoryStatus = (categoryId: string, currentStatus: boolean) => {
    updateCategory(categoryId, { isactive: !currentStatus });
  };

  const getTypeIcon = (type: string) => {
    return type === 'tangible' ? Package : Zap;
  };

  const getTypeColor = (type: string) => {
    return type === 'tangible' 
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
    tangible: categories.filter(cat => cat.type === 'tangible').length,
    intangible: categories.filter(cat => cat.type === 'intangible').length,
    active: categories.filter(cat => cat.isactive).length,
    inactive: categories.filter(cat => !cat.isactive).length
  };

  // Chart data for category distribution
  const categoryChartData = {
    categories: ['Tangible', 'Intangible'],
    counts: [stats.tangible, stats.intangible],
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
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-4 py-2 space-x-2 text-white transition-all duration-200 rounded-lg shadow-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 hover:shadow-xl"
        >
          <Plus size={16} />
          <span>Add Category</span>
        </button>
      </div>

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
              <p className="text-sm font-medium text-gray-600">Tangible</p>
              <p className="text-2xl font-bold text-gray-900">{stats.tangible}</p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-teal-600">
              <Package className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Intangible</p>
              <p className="text-2xl font-bold text-gray-900">{stats.intangible}</p>
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
                              category.type === 'tangible' 
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
                          {user?.role === 'admin' && (
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
                <label className="block mb-1 text-sm font-medium text-gray-700">Category Name *</label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Computer Mouse"
                />
              </div>

              <div>
                <CategoryTypeDropdown
                  label="Category Type *"
                  value={newCategory.type}
                  onChange={(value) => setNewCategory((prev:any) => ({ ...prev, type: value as 'tangible' | 'intangible' }))}
                  placeholder="Select category type"
                  required
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
                      type: 'tangible',
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
                  viewingCategory.type === 'tangible' 
                    ? 'from-blue-500 to-cyan-600' 
                    : 'from-purple-500 to-pink-600'
                }`}>
                  {viewingCategory.type === 'tangible' ? (
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
    </div>
  );
};

export default CategoryManagement;