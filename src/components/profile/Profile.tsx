import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { useUpdateUserProfileMutation, useGetCurrentUserQuery } from '../../store/api/authApi';
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
  Activity,
  Eye,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { CRUDToasts } from '../../services/toastService';
import { uploadProfilePicture, deleteProfilePicture, generateDefaultProfilePicture } from '../../utils/storageUtils';
import toast from 'react-hot-toast';

interface FileUploadState {
  isUploading: boolean;
  isDeleting: boolean;
  showPreview: boolean;
  showDeleteConfirm: boolean;
  previewFile: File | null;
  previewUrl: string | null;
}

interface FormData {
  name: string;
  email: string;
  department: string;
  phone: string;
  address: string;
  bio: string;
}

const Profile: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [updateUserProfile] = useUpdateUserProfileMutation();
  const { refetch: refetchUser } = useGetCurrentUserQuery();
  
  // Form state
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: user?.name || '',
    email: user?.email || '',
    department: user?.department || '',
    phone: user?.phone || '',
    address: user?.address || '',
    bio: user?.bio || ''
  });

  // File upload state
  const [fileUploadState, setFileUploadState] = useState<FileUploadState>({
    isUploading: false,
    isDeleting: false,
    showPreview: false,
    showDeleteConfirm: false,
    previewFile: null,
    previewUrl: null
  });

   const [profilePictureKey, setProfilePictureKey] = useState(0);
   const [currentProfilePicture, setCurrentProfilePicture] = useState<string | null>(user?.profilepicture || null);
   const fileInputRef = useRef<HTMLInputElement>(null);

  // File validation
  const validateFile = useCallback((file: File): string | null => {
    if (!file.type.startsWith('image/')) {
      return 'Please select an image file (JPG, PNG, GIF, WebP)';
    }
    if (file.size > 5 * 1024 * 1024) {
      return 'Image size should be less than 5MB';
    }
    if (file.size < 1024) {
      return 'Image is too small (minimum 1KB)';
    }
    return null;
  }, []);

  // Reset file upload state
  const resetFileUploadState = useCallback(() => {
    if (fileUploadState.previewUrl) {
      URL.revokeObjectURL(fileUploadState.previewUrl);
    }
    setFileUploadState({
      isUploading: false,
      isDeleting: false,
      showPreview: false,
      showDeleteConfirm: false,
      previewFile: null,
      previewUrl: null
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [fileUploadState.previewUrl]);

  // Handle file selection (both click and drag-drop)
  const handleFileSelect = useCallback((file: File) => {
    if (!user) {
      toast.error('No user data available');
      return;
    }

    const validationError = validateFile(file);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setFileUploadState(prev => ({
      ...prev,
      previewFile: file,
      previewUrl,
      showPreview: true
    }));
  }, [user, validateFile]);

  // Handle file input change
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

   // Upload file to server
   const performFileUpload = useCallback(async () => {
     if (!fileUploadState.previewFile || !user) {
       return;
     }

     setFileUploadState(prev => ({ ...prev, isUploading: true }));
     const loadingToast = CRUDToasts.updating('profile picture');

     try {
       // Delete old profile picture if it exists
       if (user.profilepicture) {
         await deleteProfilePicture(user.id, user.profilepicture);
       }

       // Upload new image
       const imageUrl = await uploadProfilePicture(user.id, fileUploadState.previewFile);
       if (!imageUrl) {
         throw new Error('Failed to upload image');
       }

       // Update user profile in database
       const updatedUser = await updateUserProfile({
         id: user.id,
         updates: { profilepicture: imageUrl }
       }).unwrap();

       // Force immediate UI update
       setCurrentProfilePicture(imageUrl);
       setProfilePictureKey(prev => prev + 1);
       
       // Refresh user data
       await refetchUser();
       
       toast.dismiss(loadingToast);
       CRUDToasts.updated('profile picture');
       
       // Reset state
       resetFileUploadState();
       
     } catch (error: any) {
       console.error('Profile picture upload error:', error);
       toast.dismiss(loadingToast);
       
       if (error.message?.includes('row-level security policy')) {
         toast.error('Profile update failed due to security policy. Please contact your administrator.');
       } else if (error.message?.includes('storage')) {
         toast.error('Failed to upload image to storage. Please try again.');
       } else {
         CRUDToasts.updateError('profile picture', error.message || 'Upload failed');
       }
     } finally {
       setFileUploadState(prev => ({ ...prev, isUploading: false }));
     }
   }, [fileUploadState.previewFile, user, updateUserProfile, refetchUser, resetFileUploadState]);

   // Delete profile picture
   const performFileDelete = useCallback(async () => {
     if (!user?.profilepicture) {
       toast.error('No profile picture to remove');
       return;
     }

     setFileUploadState(prev => ({ ...prev, isDeleting: true, showDeleteConfirm: false }));
     const loadingToast = CRUDToasts.updating('profile picture');

     try {
       // Delete from storage
       await deleteProfilePicture(user.id, user.profilepicture);

       // Update user profile to remove picture reference
       const updatedUser = await updateUserProfile({
         id: user.id,
         updates: { profilepicture: undefined }
       }).unwrap();

       // Fallback: Direct database update
       const { error: directUpdateError } = await supabase
         .from('users')
         .update({ profilepicture: null as any })
         .eq('id', user.id);
       
       if (directUpdateError) {
         console.error('Direct database update failed:', directUpdateError);
       }
       
       // Force immediate UI update
       setCurrentProfilePicture(null);
       setProfilePictureKey(prev => prev + 1);
       
       // Refresh user data
       await refetchUser();
       
       toast.dismiss(loadingToast);
       CRUDToasts.updated('profile picture');
       
       // Reset file input
       if (fileInputRef.current) {
         fileInputRef.current.value = '';
       }
       
     } catch (error: any) {
       console.error('Profile picture removal error:', error);
       toast.dismiss(loadingToast);
       
       if (error.message?.includes('row-level security policy')) {
         toast.error('Profile update failed due to security policy. Please contact your administrator.');
       } else {
         CRUDToasts.updateError('profile picture', error.message || 'Removal failed');
       }
     } finally {
       setFileUploadState(prev => ({ ...prev, isDeleting: false }));
     }
   }, [user, updateUserProfile, refetchUser]);

  // Form handlers
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const validateForm = useCallback((): boolean => {
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return false;
    }
    if (formData.name.trim().length < 2) {
      toast.error('Name must be at least 2 characters long');
      return false;
    }
    if (formData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      toast.error('Please enter a valid phone number');
      return false;
    }
    if (formData.bio && formData.bio.length > 500) {
      toast.error('Bio must be less than 500 characters');
      return false;
    }
    return true;
  }, [formData]);

  const handleSave = useCallback(async () => {
    if (!user || !validateForm()) {
      return;
    }

    setIsSaving(true);
    const loadingToast = CRUDToasts.updating('profile');
    
    try {
      const updates = {
        name: formData.name.trim(),
        department: formData.department.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        address: formData.address.trim() || undefined,
        bio: formData.bio.trim() || undefined
      };

      await updateUserProfile({ id: user.id, updates }).unwrap();
      
      toast.dismiss(loadingToast);
      CRUDToasts.updated('profile');
      setIsEditing(false);
      
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast.dismiss(loadingToast);
      
      if (error.message?.includes('row-level security policy')) {
        toast.error('Profile update failed due to security policy. Please contact your administrator.');
      } else if (error.message?.includes('duplicate key')) {
        toast.error('A user with this information already exists.');
      } else {
        CRUDToasts.updateError('profile', error.message || 'Update failed');
      }
    } finally {
      setIsSaving(false);
    }
  }, [user, formData, validateForm, updateUserProfile]);

  const handleCancel = useCallback(() => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      department: user?.department || '',
      phone: user?.phone || '',
      address: user?.address || '',
      bio: user?.bio || ''
    });
    setIsEditing(false);
    resetFileUploadState();
  }, [user, resetFileUploadState]);

  // Utility functions
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
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

  // Effects
  useEffect(() => {
    return () => {
      if (fileUploadState.previewUrl) {
        URL.revokeObjectURL(fileUploadState.previewUrl);
      }
    };
  }, [fileUploadState.previewUrl]);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        department: user.department || '',
        phone: user.phone || '',
        address: user.address || '',
        bio: user.bio || ''
      });
    }
  }, [user]);

  // Update current profile picture when user changes
  useEffect(() => {
    setCurrentProfilePicture(user?.profilepicture || null);
  }, [user?.profilepicture]);

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

  const roleConfig = getRoleConfig(user?.role || '');
  const RoleIcon = roleConfig.icon || User;

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
                  {!user.profilepicture && (
                    <div className="px-3 py-1 text-sm rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30">
                      <span className="flex items-center space-x-1">
                        <Camera size={14} />
                        <span>Using default avatar</span>
                      </span>
                    </div>
                  )}
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
                      disabled={isSaving || fileUploadState.isUploading}
                      className="flex items-center px-6 py-3 space-x-2 font-semibold text-white transition-all duration-200 transform bg-green-500 rounded-xl hover:bg-green-600 hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      <Save size={18} className="text-white" />
                      <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
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
                 {/* Profile Picture Display */}
                 <div className="flex flex-col items-center mb-4" key={`profile-pic-${profilePictureKey}`}>
                   <div className="relative">
                     {currentProfilePicture ? (
                       <div className="relative group">
                         <img
                           src={`${currentProfilePicture}?t=${profilePictureKey}`}
                           alt={`${user.name}'s profile`}
                           className="object-cover w-32 h-32 border-4 border-white rounded-full shadow-lg transition-all duration-200 group-hover:shadow-xl"
                           onError={(e) => {
                             console.error('Profile picture failed to load:', currentProfilePicture);
                             e.currentTarget.style.display = 'none';
                             const fallbackDiv = e.currentTarget.nextElementSibling as HTMLElement;
                             if (fallbackDiv) {
                               fallbackDiv.style.display = 'flex';
                             }
                           }}
                           onLoad={() => console.log('Profile picture loaded successfully')}
                         />
                         {/* Fallback for broken images */}
                         <div 
                           className="hidden items-center justify-center w-32 h-32 border-4 border-white rounded-full shadow-lg bg-gradient-to-br from-gray-200 to-gray-300"
                           style={{ position: 'absolute', top: 0, left: 0 }}
                         >
                           <User size={48} className="text-gray-500" />
                         </div>
                         
                         {/* Hover overlay for quick actions */}
                         <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-50 rounded-full transition-all duration-200">
                           <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                             {isEditing ? (
                               <div className="flex space-x-2">
                                 <button
                                   onClick={() => fileInputRef.current?.click()}
                                   className="p-2 text-white bg-blue-500 rounded-full hover:bg-blue-600 transition-colors shadow-lg"
                                   title="Change picture"
                                 >
                                   <Camera size={16} />
                                 </button>
                                 <button
                                   onClick={() => setFileUploadState(prev => ({ ...prev, showDeleteConfirm: true }))}
                                   className="p-2 text-white bg-red-500 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                                   title="Remove picture"
                                 >
                                   <Trash2 size={16} />
                                 </button>
                               </div>
                             ) : (
                               <button
                                 onClick={() => setIsEditing(true)}
                                 className="p-2 text-white bg-indigo-500 rounded-full hover:bg-indigo-600 transition-colors shadow-lg"
                                 title="Edit profile"
                               >
                                 <Edit3 size={16} />
                               </button>
                             )}
                           </div>
                         </div>
                       </div>
                     ) : (
                       <div className="relative group">
                         <img
                           src={generateDefaultProfilePicture(user.name, 128)}
                           alt={`${user.name}'s default profile`}
                           className="object-cover w-32 h-32 border-4 border-white rounded-full shadow-lg transition-all duration-200 group-hover:shadow-xl"
                         />
                         
                         {/* Hover overlay for quick actions */}
                         <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-50 rounded-full transition-all duration-200">
                           <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                             {isEditing ? (
                               <button
                                 onClick={() => fileInputRef.current?.click()}
                                 className="p-3 text-white bg-green-500 rounded-full hover:bg-green-600 transition-colors shadow-lg"
                                 title="Add profile picture"
                               >
                                 <Camera size={20} />
                               </button>
                             ) : (
                               <button
                                 onClick={() => setIsEditing(true)}
                                 className="p-3 text-white bg-indigo-500 rounded-full hover:bg-indigo-600 transition-colors shadow-lg"
                                 title="Add profile picture"
                               >
                                 <Camera size={20} />
                               </button>
                             )}
                           </div>
                         </div>
                       </div>
                     )}
                   </div>
                   
                   {/* Status indicator */}
                   <div className="mt-2 text-center">
                     {currentProfilePicture ? (
                       <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-600 bg-green-100 rounded-full">
                         <CheckCircle size={12} className="mr-1" />
                         Custom Avatar
                       </span>
                     ) : (
                       <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full">
                         <User size={12} className="mr-1" />
                         Default Avatar
                       </span>
                     )}
                   </div>
                 </div>

                 {/* File Upload Controls */}
                 {isEditing && (
                   <div className="mt-6 space-y-4">
                     {/* Upload Buttons */}
                     <div className="grid grid-cols-1 gap-3">
                       <button
                         onClick={() => fileInputRef.current?.click()}
                         disabled={fileUploadState.isUploading || fileUploadState.isDeleting}
                         className="flex items-center justify-center w-full px-4 py-3 space-x-2 font-medium text-white transition-all duration-200 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                       >
                         <Camera size={18} />
                         <span>
                           {fileUploadState.isUploading ? 'Uploading...' : 
                            currentProfilePicture ? 'Change Picture' : 'Add Picture'}
                         </span>
                       </button>

                       {currentProfilePicture && (
                         <button
                           onClick={() => setFileUploadState(prev => ({ ...prev, showDeleteConfirm: true }))}
                           disabled={fileUploadState.isUploading || fileUploadState.isDeleting}
                           className="flex items-center justify-center w-full px-4 py-3 space-x-2 font-medium text-white transition-all duration-200 rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                         >
                           {fileUploadState.isDeleting ? (
                             <>
                               <RefreshCw size={18} className="animate-spin" />
                               <span>Removing...</span>
                             </>
                           ) : (
                             <>
                               <Trash2 size={18} />
                               <span>Remove Picture</span>
                             </>
                           )}
                         </button>
                       )}
                     </div>

                    {/* Drag & Drop Area */}
                    {/* <div 
                      className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-indigo-400 hover:bg-indigo-50 transition-all duration-200 cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <div className="space-y-2">
                        <Upload size={32} className="mx-auto text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            Drop an image here or click to browse
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Supports JPG, PNG, GIF, WebP up to 5MB
                          </p>
                        </div>
                      </div>
                    </div> */}

                    {/* File Input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileInputChange}
                      className="hidden"
                    />

                    {/* Requirements Info */}
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs font-medium text-gray-700 mb-1 text-center">Requirements</p>
                      <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center">
                          <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
                          Image formats
                        </span>
                        <span className="flex items-center">
                          <div className="w-2 h-2 bg-blue-400 rounded-full mr-1"></div>
                          Max 5MB
                        </span>
                        <span className="flex items-center">
                          <div className="w-2 h-2 bg-purple-400 rounded-full mr-1"></div>
                          Min 1KB
                        </span>
                      </div>
                    </div>
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
                    <div className="space-y-2">
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        rows={4}
                        maxLength={500}
                        className="w-full px-4 py-3 transition-all duration-200 border border-gray-200 resize-none rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 focus:bg-white"
                        placeholder="Tell us about yourself, your experience, and what you bring to the team..."
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Maximum 500 characters</span>
                        <span className={formData.bio.length > 450 ? 'text-orange-500' : 'text-gray-500'}>
                          {formData.bio.length}/500
                        </span>
                      </div>
                    </div>
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

      {/* File Preview Modal */}
      {fileUploadState.showPreview && fileUploadState.previewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full mx-4 shadow-2xl transform transition-all duration-200">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center justify-center">
                <Eye size={20} className="mr-2 text-indigo-600" />
                Preview Profile Picture
              </h3>
              
              {/* Preview Image */}
              <div className="relative inline-block mb-6">
                <img
                  src={fileUploadState.previewUrl}
                  alt="Profile picture preview"
                  className="object-cover w-48 h-48 border-4 border-gray-200 rounded-full shadow-lg mx-auto"
                />
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-500 border-2 border-white rounded-full flex items-center justify-center">
                  <Camera size={16} className="text-white" />
                </div>
              </div>

              {/* File Information */}
              {fileUploadState.previewFile && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-left">
                      <span className="font-medium text-gray-700">File Name:</span>
                      <p className="text-gray-600 truncate" title={fileUploadState.previewFile.name}>
                        {fileUploadState.previewFile.name}
                      </p>
                    </div>
                    <div className="text-left">
                      <span className="font-medium text-gray-700">File Size:</span>
                      <p className="text-gray-600">
                        {(fileUploadState.previewFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                    <div className="text-left">
                      <span className="font-medium text-gray-700">File Type:</span>
                      <p className="text-gray-600">{fileUploadState.previewFile.type}</p>
                    </div>
                    <div className="text-left">
                      <span className="font-medium text-gray-700">Last Modified:</span>
                      <p className="text-gray-600">
                        {new Date(fileUploadState.previewFile.lastModified).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={resetFileUploadState}
                  disabled={fileUploadState.isUploading}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={performFileUpload}
                  disabled={fileUploadState.isUploading}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                >
                  {fileUploadState.isUploading ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload size={16} />
                      <span>Upload Picture</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {fileUploadState.showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl transform transition-all duration-200">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <Trash2 size={24} className="text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Remove Profile Picture
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to remove your profile picture? This action cannot be undone and you'll see your default avatar instead.
              </p>
              
               {/* Current profile picture preview */}
               {currentProfilePicture && (
                 <div className="mb-6">
                   <img
                     src={currentProfilePicture}
                     alt="Current profile"
                     className="object-cover w-16 h-16 border-2 border-gray-200 rounded-full mx-auto opacity-75"
                   />
                   <p className="text-xs text-gray-400 mt-2">Current picture will be removed</p>
                 </div>
               )}

              <div className="flex space-x-3">
                <button
                  onClick={() => setFileUploadState(prev => ({ ...prev, showDeleteConfirm: false }))}
                  disabled={fileUploadState.isDeleting}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={performFileDelete}
                  disabled={fileUploadState.isDeleting}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {fileUploadState.isDeleting ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      <span>Removing...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      <span>Remove Picture</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;