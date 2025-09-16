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
//     { label: 'Asset Tag', value: processedCategory.annualmanagementcharge },
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
import { X, Edit, Package, Calendar, DollarSign, MapPin, Tag, User, FileText, Image, Download, Eye, Building, Wrench, Clock, AlertCircle } from 'lucide-react';

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

  // Helper function to get status color
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'disposed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  // Helper function to get condition color
  const getConditionColor = (condition: string) => {
    switch (condition?.toLowerCase()) {
      case 'excellent': return 'bg-green-100 text-green-800 border-green-200';
      case 'good': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'fair': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'poor': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-sm">
      <div className="w-full max-w-7xl max-h-[95vh] overflow-hidden bg-white rounded-3xl shadow-2xl border border-gray-100">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-[#0d559e] to-[#1a6bb8] px-8 py-6 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white bg-opacity-20 rounded-xl">
                <Package className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Asset Details</h2>
                <p className="text-blue-100 text-sm">Complete inventory information</p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-3 text-white hover:bg-white hover:bg-opacity-20 rounded-xl transition-all duration-200"
            >
              <X size={24} className="text-red-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(95vh-120px)] p-8">
          {/* Asset Overview Card */}
          <div className="mb-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{processedCategory.assetname || 'Unnamed Asset'}</h3>
                <p className="text-gray-600 text-sm">{processedCategory.specification || 'No specification available'}</p>
              </div>
              <div className="flex space-x-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(processedCategory.status)}`}>
                  {processedCategory.status || 'Unknown'}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getConditionColor(processedCategory.conditionofasset)}`}>
                  {processedCategory.conditionofasset || 'Unknown'}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Tag className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">ID:</span>
                <span className="font-mono font-medium">{processedCategory.uniqueid || '—'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Building className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">Category:</span>
                <span className="font-medium">{processedCategory.assetcategory || '—'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">Location:</span>
                <span className="font-medium">{processedCategory.locationofitem || '—'}</span>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Basic Information */}
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <h4 className="text-lg font-semibold text-gray-900">Basic Information</h4>
                </div>
                <div className="space-y-4">
                  {[
                    { label: 'Make/Model', value: processedCategory.makemodel, icon: Package },
                    { label: 'Serial Number', value: processedCategory.productserialnumber, icon: Tag },
                    { label: 'Invoice Number', value: processedCategory.invoicenumber, icon: FileText },
                    { label: 'Purchase Order #', value: processedCategory.purchaseordernumber, icon: FileText },
                    { label: 'Financial Year', value: processedCategory.financialyear, icon: Calendar },
                    { label: 'Annual Management Charge (AMS)', value: processedCategory.annualmanagementcharge ? `₹${processedCategory.annualmanagementcharge}` : 'Not set', icon: DollarSign },
                  ].map((field, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <field.icon className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700">{field.label}</label>
                        <p className="text-sm text-gray-900 font-mono">{field.value || '—'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Information */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <h4 className="text-lg font-semibold text-gray-900">Financial Information</h4>
                </div>
                <div className="space-y-4">
                  {[
                    { label: 'Rate (Inclusive Tax)', value: processedCategory.rateinclusivetax, prefix: '₹' },
                    { label: 'Total Cost', value: processedCategory.totalcost, prefix: '₹' },
                    { label: 'Quantity Per Item', value: processedCategory.quantityperitem },
                    { label: 'Quantity In Stock', value: processedCategory.balancequantityinstock },
                    { label: 'Unit of Measurement', value: processedCategory.unitofmeasurement },
                    { label: 'Minimum Stock Level', value: processedCategory.minimumstocklevel },
                  ].map((field, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <DollarSign className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700">{field.label}</label>
                        <p className="text-sm text-gray-900 font-medium">
                          {field.prefix}{field.value || '—'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Additional Information */}
            <div className="space-y-6">
              {/* Vendor & Location */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Building className="w-5 h-5 text-purple-600" />
                  <h4 className="text-lg font-semibold text-gray-900">Vendor & Location</h4>
                </div>
                <div className="space-y-4">
                  {[
                    { label: 'Vendor Name', value: processedCategory.vendorname, icon: Building },
                    { label: 'Location of Item', value: processedCategory.locationofitem, icon: MapPin },
                    { label: 'Issued To', value: processedCategory.issuedto, icon: User },
                  ].map((field, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <field.icon className="w-4 h-4 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700">{field.label}</label>
                        <p className="text-sm text-gray-900">{field.value || '—'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dates & Timeline */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Calendar className="w-5 h-5 text-orange-600" />
                  <h4 className="text-lg font-semibold text-gray-900">Dates & Timeline</h4>
                </div>
                <div className="space-y-4">
                  {[
                    { label: 'Date of Invoice', value: formatDate(processedCategory.dateofinvoice), icon: Calendar },
                    { label: 'Date of Entry', value: formatDate(processedCategory.dateofentry, true), icon: Clock },
                    { label: 'Date of Issue', value: formatDate(processedCategory.dateofissue), icon: Calendar },
                    { label: 'Expected Return Date', value: formatDate(processedCategory.expectedreturndate), icon: Calendar },
                    { label: 'Created At', value: formatDate(processedCategory.createdat, true), icon: Clock },
                    { label: 'Last Updated', value: formatDate(processedCategory.lastmodifieddate, true), icon: Clock },
                  ].map((field, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <field.icon className="w-4 h-4 text-orange-600" />
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700">{field.label}</label>
                        <p className="text-sm text-gray-900">{field.value || '—'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Maintenance & Warranty */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Wrench className="w-5 h-5 text-indigo-600" />
                  <h4 className="text-lg font-semibold text-gray-900">Maintenance & Warranty</h4>
                </div>
                <div className="space-y-4">
                  {[
                     { label: 'Expected Lifespan', value: processedCategory.expectedlifespan },
                    { label: 'Warranty Information', value: processedCategory.warrantyinformation },
                    { label: 'Depreciation Method', value: processedCategory.depreciationmethod },
                    { label: 'Maintenance Schedule', value: processedCategory.maintenanceschedule },
                  ].map((field, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="p-2 bg-indigo-100 rounded-lg">
                        <Wrench className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700">{field.label}</label>
                        <p className="text-sm text-gray-900">{field.value || '—'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Description Section */}
          {processedCategory.description && (
            <div className="mt-8 bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <FileText className="w-5 h-5 text-gray-600" />
                <h4 className="text-lg font-semibold text-gray-900">Description</h4>
              </div>
              <p className="text-gray-700 leading-relaxed">{processedCategory.description}</p>
            </div>
          )}
<div className="mt-8 bg-white rounded-2xl border border-gray-200 p-6"></div>
          {/* Attachments Section */}
          {/* <div className="mt-8 bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Image className="w-5 h-5 text-pink-600" />
              <h4 className="text-lg font-semibold text-gray-900">Attachments</h4>
            </div>
            
            {processedCategory.attachments && Array.isArray(processedCategory.attachments) && processedCategory.attachments.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {processedCategory.attachments.map((file: any, index: number) => {
                  const isFileObject = file instanceof File;
                  const fileName = isFileObject ? file.name : file.name || `Attachment ${index + 1}`;
                  const fileUrl = isFileObject ? URL.createObjectURL(file) : (file.url || file.signedUrl || file);

                  return (
                    <div key={index} className="group bg-gray-50 rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200">
                      
                      <div className="relative aspect-square bg-white overflow-hidden">
                        <img
                          src={fileUrl}
                          alt={fileName}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
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

                    
                      <div className="p-4 space-y-3">
                        <p className="text-sm font-medium text-gray-900 truncate" title={fileName}>
                          {fileName}
                        </p>

                        <div className="flex space-x-2">
                          <a
                            href={fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-xs font-medium text-blue-600 transition-colors border border-blue-200 rounded-lg hover:bg-blue-50"
                          >
                            <Eye className="w-3 h-3" />
                            <span>View</span>
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
                            className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-xs font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
                          >
                            <Download className="w-3 h-3" />
                            <span>Download</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Image className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 text-sm">No attachments available</p>
              </div>
            )}
          </div> */}
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-8 py-6 rounded-b-3xl">
          <div className="flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                onEdit(viewingCategory);
              }}
              className="px-6 py-3 text-white bg-gradient-to-r from-green-500 to-green-600 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 font-medium flex items-center space-x-2 shadow-lg"
            >
              <Edit className="w-4 h-4" />
              <span>Edit Asset</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewInventory;
