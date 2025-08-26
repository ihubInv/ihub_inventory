// import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// import { InventoryItem, Request, User, Category } from '../types';
// import { sendNotificationEmail } from '../services/emailService';

// interface InventoryContextType {
//   inventoryItems: InventoryItem[];
//   requests: Request[];
//   users: User[];
//   categories: Category[];
//   addInventoryItem: (item: Omit<InventoryItem, 'id' | 'createdAt' | 'lastModifiedDate'>) => void;
//   updateInventoryItem: (id: string, item: Partial<InventoryItem>) => void;
//   deleteInventoryItem: (id: string) => void;
//   submitRequest: (request: Omit<Request, 'id' | 'submittedAt' | 'status'>) => void;
//   updateRequestStatus: (id: string, status: 'approved' | 'rejected', remarks?: string, reviewerid?: string) => void;
//   addUser: (user: Omit<User, 'id' | 'createdAt'>) => void;
//   updateUser: (id: string, user: Partial<User>) => void;
//   deleteUser: (id: string) => void;
//   addCategory: (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => void;
//   updateCategory: (id: string, category: Partial<Category>) => void;
//   deleteCategory: (id: string) => void;
// }

// const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

// export const useInventory = () => {
//   const context = useContext(InventoryContext);
//   if (context === undefined) {
//     throw new Error('useInventory must be used within an InventoryProvider');
//   }
//   return context;
// };

// // Mock data
// const mockInventoryItems: InventoryItem[] = [
//   {
//     id: '1',
//     uniqueId: 'IT-LAP-001',
//     financialYear: '2024-25',
//     dateOfInvoice: new Date('2024-01-15'),
//     dateOfEntry: new Date('2024-01-16'),
//     invoiceNumber: 'INV-2024-001',
//     assetCategory: 'Electronics',
//     assetName: 'Dell Laptop',
//     specification: 'Intel i7, 16GB RAM, 512GB SSD',
//     makeModel: 'Dell Inspiron 15',
//     productSerialNumber: 'DL123456789',
//     vendorName: 'Dell Technologies',
//     quantityPerItem: 1,
//     rateInclusiveTax: 75000,
//     totalCost: 75000,
//     locationOfItem: 'IT Department',
//     balanceQuantityInStock: 10,
//     description: 'Laptop for development work',
//     unitOfMeasurement: 'Pieces',
//     conditionOfAsset: 'excellent',
//     status: 'available',
//     minimumStockLevel: 5,
//     lastModifiedBy: 'admin',
//     lastModifiedDate: new Date(),
//     createdAt: new Date()
//   },
//   {
//     id: '2',
//     uniqueId: 'OFF-CHR-001',
//     financialYear: '2024-25',
//     dateOfInvoice: new Date('2024-01-10'),
//     dateOfEntry: new Date('2024-01-11'),
//     invoiceNumber: 'INV-2024-002',
//     assetCategory: 'Furniture',
//     assetName: 'Office Chair',
//     specification: 'Ergonomic, Height Adjustable',
//     makeModel: 'Herman Miller Aeron',
//     productSerialNumber: 'HM987654321',
//     vendorName: 'Herman Miller',
//     quantityPerItem: 1,
//     rateInclusiveTax: 25000,
//     totalCost: 25000,
//     locationOfItem: 'Office Floor 2',
//     balanceQuantityInStock: 25,
//     description: 'Ergonomic office chair',
//     unitOfMeasurement: 'Pieces',
//     conditionOfAsset: 'excellent',
//     status: 'available',
//     minimumStockLevel: 10,
//     lastModifiedBy: 'admin',
//     lastModifiedDate: new Date(),
//     createdAt: new Date()
//   }
// ];

// const mockRequests: Request[] = [
//   {
//     id: '1',
//     employeeId: '3',
//     employeeName: 'John Doe',
//     itemType: 'Laptop',
//     quantity: 1,
//     purpose: 'Development Work',
//     justification: 'Need a new laptop for React development projects',
//     status: 'pending',
//     submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
//   },
//   {
//     id: '2',
//     employeeId: '3',
//     employeeName: 'John Doe',
//     itemType: 'Office Chair',
//     quantity: 1,
//     purpose: 'Workstation Setup',
//     justification: 'Current chair is causing back pain',
//     status: 'approved',
//     submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
//     reviewedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
//     reviewedBy: '1',
//     reviewerName: 'System Administrator',
//     remarks: 'Approved for ergonomic reasons'
//   }
// ];

