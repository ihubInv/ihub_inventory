import React, { useState } from 'react';
import { useInventory } from '../../contexts/InventoryContext';
import { useAuth } from '../../contexts/AuthContext';
import { Users, Plus, Edit, Trash2, Search, Filter, UserCheck, UserX } from 'lucide-react';

const UserManagement: React.FC = () => {
  const { users, addUser, updateUser, deleteUser } = useInventory();
  const { user: currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

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
                            <button className="p-1 text-blue-600 transition-colors rounded hover:text-blue-900">
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
    </div>
  );
};

export default UserManagement;