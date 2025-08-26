// // components/ViewInventory.tsx

// import React from 'react';
// import { X, Edit } from 'lucide-react';

// interface ViewInventoryProps {
//   viewingCategory: any;
//   onClose: () => void;
//   onEdit: (category: any) => void;
// }

// const ViewInventory: React.FC<ViewInventoryProps> = ({ viewingCategory, onClose, onEdit }) => {
//   if (!viewingCategory) return null;

//   // Helper function to safely format dates
//   const formatDate = (dateValue: any, includeTime: boolean = false): string => {
//     if (!dateValue) return '—';
//     try {
//       const date = new Date(dateValue);
//       if (isNaN(date.getTime())) return '—';
//       return includeTime ? date.toLocaleString() : date.toLocaleDateString();
//     } catch (e) {
//       console.error('Date formatting error:', e, dateValue);
//       return '—';
//     }
//   };

//   // Parse attachments if they come as a JSON string from the database
//   let attachments = viewingCategory.attachments;
//   if (typeof attachments === 'string') {
//     try {
//       attachments = JSON.parse(attachments);
//     } catch (e) {
//       console.error('Failed to parse attachments:', e);
//       attachments = [];
//     }
//   }

//   // Create a processed viewing object
//   const processedCategory = {
//     ...viewingCategory,
//     attachments: attachments
//   };

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black bg-opacity-50">
//       <div className="w-full max-w-6xl max-h-[90vh] overflow-y-auto p-8 bg-white rounded-2xl shadow-xl">
//         <div className="flex items-center justify-between mb-6">
//           <h3 className="text-2xl font-semibold text-gray-900">Inventory Asset Details</h3>
//           <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
//             <X size={24} />
//           </button>
//         </div>

//         <div className="grid grid-cols-1 gap-6 text-sm text-gray-800 md:grid-cols-3">
//   {[
//     { label: 'Asset Name', value: processedCategory.assetname },
//     { label: 'Asset Category', value: processedCategory.assetcategory },
//     { label: 'Invoice Number', value: processedCategory.invoicenumber },
//     { label: 'Specification', value: processedCategory.specification },
//     { label: 'Make/Model', value: processedCategory.makemodel },
//     { label: 'Serial Number', value: processedCategory.productserialnumber },
//     { label: 'Location', value: processedCategory.locationofitem },
//     { label: 'Vendor', value: processedCategory.vendorname },
//     { label: 'Status', value: processedCategory.status, capitalize: true },
//     { label: 'Condition', value: processedCategory.conditionofasset, capitalize: true },
//     { label: 'Quantity In Stock', value: processedCategory.balancequantityinstock },
//     { label: 'Unit', value: processedCategory.unitofmeasurement },
//     { label: 'Description', value: processedCategory.description },
//     { label: 'Purchase Order #', value: processedCategory.purchaseordernumber },
//     { label: 'Expected Lifespan', value: processedCategory.expectedlifespan },
//     { label: 'Warranty Information', value: processedCategory.warrantyinformation },
//     { label: 'Depreciation Method', value: processedCategory.depreciationmethod },
//     { label: 'Maintenance Schedule', value: processedCategory.maintenanceschedule },
//     { label: 'Minimum Stock Level', value: processedCategory.minimumstocklevel },
//     { label: 'Date of Issue', value: formatDate(processedCategory.dateofissue) },
//     { label: 'Issued To', value: processedCategory.issuedto },
//     { label: 'Expected Return Date', value: formatDate(processedCategory.expectedreturndate) },
//     { label: 'Created At', value: formatDate(processedCategory.createdat, true) },
//     { label: 'Last Updated', value: formatDate(processedCategory.lastmodifieddate, true) },
//     { label: 'Asset ID', value: processedCategory.id, isMono: true },
//     { label: 'Unique ID', value: processedCategory.uniqueid },
//     { label: 'Financial Year', value: processedCategory.financialyear },
//     { label: 'Date of Invoice', value: formatDate(processedCategory.dateofinvoice) },
//     { label: 'Date of Entry', value: formatDate(processedCategory.dateofentry, true) },
//     { label: 'Quantity Per Item', value: processedCategory.quantityperitem },
//     { label: 'Rate (Inclusive Tax)', value: processedCategory.rateinclusivetax },
//     { label: 'Total Cost', value: processedCategory.totalcost },
//     { label: 'Asset Tag', value: processedCategory.assettag },
//     { label: 'Modified By (User ID)', value: processedCategory.lastmodifiedby },
//   ].map((field, index) => (
//     <div key={index} className="break-words">
//       <label className="block mb-1 font-medium">{field.label}</label>
//       <p
//     className={`min-h-[48px] p-3 bg-gray-100 rounded-lg ${
//       field.capitalize ? 'capitalize' : ''
//     } ${field.isMono ? 'font-mono' : ''}`}
//   >
//     {field.value ?? '—'}
//   </p>
//     </div>
//   ))}

