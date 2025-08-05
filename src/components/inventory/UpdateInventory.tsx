import React from 'react';
import { Save, X } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

interface InventoryAssetFormModalProps {
  showAddModal: boolean;
  editingCategory: any;
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  handleAddCategory: (e: React.FormEvent<HTMLFormElement>) => void;
  handleUpdateCategory: (e: React.FormEvent<HTMLFormElement>) => void;
  setShowAddModal: (show: boolean) => void;
  setEditingCategory: (category: any) => void;
}

const UpdateInventory: React.FC<InventoryAssetFormModalProps> = ({
  showAddModal,
  editingCategory,
  formData,
  setFormData,
  handleAddCategory,
  handleUpdateCategory,
  setShowAddModal,
  setEditingCategory,
}) => {
  const [users, setUsers] = React.useState<any[]>([]);
  const [usersError, setUsersError] = React.useState<any>(null);

  React.useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from('users') // your users table name
        .select('*');
      if (error) {
        setUsersError(error);
        console.error('Error fetching users:', error);
      } else {
        setUsers(data || []);
        console.log('All users:', data);
      }
    };
    fetchUsers();
  }, []);

  if (!showAddModal) return null;
  const fields: { label: string; name: keyof typeof formData; type?: string }[] = [
    { label: 'Unique ID', name: 'uniqueid' },
    { label: 'Financial Year', name: 'financialyear' },
    { label: 'Date of Invoice', name: 'dateofinvoice', type: 'date' },
    { label: 'Date of Entry', name: 'dateofentry', type: 'date' },
    { label: 'Invoice Number', name: 'invoicenumber' },
    { label: 'Asset Category', name: 'assetcategory' },
    { label: 'Asset Category ID', name: 'assetcategoryid' },
    { label: 'Asset Name', name: 'assetname' },
    { label: 'Asset Tag', name: 'assettag' },
    { label: 'Specification', name: 'specification' },
    { label: 'Make/Model', name: 'makemodel' },
    { label: 'Product Serial Number', name: 'productserialnumber' },
    { label: 'Vendor Name', name: 'vendorname' },
    { label: 'Quantity Per Item', name: 'quantityperitem' },
    { label: 'Rate Inclusive Tax', name: 'rateinclusivetax' },
    { label: 'Total Cost', name: 'totalcost' },
    { label: 'Location of Item', name: 'locationofitem' },
    { label: 'Balance Quantity In Stock', name: 'balancequantityinstock' },
    { label: 'Description', name: 'description' },
    { label: 'Unit of Measurement', name: 'unitofmeasurement' },
    { label: 'Condition of Asset', name: 'conditionofasset' },
    { label: 'Status', name: 'status' },
    { label: 'Minimum Stock Level', name: 'minimumstocklevel' },
    { label: 'Depreciation Method', name: 'depreciationmethod' },
    { label: 'Warranty Information', name: 'warrantyinformation' },
    { label: 'Maintenance Schedule', name: 'maintenanceschedule' },
    { label: 'Purchase Order Number', name: 'purchaseordernumber' },
    { label: 'Expected Lifespan', name: 'expectedlifespan' },
    { label: 'Expected Return Date', name: 'expectedreturndate', type: 'date' },
    { label: 'Date of Issue', name: 'dateofissue', type: 'date' },
    { label: 'Issued To', name: 'issuedto' },
    { label: 'Last Modified By', name: 'lastmodifiedby' },
    { label: 'Last Modified Date', name: 'lastmodifieddate', type: 'datetime-local' },
    { label: 'Created At', name: 'createdat', type: 'datetime-local' },
  ];

  // console.log('Form Data:', formData.dateofentry);
  // const dateOfEntryField = fields.find(f => f.name === 'dateofentry');
  // console.log('fields Data:', dateOfEntryField);


formData.attachments?.filter(att => att.isNew).forEach(async (att) => {
  await supabase.storage.from('your-bucket').upload(`path/${att.name}`, att.file);
});


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black bg-opacity-50">
      <div className="w-full max-w-6xl max-h-[90vh] overflow-y-auto p-8 bg-white rounded-2xl shadow-xl">
        <h3 className="mb-6 text-2xl font-semibold text-gray-900">
          {editingCategory ? 'Edit Inventory Asset' : 'Add New Inventory Asset'}
        </h3>

        <form
          onSubmit={editingCategory ? handleUpdateCategory : handleAddCategory}
          className="grid grid-cols-1 gap-6 md:grid-cols-3"
        >


          {fields.map((field, index) => {
            let value = formData[field.name] || '';



            // Special logic for lastmodifiedby
            if (field.name === 'lastmodifiedby') {
              const user = users.find((u) => u.id === value);
              value = user ? user.name : value; // fallback to ID if no name found
            }

            if (field.type === 'date' && value) {
              value = value.slice(0, 10);
            }

            if (field.type === 'datetime-local' && value) {
              value = new Date(value).toISOString().slice(0, 16);
            }

            return (
              <div key={index} className="mb-4">
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  {field.label}
                </label>
                <input
                  type={field.type || 'text'}
                  value={value}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, [field.name]: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            );
          })}

          {/* Attachments */}
         {/* Attachments */}
<div className="md:col-span-3">
  <label className="block mb-1 text-sm font-medium text-gray-700">Attachments</label>
  <input
    type="file"
    multiple
    onChange={(e) => {
      const files = e.target.files;
      if (!files) return;
      const newAttachments = Array.from(files).map((file) => ({
        name: file.name,
        file,
        url: URL.createObjectURL(file),
        isNew: true, // differentiate new files
      }));
      setFormData((prev: any) => ({
        ...prev,
        attachments: [...(prev.attachments || []), ...newAttachments],
      }));
    }}
    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
  />

  {/* Show file list with delete */}
  <div className="mt-2 space-y-2">
    {(formData.attachments || []).map((file: any, index: number) => (
      <div key={index} className="flex items-center justify-between text-sm text-gray-700">
        {file.url ? (
          <a href={file.url} download={file.name} className="underline text-blue-600">
            {file.name}
          </a>
        ) : (
          <span>{file.name}</span>
        )}
        <button
          type="button"
          onClick={() => {
            const updated = [...formData.attachments];
            updated.splice(index, 1);
            setFormData((prev: any) => ({ ...prev, attachments: updated }));
          }}
          className="ml-2 text-red-500 hover:text-red-700"
        >
          Delete
        </button>
      </div>
    ))}
  </div>
</div>

          {/* Created By */}

          {/* Is Active */}
          <div className="flex items-center mt-2 md:col-span-3">
            <input
              type="checkbox"
              id="isActive"
              checked={formData?.isActive || false}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, isActive: e.target.checked }))
              }
              className="w-4 h-4 text-blue-600 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 text-sm text-gray-900">
              Active Asset
            </label>
          </div>

          {/* Buttons */}
          <div className="flex justify-end pt-4 space-x-3 md:col-span-3">
            <button
              type="button"
              onClick={() => {
                setShowAddModal(false);
                setEditingCategory(null);
              }}
              className="flex items-center px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100"
            >
              <X size={16} className="mr-1" />
              Cancel
            </button>

            <button
              type="submit"
              className="flex items-center px-4 py-2 space-x-2 text-white transition-all duration-200 rounded-lg shadow-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 hover:shadow-xl"
            >
              <Save size={16} className="mr-1" />
              {editingCategory ? 'Update' : 'Add'} Inventory Asset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateInventory;
