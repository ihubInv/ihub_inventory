import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { User, Save, Camera, Mail, Phone, MapPin, Calendar, Shield } from 'lucide-react';

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    department: user?.department || '',
    phone: '',
    address: '',
    bio: ''
  });


  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    if (user) {
      updateUser({
        name: formData.name,
        department: formData.department
      });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      department: user?.department || '',
      phone: '',
      address: '',
      bio: ''
    });
    setIsEditing(false);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'from-red-500 to-pink-600';
      case 'stock-manager':
        return 'from-blue-500 to-purple-600';
      case 'employee':
        return 'from-green-500 to-teal-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getRoleBadgeColor = (role: string) => {
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

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <User className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">No user data available</p>
        </div>
      </div>
    );
  }

  console.log(">>>>???",user)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="mt-1 text-gray-600">Manage your account settings and personal information</p>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center px-4 py-2 space-x-2 text-white transition-all duration-200 rounded-lg bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700"
          >
            <Save size={16} />
            <span>Edit Profile</span>
          </button>
        ) : (
          <div className="flex items-center space-x-3">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-gray-700 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center px-4 py-2 space-x-2 text-white transition-all duration-200 rounded-lg bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700"
            >
              <Save size={16} />
              <span>Save Changes</span>
            </button>
          </div>
        )}
      </div>

     
      <div className="p-6 space-y-8">
        {/* Profile Card */}
        <div className="lg:row-span-1">
        <div className="p-8 text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 rounded-2xl">
        <h1 className="mb-2 text-3xl font-bold">
          {getGreeting()}, {user?.name}!
        </h1>
        <p className="text-lg text-blue-100">
          Welcome to your Profile
        </p>
      </div>
        </div>

        {/* Profile Details */}
        <div className="lg:col-span-2">
          <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
            <h3 className="mb-6 text-lg font-semibold text-gray-900">Personal Information</h3>
            
            <div className="space-y-6">
         {/* Name and Phone in one row */}
  <div className="flex flex-col space-y-6 md:flex-row md:space-x-6 md:space-y-0">
    
    {/* Full Name */}
    <div className="w-full md:w-1/2">
      <label className="block mb-2 text-sm font-medium text-gray-700">
        <User size={16} className="inline mr-2" />
        Full Name
      </label>
      {isEditing ? (
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      ) : (
        <p className="px-4 py-2 text-gray-900 bg-gray-100 rounded-lg ">{user.name}</p>
      )}
    </div>

    {/* Phone Number */}
    <div className="w-full md:w-1/2">
      <label className="block mb-2 text-sm font-medium text-gray-700">
        <Phone size={16} className="inline mr-2" />
        Phone Number
      </label>
      {isEditing ? (
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleInputChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter your phone number"
        />
      ) : (
        <p className="px-4 py-2 text-gray-900 bg-gray-100 rounded-lg ">{formData.phone || 'Not provided'}</p>
      )}
    </div>

  </div>
{/* Department + Phone in one row */}
<div className="flex flex-col space-y-6 md:flex-row md:space-x-6 md:space-y-0">

  {/* Department */}
  <div className="w-full md:w-1/2">
    <label className="block mb-2 text-sm font-medium text-gray-700">
      <MapPin size={16} className="inline mr-2" />
      Department
    </label>
    {isEditing ? (
      <input
        type="text"
        name="department"
        value={formData.department}
        onChange={handleInputChange}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder="Enter your department"
      />
    ) : (
      <p className="px-4 py-2 text-gray-900 bg-gray-100 rounded-lg ">{user.department || 'Not specified'}</p>
    )}
  </div>

  {/* Phone Number */}
  <div className="w-full md:w-1/2">
    <label className="block mb-2 text-sm font-medium text-gray-700">
      <Phone size={16} className="inline mr-2" />
      Phone Number
    </label>
    {isEditing ? (
      <input
        type="tel"
        name="phone"
        value={formData.phone}
        onChange={handleInputChange}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder="Enter your phone number"
      />
    ) : (
      <p className="px-4 py-2 text-gray-900 bg-gray-100 rounded-lg ">{formData.phone || 'Not provided'}</p>
    )}
  </div>

</div>


              {/* Bio */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Bio
                </label>
                {isEditing ? (
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Tell us about yourself..."
                  />
                ) : (
                  <p className="text-gray-900 bg-gray-100 px-4 py-2 rounded-lg min-h-[100px]">
                    {formData.bio || 'No bio provided'}
                  </p>
                )}
              </div>

              {/* Account Info */}
              <div className="pt-6 border-t border-gray-200">
                <h4 className="mb-4 font-semibold text-gray-900 text-md">Account Information</h4>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      <Calendar size={16} className="inline mr-2" />
                      Member Since
                    </label>
                    <p className="px-3 py-2 text-sm text-gray-900 bg-gray-100 rounded-lg ">
                      {new Date(user.createdat).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Account Status
                    </label>
                    <p className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                      user.isactive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.isactive ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;