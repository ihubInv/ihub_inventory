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
import { uploadProfilePicture, deleteProfilePicture } from '../../utils/storageUtils';
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
      // Delete old profile picture if it exists
      if (user?.profilepicture) {
        console.log('Deleting old profile picture:', user.profilepicture);
        await deleteProfilePicture(user.id, user.profilepicture);
      }

      // Upload new image using utility function
      console.log('Uploading new profile picture...');
      const imageUrl = await uploadProfilePicture(user?.id || '', file);

      if (!imageUrl) {
        throw new Error('Failed to upload image');
      }

      console.log('Updating user profile with new image URL:', imageUrl);
      
      try {
        // Update user profile
        await updateUser({
          profilepicture: imageUrl
        });

        toast.dismiss(loadingToast);
        CRUDToasts.updated('profile picture');
      } catch (updateError: any) {
        console.error('Profile update failed:', updateError);
        
        // Handle different types of errors
        if (updateError.message?.includes('No user data returned')) {
          console.log('Attempting to create user record...');
          try {
            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (authUser) {
              const newUserData = {
                id: authUser.id,
                email: authUser.email,
                name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
                role: 'employee',
                department: '',
                isactive: true,
                createdat: new Date().toISOString(),
                lastlogin: new Date().toISOString(),
                profilepicture: imageUrl
              };
              
              const { error: createError } = await supabase
                .from('users')
                .insert([newUserData]);
              
              if (createError) {
                throw createError;
              }
              
              console.log('User record created successfully');
              toast.dismiss(loadingToast);
              CRUDToasts.updated('profile picture');
            }
          } catch (createError) {
            console.error('Failed to create user record:', createError);
            throw createError;
          }
        } else if (updateError.message?.includes('row-level security policy')) {
          console.error('RLS Policy Error:', updateError);
          toast.dismiss(loadingToast);
          toast.error('Profile update failed due to security policy. Please contact your administrator to fix the database permissions.');
          throw new Error('RLS policy violation - database permissions need to be updated');
        } else {
          throw updateError;
        }
      }
    } catch (error: any) {
      console.error('Profile picture upload error:', error);
      toast.dismiss(loadingToast);
      CRUDToasts.updateError('profile picture', error.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const removeProfilePicture = async () => {
    if (!user?.profilepicture) return;

    const loadingToast = CRUDToasts.updating('profile picture');

    try {
      // Delete the image from storage
      await deleteProfilePicture(user.id, user.profilepicture);

      // Update user profile to remove the profile picture URL
      await updateUser({
        profilepicture: undefined
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
          gradient: 'from-[#0d559e] via-[#1a6bb8] to-[#2c7bc7]',
          badgeColor: 'bg-gradient-to-r from-[#0d559e] to-[#1a6bb8]',
          icon: Crown,
          title: 'Administrator',
          description: 'Full system access and control'
        };
      case 'stock-manager':
        return {
          gradient: 'from-[#0d559e] via-[#1a6bb8] to-[#2c7bc7]',
          badgeColor: 'bg-gradient-to-r from-[#0d559e] to-[#1a6bb8]',
          icon: Briefcase,
          title: 'Stock Manager',
          description: 'Inventory and stock management'
        };
      case 'employee':
        return {
          gradient: 'from-[#0d559e] via-[#1a6bb8] to-[#2c7bc7]',
          badgeColor: 'bg-gradient-to-r from-[#0d559e] to-[#1a6bb8]',
          title: 'Employee',
          description: 'Request and track inventory items'
        };
      default:
        return {
          gradient: 'from-[#0d559e] to-[#1a6bb8]',
          badgeColor: 'bg-gradient-to-r from-[#0d559e] to-[#1a6bb8]',
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
      <div className="px-4 py-8 mx-auto space-y-8 max-w-7xl">
        
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0d559e] via-[#1a6bb8] to-[#2c7bc7]">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute top-0 right-0 translate-x-48 -translate-y-48 rounded-full w-96 h-96 bg-white/10"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 -translate-x-32 translate-y-32 rounded-full bg-white/5"></div>
          
          <div className="relative p-8 text-white">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="mb-6 lg:mb-0">
                <h1 className="mb-3 text-4xl font-bold lg:text-5xl">
                  {getGreeting()}, {user.name}! 👋
                </h1>
                <p className="mb-4 text-xl text-blue-100">
                  Welcome to your personalized profile dashboard
                </p>
                <div className="flex items-center space-x-3">
                  <div className={`px-4 py-2 rounded-full ${roleConfig.badgeColor} text-white font-semibold flex items-center space-x-2`}>
                    <RoleIcon size={18} />
                    <span>{roleConfig.title}</span>
                  </div>
                  <div className="px-3 py-1 text-sm rounded-full bg-white/20">
                    {user.email}
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-4">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center px-6 py-3 space-x-2 font-semibold text-indigo-600 transition-all duration-200 transform bg-white rounded-xl hover:bg-gray-50 hover:shadow-lg hover:scale-105"
                  >
                    <Edit3 size={18} className="text-blue-500" />
                    <span>Edit Profile</span>
                  </button>
                ) : (
                  <div className="flex space-x-3">
                    <button
                      onClick={handleCancel}
                      className="px-6 py-3 font-semibold text-white transition-all duration-200 border-2 border-white/30 rounded-xl hover:bg-white/10"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className="flex items-center px-6 py-3 space-x-2 font-semibold text-white transition-all duration-200 transform bg-green-500 rounded-xl hover:bg-green-600 hover:shadow-lg hover:scale-105"
                    >
                      <Save size={18} className="text-green-500" />
                      <span>Save Changes</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          
          {/* Left Column - Profile Picture & Stats */}
          <div className="space-y-6 lg:col-span-1">
            
            {/* Profile Picture Card */}
            <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
              <h3 className="flex items-center mb-4 text-lg font-semibold text-gray-900">
                <Camera size={20} className="mr-2 text-indigo-600" />
                Profile Picture
              </h3>
              
              <div className="text-center">
                {/* Profile Picture */}
                <div className="relative inline-block mb-4">
                  {user.profilepicture ? (
                    <div className="relative">
                      <img
                        src={user.profilepicture}
                        alt="Profile"
                        className="object-cover w-32 h-32 border-4 border-white rounded-full shadow-lg"
                        onError={(e) => {
                          console.error('Profile picture failed to load:', user.profilepicture);
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      {isEditing && (
                        <button
                          onClick={removeProfilePicture}
                          className="absolute p-2 text-white transition-all duration-200 bg-red-500 rounded-full shadow-lg -top-2 -right-2 hover:bg-red-600"
                          title="Remove profile picture"
                        >
                          <X size={16} className="text-red-500" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center w-32 h-32 mx-auto border-4 border-white rounded-full shadow-lg bg-gradient-to-br from-gray-200 to-gray-300">
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
                      className="flex items-center justify-center w-full px-4 py-2 space-x-2 font-medium text-white transition-all duration-200 rounded-xl bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Upload size={16} className="text-blue-500" />
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
            <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
              <h3 className="flex items-center mb-4 text-lg font-semibold text-gray-900">
                <Shield size={20} className="mr-2 text-indigo-600" />
                Account Status
              </h3>
              
              <div className="space-y-4">
                <div className="p-4 text-center rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50">
                  <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold text-white ${roleConfig.badgeColor} mb-3`}>
                    <RoleIcon size={16} className="mr-2" />
                    {roleConfig.title}
                  </div>
                  <p className="text-sm text-gray-600">{roleConfig.description}</p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                    <span className="text-sm font-medium text-gray-700">Status</span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      user.isactive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      <CheckCircle size={12} className="mr-1 text-green-500" />
                      {user.isactive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                    <span className="text-sm font-medium text-gray-700">Member Since</span>
                    <span className="text-sm text-gray-600">
                      {new Date(user.createdat).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats Card */}
            <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
              <h3 className="flex items-center mb-4 text-lg font-semibold text-gray-900">
                <Activity size={20} className="mr-2 text-indigo-600" />
                Quick Stats
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50">
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
                
                <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50">
                  <span className="text-sm font-medium text-gray-700">Account Health</span>
                  <span className="text-sm font-semibold text-green-600">Excellent</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Profile Details */}
          <div className="space-y-6 lg:col-span-2">
            
            {/* Personal Information Card */}
            <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
              <h3 className="flex items-center mb-6 text-lg font-semibold text-gray-900">
                <User size={20} className="mr-2 text-indigo-600" />
                Personal Information
              </h3>
              
              <div className="space-y-6">
                {/* Name and Phone Row */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label className="flex items-center block mb-2 text-sm font-semibold text-gray-700">
                      <User size={16} className="mr-2 text-indigo-500" />
                      Full Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 transition-all duration-200 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 focus:bg-white"
                        placeholder="Enter your full name"
                      />
                    ) : (
                      <div className="px-4 py-3 border border-indigo-100 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
                        <span className="font-medium text-gray-900">{user.name}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center block mb-2 text-sm font-semibold text-gray-700">
                      <Phone size={16} className="mr-2 text-indigo-500" />
                      Phone Number
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 transition-all duration-200 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 focus:bg-white"
                        placeholder="Enter your phone number"
                      />
                    ) : (
                      <div className="px-4 py-3 border border-blue-100 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
                        <span className="font-medium text-gray-900">{formData.phone || 'Not provided'}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Department and Address Row */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label className="flex items-center block mb-2 text-sm font-semibold text-gray-700">
                      <Briefcase size={16} className="mr-2 text-indigo-500" />
                      Department
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="department"
                        value={formData.department}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 transition-all duration-200 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 focus:bg-white"
                        placeholder="Enter your department"
                      />
                    ) : (
                      <div className="px-4 py-3 border border-green-100 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                        <span className="font-medium text-gray-900">{user.department || 'Not specified'}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center block mb-2 text-sm font-semibold text-gray-700">
                      <MapPin size={16} className="mr-2 text-indigo-500" />
                      Address
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 transition-all duration-200 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 focus:bg-white"
                        placeholder="Enter your address"
                      />
                    ) : (
                      <div className="px-4 py-3 border border-orange-100 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl">
                        <span className="font-medium text-gray-900">{formData.address || 'Not provided'}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bio Section */}
                <div>
                  <label className="flex items-center block mb-2 text-sm font-semibold text-gray-700">
                    <Award size={16} className="mr-2 text-indigo-500" />
                    Bio
                  </label>
                  {isEditing ? (
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-4 py-3 transition-all duration-200 border border-gray-200 resize-none rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 focus:bg-white"
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
            <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
              <h3 className="flex items-center mb-6 text-lg font-semibold text-gray-900">
                <Mail size={20} className="mr-2 text-indigo-600" />
                Account Information
              </h3>
              
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="flex items-center block mb-2 text-sm font-semibold text-gray-700">
                    <Mail size={16} className="mr-2 text-indigo-500" />
                    Email Address
                  </label>
                  <div className="px-4 py-3 border border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                    <span className="font-medium text-gray-900">{user.email}</span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
                </div>
                
                                 <div>
                   <label className="flex items-center block mb-2 text-sm font-semibold text-gray-700">
                     <Clock size={16} className="mr-2 text-indigo-500" />
                     Last Login
                   </label>
                   <div className="px-4 py-3 border border-yellow-100 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl">
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