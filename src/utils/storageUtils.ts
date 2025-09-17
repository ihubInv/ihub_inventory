import { supabase } from '../lib/supabaseClient';

export const ensureProfilePicturesBucket = async () => {
  try {
    // Since the bucket already exists (as shown in your screenshot), 
    // let's just try to access it directly instead of checking/creating
    console.log('Checking access to profile-pictures bucket...');
    
    // Try to list files in the bucket to verify access
    const { data, error } = await supabase.storage
      .from('profile-pictures')
      .list('', { limit: 1 });

    if (error) {
      console.error('Error accessing profile-pictures bucket:', error);
      return false;
    }

    console.log('Profile pictures bucket is accessible');
    return true;
  } catch (error) {
    console.error('Error ensuring profile pictures bucket:', error);
    return false;
  }
};

export const uploadProfilePicture = async (userId: string, file: File): Promise<string | null> => {
  try {
    console.log('Starting profile picture upload for user:', userId);
    
    // Generate unique filename
    const fileExtension = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`;
    
    console.log('Uploading file:', fileName);

    // Upload file directly (bucket already exists)
    const { data, error } = await supabase.storage
      .from('profile-pictures')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Upload error:', error);
      throw error;
    }

    console.log('Upload successful, data:', data);

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('profile-pictures')
      .getPublicUrl(fileName);

    console.log('Public URL generated:', urlData.publicUrl);
    return urlData.publicUrl;
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    throw error;
  }
};

export const listUserProfilePictures = async (userId: string): Promise<string[]> => {
  try {
    console.log('Listing profile pictures for user:', userId);
    
    const { data: files, error } = await supabase.storage
      .from('profile-pictures')
      .list(userId, { limit: 100 });
    
    if (error) {
      console.error('Error listing profile pictures:', error);
      return [];
    }
    
    const imageUrls = files.map(file => {
      const { data: urlData } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(`${userId}/${file.name}`);
      return urlData.publicUrl;
    });
    
    console.log('Found profile pictures:', imageUrls.length);
    return imageUrls;
  } catch (error) {
    console.error('Error listing profile pictures:', error);
    return [];
  }
};

export const getProfilePictureInfo = async (userId: string, imageUrl: string): Promise<{ exists: boolean; size?: number; lastModified?: string }> => {
  try {
    // Extract file path from URL
    const urlParts = imageUrl.split('/');
    const bucketIndex = urlParts.findIndex(part => part === 'profile-pictures');
    
    if (bucketIndex === -1 || bucketIndex + 2 >= urlParts.length) {
      return { exists: false };
    }
    
    const filePath = urlParts.slice(bucketIndex + 1).join('/');
    
    // Get file info
    const { data, error } = await supabase.storage
      .from('profile-pictures')
      .list(userId, { search: filePath.split('/').pop() });
    
    if (error || !data || data.length === 0) {
      return { exists: false };
    }
    
    const file = data[0];
    return {
      exists: true,
      size: file.metadata?.size,
      lastModified: file.updated_at
    };
  } catch (error) {
    console.error('Error getting profile picture info:', error);
    return { exists: false };
  }
};

export const deleteProfilePicture = async (userId: string, imageUrl: string): Promise<boolean> => {
  try {
    console.log('Deleting profile picture for user:', userId);
    console.log('Image URL:', imageUrl);
    
    // Extract the file path from the URL
    // URL format: https://domain.supabase.co/storage/v1/object/public/profile-pictures/userId/filename
    const urlParts = imageUrl.split('/');
    const bucketIndex = urlParts.findIndex(part => part === 'profile-pictures');
    
    if (bucketIndex === -1 || bucketIndex + 2 >= urlParts.length) {
      console.warn('Could not extract file path from URL:', imageUrl);
      return false;
    }
    
    // Get the file path after the bucket name
    const filePath = urlParts.slice(bucketIndex + 1).join('/');
    console.log('Extracted file path:', filePath);
    
    // Delete from storage
    const { error } = await supabase.storage
      .from('profile-pictures')
      .remove([filePath]);

    if (error) {
      console.error('Error deleting profile picture:', error);
      return false;
    }

    console.log('Profile picture deleted successfully');
    return true;
  } catch (error) {
    console.error('Error deleting profile picture:', error);
    return false;
  }
};

export const generateDefaultProfilePicture = (name: string, size: number = 128): string => {
  // Extract initials from name
  const initials = name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2);

  // Generate a color based on the name (consistent for same name)
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ];
  
  const colorIndex = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  const backgroundColor = colors[colorIndex];

  // Create SVG data URL
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${backgroundColor}"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size * 0.4}" 
            font-weight="bold" text-anchor="middle" dy="0.35em" fill="white">
        ${initials}
      </text>
    </svg>
  `;

  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

export const validateProfilePictureUrl = async (url: string): Promise<boolean> => {
  try {
    if (!url) return false;
    
    // Test if the URL is accessible
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error('Error validating profile picture URL:', error);
    return false;
  }
};
