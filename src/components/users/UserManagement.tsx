import React, { useState } from 'react';
import { useInventory } from '../../contexts/InventoryContext';
import { useAuth } from '../../contexts/AuthContext';
import { Users, Plus, Edit, Trash2, Search, Filter, UserCheck, UserX, X, Save } from 'lucide-react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { validateEmail } from '../../utils/validation';
import { supabase } from '../../lib/supabaseClient';




interface FormData {
  name: string;
  email: string;
  password: string;
  role: string;
  department:string
}
const UserManagement: React.FC = () => {
  const { users, addUser, updateUser, deleteUser } = useInventory();
  const { user: currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewingCategory, setViewingCategory] = useState<any>(null);
    const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
const [updateModel, setUpdateModel] = useState(false);

  
  
const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        password: '',
        role: 'employee',
        department:""
       
      });
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const roleOptions = [
  { value: 'employee', label: 'Employee '},
  { value: 'stock-manager', label: 'Stock Manager ' },
  { value: 'admin', label: 'Administrator' }
];


  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.department?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && user.isactive) ||
                         (filterStatus === 'inactive' && !user.isactive);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'stock-manager':
        return 'bg-blue-100 text-blue-800';
      case 'employee':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (isactive: boolean) => {
    return isactive 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  const handleToggleStatus = (userId: string, currentStatus: boolean) => {
    updateUser(userId, { isactive: !currentStatus });
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteUser(userId);
    }
  };

  const stats = {
    total: users.length,
    active: users.filter(u => u.isactive).length,
    inactive: users.filter(u => !u.isactive).length,
    admins: users.filter(u => u.role === 'admin').length,
    stockManagers: users.filter(u => u.role === 'stock-manager').length,
    employees: users.filter(u => u.role === 'employee').length
  };



  

    const validateForm = (): string[] => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors);
  };
  
  


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    const allowedDomain = "@ihubiitmandi.in";
    if (!formData.email.endsWith(allowedDomain)) {
      toast.error(`Only emails ending with ${allowedDomain} are allowed to register.`, {
        autoClose: 5000,
        position: 'top-right'
      });
      return;
    }
  
    if (!validateForm()) return;
    setIsLoading(true);
  
    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            role: formData.role
          }
        }
      });
  
      if (error) throw error;
  
      const userId = data.user?.id;
      const { error: insertError } = await supabase.from('users').insert({
        id: userId,
        email: formData.email,
        name: formData.name,
        role: formData.role,
        department: formData.department || null,
        isactive: true,
        createdat: new Date().toISOString(),
        lastlogin: new Date().toISOString()
      });
  
      if (insertError) throw insertError;
  
      toast.success('Registration successful!.', {
        autoClose: 5000,
        position: 'top-right',
      });
  
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(`Registration failed: ${error.message || 'An unexpected error occurred'}`, {
        autoClose: 5000,
        position: 'top-right'
      });
    } finally {
      setIsLoading(false);
    }
  };
  

  





const handleUpdateUser = async (userId: string, updatedData: Partial<{
  name: string;
  role: string;
  department: string;
  isactive: boolean;
}>) => {
  debugger
  try {
    console.log('Updating user:', userId, updatedData);
    const { error } = await supabase
      .from('users')
      .update({
        ...updatedData,
        lastlogin: new Date().toISOString() // auto-update login time
      })
      .eq('id', userId);

    if (error) throw error;

    toast.success('User details updated successfully!', {
      autoClose: 4000,
      position: 'top-right',
    });
  } catch (error: any) {
    console.error('Update error:', error);
    toast.error(`Update failed: ${error.message || 'Something went wrong.'}`, {
      autoClose: 5000,
      position: 'top-right',
    });
  }
};



