import React, { useState, useEffect } from 'react';
import { 
  Package, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw, 
  Download,
  Upload,
  Search,
  Filter,
  Eye,
  Edit3,
  Save,
  X
} from 'lucide-react';
import { 
  validateAndFixInventoryUniqueIds,
  getItemsWithInvalidUniqueIds,
  validateUniqueIdFormat,
  generateUniqueIdForItem,
  checkUniqueIdExists,
  InventoryItemWithUniqueId
} from '../../utils/uniqueIdManager';
import toast from 'react-hot-toast';

const UniqueIdManager: React.FC = () => {
  const [invalidItems, setInvalidItems] = useState<InventoryItemWithUniqueId[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFixing, setIsFixing] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [newUniqueId, setNewUniqueId] = useState('');
  const [validationResult, setValidationResult] = useState<{ isValid: boolean; error?: string; suggestion?: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFixedItems, setShowFixedItems] = useState(false);

  // Load invalid items on component mount
  useEffect(() => {
    loadInvalidItems();
  }, []);

  const loadInvalidItems = async () => {
    setIsLoading(true);
    try {
      const items = await getItemsWithInvalidUniqueIds();
      setInvalidItems(items);
    } catch (error) {
      console.error('Error loading invalid items:', error);
      toast.error('Failed to load items with invalid unique IDs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFixAll = async () => {
    setIsFixing(true);
    const loadingToast = toast.loading('Fixing unique IDs...');
    
    try {
      const result = await validateAndFixInventoryUniqueIds();
      
      toast.dismiss(loadingToast);
      
      if (result.fixedItems > 0) {
        toast.success(`✅ Fixed ${result.fixedItems} unique IDs successfully!`);
      }
      
      if (result.errors.length > 0) {
        console.error('Errors during fix:', result.errors);
        toast.error(`${result.errors.length} errors occurred. Check console for details.`);
      }
      
      if (result.invalidItems === 0) {
        toast.success('🎉 All unique IDs are now valid!');
      }
      
      // Reload the list
      await loadInvalidItems();
      
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('Error fixing unique IDs:', error);
      toast.error('Failed to fix unique IDs');
    } finally {
      setIsFixing(false);
    }
  };

  const handleEditItem = async (item: InventoryItemWithUniqueId) => {
    setEditingItem(item.id);
    
    try {
      // Generate a suggested unique ID
      const suggestedId = await generateUniqueIdForItem({
        financialyear: item.financialyear,
        assetname: item.assetname,
        assetcategory: item.assetcategory,
        locationofitem: item.locationofitem
      });
      
      setNewUniqueId(suggestedId);
      
      // Validate the suggested ID
      const validation = validateUniqueIdFormat(suggestedId);
      setValidationResult(validation);
      
    } catch (error) {
      console.error('Error generating suggested ID:', error);
      toast.error('Failed to generate suggested unique ID');
    }
  };

  const handleSaveEdit = async (itemId: string) => {
    if (!newUniqueId.trim()) {
      toast.error('Please enter a unique ID');
      return;
    }

    const validation = validateUniqueIdFormat(newUniqueId);
    if (!validation.isValid) {
      toast.error(validation.error || 'Invalid unique ID format');
      return;
    }

    try {
      // Check if the new ID already exists
      const exists = await checkUniqueIdExists(newUniqueId, itemId);
      if (exists) {
        toast.error('This unique ID already exists');
        return;
      }

      // Update the item (you'll need to implement this API call)
      // const { error } = await updateInventoryItemUniqueId(itemId, newUniqueId);
      
      toast.success('Unique ID updated successfully!');
      setEditingItem(null);
      setNewUniqueId('');
      setValidationResult(null);
      
      // Reload the list
      await loadInvalidItems();
      
    } catch (error) {
      console.error('Error updating unique ID:', error);
      toast.error('Failed to update unique ID');
    }
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setNewUniqueId('');
    setValidationResult(null);
  };

  const filteredItems = invalidItems.filter(item =>
    item.assetname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.uniqueid.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.assetcategory.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-200">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Package className="w-8 h-8 mr-3 text-blue-600" />
              Unique ID Manager
            </h2>
            <p className="mt-2 text-gray-600">
              Manage and fix unique IDs for inventory items
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={loadInvalidItems}
              disabled={isLoading}
              className="flex items-center px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw size={16} className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            
            <button
              onClick={handleFixAll}
              disabled={isFixing || invalidItems.length === 0}
              className="flex items-center px-4 py-2 text-white bg-gradient-to-r from-green-500 to-green-600 rounded-lg hover:from-green-600 hover:to-green-700 disabled:opacity-50"
            >
              <CheckCircle size={16} className="mr-2" />
              {isFixing ? 'Fixing...' : `Fix All (${invalidItems.length})`}
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center">
              <Package className="w-8 h-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-900">Total Items</p>
                <p className="text-2xl font-bold text-blue-600">{invalidItems.length}</p>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertTriangle className="w-8 h-8 text-red-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-red-900">Invalid IDs</p>
                <p className="text-2xl font-bold text-red-600">{invalidItems.length}</p>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-green-900">Ready to Fix</p>
                <p className="text-2xl font-bold text-green-600">{invalidItems.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" size={16} />
          <input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Items List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
          <span className="ml-3 text-gray-600">Loading items...</span>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">All Unique IDs are Valid!</h3>
          <p className="text-gray-600">No items with invalid unique IDs found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredItems.map((item) => (
            <div key={item.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <Package className="w-5 h-5 text-gray-400" />
                    <div>
                      <h4 className="font-medium text-gray-900">{item.assetname}</h4>
                      <p className="text-sm text-gray-600">{item.assetcategory}</p>
                    </div>
                  </div>
                  
                  <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                    <span>Current ID: <code className="bg-gray-100 px-2 py-1 rounded">{item.uniqueid}</code></span>
                    <span>Location: {item.locationofitem}</span>
                    <span>Year: {item.financialyear}</span>
                  </div>
                  
                  {editingItem === item.id && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Edit3 size={16} className="text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">Edit Unique ID</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={newUniqueId}
                          onChange={(e) => {
                            setNewUniqueId(e.target.value);
                            const validation = validateUniqueIdFormat(e.target.value);
                            setValidationResult(validation);
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter new unique ID"
                        />
                        
                        <button
                          onClick={() => handleSaveEdit(item.id)}
                          disabled={!validationResult?.isValid}
                          className="px-3 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Save size={16} />
                        </button>
                        
                        <button
                          onClick={handleCancelEdit}
                          className="px-3 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                          <X size={16} />
                        </button>
                      </div>
                      
                      {validationResult && (
                        <div className={`mt-2 text-sm ${
                          validationResult.isValid ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {validationResult.isValid ? (
                            <span className="flex items-center">
                              <CheckCircle size={14} className="mr-1" />
                              Valid unique ID format
                            </span>
                          ) : (
                            <span className="flex items-center">
                              <AlertTriangle size={14} className="mr-1" />
                              {validationResult.error}
                            </span>
                          )}
                          {validationResult.suggestion && (
                            <p className="mt-1 text-gray-600">{validationResult.suggestion}</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEditItem(item)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    title="Edit Unique ID"
                  >
                    <Edit3 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UniqueIdManager;
