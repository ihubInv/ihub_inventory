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
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const loadAll = async () => {
    const [items, reqs, usrs, cats] = await Promise.all([
      fetchInventoryItems(),
      const [inventoryData, requestsData, usersData, categoriesData] = await Promise.allSettled([
        fetchInventoryItems(),
        fetchRequests(),
        fetchUsers(),
        fetchCategories()
      ]);
    ]
    )
    setUsers(usrs);
    setCategories(cats);
  };

  useEffect(() => {
    loadAll();
  }, []);

  const addInventoryItem = async (item: Omit<InventoryItem, 'id' | 'createdat' | 'lastmodifieddate'>) => {
    debugger
    await insertInventoryItem(item);
    const updated = await fetchInventoryItems();
    setInventoryItems(updated);
  };

  const updateInventoryItem = async (id: string, item: Partial<InventoryItem>) => {
    await updateInventoryItemById(id, item);
    const updated = await fetchInventoryItems();
    setInventoryItems(updated);
  };

  const deleteInventoryItem = async (id: string) => {
    await deleteInventoryItemById(id);
    const updated = await fetchInventoryItems();
    setInventoryItems(updated);
  };

  const submitRequest = async (request: Omit<Request, 'id' | 'submittedat' | 'status'>) => {
    await insertRequest(request);
    const updated = await fetchRequests();
    setRequests(updated);
  };

  const updateRequestStatus = async (id: string, status: 'approved' | 'rejected', remarks?: string, reviewerid?: string) => {
    debugger
    await updateRequestStatusById(id, status, remarks, reviewerid);
    const updated = await fetchRequests();
    setRequests(updated);
  };

  const addUser = async (user: Omit<User, 'id' | 'createdat'>) => {
    await insertUser(user);
    const updated = await fetchUsers();
    setUsers(updated);
  };

  const updateUser = async (id: string, user: Partial<User>) => {
    await updateUserById(id, user);
    const updated = await fetchUsers();
    setUsers(updated);
  };

  const deleteUser = async (id: string) => {
    await deleteUserById(id);
    const updated = await fetchUsers();
    setUsers(updated);
  };

  // const addCategory = async (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => {
  //   debugger
  //   await insertCategory(category);
  //   const updated = await fetchCategories();
  //   setCategories(updated);
  // };

  const addCategory = async (category: Omit<Category, 'id' | 'createdat' | 'updatedat'>) => {
    debugger
    try {
      setInventoryItems(inventoryData.status === 'fulfilled' ? inventoryData.value : []);
      setRequests(requestsData.status === 'fulfilled' ? requestsData.value : []);
      setUsers(usersData.status === 'fulfilled' ? usersData.value : []);
      setCategories(categoriesData.status === 'fulfilled' ? categoriesData.value : []);
      console.warn('Some data could not be loaded:', error);
      console.error('Error inserting category:', error);
      throw error; // propagate back to handler
    }
  };
  

  const updateCategory = async (id: string, category: Partial<Category>) => {
    await updateCategoryById(id, category);
    const updated = await fetchCategories();
    setCategories(updated);
  };

  const deleteCategory = async (id: string) => {
    await deleteCategoryById(id);
    const updated = await fetchCategories();
    setCategories(updated);
  };

  return (
    <InventoryContext.Provider value={{
      inventoryItems,
      requests,
      users,
      categories,
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
      deleteCategory
    }}>
      {children}
    </InventoryContext.Provider>
  );
};
