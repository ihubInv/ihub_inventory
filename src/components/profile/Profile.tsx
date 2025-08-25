import React, { useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  User, 
  Save, 
  Camera, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Shield, 
  Upload, 
  X, 
  Edit3, 
  Crown, 
  Briefcase, 
  Award,
  Clock,
  CheckCircle,
  Star,
  TrendingUp,
  Activity
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { CRUDToasts } from '../../services/toastService';
import toast from 'react-hot-toast';

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    department: user?.department || '',
    phone: user?.phone || '',
    address: user?.address || '',
    bio: user?.bio || ''
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

  const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setIsUploading(true);
    const loadingToast = CRUDToasts.updating('profile picture');

    try {
      // Upload to Supabase Storage
      const fileName = `${user?.id}/${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, file);

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName);

      // Update user profile
      await updateUser({
        profilePicture: urlData.publicUrl
      });

      toast.dismiss(loadingToast);
      CRUDToasts.updated('profile picture');
    } catch (error: any) {
      console.error('Profile picture upload error:', error);
      toast.dismiss(loadingToast);
      CRUDToasts.updateError('profile picture', error.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const removeProfilePicture = async () => {
    if (!user?.profilePicture) return;

    const loadingToast = CRUDToasts.updating('profile picture');

    try {
      await updateUser({
        profilePicture: undefined
      });

      toast.dismiss(loadingToast);
      CRUDToasts.updated('profile picture');
    } catch (error: any) {
      console.error('Profile picture removal error:', error);
      toast.dismiss(loadingToast);
      CRUDToasts.updateError('profile picture', error.message || 'Removal failed');
    }
  };

  const handleSave = async () => {
    if (user) {
      const loadingToast = CRUDToasts.updating('profile');
      
      try {
        await updateUser({
          name: formData.name,
          department: formData.department,
          phone: formData.phone,
          address: formData.address,
          bio: formData.bio
        });
        
        toast.dismiss(loadingToast);
        CRUDToasts.updated('profile');
        setIsEditing(false);
      } catch (error: any) {
        toast.dismiss(loadingToast);
        CRUDToasts.updateError('profile', error.message || 'Update failed');
      }
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      department: user?.department || '',
      phone: user?.phone || '',
      address: user?.address || '',
      bio: user?.bio || ''
    });
    setIsEditing(false);
  };

  const getRoleConfig = (role: string) => {
    switch (role) {
      case 'admin':
        return {
          gradient: 'from-red-500 via-pink-500 to-purple-600',
          badgeColor: 'bg-gradient-to-r from-red-500 to-pink-600',
          icon: Crown,
          title: 'Administrator',
          description: 'Full system access and control'
        };
      case 'stock-manager':
        return {
          gradient: 'from-blue-500 via-indigo-500 to-purple-600',
          badgeColor: 'bg-gradient-to-r from-blue-500 to-indigo-600',
          icon: Briefcase,
          title: 'Stock Manager',
          description: 'Inventory and stock management'
        };
      case 'employee':
        return {
          gradient: 'from-green-500 via-emerald-500 to-teal-600',
          badgeColor: 'bg-gradient-to-r from-green-500 to-emerald-600',
          title: 'Employee',
          description: 'Request and track inventory items'
        };
      default:
        return {
          gradient: 'from-gray-500 to-gray-600',
          badgeColor: 'bg-gray-500',
          icon: User,
          title: 'User',
          description: 'System user'
        };
    }
  };

  const roleConfig = getRoleConfig(user?.role || '');
  const RoleIcon = roleConfig.icon || User;

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-48 translate-x-48"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-32 -translate-x-32"></div>
          
          <div className="relative p-8 text-white">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="mb-6 lg:mb-0">
                <h1 className="text-4xl lg:text-5xl font-bold mb-3">
                  {getGreeting()}, {user.name}! 👋
                </h1>
                <p className="text-xl text-blue-100 mb-4">
                  Welcome to your personalized profile dashboard
                </p>
                <div className="flex items-center space-x-3">
                  <div className={`px-4 py-2 rounded-full ${roleConfig.badgeColor} text-white font-semibold flex items-center space-x-2`}>
                    <RoleIcon size={18} />
                    <span>{roleConfig.title}</span>
                  </div>
                  <div className="px-3 py-1 bg-white/20 rounded-full text-sm">
                    {user.email}
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-4">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center px-6 py-3 space-x-2 text-indigo-600 bg-white rounded-xl font-semibold transition-all duration-200 hover:bg-gray-50 hover:shadow-lg transform hover:scale-105"
                  >
                    <Edit3 size={18} />
                    <span>Edit Profile</span>
                  </button>
                ) : (
                  <div className="flex space-x-3">
                    <button
                      onClick={handleCancel}
                      className="px-6 py-3 text-white border-2 border-white/30 rounded-xl font-semibold transition-all duration-200 hover:bg-white/10"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className="flex items-center px-6 py-3 space-x-2 text-white bg-green-500 rounded-xl font-semibold transition-all duration-200 hover:bg-green-600 hover:shadow-lg transform hover:scale-105"
                    >
                      <Save size={18} />
                      <span>Save Changes</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Profile Picture & Stats */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Profile Picture Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Camera size={20} className="mr-2 text-indigo-600" />
                Profile Picture
              </h3>
              
              <div className="text-center">
                {/* Profile Picture */}
                <div className="relative inline-block mb-4">
                  {user.profilePicture ? (
                    <div className="relative">
                      <img
                        src={user.profilePicture}
                        alt="Profile"
                        className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                      />
                      {isEditing && (
                        <button
                          onClick={removeProfilePicture}
                          className="absolute -top-2 -right-2 p-2 text-white bg-red-500 rounded-full hover:bg-red-600 transition-all duration-200 shadow-lg"
                          title="Remove profile picture"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 border-4 border-white shadow-lg mx-auto">
                      <User size={48} className="text-gray-500" />
                    </div>
                  )}
                </div>

                {/* Upload Controls */}
                {isEditing && (
                  <div className="space-y-3">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="w-full flex items-center justify-center px-4 py-2 space-x-2 text-white transition-all duration-200 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      <Upload size={16} />
                      <span>{isUploading ? 'Uploading...' : 'Upload Picture'}</span>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePictureUpload}
                      className="hidden"
                    />
                    <p className="text-xs text-gray-500">
                      JPG, PNG, GIF • Max 5MB
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Role & Status Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Shield size={20} className="mr-2 text-indigo-600" />
                Account Status
              </h3>
              
              <div className="space-y-4">
                <div className="text-center p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50">
                  <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold text-white ${roleConfig.badgeColor} mb-3`}>
                    <RoleIcon size={16} className="mr-2" />
                    {roleConfig.title}
                  </div>
                  <p className="text-sm text-gray-600">{roleConfig.description}</p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Status</span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      user.isactive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      <CheckCircle size={12} className="mr-1" />
                      {user.isactive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Member Since</span>
                    <span className="text-sm text-gray-600">
                      {new Date(user.createdat).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Activity size={20} className="mr-2 text-indigo-600" />
                Quick Stats
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Role Level</span>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3].map((level) => (
                      <Star 
                        key={level} 
                        size={16} 
                        className={`${level <= (user.role === 'admin' ? 3 : user.role === 'stock-manager' ? 2 : 1) ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
                      />
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Account Health</span>
                  <span className="text-sm font-semibold text-green-600">Excellent</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Profile Details */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Personal Information Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <User size={20} className="mr-2 text-indigo-600" />
                Personal Information
              </h3>
              
              <div className="space-y-6">
                {/* Name and Phone Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block mb-2 text-sm font-semibold text-gray-700 flex items-center">
                      <User size={16} className="mr-2 text-indigo-500" />
                      Full Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                        placeholder="Enter your full name"
                      />
                    ) : (
                      <div className="px-4 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                        <span className="font-medium text-gray-900">{user.name}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-semibold text-gray-700 flex items-center">
                      <Phone size={16} className="mr-2 text-indigo-500" />
                      Phone Number
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                        placeholder="Enter your phone number"
                      />
                    ) : (
                      <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
                        <span className="font-medium text-gray-900">{formData.phone || 'Not provided'}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Department and Address Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block mb-2 text-sm font-semibold text-gray-700 flex items-center">
                      <Briefcase size={16} className="mr-2 text-indigo-500" />
                      Department
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="department"
                        value={formData.department}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                        placeholder="Enter your department"
                      />
                    ) : (
                      <div className="px-4 py-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                        <span className="font-medium text-gray-900">{user.department || 'Not specified'}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-semibold text-gray-700 flex items-center">
                      <MapPin size={16} className="mr-2 text-indigo-500" />
                      Address
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                        placeholder="Enter your address"
                      />
                    ) : (
                      <div className="px-4 py-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-100">
                        <span className="font-medium text-gray-900">{formData.address || 'Not provided'}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bio Section */}
                <div>
                  <label className="block mb-2 text-sm font-semibold text-gray-700 flex items-center">
                    <Award size={16} className="mr-2 text-indigo-500" />
                    Bio
                  </label>
                  {isEditing ? (
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white resize-none"
                      placeholder="Tell us about yourself, your experience, and what you bring to the team..."
                    />
                  ) : (
                    <div className="px-4 py-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100 min-h-[100px]">
                      <span className="font-medium text-gray-900">
                        {formData.bio || 'No bio provided. Click edit to add your personal bio and tell us about yourself!'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Email & Account Info Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <Mail size={20} className="mr-2 text-indigo-600" />
                Account Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2 text-sm font-semibold text-gray-700 flex items-center">
                    <Mail size={16} className="mr-2 text-indigo-500" />
                    Email Address
                  </label>
                  <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                    <span className="font-medium text-gray-900">{user.email}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>
                
                                 <div>
                   <label className="block mb-2 text-sm font-semibold text-gray-700 flex items-center">
                     <Clock size={16} className="mr-2 text-indigo-500" />
                     Last Login
                   </label>
                   <div className="px-4 py-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-100">
                     <span className="font-medium text-gray-900">
                       {user.lastlogin ? new Date(user.lastlogin).toLocaleDateString() : 'Never logged in'}
                     </span>
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