// components/ViewInventory.tsx

import React from 'react';
import { X, Edit } from 'lucide-react';

interface ViewInventoryProps {
  viewingCategory: any;
  onClose: () => void;
  onEdit: (category: any) => void;
}

const ViewInventory: React.FC<ViewInventoryProps> = ({ viewingCategory, onClose, onEdit }) => {
  if (!viewingCategory) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black bg-opacity-50">
      <div className="w-full max-w-6xl max-h-[90vh] overflow-y-auto p-8 bg-white rounded-2xl shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-semibold text-gray-900">Inventory Asset Details</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-800">
  {[
    { label: 'Asset Name', value: viewingCategory.assetname },
    { label: 'Asset Category', value: viewingCategory.assetcategory },
    { label: 'Invoice Number', value: viewingCategory.invoicenumber },
    { label: 'Specification', value: viewingCategory.specification },
    { label: 'Make/Model', value: viewingCategory.makemodel },
    { label: 'Serial Number', value: viewingCategory.productserialnumber },
    { label: 'Location', value: viewingCategory.locationofitem },
    { label: 'Vendor', value: viewingCategory.vendorname },
    { label: 'Status', value: viewingCategory.status, capitalize: true },
    { label: 'Condition', value: viewingCategory.conditionofasset, capitalize: true },
    { label: 'Quantity In Stock', value: viewingCategory.balancequantityinstock },
    { label: 'Unit', value: viewingCategory.unitofmeasurement },
    { label: 'Description', value: viewingCategory.description },
    { label: 'Purchase Order #', value: viewingCategory.purchaseordernumber },
    { label: 'Expected Lifespan', value: viewingCategory.expectedlifespan },
    { label: 'Warranty Information', value: viewingCategory.warrantyinformation },
    { label: 'Depreciation Method', value: viewingCategory.depreciationmethod },
    { label: 'Maintenance Schedule', value: viewingCategory.maintenanceschedule },
    { label: 'Minimum Stock Level', value: viewingCategory.minimumstocklevel },
    { label: 'Date of Issue', value: viewingCategory.dateofissue },
    { label: 'Issued To', value: viewingCategory.issuedto },
    { label: 'Expected Return Date', value: viewingCategory.expectedreturndate ?? '—' },
    { label: 'Created At', value: new Date(viewingCategory.createdat).toLocaleString() },
    { label: 'Last Updated', value: new Date(viewingCategory.lastmodifieddate).toLocaleString() },
    { label: 'Asset ID', value: viewingCategory.id, isMono: true },
    { label: 'Unique ID', value: viewingCategory.uniqueid },
    { label: 'Financial Year', value: viewingCategory.financialyear },
    { label: 'Date of Invoice', value: viewingCategory.dateofinvoice },
    { label: 'Date of Entry', value: new Date(viewingCategory.dateofentry).toLocaleString() },
    { label: 'Quantity Per Item', value: viewingCategory.quantityperitem },
    { label: 'Rate (Inclusive Tax)', value: viewingCategory.rateinclusivetax },
    { label: 'Total Cost', value: viewingCategory.totalcost },
    { label: 'Asset Tag', value: viewingCategory.assettag },
    { label: 'Modified By (User ID)', value: viewingCategory.lastmodifiedby },
  ].map((field, index) => (
    <div key={index} className="break-words">
      <label className="block mb-1 font-medium">{field.label}</label>
      <p
    className={`min-h-[48px] p-3 bg-gray-100 rounded-lg ${
      field.capitalize ? 'capitalize' : ''
    } ${field.isMono ? 'font-mono' : ''}`}
  >
    {field.value ?? '—'}
  </p>
    </div>
  ))}

{Array.isArray(viewingCategory.attachments) &&
  viewingCategory.attachments.map((file: any, index: number) => (
    <div key={index} className="break-words">
      <label className="block mb-1 font-medium">Attachment</label>
      <div className="flex flex-col space-y-2">
        <img
          src={file.url}
          alt={file.name}
          className="w-20 h-20 object-cover border rounded"
        />
        <a
          href={file.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline break-all"
        >
          {file.name}
        </a>
        <button
          onClick={async () => {
            try {
              const response = await fetch(file.url);
              const blob = await response.blob();
              const url = window.URL.createObjectURL(blob);

              const a = document.createElement('a');
              a.href = url;
              a.download = file.name;
              document.body.appendChild(a);
              a.click();
              a.remove();
              window.URL.revokeObjectURL(url);
            } catch (err) {
              alert('Failed to download file.');
              console.error('Download error:', err);
            }
          }}
          className="inline-block w-fit px-3 py-1 mt-1 text-sm text-white bg-blue-600 rounded hover:bg-blue-700"
        >
          Download
        </button>
      </div>
    </div>
  ))}




</div>


        <div className="flex justify-end gap-3 pt-4 mt-8 border-t">
          <button
            onClick={() => {
              onClose();
              onEdit(viewingCategory);
            }}
            className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700"
          >
            <Edit size={16} className="inline mr-1" />
            Edit Asset
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border rounded-lg hover:bg-gray-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewInventory;
