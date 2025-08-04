// import React, { useState } from 'react';
// import { useInventory } from '../../contexts/InventoryContext';
// import { useAuth } from '../../contexts/AuthContext';
// import { Save, X, } from 'lucide-react';

// const UpdateInventory: React.FC = () => {
//   const { addInventoryItem, updateInventoryItem } = useInventory();
//   const { user } = useAuth();

//   const [showAddModal, setShowAddModal] = useState(false);
//   const [editingCategory, setEditingCategory] = useState<any>(null);
  
//   const [formData, setFormData] = useState({
//     uniqueid: '',
//     financialyear: '2024-25',
//     dateofinvoice: null as Date | null,
//     dateofentry: new Date(),
//     invoicenumber: '',
//     assetcategory: '',
//     assetcategoryid:"",
//     assetname: '',
//     specification: '',
//     makemodel: '',
//     productserialnumber: '',
//     vendorname: '',
//     quantityperitem: 1,
//     rateinclusivetax: 0,
//     totalcost: 0,
//     locationofitem: '',
//     issuedto: '',
//     dateofissue: null as Date | null,
//     expectedreturndate: null as Date | null,
//     balancequantityinstock: 0,
//     description: '',
//     unitofmeasurement: 'Pieces',
//     depreciationmethod: '',
//     warrantyinformation: '',
//     maintenanceschedule: '',
//     conditionofasset: 'excellent' as const,
//     status: 'available' as const,
//     minimumstocklevel: 5,
//     purchaseordernumber: '',
//     expectedlifespan: '',
//     assettag: '',
//   });


  

//   const handleUpdateCategory = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (editingCategory) {
//       updateInventoryItem(editingCategory.id, formData);
//       setEditingCategory(null);
//       setFormData({
//         uniqueid: '',
//         financialyear: '2024-25',
//         dateofinvoice: null as Date | null,
//         dateofentry: new Date(),
//         invoicenumber: '',
//         assetcategory: '',
//         assetcategoryid:"",
//         assetname: '',
//         specification: '',
//         makemodel: '',
//         productserialnumber: '',
//         vendorname: '',
//         quantityperitem: 1,
//         rateinclusivetax: 0,
//         totalcost: 0,
//         locationofitem: '',
//         issuedto: '',
//         dateofissue: null as Date | null,
//         expectedreturndate: null as Date | null,
//         balancequantityinstock: 0,
//         description: '',
//         unitofmeasurement: 'Pieces',
//         depreciationmethod: '',
//         warrantyinformation: '',
//         maintenanceschedule: '',
//         conditionofasset: 'excellent' as const,
//         status: 'available' as const,
//         minimumstocklevel: 5,
//         purchaseordernumber: '',
//         expectedlifespan: '',
//         assettag: '',
//       });
//       setShowAddModal(false);
//     }
//   };



  
//   const handleAddCategory = async (e: React.FormEvent) => {
//     debugger
//     e.preventDefault();
//     try {
//       debugger;
//       await addInventoryItem({
//         ...formData,
//         createdBy: user?.id || 'unknown'
//       });
//       setFormData({
//         uniqueid: '',
//         financialyear: '2024-25',
//         dateofinvoice: null as Date | null,
//         dateofentry: new Date(),
//         invoicenumber: '',
//         assetcategory: '',
//         assetcategoryid:"",
//         assetname: '',
//         specification: '',
//         makemodel: '',
//         productserialnumber: '',
//         vendorname: '',
//         quantityperitem: 1,
//         rateinclusivetax: 0,
//         totalcost: 0,
//         locationofitem: '',
//         issuedto: '',
//         dateofissue: null as Date | null,
//         expectedreturndate: null as Date | null,
//         balancequantityinstock: 0,
//         description: '',
//         unitofmeasurement: 'Pieces',
//         depreciationmethod: '',
//         warrantyinformation: '',
//         maintenanceschedule: '',
//         conditionofasset: 'excellent' as const,
//         status: 'available' as const,
//         minimumstocklevel: 5,
//         purchaseordernumber: '',
//         expectedlifespan: '',
//         assettag: '',
//       });
//       setShowAddModal(false);
//     } catch (err) {
//       console.error('Failed to add category:', err);
//       // Optional: show toast or error message
//     }
//   };
  

  

  

//   return (
//     <div className="space-y-6">
     
     
//   {/* Add/Edit Category Modal */}

//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
//           <div className="w-full max-w-lg p-6 bg-white rounded-2xl">
//             <h3 className="mb-4 text-lg font-semibold text-gray-900">
//               {editingCategory ? 'Edit Inventory Assest' : 'Add New Inventory Assest '}
//             </h3>
            
