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

export const deleteProfilePicture = async (userId: string, imageUrl: string): Promise<boolean> => {
  try {
    // Extract filename from URL
    const fileName = imageUrl.split('/').pop();
    if (!fileName) {
      console.warn('Could not extract filename from URL:', imageUrl);
      return false;
    }

    // Delete from storage
    const { error } = await supabase.storage
      .from('profile-pictures')
      .remove([`${userId}/${fileName}`]);

    if (error) {
      console.error('Error deleting profile picture:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting profile picture:', error);
    return false;
  }
};