// {/* Debug: Show attachments data structure */}
// {(() => {
//   console.log('Attachments data:', processedCategory.attachments);
//   return null;
// })()}

// {/* Attachments Section */}
// {processedCategory.attachments && Array.isArray(processedCategory.attachments) && processedCategory.attachments.length > 0 ? (
//   <div className="col-span-full">
//     <label className="block mb-3 text-sm font-medium text-gray-700">Attachments</label>
//     <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
//       {processedCategory.attachments.map((file: any, index: number) => {
//         // Handle both File objects and URL objects
//         const isFileObject = file instanceof File;
//         const fileUrl = isFileObject ? URL.createObjectURL(file) : (file.url || file);
//         const fileName = isFileObject ? file.name : (file.name || `Attachment ${index + 1}`);
        
//         return (
//           <div key={index} className="p-4 space-y-3 border border-gray-200 rounded-lg bg-gray-50">
//             {/* Image Preview */}
//             <div className="relative overflow-hidden bg-white border border-gray-200 rounded-lg aspect-square">
//               <img
//                 src={fileUrl}
//                 alt={fileName}
//                 className="object-cover w-full h-full transition-transform hover:scale-105"
//                 onError={(e) => {
//                   // Fallback to file icon if image fails to load
//                   const target = e.target as HTMLImageElement;
//                   target.style.display = 'none';
//                   const parent = target.parentElement;
//                   if (parent) {
//                     parent.innerHTML = `
//                       <div class="w-full h-full flex items-center justify-center bg-gray-100">
//                         <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
//                         </svg>
//                       </div>
//                     `;
//                   }
//                 }}
//               />
//             </div>
            
//             {/* File Info */}
//             <div className="space-y-2">
//               <p className="text-sm font-medium text-gray-900 truncate" title={fileName}>
//                 {fileName}
//               </p>
              
//               {/* Action Buttons */}
//               <div className="flex space-x-2">
//                 <a
//                   href={fileUrl}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="flex-1 px-3 py-2 text-xs font-medium text-center text-blue-600 transition-colors border border-blue-200 rounded-lg hover:bg-blue-50"
//                 >
//                   View
//                 </a>
//                 <button
//                   onClick={async () => {
//                     try {
//                       const response = await fetch(fileUrl);
//                       const blob = await response.blob();
//                       const url = window.URL.createObjectURL(blob);

//                       const a = document.createElement('a');
//                       a.href = url;
//                       a.download = fileName;
//                       document.body.appendChild(a);
//                       a.click();
//                       a.remove();
//                       window.URL.revokeObjectURL(url);
//                     } catch (err) {
//                       alert('Failed to download file.');
//                       console.error('Download error:', err);
//                     }
//                   }}
//                   className="flex-1 px-3 py-2 text-xs font-medium text-center text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
//                 >
//                   Download
//                 </button>
//               </div>
//             </div>
//           </div>
//         );
//       })}
//     </div>
//   </div>
// ) : (
//   <div className="col-span-full">
//     <label className="block mb-3 text-sm font-medium text-gray-700">Attachments</label>
//     <div className="p-4 text-center border border-gray-200 rounded-lg bg-gray-50">
//       <p className="text-sm text-gray-500">No attachments available</p>
//       {processedCategory.attachments && (
//         <p className="mt-1 text-xs text-gray-400">
//           Data type: {typeof processedCategory.attachments}, 
//           Is Array: {Array.isArray(processedCategory.attachments)}, 
//           Length: {processedCategory.attachments?.length || 'N/A'}
//         </p>
//       )}
//     </div>
//   </div>
// )}




// </div>