//             <form onSubmit={editingCategory ? handleUpdateCategory : handleAddCategory} className="space-y-4">
//               <div>
//                 <label className="block mb-1 text-sm font-medium text-gray-700">Assest Name *</label>
//                 <input
//                   type="text"
//                   value={formData.assetname}
//                   onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
//                   required
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   placeholder="e.g., Computer Mouse"
//                 />
//               </div>

//               <div>
//                 <label className="block mb-1 text-sm font-medium text-gray-700"> Assest Category Type *</label>
//                 <select
//                   value={formData.type}
//                   onChange={(e:any) => setFormData((prev:any) => ({ ...prev, type: e.target.value as 'tangible' | 'intangible' }))}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 >
//                   <option value="tangible">Tangible (Physical Items)</option>
//                   <option value="intangible">Intangible (Digital/Virtual Items)</option>
//                 </select>
//               </div>

//               <div>
//                 <label className="block mb-1 text-sm font-medium text-gray-700">Description</label>
//                 <textarea
//                   value={formData.description}
//                   onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
//                   rows={3}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   placeholder="Brief description of this category..."
//                 />
//               </div>

//               <div className="flex items-center">
//                 <input
//                   type="checkbox"
//                   id="isActive"
//                   // checked={formData.isActive}
//                   // onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
//                   className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
//                 />
//                 <label htmlFor="isActive" className="block ml-2 text-sm text-gray-900">
//                   Active Category
//                 </label>
//               </div>

//               <div className="flex items-center justify-end pt-4 space-x-3">
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setShowAddModal(false);
//                     setEditingCategory(null);
//                     // setFormData({
//                     //   name: '',
//                     //   type: 'tangible',
//                     //   description: '',
//                     //   isActive: true
//                     // });
//                   }}
//                   className="flex items-center px-4 py-2 space-x-2 text-gray-700 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
//                 >
//                   <X size={16} />
//                   <span>Cancel</span>
//                 </button>
//                 <button
//                   type="submit"
//                   className="flex items-center px-4 py-2 space-x-2 text-white transition-all duration-200 rounded-lg shadow-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 hover:shadow-xl"
//                 >
//                   <Save size={16} />
//                   <span>{editingCategory ? 'Update' : 'Add'}  Inventory Assest</span>
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>


      
      
//     </div>
//   );
// };

// export default UpdateInventory;




import React, { useState } from 'react';
import { Save, X } from 'lucide-react';

interface UpdateInventoryProps {
  handleAddCategory: (formData: any) => Promise<void>;
  handleUpdateCategory: (id: string, formData: any) => Promise<void>;
  editingCategory?: any; // optional: item being edited
  onClose: () => void;
}

const UpdateInventory: React.FC<UpdateInventoryProps> = ({
  handleAddCategory,
  handleUpdateCategory,
  editingCategory,
  onClose
}) => {
  const now = new Date();

  const [formData, setFormData] = useState({
    uniqueid: '',
    financialyear: '2024-25',
    dateofinvoice: null as Date | null,
    dateofentry: now,
    invoicenumber: '',
    assetcategory: '',
    assetcategoryid: '',
    assetname: '',
    specification: '',
    makemodel: '',
    productserialnumber: '',
    vendorname: '',
    quantityperitem: 1,
    rateinclusivetax: 0,
    totalcost: 0,
    locationofitem: '',
    issuedto: '',
    dateofissue: null as Date | null,
    expectedreturndate: null as Date | null,
    balancequantityinstock: 0,
    description: '',
    unitofmeasurement: 'Pieces',
    depreciationmethod: '',
    warrantyinformation: '',
    maintenanceschedule: '',
    conditionofasset: 'excellent' as const,
    status: 'available' as const,
    minimumstocklevel: 5,
    purchaseordernumber: '',
    expectedlifespan: '',
    assettag: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCategory) {
      await handleUpdateCategory(editingCategory.id, formData);
    } else {
      await handleAddCategory(formData);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="w-full max-w-lg p-6 bg-white rounded-2xl">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          {editingCategory ? 'Edit Inventory Asset' : 'Add New Inventory Asset'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Asset Name *</label>
            <input
              type="text"
              value={formData.assetname}
              onChange={(e) => setFormData(prev => ({ ...prev, assetname: e.target.value }))}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="e.g., Computer Mouse"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="Brief description..."
            />
          </div>

          <div className="flex items-center justify-end pt-4 space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center px-4 py-2 text-gray-700 border border-gray-300 rounded-lg"
            >
              <X size={16} />
              <span>Cancel</span>
            </button>
            <button
              type="submit"
              className="flex items-center px-4 py-2 text-white rounded-lg bg-gradient-to-r from-blue-500 to-purple-600"
            >
              <Save size={16} />
              <span>{editingCategory ? 'Update' : 'Add'} Inventory</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateInventory;
