// supabaseInventoryService.ts
import { supabase } from '../lib/supabaseClient';
import { InventoryItem, Request, User, Category } from '../types';

// ------------------- Inventory -------------------
export const fetchInventoryItems = async (): Promise<InventoryItem[]> => {
  const { data, error } = await supabase.from('inventory_items').select('*');
  if (error) throw new Error(error.message);
  return data as InventoryItem[];
};

export const insertInventoryItem = async (item: Omit<InventoryItem, 'id' | 'createdat' | 'lastmodifieddate'>) => {
    debugger
  const { error } = await supabase.from('inventory_items').insert([{ 
    ...item,
    createdat: new Date().toISOString(),
    lastmodifieddate: new Date().toISOString()
  }]);
  if (error) throw new Error(error.message);
};

export const updateInventoryItemById = async (id: string, item: Partial<InventoryItem>) => {
  const { error } = await supabase
    .from('inventory_items')
    .update({ ...item, lastmodifieddate: new Date().toISOString() })
    .eq('id', id);
  if (error) throw new Error(error.message);
};

export const deleteInventoryItemById = async (id: string) => {
  const { error } = await supabase.from('inventory_items').delete().eq('id', id);
  if (error) throw new Error(error.message);
};

// ------------------- Requests -------------------
export const fetchRequests = async (): Promise<Request[]> => {
  const { data, error } = await supabase.from('requests').select('*');
  if (error) throw new Error(error.message);
  return data as Request[];
};

export const insertRequest = async (request: Omit<Request, 'id' | 'submittedat' | 'status'>) => {
  const { error } = await supabase.from('requests').insert([{ 
    ...request, 
    submittedat: new Date().toISOString(),
    status: 'pending' 
  }]);
  if (error) throw new Error(error.message);
};

export const updateRequestStatusById = async (
  id: string,
  status: 'approved' | 'rejected',
  remarks?: string,
  reviewerid?: string
) => {
  debugger
  const { error } = await supabase.from('requests').update({
    status,
    remarks,
    reviewedby: reviewerid,
    reviewedat: new Date().toISOString()
  }).eq('id', id);
  if (error) throw new Error(error.message);
};

// ------------------- Users -------------------
export const fetchUsers = async (): Promise<User[]> => {
  const { data, error } = await supabase.from('users').select('*');
  if (error) throw new Error(error.message);
  return data as User[];
};

export const insertUser = async (user: Omit<User, 'id' | 'createdat'>) => {
  const { error } = await supabase.from('users').insert([{ 
    ...user, 
    createdat: new Date().toISOString() 
  }]);
  if (error) throw new Error(error.message);
};

export const updateUserById = async (id: string, user: Partial<User>) => {
  const { error } = await supabase.from('users').update(user).eq('id', id);
  if (error) throw new Error(error.message);
};

export const deleteUserById = async (id: string) => {
  const { error } = await supabase.from('users').delete().eq('id', id);
  if (error) throw new Error(error.message);
};

// ------------------- Categories -------------------
export const fetchCategories = async (): Promise<Category[]> => {
  const { data, error } = await supabase.from('categories').select('*');
  if (error) throw new Error(error.message);
  return data as Category[];
};

// export const insertCategory = async (category: Omit<Category, 'id' | 'createdat' | 'updatedAt'>) => {
//     debugger
//   const { error } = await supabase.from('categories').insert([{ 
//     ...category, 
//     createdat: new Date().toISOString(), 
//     updatedAt: new Date().toISOString() 
//   }]);
//   if (error) throw new Error(error.message);
// };

export const insertCategory = async (category: Omit<Category, 'id' | 'createdat' | 'updatedat'>) => {
    debugger
    try {
      const { error } = await supabase.from('categories').insert([{ 
        ...category, 
        createdat: new Date().toISOString(), 
        updatedat: new Date().toISOString() 
      }]);
      if (error) throw new Error(error.message);
    } catch (err) {
      console.error('Insert category failed:', err);
      throw err;
    }
  };
  

export const updateCategoryById = async (id: string, category: Partial<Category>) => {
  const { error } = await supabase.from('categories').update({ 
    ...category, 
    updatedat: new Date().toISOString() 
  }).eq('id', id);
  if (error) throw new Error(error.message);
};

export const deleteCategoryById = async (id: string) => {
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw new Error(error.message);
};