//         <div className="flex justify-end gap-3 pt-4 mt-8 border-t">
//           <button
//             onClick={() => {
//               onClose();
//               onEdit(viewingCategory);
//             }}
//             className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700"
//           >
//             <Edit size={16} className="inline mr-1" />
//             Edit Asset
//           </button>
//           <button
//             onClick={onClose}
//             className="px-4 py-2 text-gray-700 border rounded-lg hover:bg-gray-100"
//           >
//             Close
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ViewInventory;






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

  // Helper function to safely format dates
  const formatDate = (dateValue: any, includeTime: boolean = false): string => {
    if (!dateValue) return '—';
    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) return '—';
      return includeTime ? date.toLocaleString() : date.toLocaleDateString();
    } catch (e) {
      console.error('Date formatting error:', e, dateValue);
      return '—';
    }
  };

  // Parse attachments if they come as a JSON string from the database
  let attachments = viewingCategory.attachments;
  if (typeof attachments === 'string') {
    try {
      attachments = JSON.parse(attachments);
    } catch (e) {
      console.error('Failed to parse attachments:', e);
      attachments = [];
    }
  }

  // Create a processed viewing object
  const processedCategory = {
    ...viewingCategory,
    attachments,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black bg-opacity-50">
      <div className="w-full max-w-6xl max-h-[90vh] overflow-y-auto p-8 bg-white rounded-2xl shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-semibold text-gray-900">Inventory Asset Details</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 text-sm text-gray-800 md:grid-cols-3">
          {[
            { label: 'Asset Name', value: processedCategory.assetname },
            { label: 'Asset Category', value: processedCategory.assetcategory },
            { label: 'Invoice Number', value: processedCategory.invoicenumber },
            { label: 'Specification', value: processedCategory.specification },
            { label: 'Make/Model', value: processedCategory.makemodel },
            { label: 'Serial Number', value: processedCategory.productserialnumber },
            { label: 'Location', value: processedCategory.locationofitem },
            { label: 'Vendor', value: processedCategory.vendorname },
            { label: 'Status', value: processedCategory.status, capitalize: true },
            { label: 'Condition', value: processedCategory.conditionofasset, capitalize: true },
            { label: 'Quantity In Stock', value: processedCategory.balancequantityinstock },
            { label: 'Unit', value: processedCategory.unitofmeasurement },
            { label: 'Description', value: processedCategory.description },
            { label: 'Purchase Order #', value: processedCategory.purchaseordernumber },
            { label: 'Expected Lifespan', value: processedCategory.expectedlifespan },
            { label: 'Warranty Information', value: processedCategory.warrantyinformation },
            { label: 'Depreciation Method', value: processedCategory.depreciationmethod },
            { label: 'Maintenance Schedule', value: processedCategory.maintenanceschedule },
            { label: 'Minimum Stock Level', value: processedCategory.minimumstocklevel },
            { label: 'Date of Issue', value: formatDate(processedCategory.dateofissue) },
            { label: 'Issued To', value: processedCategory.issuedto },
            { label: 'Expected Return Date', value: formatDate(processedCategory.expectedreturndate) },
            { label: 'Created At', value: formatDate(processedCategory.createdat, true) },
            { label: 'Last Updated', value: formatDate(processedCategory.lastmodifieddate, true) },
            { label: 'Asset ID', value: processedCategory.id, isMono: true },
            { label: 'Unique ID', value: processedCategory.uniqueid },
            { label: 'Financial Year', value: processedCategory.financialyear },
            { label: 'Date of Invoice', value: formatDate(processedCategory.dateofinvoice) },
            { label: 'Date of Entry', value: formatDate(processedCategory.dateofentry, true) },
            { label: 'Quantity Per Item', value: processedCategory.quantityperitem },
            { label: 'Rate (Inclusive Tax)', value: processedCategory.rateinclusivetax },
            { label: 'Total Cost', value: processedCategory.totalcost },
            { label: 'Asset Tag', value: processedCategory.assettag },
            { label: 'Modified By (User ID)', value: processedCategory.lastmodifiedby },
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

          {/* Attachments Section */}
          {processedCategory.attachments && Array.isArray(processedCategory.attachments) && processedCategory.attachments.length > 0 ? (
  <div className="col-span-full">
    <label className="block mb-3 text-sm font-medium text-gray-700">Attachments</label>
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {processedCategory.attachments.map((file: any, index: number) => {
        const isFileObject = file instanceof File;
        const fileName = isFileObject ? file.name : file.name || `Attachment ${index + 1}`;

        // Determine URL: if it's a File object, use URL.createObjectURL
        // Otherwise, use the provided URL (public) or a signed URL (private)
        const fileUrl = isFileObject ? URL.createObjectURL(file) : (file.url || file.signedUrl || file);

        return (
          <div key={index} className="p-4 space-y-3 border border-gray-200 rounded-lg bg-gray-50">
            {/* Image Preview */}
            <div className="relative overflow-hidden bg-white border border-gray-200 rounded-lg aspect-square">
              <img
                src={fileUrl}
                alt={fileName}
                className="object-cover w-full h-full transition-transform hover:scale-105"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = `
                      <div class="w-full h-full flex items-center justify-center bg-gray-100">
                        <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                      </div>
                    `;
                  }
                }}
              />
            </div>

            {/* File Info */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-900 truncate" title={fileName}>
                {fileName}
              </p>

              <div className="flex space-x-2">
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-3 py-2 text-xs font-medium text-center text-blue-600 transition-colors border border-blue-200 rounded-lg hover:bg-blue-50"
                >
                  View
                </a>

                <button
                  onClick={() => {
                    const a = document.createElement('a');
                    a.href = fileUrl;
                    a.download = fileName;
                    a.target = '_blank';
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                  }}
                  className="flex-1 px-3 py-2 text-xs font-medium text-center text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Download
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  </div>
) : (
  <div className="col-span-full">
    <label className="block mb-3 text-sm font-medium text-gray-700">Attachments</label>
    <div className="p-4 text-center border border-gray-200 rounded-lg bg-gray-50">
      <p className="text-sm text-gray-500">No attachments available</p>
    </div>
  </div>
)}

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