// const mockUsers: User[] = [
//   {
//     id: '1',
//     email: 'admin@company.com',
//     name: 'System Administrator',
//     role: 'admin',
//     department: 'IT',
//     isActive: true,
//     createdAt: new Date(),
//     lastlogin: new Date()
//   },
//   {
//     id: '2',
//     email: 'manager@company.com',
//     name: 'Stock Manager',
//     role: 'stock-manager',
//     department: 'Operations',
//     isActive: true,
//     createdAt: new Date(),
//     lastlogin: new Date()
//   },
//   {
//     id: '3',
//     email: 'employee@company.com',
//     name: 'John Doe',
//     role: 'employee',
//     department: 'Marketing',
//     isActive: true,
//     createdAt: new Date(),
//     lastlogin: new Date()
//   }
// ];

// const mockCategories: Category[] = [
//   {
//     id: '1',
//     name: 'Computer Mouse',
//     type: 'tangible',
//     description: 'Computer input devices including wired and wireless mice',
//     isActive: true,
//     createdAt: new Date('2024-01-01'),
//     updatedAt: new Date('2024-01-01'),
//     createdBy: '1'
//   },
//   {
//     id: '2',
//     name: 'Software License',
//     type: 'intangible',
//     description: 'Software licenses and digital assets',
//     isActive: true,
//     createdAt: new Date('2024-01-02'),
//     updatedAt: new Date('2024-01-02'),
//     createdBy: '1'
//   },
//   {
//     id: '3',
//     name: 'Office Furniture',
//     type: 'tangible',
//     description: 'Desks, chairs, and other office furniture items',
//     isActive: true,
//     createdAt: new Date('2024-01-03'),
//     updatedAt: new Date('2024-01-03'),
//     createdBy: '1'
//   }
// ];

// export const InventoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
//   const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(mockInventoryItems);
//   const [requests, setRequests] = useState<Request[]>(mockRequests);
//   const [users, setUsers] = useState<User[]>(mockUsers);
//   const [categories, setCategories] = useState<Category[]>(mockCategories);

//   const addInventoryItem = (itemData: Omit<InventoryItem, 'id' | 'createdAt' | 'lastModifiedDate'>) => {
//     const newItem: InventoryItem = {
//       ...itemData,
//       id: Date.now().toString(),
//       createdAt: new Date(),
//       lastModifiedDate: new Date()
//     };
//     setInventoryItems(prev => [...prev, newItem]);
//   };

//   const updateInventoryItem = (id: string, itemData: Partial<InventoryItem>) => {
//     setInventoryItems(prev =>
//       prev.map(item =>
//         item.id === id
//           ? { ...item, ...itemData, lastModifiedDate: new Date() }
//           : item
//       )
//     );
//   };

//   const deleteInventoryItem = (id: string) => {
//     setInventoryItems(prev => prev.filter(item => item.id !== id));
//   };

//   const submitRequest = (requestData: Omit<Request, 'id' | 'submittedAt' | 'status'>) => {
//     const newRequest: Request = {
//       ...requestData,
//       id: Date.now().toString(),
//       submittedAt: new Date(),
//       status: 'pending'
//     };
//     setRequests(prev => [newRequest, ...prev]);

//     // Send email notifications to admins and stock managers
//     const adminUsers = users.filter(user => user.role === 'admin' || user.role === 'stock-manager');
//     adminUsers.forEach(admin => {
//       sendNotificationEmail('newRequest', admin.email, admin.name, {
//         employeeName: requestData.employeeName,
//         itemType: requestData.itemType,
//         quantity: requestData.quantity,
//         purpose: requestData.purpose
//       });
//     });
//   };

//   const updateRequestStatus = (id: string, status: 'approved' | 'rejected', remarks?: string, reviewerid?: string) => {
//     const request = requests.find(req => req.id === id);
//     const employee = users.find(user => user.id === request?.employeeId);
    