const handleUserUpdate = (user:any) => {
  // Load selected user data into formData for editing
  setFormData({
    name: user.name || '',
    email: user.email || '',
    password: '', // Do not prefill password for security
    role: user.role || 'employee',
    department: user.department || ''
  });
  setEditingCategory(user);
  setUpdateModel(true);
}









  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="mt-1 text-gray-600">Manage system users and their permissions</p>
        </div>
        {currentUser?.role === 'admin' && (
          <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-4 py-2 space-x-2 text-white transition-all duration-200 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
            <Plus size={16} />
            <span>Add User</span>
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6 sm:gap-6">
        <div className="p-4 bg-white border border-gray-100 shadow-sm rounded-2xl sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600 sm:text-sm">Total Users</p>
              <p className="text-xl font-bold text-gray-900 sm:text-2xl">{stats.total}</p>
            </div>
            <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600">
              <Users className="w-4 h-4 text-white sm:h-6 sm:w-6" />
            </div>
          </div>
        </div>

        <div className="p-4 bg-white border border-gray-100 shadow-sm rounded-2xl sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600 sm:text-sm">Active</p>
              <p className="text-xl font-bold text-gray-900 sm:text-2xl">{stats.active}</p>
            </div>
            <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-r from-green-500 to-teal-600">
              <UserCheck className="w-4 h-4 text-white sm:h-6 sm:w-6" />
            </div>
          </div>
        </div>

        <div className="p-4 bg-white border border-gray-100 shadow-sm rounded-2xl sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600 sm:text-sm">Inactive</p>
              <p className="text-xl font-bold text-gray-900 sm:text-2xl">{stats.inactive}</p>
            </div>
            <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-r from-red-500 to-pink-600">
              <UserX className="w-4 h-4 text-white sm:h-6 sm:w-6" />
            </div>
          </div>
        </div>

        <div className="p-4 bg-white border border-gray-100 shadow-sm rounded-2xl sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600 sm:text-sm">Admins</p>
              <p className="text-xl font-bold text-gray-900 sm:text-2xl">{stats.admins}</p>
            </div>
            <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-r from-red-500 to-pink-600">
              <Users className="w-4 h-4 text-white sm:h-6 sm:w-6" />
            </div>
          </div>
        </div>

        <div className="p-4 bg-white border border-gray-100 shadow-sm rounded-2xl sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600 sm:text-sm">Managers</p>
              <p className="text-xl font-bold text-gray-900 sm:text-2xl">{stats.stockManagers}</p>
            </div>
            <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600">
              <Users className="w-4 h-4 text-white sm:h-6 sm:w-6" />
            </div>
          </div>
        </div>

        <div className="p-4 bg-white border border-gray-100 shadow-sm rounded-2xl sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600 sm:text-sm">Employees</p>
              <p className="text-xl font-bold text-gray-900 sm:text-2xl">{stats.employees}</p>
            </div>
            <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-r from-green-500 to-teal-600">
              <Users className="w-4 h-4 text-white sm:h-6 sm:w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 bg-white border border-gray-100 shadow-sm rounded-2xl sm:p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <Search className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" size={16} />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="stock-manager">Stock Manager</option>
            <option value="employee">Employee</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <div className="flex items-center space-x-2">
            <Filter size={16} className="text-gray-400" />
            <span className="text-sm text-gray-600">{filteredUsers.length} users</span>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-hidden bg-white border border-gray-100 shadow-sm rounded-2xl">
        {filteredUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-4 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase sm:px-6">User</th>
                  <th className="px-4 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase sm:px-6">Role</th>
                  <th className="px-4 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase sm:px-6">Department</th>
                  <th className="px-4 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase sm:px-6">Status</th>
                  <th className="px-4 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase sm:px-6">Last Login</th>
                  <th className="px-4 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase sm:px-6">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="transition-colors hover:bg-gray-50">
                    <td className="px-4 py-4 sm:px-6 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-8 h-8 sm:h-10 sm:w-10">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full sm:h-10 sm:w-10 bg-gradient-to-r from-blue-500 to-purple-600">
                            <span className="text-xs font-medium text-white sm:text-sm">
                              {user.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                        </div>
                        <div className="ml-3 sm:ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-xs text-gray-500 sm:text-sm">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 sm:px-6 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                        {user.role.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900 sm:px-6 whitespace-nowrap">
                      {user.department || 'N/A'}
                    </td>
                    <td className="px-4 py-4 sm:px-6 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.isactive)}`}>
                        {user.isactive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900 sm:px-6 whitespace-nowrap">
                      {user.lastlogin ? new Date(user.lastlogin).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-4 py-4 text-sm font-medium sm:px-6 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleToggleStatus(user.id, user.isactive)}
                          className={`p-1 rounded transition-colors ${
                            user.isactive 
                              ? 'text-orange-600 hover:text-orange-900' 
                              : 'text-green-600 hover:text-green-900'
                          }`}
                          title={user.isactive ? 'Deactivate' : 'Activate'}
                        >
                          {user.isactive ? <UserX size={16} /> : <UserCheck size={16} />}
                        </button>
                        {currentUser?.role === 'admin' && (
                          <>
                            <button 
                          
                            onClick={() => {
                      
                              handleUserUpdate(user);
                              
                            }}
                            className="p-1 text-blue-600 transition-colors rounded hover:text-blue-900">
                              <Edit size={16} />
                            </button>
                            {user.id !== currentUser.id && (
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                className="p-1 text-red-600 transition-colors rounded hover:text-red-900"
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
            <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="mb-2 text-lg font-medium text-gray-900">No users found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>


{showAddModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black bg-opacity-50">
    <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8 bg-white rounded-2xl shadow-xl">
      <h3 className="mb-6 text-2xl font-semibold text-gray-900">
        Add New Employes 
      </h3>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* Row 1 - Column 1 */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, assetname: e.target.value }))}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            placeholder="e.g., Rohit Kumar"
          />
        </div>

        {/* Row 1 - Column 2 */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            placeholder="rohit@ihubiitmandi.in"
          />
        </div>

        {/* Row 2 - Column 1 */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            placeholder="password"
          />
        </div>

        {/* Row 2 - Column 2 */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Department</label>
          <input
            type="text"
            value={formData.department}
            onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            placeholder="e.g.,IT Department"
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end pt-4 space-x-3 md:col-span-2">
          <button
            type="button"
            onClick={() => {
              setShowAddModal(false);
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
         Add User
          </button>
        </div>
      </form>
    </div>
  </div>
)}



{updateModel && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black bg-opacity-50">
    <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8 bg-white rounded-2xl shadow-xl">
      <h3 className="mb-6 text-2xl font-semibold text-gray-900">
  Update User Details
      </h3>
<form
  onSubmit={(e) => {
    e.preventDefault();
    // Call update logic with the selected user id and updated formData
    if (editingCategory && editingCategory.id) {
      handleUpdateUser(editingCategory.id, {
        name: formData.name,
        email: formData.email,
        password: formData.password, // Password should be handled securely
        role: formData.role,
        department: formData.department
      });
      setUpdateModel(false);
    }
  }}
  className="grid grid-cols-1 md:grid-cols-2 gap-6"
>
  {/* Row 1 - Column 1 */}
  <div>
    <label className="block mb-1 text-sm font-medium text-gray-700">Name</label>
    <input
      type="text"
      value={formData.name}
      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
      required
      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
      placeholder="e.g., Rohit Kumar"
    />
  </div>

  {/* Row 1 - Column 2 */}
  <div>
    <label className="block mb-1 text-sm font-medium text-gray-700">Email</label>
    <input
      type="email"
      value={formData.email}
      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
      placeholder="rohit@ihubiitmandi.in"
    />
  </div>

  {/* Row 2 - Column 1 */}
  {/* <div>
    <label className="block mb-1 text-sm font-medium text-gray-700">Password</label>
    <input
      type="password"
      value={formData.password}
      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
      placeholder="password"
    />
  </div> */}

  {/* Row 2 - Column 2 */}
  <div>
    <label className="block mb-1 text-sm font-medium text-gray-700">Department</label>
    <input
      type="text"
      value={formData.department}
      onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
      placeholder="e.g., IT Department"
    />
  </div>

  {/* Buttons */}
  <div className="flex justify-end pt-4 space-x-3 md:col-span-2">
    <button
      type="button"
      onClick={() => setUpdateModel(false)}
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
      Update User
    </button>
  </div>
</form>

    </div>
  </div>
)}



    </div>
  );
};

export default UserManagement;