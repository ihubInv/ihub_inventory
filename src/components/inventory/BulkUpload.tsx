import React, { useState, useRef } from 'react';
import { Upload, Download, AlertTriangle, CheckCircle, X, FileSpreadsheet, FileText, Info } from 'lucide-react';
import * as XLSX from 'xlsx';

interface BulkUploadProps {
  onUpload: (data: any[]) => Promise<void>;
  onClose: () => void;
}

interface UploadResult {
  success: boolean;
  message: string;
  errors?: string[];
  successCount?: number;
  totalCount?: number;
}

const BulkUpload: React.FC<BulkUploadProps> = ({ onUpload, onClose }) => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Expected headers for validation
  const expectedHeaders = [
    'uniqueid',
    'financialyear',
    'dateofinvoice',
    'invoicenumber',
    'assetcategory',
    'assetname',
    'specification',
    'makemodel',
    'productserialnumber',
    'vendorname',
    'quantityperitem',
    'rateinclusivetax',
    'totalcost',
    'locationofitem',
    'unitofmeasurement',
    'depreciationmethod',
    'expectedlifespan',
    'salvagevalue',
    'warrantyinformation',
    'maintenanceschedule',
    'conditionofasset',
    'status',
    'minimumstocklevel',
    'balancequantityinstock',
    'description'
  ];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (selectedFile: File) => {
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv' // .csv
    ];

    if (!validTypes.includes(selectedFile.type) && !selectedFile.name.endsWith('.csv')) {
      alert('Please select a valid Excel (.xlsx, .xls) or CSV file');
      return;
    }

    setFile(selectedFile);
    parseFile(selectedFile);
  };

  const parseFile = (file: File) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        let data: any[] = [];
        
        if (file.name.endsWith('.csv')) {
          // Parse CSV
          const text = e.target?.result as string;
          const lines = text.split('\n');
          const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
          
          for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim()) {
              const values = lines[i].split(',');
              const row: any = {};
              headers.forEach((header, index) => {
                row[header] = values[index]?.trim() || '';
              });
              data.push(row);
            }
          }
        } else {
          // Parse Excel
          const workbook = XLSX.read(e.target?.result, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          // Convert to object array
          if (data.length > 0) {
            const headers = data[0].map((h: any) => h.toString().toLowerCase().trim());
            const rows = data.slice(1);
            data = rows.map((row: any[]) => {
              const obj: any = {};
              headers.forEach((header: string, index: number) => {
                obj[header] = row[index] || '';
              });
              return obj;
            });
          }
        }

        // Validate headers
        const fileHeaders = Object.keys(data[0] || {});
        const missingHeaders = expectedHeaders.filter(h => !fileHeaders.includes(h));
        const extraHeaders = fileHeaders.filter(h => !expectedHeaders.includes(h));

        if (missingHeaders.length > 0) {
          setUploadResult({
            success: false,
            message: `Missing required headers: ${missingHeaders.join(', ')}`,
            errors: [`Please ensure all required columns are present in your file.`]
          });
          return;
        }

        setPreviewData(data.slice(0, 5)); // Show first 5 rows for preview
        setShowPreview(true);
        setUploadResult(null);
        
      } catch (error) {
        setUploadResult({
          success: false,
          message: 'Error parsing file',
          errors: ['Please check your file format and try again.']
        });
      }
    };

    if (file.name.endsWith('.csv')) {
      reader.readAsText(file);
    } else {
      reader.readAsBinaryString(file);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    try {
      // Re-parse the full file for upload
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          let data: any[] = [];
          
          if (file.name.endsWith('.csv')) {
            const text = e.target?.result as string;
            const lines = text.split('\n');
            const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
            
            for (let i = 1; i < lines.length; i++) {
              if (lines[i].trim()) {
                const values = lines[i].split(',');
                const row: any = {};
                headers.forEach((header, index) => {
                  row[header] = values[index]?.trim() || '';
                });
                data.push(row);
              }
            }
          } else {
            const workbook = XLSX.read(e.target?.result, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            
            if (rawData.length > 0) {
              const headers = rawData[0].map((h: any) => h.toString().toLowerCase().trim());
              const rows = rawData.slice(1);
              data = rows.map((row: any[]) => {
                const obj: any = {};
                headers.forEach((header: string, index: number) => {
                  obj[header] = row[index] || '';
                });
                return obj;
              });
            }
          }

          await onUpload(data);
          setUploadResult({
            success: true,
            message: 'Upload completed successfully!',
            successCount: data.length,
            totalCount: data.length
          });
          
        } catch (error) {
          setUploadResult({
            success: false,
            message: 'Upload failed',
            errors: [error instanceof Error ? error.message : 'Unknown error occurred']
          });
        } finally {
          setUploading(false);
        }
      };

      if (file.name.endsWith('.csv')) {
        reader.readAsText(file);
      } else {
        reader.readAsBinaryString(file);
      }
      
    } catch (error) {
      setUploadResult({
        success: false,
        message: 'Upload failed',
        errors: [error instanceof Error ? error.message : 'Unknown error occurred']
      });
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    const templateData = [
      expectedHeaders,
      [
        'ihub/2024-25/LAP/Workstation-1/001', // uniqueid
        '2024-25', // financialyear
        '2024-01-15', // dateofinvoice
        'INV-001', // invoicenumber
        'Electronics', // assetcategory
        'Laptop Dell XPS', // assetname
        'Intel i7, 16GB RAM, 512GB SSD', // specification
        'Dell XPS 15', // makemodel
        'DL123456789', // productserialnumber
        'Dell Technologies', // vendorname
        '1', // quantityperitem
        '75000', // rateinclusivetax
        '75000', // totalcost
        'Workstation-1', // locationofitem
        'Pieces', // unitofmeasurement
        'straight-line', // depreciationmethod
        '3', // expectedlifespan
        '5000', // salvagevalue
        '3 years comprehensive', // warrantyinformation
        'Annual maintenance', // maintenanceschedule
        'excellent', // conditionofasset
        'available', // status
        '5', // minimumstocklevel
        '1', // balancequantityinstock
        'High-performance laptop for development work' // description
      ]
    ];

    const ws = XLSX.utils.aoa_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Inventory Template');
    XLSX.writeFile(wb, 'inventory_bulk_upload_template.xlsx');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Bulk Asset Upload</h2>
              <p className="text-gray-600">Upload multiple inventory items using Excel or CSV files</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900">Important Instructions</h3>
                <ul className="mt-2 text-sm text-blue-800 space-y-1">
                  <li>• Headers must match exactly (case-insensitive)</li>
                  <li>• Data types must be correct (numbers for quantities, dates in YYYY-MM-DD format)</li>
                  <li>• Download the template below for proper format</li>
                  <li>• Supported formats: Excel (.xlsx, .xls) and CSV files</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Template Download */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-semibold text-gray-900">Download Template</h3>
              <p className="text-sm text-gray-600">Get the exact format required for bulk upload</p>
            </div>
            <button
              onClick={downloadTemplate}
              className="flex items-center px-4 py-2 space-x-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download size={16} />
              <span>Download Template</span>
            </button>
          </div>

          {/* File Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              className="hidden"
            />
            
            <div className="space-y-4">
              <div className="flex justify-center space-x-4">
                <FileSpreadsheet className="w-12 h-12 text-green-500" />
                <FileText className="w-12 h-12 text-blue-500" />
              </div>
              
              {file ? (
                <div>
                  <p className="text-lg font-semibold text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-lg font-semibold text-gray-900">
                    Drop your file here or click to browse
                  </p>
                  <p className="text-gray-500">
                    Supports Excel (.xlsx, .xls) and CSV files
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Preview Data */}
          {showPreview && previewData.length > 0 && (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">Preview (First 5 rows)</h3>
              </div>
              <div className="overflow-x-auto max-h-64">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      {Object.keys(previewData[0] || {}).slice(0, 6).map(header => (
                        <th key={header} className="px-3 py-2 text-left font-medium text-gray-700">
                          {header}
                        </th>
                      ))}
                      <th className="px-3 py-2 text-left font-medium text-gray-700">...</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((row, index) => (
                      <tr key={index} className="border-t border-gray-200">
                        {Object.values(row).slice(0, 6).map((value: any, cellIndex) => (
                          <td key={cellIndex} className="px-3 py-2 text-gray-900">
                            {value?.toString() || '-'}
                          </td>
                        ))}
                        <td className="px-3 py-2 text-gray-500">...</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Upload Result */}
          {uploadResult && (
            <div className={`border rounded-lg p-4 ${
              uploadResult.success 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-start space-x-3">
                {uploadResult.success ? (
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                )}
                <div className="flex-1">
                  <h3 className={`font-semibold ${
                    uploadResult.success ? 'text-green-900' : 'text-red-900'
                  }`}>
                    {uploadResult.message}
                  </h3>
                  {uploadResult.success && uploadResult.successCount && (
                    <p className="text-sm text-green-800">
                      Successfully uploaded {uploadResult.successCount} items
                    </p>
                  )}
                  {uploadResult.errors && (
                    <ul className="mt-2 text-sm text-red-800 space-y-1">
                      {uploadResult.errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={uploading}
            >
              Close
            </button>
            
            {file && showPreview && !uploadResult?.success && (
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Uploading...</span>
                  </div>
                ) : (
                  `Upload ${previewData.length} Items`
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkUpload;