//     setRequests(prev =>
//       prev.map(request =>
//         request.id === id
//           ? {
//               ...request,
//               status,
//               reviewedAt: new Date(),
//               reviewedBy: reviewerid,
//               remarks
//             }
//           : request
//       )
//     );

//     // Send email notification to employee
//     if (request && employee) {
//       const emailType = status === 'approved' ? 'requestApproved' : 'requestRejected';
//       sendNotificationEmail(emailType, employee.email, employee.name, {
//         employeeName: employee.name,
//         itemType: request.itemType,
//         quantity: request.quantity,
//         remarks
//       });
//     }
//   };

//   const addUser = (userData: Omit<User, 'id' | 'createdAt'>) => {
//     const newUser: User = {
//       ...userData,
//       id: Date.now().toString(),
//       createdAt: new Date()
//     };
//     setUsers(prev => [...prev, newUser]);
//   };

//   const updateUser = (id: string, userData: Partial<User>) => {
//     setUsers(prev =>
//       prev.map(user =>
//         user.id === id ? { ...user, ...userData } : user
//       )
//     );
//   };

//   const deleteUser = (id: string) => {
//     setUsers(prev => prev.filter(user => user.id !== id));
//   };

//   const addCategory = (categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => {
//     const newCategory: Category = {
//       ...categoryData,
//       id: Date.now().toString(),
//       createdAt: new Date(),
//       updatedAt: new Date()
//     };
//     setCategories(prev => [...prev, newCategory]);
//   };

//   const updateCategory = (id: string, categoryData: Partial<Category>) => {
//     setCategories(prev =>
//       prev.map(category =>
//         category.id === id
//           ? { ...category, ...categoryData, updatedAt: new Date() }
//           : category
//       )
//     );
//   };

//   const deleteCategory = (id: string) => {
//     setCategories(prev => prev.filter(category => category.id !== id));
//   };

//   return (
//     <InventoryContext.Provider value={{
//       inventoryItems,
//       requests,
//       users,
//       categories,
//       addInventoryItem,
//       updateInventoryItem,
//       deleteInventoryItem,
//       submitRequest,
//       updateRequestStatus,
//       addUser,
//       updateUser,
//       deleteUser,
//       addCategory,
//       updateCategory,
//       deleteCategory
//     }}>
//       {children}
//     </InventoryContext.Provider>
//   );
// };



// ✅ Updated InventoryProvider using Supabase
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { InventoryItem, Request, User, Category } from '../types';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabaseClient';
import {
  fetchInventoryItems,
  fetchRequests,
  fetchUsers,
  fetchCategories,
  insertInventoryItem,
  updateInventoryItemById,
  deleteInventoryItemById,
  insertRequest,
  updateRequestStatusById,
  insertUser,
  updateUserById,
  deleteUserById,
  insertCategory,
  updateCategoryById,
  deleteCategoryById
} from '../services/supabaseInventoryService';

interface InventoryContextType {
  inventoryItems: InventoryItem[];
  requests: Request[];
  users: User[];
  categories: Category[];
  loading: boolean;
  isInitialized: boolean;
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'createdat' | 'lastmodifieddate'>) => Promise<void>;
  updateInventoryItem: (id: string, item: Partial<InventoryItem>) => Promise<void>;
  deleteInventoryItem: (id: string) => Promise<void>;
  submitRequest: (request: Omit<Request, 'id' | 'submittedat' | 'status'>) => Promise<void>;
  updateRequestStatus: (id: string, status: 'approved' | 'rejected', remarks?: string, reviewerid?: string) => Promise<void>;
  addUser: (user: Omit<User, 'id' | 'createdat'>) => Promise<void>;
  updateUser: (id: string, user: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  addCategory: (category: Omit<Category, 'id' | 'createdat' | 'updatedat'>) => Promise<void>;
  updateCategory: (id: string, category: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);
export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};

