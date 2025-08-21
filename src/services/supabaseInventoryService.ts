// supabaseInventoryService.ts
import { supabase } from '../lib/supabaseClient';
import { InventoryItem, Request, User, Category } from '../types';

// ------------------- Inventory -------------------
export const fetchInventoryItems = async (): Promise<InventoryItem[]> => {
  try {
    const { data, error } = await supabase.from('inventory_items').select('*');
    if (error) {
      console.warn('Inventory items table not found or accessible:', error.message);
      return [];
    }
    return data as InventoryItem[];
  } catch (err) {
    console.warn('Failed to fetch inventory items:', err);
    return [];
  }
};

export const insertInventoryItem = async (item: Omit<InventoryItem, 'id' | 'createdat' | 'lastmodifieddate'>) => {
  try {
    const { error } = await supabase.from('inventory_items').insert([{ 
      ...item,
      createdat: new Date().toISOString(),
      lastmodifieddate: new Date().toISOString()
    }]);
    if (error) throw new Error(error.message);
  } catch (err) {
    console.error('Failed to insert inventory item:', err);
    throw err;
  }
};

export const updateInventoryItemById = async (id: string, item: Partial<InventoryItem>) => {
  try {
    const { error } = await supabase
      .from('inventory_items')
      .update({ ...item, lastmodifieddate: new Date().toISOString() })
      .eq('id', id);
    if (error) throw new Error(error.message);
  } catch (err) {
    console.error('Failed to update inventory item:', err);
    throw err;
  }
};

export const deleteInventoryItemById = async (id: string) => {
  try {
    const { error } = await supabase.from('inventory_items').delete().eq('id', id);
    if (error) throw new Error(error.message);
  } catch (err) {
    console.error('Failed to delete inventory item:', err);
    throw err;
  }
};

// ------------------- Requests -------------------
export const fetchRequests = async (): Promise<Request[]> => {
  try {
    const { data, error } = await supabase.from('requests').select('*');
    if (error) {
      console.warn('Requests table not found or accessible:', error.message);
      return [];
    }
    return data as Request[];
  } catch (err) {
    console.warn('Failed to fetch requests:', err);
    return [];
  }
};

export const insertRequest = async (request: Omit<Request, 'id' | 'submittedat' | 'status'>) => {
  try {
    const { error } = await supabase.from('requests').insert([{ 
      ...request, 
      submittedat: new Date().toISOString(),
      status: 'pending' 
    }]);
    if (error) throw new Error(error.message);
  } catch (err) {
    console.error('Failed to insert request:', err);
    throw err;
  }
};

export const updateRequestStatusById = async (
  id: string,
  status: 'approved' | 'rejected',
  remarks?: string,
  reviewerid?: string
) => {
  try {
    const { error } = await supabase.from('requests').update({
      status,
      remarks,
      reviewedby: reviewerid,
      reviewedat: new Date().toISOString()
    }).eq('id', id);
    if (error) throw new Error(error.message);
  } catch (err) {
    console.error('Failed to update request status:', err);
    throw err;
  }
};

// ------------------- Users -------------------
export const fetchUsers = async (): Promise<User[]> => {
  try {
    const { data, error } = await supabase.from('users').select('*');
    if (error) {
      console.warn('Users table not found or accessible:', error.message);
      return [];
    }
    return data as User[];
  } catch (err) {
    console.warn('Failed to fetch users:', err);
    return [];
  }
};

export const insertUser = async (user: Omit<User, 'id' | 'createdat'>) => {
  try {
    const { error } = await supabase.from('users').insert([{ 
      ...user, 
      createdat: new Date().toISOString() 
    }]);
    if (error) throw new Error(error.message);
  } catch (err) {
    console.error('Failed to insert user:', err);
    throw err;
  }
};

export const updateUserById = async (id: string, user: Partial<User>) => {
  try {
    const { error } = await supabase.from('users').update(user).eq('id', id);
    if (error) throw new Error(error.message);
  } catch (err) {
    console.error('Failed to update user:', err);
    throw err;
  }
};

export const deleteUserById = async (id: string) => {
  try {
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) throw new Error(error.message);
  } catch (err) {
    console.error('Failed to delete user:', err);
    throw err;
  }
};

// ------------------- Categories -------------------
export const fetchCategories = async (): Promise<Category[]> => {
  try {
    const { data, error } = await supabase.from('categories').select('*');
    if (error) {
      console.warn('Categories table not found or accessible:', error.message);
      return [];
    }
    return data as Category[];
  } catch (err) {
    console.warn('Failed to fetch categories:', err);
    return [];
  }
};

export const insertCategory = async (category: Omit<Category, 'id' | 'createdat' | 'updatedat'>) => {
  try {
    const { error } = await supabase.from('categories').insert([{ 
      ...category, 
      createdat: new Date().toISOString(), 
      updatedat: new Date().toISOString() 
    }]);
    if (error) throw new Error(error.message);
  } catch (err) {
    console.error('Failed to insert category:', err);
    throw err;
  }
};

export const updateCategoryById = async (id: string, category: Partial<Category>) => {
  try {
    const { error } = await supabase.from('categories').update({ 
      ...category, 
      updatedat: new Date().toISOString() 
    }).eq('id', id);
    if (error) throw new Error(error.message);
  } catch (err) {
    console.error('Failed to update category:', err);
    throw err;
  }
};

export const deleteCategoryById = async (id: string) => {
  try {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw new Error(error.message);
  } catch (err) {
    console.error('Failed to delete category:', err);
    throw err;
  }
};