export const InventoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Cache keys for localStorage
  const CACHE_KEYS = {
    inventory: 'inventoryItemsCache',
    requests: 'requestsCache',
    users: 'usersCache',
    categories: 'categoriesCache',
    lastFetch: 'lastDataFetch'
  };

  // Cache expiration time (5 minutes)
  const CACHE_EXPIRY = 5 * 60 * 1000;

  // Load data from cache
  const loadFromCache = () => {
    try {
      const lastFetch = localStorage.getItem(CACHE_KEYS.lastFetch);
      const now = Date.now();
      
      // Check if cache is still valid
      if (lastFetch && (now - parseInt(lastFetch)) < CACHE_EXPIRY) {
        const cachedInventory = localStorage.getItem(CACHE_KEYS.inventory);
        const cachedRequests = localStorage.getItem(CACHE_KEYS.requests);
        const cachedUsers = localStorage.getItem(CACHE_KEYS.users);
        const cachedCategories = localStorage.getItem(CACHE_KEYS.categories);

        if (cachedInventory) {
          const parsedInventory = JSON.parse(cachedInventory);
          // Convert date strings back to Date objects
          const inventoryWithDates = parsedInventory.map((item: any) => ({
            ...item,
            dateofinvoice: item.dateofinvoice ? new Date(item.dateofinvoice) : null,
            dateofentry: item.dateofentry ? new Date(item.dateofentry) : null,
            dateofissue: item.dateofissue ? new Date(item.dateofissue) : null,
            expectedreturndate: item.expectedreturndate ? new Date(item.expectedreturndate) : null,
            createdat: item.createdat ? new Date(item.createdat) : null,
            lastmodifieddate: item.lastmodifieddate ? new Date(item.lastmodifieddate) : null,
          }));
          setInventoryItems(inventoryWithDates);
        }

        if (cachedRequests) {
          const parsedRequests = JSON.parse(cachedRequests);
          const requestsWithDates = parsedRequests.map((request: any) => ({
            ...request,
            submittedat: request.submittedat ? new Date(request.submittedat) : null,
            reviewedat: request.reviewedat ? new Date(request.reviewedat) : null,
          }));
          setRequests(requestsWithDates);
        }

        if (cachedUsers) {
          const parsedUsers = JSON.parse(cachedUsers);
          const usersWithDates = parsedUsers.map((user: any) => ({
            ...user,
            createdat: user.createdat ? new Date(user.createdat) : null,
            lastlogin: user.lastlogin ? new Date(user.lastlogin) : null,
          }));
          setUsers(usersWithDates);
        }

        if (cachedCategories) {
          const parsedCategories = JSON.parse(cachedCategories);
          const categoriesWithDates = parsedCategories.map((category: any) => ({
            ...category,
            createdat: category.createdat ? new Date(category.createdat) : null,
            updatedat: category.updatedat ? new Date(category.updatedat) : null,
          }));
          setCategories(categoriesWithDates);
        }

        console.log('Data loaded from cache');
        return true; // Cache was used
      }
    } catch (error) {
      console.error('Error loading from cache:', error);
    }
    return false; // Cache was not used
  };

  // Save data to cache
  const saveToCache = (inventory: InventoryItem[], requests: Request[], users: User[], categories: Category[]) => {
    try {
      localStorage.setItem(CACHE_KEYS.inventory, JSON.stringify(inventory));
      localStorage.setItem(CACHE_KEYS.requests, JSON.stringify(requests));
      localStorage.setItem(CACHE_KEYS.users, JSON.stringify(users));
      localStorage.setItem(CACHE_KEYS.categories, JSON.stringify(categories));
      localStorage.setItem(CACHE_KEYS.lastFetch, Date.now().toString());
      console.log('Data saved to cache');
    } catch (error) {
      console.error('Error saving to cache:', error);
    }
  };

  // Clear cache
  const clearCache = () => {
    try {
      localStorage.removeItem(CACHE_KEYS.inventory);
      localStorage.removeItem(CACHE_KEYS.requests);
      localStorage.removeItem(CACHE_KEYS.users);
      localStorage.removeItem(CACHE_KEYS.categories);
      localStorage.removeItem(CACHE_KEYS.lastFetch);
      console.log('Cache cleared');
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  };

  const loadAll = async (forceRefresh = false) => {
    // Only load data if user is authenticated
    if (!isAuthenticated || !user) {
      console.log('Not authenticated, skipping data load');
      setInventoryItems([]);
      setRequests([]);
      setUsers([]);
      setCategories([]);
      setLoading(false);
      clearCache(); // Clear cache when not authenticated
      return;
    }

    console.log('User authenticated, loading data...');
    setLoading(true);
    
    // Try to load from cache first (unless force refresh)
    if (!forceRefresh && loadFromCache()) {
      setLoading(false);
      // Still fetch fresh data in background for next time
      setTimeout(() => loadAll(true), 1000);
      return;
    }
    
    try {
      const [inventoryData, requestsData, usersData, categoriesData] = await Promise.allSettled([
        fetchInventoryItems(),
        fetchRequests(),
        fetchUsers(),
        fetchCategories()
      ]);
      
      const inventory = inventoryData.status === 'fulfilled' ? inventoryData.value : [];
      const requests = requestsData.status === 'fulfilled' ? requestsData.value : [];
      const users = usersData.status === 'fulfilled' ? usersData.value : [];
      const categories = categoriesData.status === 'fulfilled' ? categoriesData.value : [];
      
      setInventoryItems(inventory);
      setRequests(requests);
      setUsers(users);
      setCategories(categories);
      
      // Save to cache
      saveToCache(inventory, requests, users, categories);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initialize component and load data immediately
  useEffect(() => {
    console.log('InventoryProvider mounted/remounted');
    
    // Load from cache immediately if available
    if (isAuthenticated && user && !isInitialized) {
      console.log('Loading cached data on mount...');
      if (loadFromCache()) {
        setIsInitialized(true);
        console.log('Data loaded from cache on mount');
      }
    }
  }, []);

  // Handle page load and ensure data is available
  useEffect(() => {
    const handlePageLoad = () => {
      if (isAuthenticated && user) {
        console.log('Page load detected, ensuring data is loaded...');
        
        // If no data in state, try to load from cache first
        if (!inventoryItems.length && !requests.length && !users.length && !categories.length) {
          console.log('No data in state, loading from cache...');
          if (!loadFromCache()) {
            console.log('No cache available, loading fresh data...');
            loadAll(true);
          }
        }
      }
    };

    // Check immediately if page is already loaded
    if (document.readyState === 'complete') {
      handlePageLoad();
    } else {
      window.addEventListener('load', handlePageLoad);
    }

    return () => {
      window.removeEventListener('load', handlePageLoad);
    };
  }, [isAuthenticated, user, inventoryItems.length, requests.length, users.length, categories.length]);

  // Load data when authentication state changes
  useEffect(() => {
    console.log('Auth state changed:', { isAuthenticated, authLoading, userId: user?.id });
    
    // Only load data after auth loading is complete
    if (!authLoading) {
      if (isAuthenticated && user) {
        console.log('Loading data due to auth state change...');
        loadAll();
        setIsInitialized(true);
      } else {
        console.log('Clearing data due to auth state change...');
        setInventoryItems([]);
        setRequests([]);
        setUsers([]);
        setCategories([]);
        setLoading(false);
        setIsInitialized(false);
        clearCache();
      }
    }
  }, [isAuthenticated, authLoading, user?.id]);

  // Listen for auth state changes
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event);
      if (event === 'SIGNED_IN' && session) {
        // Reload data when user signs in
        loadAll();
      } else if (event === 'SIGNED_OUT') {
        // Clear data when user signs out
        setInventoryItems([]);
        setRequests([]);
        setUsers([]);
        setCategories([]);
        setLoading(false);
        clearCache();
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Listen for tab visibility changes to refresh data when user returns
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isAuthenticated && user) {
        console.log('Tab became visible, reloading data...');
        
        // Always load from cache first for instant display
        if (loadFromCache()) {
          console.log('Data restored from cache');
        }
        
        // Check if we need fresh data
        const lastFetch = localStorage.getItem(CACHE_KEYS.lastFetch);
        const now = Date.now();
        
        if (!lastFetch || (now - parseInt(lastFetch)) > CACHE_EXPIRY) {
          console.log('Cache is stale, fetching fresh data...');
          loadAll(true);
        } else {
          console.log('Cache is fresh, no API call needed');
        }
      }
    };

    const handleFocus = () => {
      if (isAuthenticated && user) {
        console.log('Window focused, checking data...');
        // Load from cache immediately when window gets focus
        if (!inventoryItems.length || !requests.length) {
          console.log('No data in state, loading from cache...');
          if (loadFromCache()) {
            console.log('Data restored from cache on focus');
          } else {
            console.log('No cache available, loading fresh data...');
            loadAll(true);
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [isAuthenticated, user, inventoryItems.length, requests.length]);

  const addInventoryItem = async (item: Omit<InventoryItem, 'id' | 'createdat' | 'lastmodifieddate'>) => {
    await insertInventoryItem(item);
    const updated = await fetchInventoryItems();
    setInventoryItems(updated);
    // Update cache
    saveToCache(updated, requests, users, categories);
  };

  const updateInventoryItem = async (id: string, item: Partial<InventoryItem>) => {
    await updateInventoryItemById(id, item);
    const updated = await fetchInventoryItems();
    setInventoryItems(updated);
    // Update cache
    saveToCache(updated, requests, users, categories);
  };

  const deleteInventoryItem = async (id: string) => {
    await deleteInventoryItemById(id);
    const updated = await fetchInventoryItems();
    setInventoryItems(updated);
    // Update cache
    saveToCache(updated, requests, users, categories);
  };

  const submitRequest = async (request: Omit<Request, 'id' | 'submittedat' | 'status'>) => {
    await insertRequest(request);
    const updated = await fetchRequests();
    setRequests(updated);
    // Update cache
    saveToCache(inventoryItems, updated, users, categories);
  };

  const updateRequestStatus = async (id: string, status: 'approved' | 'rejected', remarks?: string, reviewerid?: string) => {
    await updateRequestStatusById(id, status, remarks, reviewerid);
    const updated = await fetchRequests();
    setRequests(updated);
    // Update cache
    saveToCache(inventoryItems, updated, users, categories);
  };

  const addUser = async (user: Omit<User, 'id' | 'createdat'>) => {
    await insertUser(user);
    const updated = await fetchUsers();
    setUsers(updated);
    // Update cache
    saveToCache(inventoryItems, requests, updated, categories);
  };

  const updateUser = async (id: string, user: Partial<User>) => {
    await updateUserById(id, user);
    const updated = await fetchUsers();
    setUsers(updated);
    // Update cache
    saveToCache(inventoryItems, requests, updated, categories);
  };

  const deleteUser = async (id: string) => {
    await deleteUserById(id);
    const updated = await fetchUsers();
    setUsers(updated);
    // Update cache
    saveToCache(inventoryItems, requests, updated, categories);
  };

  // const addCategory = async (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => {
  //   debugger
  //   await insertCategory(category);
  //   const updated = await fetchCategories();
  //   setCategories(updated);
  // };

  const addCategory = async (category: Omit<Category, 'id' | 'createdat' | 'updatedat'>) => {
    try {
      await insertCategory(category);
      const updated = await fetchCategories();
      setCategories(updated);
      // Update cache
      saveToCache(inventoryItems, requests, users, updated);
    } catch (error) {
      console.error('Error inserting category:', error);
      throw error; // propagate back to handler
    }
  };
  

  const updateCategory = async (id: string, category: Partial<Category>) => {
    await updateCategoryById(id, category);
    const updated = await fetchCategories();
    setCategories(updated);
    // Update cache
    saveToCache(inventoryItems, requests, users, updated);
  };

  const deleteCategory = async (id: string) => {
    await deleteCategoryById(id);
    const updated = await fetchCategories();
    setCategories(updated);
    // Update cache
    saveToCache(inventoryItems, requests, users, updated);
  };

  const refreshData = async () => {
    await loadAll(true); // Force refresh
  };

  return (
    <InventoryContext.Provider value={{
      inventoryItems,
      requests,
      users,
      categories,
      loading,
      isInitialized,
      addInventoryItem,
      updateInventoryItem,
      deleteInventoryItem,
      submitRequest,
      updateRequestStatus,
      addUser,
      updateUser,
      deleteUser,
      addCategory,
      updateCategory,
      deleteCategory,
      refreshData
    }}>
      {children}
    </InventoryContext.Provider>
  );
};
