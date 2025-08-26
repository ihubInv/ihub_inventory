import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useInventory } from '../../contexts/InventoryContext';
import { Download, Filter, RotateCcw, Table, BarChart3, PieChart, TrendingUp, FileSpreadsheet, FileText, Image } from 'lucide-react';
import AttractiveDropdown from '../common/AttractiveDropdown';
import { PivotBarChart, PivotPieChart, PivotLineChart } from '../charts/ChartComponents';
import * as XLSX from 'xlsx';
import { createAttractiveExcelFile, createAttractiveCSV } from '../../utils/enhancedExport';

interface PivotConfig {
  rows: string[];
  columns: string[];
  values: string[];
  aggregation: 'count' | 'sum' | 'avg' | 'min' | 'max';
}

const InventoryPivotTable: React.FC = () => {
  const { inventoryItems } = useInventory();
  const [pivotConfig, setPivotConfig] = useState<PivotConfig>({
    rows: ['assetcategory'],
    columns: ['status'],
    values: ['balancequantityinstock'],
    aggregation: 'sum'
  });
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());
  const [chartType, setChartType] = useState<'bar' | 'pie' | 'line'>('bar');
  const [showCharts, setShowCharts] = useState(true);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  // Chart references for export
  const primaryChartRef = useRef<any>(null);
  const secondaryChartRef = useRef<any>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
    };

    if (showExportMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showExportMenu]);

  // Chart image capture function
  const captureChartImage = async (chartRef: React.RefObject<any>): Promise<string | null> => {
    if (!chartRef.current) return null;
    
    try {
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        height: 400,
        width: 600
      });
      return canvas.toDataURL('image/png');
    } catch (error) {
      console.error('Error capturing chart:', error);
      return null;
    }
  };

  const availableFields = [
    { value: 'assetcategory', label: 'Asset Category' },
    { value: 'status', label: 'Status' },
    { value: 'conditionofasset', label: 'Condition' },
    { value: 'locationofitem', label: 'Location' },
    { value: 'vendorname', label: 'Vendor' },
    { value: 'unitofmeasurement', label: 'Unit' },
    { value: 'financialyear', label: 'Financial Year' }
  ];

  const valueFields = [
    { value: 'balancequantityinstock', label: 'Quantity in Stock' },
    { value: 'rateinclusivetax', label: 'Rate (Inclusive Tax)' },
    { value: 'totalcost', label: 'Total Cost' },
    { value: 'minimumstocklevel', label: 'Minimum Stock Level' }
  ];

  const aggregationOptions = [
    { value: 'count', label: 'Count' },
    { value: 'sum', label: 'Sum' },
    { value: 'avg', label: 'Average' },
    { value: 'min', label: 'Minimum' },
    { value: 'max', label: 'Maximum' }
  ];

  const pivotData = useMemo(() => {
    if (!inventoryItems.length) return { rows: [], columns: [], data: {} };

    // Get unique values for rows and columns
    const rowValues = [...new Set(inventoryItems.map(item => 
      pivotConfig.rows.map(field => item[field as keyof typeof item] || 'N/A').join(' | ')
    ))].sort();

    const columnValues = [...new Set(inventoryItems.map(item => 
      pivotConfig.columns.map(field => item[field as keyof typeof item] || 'N/A').join(' | ')
    ))].sort();

    // Create data matrix
    const data: { [key: string]: { [key: string]: number } } = {};
    
    rowValues.forEach(rowValue => {
      data[rowValue] = {};
      columnValues.forEach(columnValue => {
        const filteredItems = inventoryItems.filter(item => {
          const itemRowValue = pivotConfig.rows.map(field => item[field as keyof typeof item] || 'N/A').join(' | ');
          const itemColumnValue = pivotConfig.columns.map(field => item[field as keyof typeof item] || 'N/A').join(' | ');
          return itemRowValue === rowValue && itemColumnValue === columnValue;
        });

        let value = 0;
        if (filteredItems.length > 0) {
          const values = filteredItems.map(item => {
            const fieldValue = item[pivotConfig.values[0] as keyof typeof item];
            return typeof fieldValue === 'number' ? fieldValue : 0;
          });

          switch (pivotConfig.aggregation) {
            case 'count':
              value = filteredItems.length;
              break;
            case 'sum':
              value = values.reduce((sum, val) => sum + val, 0);
              break;
            case 'avg':
              value = values.reduce((sum, val) => sum + val, 0) / values.length;
              break;
            case 'min':
              value = Math.min(...values);
              break;
            case 'max':
              value = Math.max(...values);
              break;
          }
        }

        data[rowValue][columnValue] = value;
      });
    });

    return { rows: rowValues, columns: columnValues, data };
  }, [inventoryItems, pivotConfig]);

  // Enhanced export functions
  const createEnhancedWorkbook = (includeCharts: boolean = false) => {
    const wb = XLSX.utils.book_new();
    
    // Create main data worksheet with enhanced formatting
    const wsData: any[][] = [];
    
    // Add title and metadata
    wsData.push(['INVENTORY PIVOT ANALYSIS REPORT']);
    wsData.push(['Generated on:', new Date().toLocaleString()]);
    wsData.push(['']);
    
    // Add configuration details
    wsData.push(['CONFIGURATION DETAILS']);
    wsData.push(['Row Field:', availableFields.find(f => f.value === pivotConfig.rows[0])?.label || pivotConfig.rows[0]]);
    wsData.push(['Column Field:', availableFields.find(f => f.value === pivotConfig.columns[0])?.label || pivotConfig.columns[0]]);
    wsData.push(['Value Field:', valueFields.find(f => f.value === pivotConfig.values[0])?.label || pivotConfig.values[0]]);
    wsData.push(['Aggregation:', pivotConfig.aggregation.toUpperCase()]);
    wsData.push(['']);
    
    // Add summary statistics
    wsData.push(['SUMMARY STATISTICS']);
    const totalRows = pivotData.rows.length;
    const totalCols = pivotData.columns.length;
    const totalCells = totalRows * totalCols;
    const grandTotal = pivotData.rows.reduce((sum, row) => 
      sum + pivotData.columns.reduce((rowSum, col) => rowSum + (pivotData.data[row][col] || 0), 0), 0
    );
    
    wsData.push(['Total Categories:', totalRows]);
    wsData.push(['Total Data Points:', totalCols]);
    wsData.push(['Total Data Cells:', totalCells]);
    wsData.push(['Grand Total:', pivotConfig.aggregation === 'avg' ? (grandTotal / totalCells).toFixed(2) : grandTotal.toLocaleString()]);
    wsData.push(['']);
    
    // Add pivot table data with enhanced formatting
    wsData.push(['PIVOT TABLE DATA']);
    wsData.push(['']);
    
    // Header row
    const headerRow = ['Category', ...pivotData.columns, 'Row Total'];
    wsData.push(headerRow);
    
    // Data rows
    pivotData.rows.forEach(row => {
      const rowData = [row];
      let rowTotal = 0;
      
      pivotData.columns.forEach(col => {
        const value = pivotData.data[row][col] || 0;
        rowTotal += value;
        rowData.push(pivotConfig.aggregation === 'avg' ? value.toFixed(2) : value);
      });
      
      rowData.push(pivotConfig.aggregation === 'avg' ? (rowTotal / pivotData.columns.length).toFixed(2) : rowTotal);
      wsData.push(rowData);
    });
    
    // Column totals
    const totalRow = ['Column Total'];
    pivotData.columns.forEach(col => {
      const colTotal = pivotData.rows.reduce((sum, row) => sum + (pivotData.data[row][col] || 0), 0);
      totalRow.push(pivotConfig.aggregation === 'avg' ? (colTotal / pivotData.rows.length).toFixed(2) : colTotal);
    });
    totalRow.push(pivotConfig.aggregation === 'avg' ? (grandTotal / totalCells).toFixed(2) : grandTotal);
    wsData.push(totalRow);
    
    // Add detailed breakdown
    wsData.push(['']);
    wsData.push(['DETAILED BREAKDOWN']);
    wsData.push(['']);
    
    // Create detailed data for each category
    pivotData.rows.forEach(row => {
      wsData.push([`${row} Details:`]);
      pivotData.columns.forEach(col => {
        const value = pivotData.data[row][col] || 0;
        const percentage = grandTotal > 0 ? ((value / grandTotal) * 100).toFixed(1) : '0.0';
        wsData.push([`  ${col}:`, value, `(${percentage}%)`]);
      });
      wsData.push(['']);
    });
    
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    
    // Apply cell styling and formatting
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    
    // Set column widths
    ws['!cols'] = [
      { wch: 25 }, // Category column
      ...pivotData.columns.map(() => ({ wch: 15 })), // Data columns
      { wch: 15 } // Total column
    ];
    
    XLSX.utils.book_append_sheet(wb, ws, 'Pivot Analysis');
    
    // If including charts, create a summary sheet
    if (includeCharts) {
      const chartSummary: any[][] = [];
      chartSummary.push(['CHART DATA SUMMARY']);
      chartSummary.push(['']);
      chartSummary.push(['Chart Configuration:']);
      chartSummary.push(['Primary Chart Type:', chartType.toUpperCase()]);
      chartSummary.push(['Data Visualization:', 'Chart data included for external tools']);
      chartSummary.push(['']);
      
      // Add chart data in structured format for external visualization
      chartSummary.push(['CHART DATA (for external charting tools)']);
      chartSummary.push(['']);
      chartSummary.push(['Category', ...pivotData.columns, 'Total']);
      
      pivotData.rows.forEach(row => {
        const rowData = [row];
        let rowTotal = 0;
        pivotData.columns.forEach(col => {
          const value = pivotData.data[row][col] || 0;
          rowTotal += value;
          rowData.push(value);
        });
        rowData.push(rowTotal);
        chartSummary.push(rowData);
      });
      
      // Add percentage breakdown
      chartSummary.push(['']);
      chartSummary.push(['PERCENTAGE BREAKDOWN']);
      chartSummary.push(['Category', ...pivotData.columns.map(col => `${col} %`), 'Total %']);
      
      const totalGrand = pivotData.rows.reduce((sum, row) => 
        sum + pivotData.columns.reduce((rowSum, col) => rowSum + (pivotData.data[row][col] || 0), 0), 0
      );
      
      pivotData.rows.forEach(row => {
        const rowData = [row];
        let rowTotal = 0;
        pivotData.columns.forEach(col => {
          const value = pivotData.data[row][col] || 0;
          rowTotal += value;
          const percentage = totalGrand > 0 ? ((value / totalGrand) * 100).toFixed(1) : '0.0';
          rowData.push(`${percentage}%`);
        });
        const totalPercentage = totalGrand > 0 ? ((rowTotal / totalGrand) * 100).toFixed(1) : '0.0';
        rowData.push(`${totalPercentage}%`);
        chartSummary.push(rowData);
      });
      
      const wsChart = XLSX.utils.aoa_to_sheet(chartSummary);
      wsChart['!cols'] = [{ wch: 20 }, ...pivotData.columns.map(() => ({ wch: 15 })), { wch: 15 }];
      
      XLSX.utils.book_append_sheet(wb, wsChart, 'Chart Data');
    }
    
    return wb;
  };

  const exportToExcelEnhanced = async (includeCharts: boolean = false) => {
    setIsExporting(true);
    try {
      const workbook = await createAttractiveExcelFile(
        pivotData,
        pivotConfig,
        availableFields,
        valueFields,
        chartType,
        includeCharts,
        showCharts,
        primaryChartRef,
        secondaryChartRef
      );
      
      // Generate and download file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      const timestamp = new Date().toISOString().slice(0, 10);
      const filename = `pivot-analysis-${includeCharts ? 'with-charts' : 'table-only'}-${timestamp}.xlsx`;
      link.download = filename;
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      console.log(`✅ Export successful: ${filename}`);
    } catch (error) {
      console.error('❌ Export failed:', error);
    } finally {
      setIsExporting(false);
      setShowExportMenu(false);
    }
  };

  const exportToCsvEnhanced = (includeCharts: boolean = false) => {
    setIsExporting(true);
    try {
      const csvContent = createAttractiveCSV(
        pivotData,
        pivotConfig,
        availableFields,
        valueFields,
        chartType,
        includeCharts
      );
      
      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      
      const timestamp = new Date().toISOString().slice(0, 10);
      const filename = `pivot-analysis-${includeCharts ? 'with-charts' : 'table-only'}-${timestamp}.csv`;
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      console.log(`✅ Export successful: ${filename}`);
    } catch (error) {
      console.error('❌ Export failed:', error);
    } finally {
      setIsExporting(false);
      setShowExportMenu(false);
    }
  };

  // Legacy function for backward compatibility
  const exportToExcel = () => {
    exportToExcelEnhanced(false);
  };

  const exportToCSV = () => {
    const csvContent = [
      ['', ...pivotData.columns].join(','),
      ...pivotData.rows.map(row => [
        row,
        ...pivotData.columns.map(col => pivotData.data[row][col] || 0)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory-pivot-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportSelectedData = () => {
    const selectedRows = pivotData.rows.filter(row => 
      pivotData.columns.some(col => selectedCells.has(`${row}-${col}`))
    );
    const selectedColumns = pivotData.columns.filter(col => 
      pivotData.rows.some(row => selectedCells.has(`${row}-${col}`))
    );

    const worksheetData = [
      ['', ...selectedColumns],
      ...selectedRows.map(row => [
        row,
        ...selectedColumns.map(col => 
          selectedCells.has(`${row}-${col}`) ? (pivotData.data[row][col] || 0) : ''
        )
      ])
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Selected Data');
    XLSX.writeFile(workbook, `inventory-selected-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const toggleCellSelection = (row: string, col: string) => {
    const cellKey = `${row}-${col}`;
    const newSelection = new Set(selectedCells);
    if (newSelection.has(cellKey)) {
      newSelection.delete(cellKey);
    } else {
      newSelection.add(cellKey);
    }
    setSelectedCells(newSelection);
  };

  const resetPivot = () => {
    setPivotConfig({
      rows: ['assetcategory'],
      columns: ['status'],
      values: ['balancequantityinstock'],
      aggregation: 'sum'
    });
    setSelectedCells(new Set());
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Inventory Pivot Table</h2>
            <p className="text-gray-600">Analyze inventory data with custom dimensions</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={resetPivot}
            className="flex items-center px-3 py-2 space-x-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <RotateCcw size={16} />
            <span>Reset</span>
          </button>
          
          {/* Enhanced Export Menu */}
          <div className="relative" ref={exportMenuRef}>
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              disabled={isExporting}
              className={`flex items-center px-4 py-2 space-x-2 text-white rounded-lg transition-colors ${
                isExporting 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
              }`}
            >
              <Download size={16} />
              <span>{isExporting ? 'Exporting...' : 'Export'}</span>
              <svg className={`w-4 h-4 transition-transform ${showExportMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
                <div className="p-3 border-b border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-900">Export Options</h3>
                  <p className="text-xs text-gray-600 mt-1">Choose format and content</p>
                </div>
                
                <div className="p-3 space-y-3">
                  {/* Excel Export Options */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-gray-700 flex items-center">
                      <FileSpreadsheet className="w-4 h-4 mr-2 text-green-600" />
                      Excel (.xlsx)
                    </h4>
                    <div className="grid grid-cols-1 gap-2">
                      <button
                        onClick={() => exportToExcelEnhanced(false)}
                        disabled={isExporting}
                        className="flex items-center justify-between px-3 py-2 text-xs text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <span>📊 Table Only</span>
                        <span className="text-gray-500">Enhanced</span>
                      </button>
                      <button
                        onClick={() => exportToExcelEnhanced(true)}
                        disabled={isExporting}
                        className="flex items-center justify-between px-3 py-2 text-xs text-gray-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <span>📈 With Chart Data</span>
                        <span className="text-blue-600">Premium</span>
                      </button>
                    </div>
                  </div>

                  {/* CSV Export Options */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-gray-700 flex items-center">
                      <FileText className="w-4 h-4 mr-2 text-orange-600" />
                      CSV (.csv)
                    </h4>
                    <div className="grid grid-cols-1 gap-2">
                      <button
                        onClick={() => exportToCsvEnhanced(false)}
                        disabled={isExporting}
                        className="flex items-center justify-between px-3 py-2 text-xs text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <span>📋 Table Only</span>
                        <span className="text-gray-500">Basic</span>
                      </button>
                      <button
                        onClick={() => exportToCsvEnhanced(true)}
                        disabled={isExporting}
                        className="flex items-center justify-between px-3 py-2 text-xs text-gray-700 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                      >
                        <span>📊 With Chart Data</span>
                        <span className="text-orange-600">Extended</span>
                      </button>
                    </div>
                  </div>

                  {/* Export Info */}
                  <div className="pt-2 border-t border-gray-100">
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span>Data rows: {pivotData.rows.length}</span>
                      <span>Columns: {pivotData.columns.length}</span>
                    </div>
                    {showCharts && (
                      <div className="text-xs text-blue-600 mt-1">
                        Chart type: {chartType.toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {selectedCells.size > 0 && (
            <button
              onClick={exportSelectedData}
              className="flex items-center px-3 py-2 space-x-2 text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Download size={16} />
              <span>Selected ({selectedCells.size})</span>
            </button>
          )}
        </div>
      </div>

      {/* Configuration Panel */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <AttractiveDropdown
            label="Row Fields"
            options={availableFields}
            value={pivotConfig.rows[0]}
            onChange={(value) => setPivotConfig(prev => ({ ...prev, rows: [value] }))}
            placeholder="Select row field"
            size="sm"
          />
          
          <AttractiveDropdown
            label="Column Fields"
            options={availableFields}
            value={pivotConfig.columns[0]}
            onChange={(value) => setPivotConfig(prev => ({ ...prev, columns: [value] }))}
            placeholder="Select column field"
            size="sm"
          />
          
          <AttractiveDropdown
            label="Value Fields"
            options={valueFields}
            value={pivotConfig.values[0]}
            onChange={(value) => setPivotConfig(prev => ({ ...prev, values: [value] }))}
            placeholder="Select value field"
            size="sm"
          />
          
          <AttractiveDropdown
            label="Aggregation"
            options={aggregationOptions}
            value={pivotConfig.aggregation}
            onChange={(value) => setPivotConfig(prev => ({ ...prev, aggregation: value as any }))}
            placeholder="Select aggregation"
            size="sm"
          />
        </div>
      </div>

      {/* Charts Section */}
      {pivotData.rows.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-medium text-gray-900">Data Visualization</h3>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">Chart Type:</span>
                  <div className="flex rounded-lg border border-gray-200 bg-white">
                    <button
                      onClick={() => setChartType('bar')}
                      className={`px-3 py-2 text-xs font-medium rounded-l-lg border-r border-gray-200 transition-colors ${
                        chartType === 'bar' 
                          ? 'bg-blue-500 text-white' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <BarChart3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setChartType('pie')}
                      className={`px-3 py-2 text-xs font-medium border-r border-gray-200 transition-colors ${
                        chartType === 'pie' 
                          ? 'bg-blue-500 text-white' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <PieChart className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setChartType('line')}
                      className={`px-3 py-2 text-xs font-medium rounded-r-lg transition-colors ${
                        chartType === 'line' 
                          ? 'bg-blue-500 text-white' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <TrendingUp className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => setShowCharts(!showCharts)}
                  className="flex items-center space-x-2 px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span>{showCharts ? 'Hide Charts' : 'Show Charts'}</span>
                </button>
              </div>
            </div>
          </div>
          
          {showCharts && (
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Primary Chart */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="h-80" ref={primaryChartRef}>
                    {chartType === 'bar' && <PivotBarChart pivotData={pivotData} config={pivotConfig} />}
                    {chartType === 'pie' && <PivotPieChart pivotData={pivotData} config={pivotConfig} />}
                    {chartType === 'line' && <PivotLineChart pivotData={pivotData} config={pivotConfig} />}
                  </div>
                  <div className="mt-3 text-center">
                    <h4 className="text-sm font-medium text-gray-900">
                      {chartType === 'bar' && 'Bar Chart Analysis'}
                      {chartType === 'pie' && 'Distribution Overview'}
                      {chartType === 'line' && 'Trend Analysis'}
                    </h4>
                    <p className="text-xs text-gray-600 mt-1">
                      {pivotConfig.aggregation.charAt(0).toUpperCase() + pivotConfig.aggregation.slice(1)} of {
                        valueFields.find(f => f.value === pivotConfig.values[0])?.label
                      }
                    </p>
                  </div>
                </div>

                {/* Secondary Chart (Alternative view) */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="h-80" ref={secondaryChartRef}>
                    {chartType !== 'pie' ? (
                      <PivotPieChart pivotData={pivotData} config={pivotConfig} />
                    ) : (
                      <PivotBarChart pivotData={pivotData} config={pivotConfig} />
                    )}
                  </div>
                  <div className="mt-3 text-center">
                    <h4 className="text-sm font-medium text-gray-900">
                      {chartType !== 'pie' ? 'Distribution Overview' : 'Bar Chart Analysis'}
                    </h4>
                    <p className="text-xs text-gray-600 mt-1">Alternative visualization</p>
                  </div>
                </div>
              </div>

              {/* Chart Insights */}
              <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <h4 className="text-sm font-semibold text-blue-900 mb-2">Chart Insights</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="text-blue-800">
                    <span className="font-medium">Total Categories:</span> {pivotData.rows.length}
                  </div>
                  <div className="text-blue-800">
                    <span className="font-medium">Data Points:</span> {pivotData.columns.length}
                  </div>
                  <div className="text-blue-800">
                    <span className="font-medium">Aggregation:</span> {pivotConfig.aggregation.toUpperCase()}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pivot Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-2">
            <Table className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-medium text-gray-900">
              {pivotConfig.aggregation.charAt(0).toUpperCase() + pivotConfig.aggregation.slice(1)} of {
                valueFields.find(f => f.value === pivotConfig.values[0])?.label
              } by {
                availableFields.find(f => f.value === pivotConfig.rows[0])?.label
              } and {
                availableFields.find(f => f.value === pivotConfig.columns[0])?.label
              }
            </h3>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                  {availableFields.find(f => f.value === pivotConfig.rows[0])?.label}
                </th>
                {pivotData.columns.map(col => (
                  <th key={col} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                    {col}
                  </th>
                ))}
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-blue-50">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pivotData.rows.map(row => {
                const rowTotal = pivotData.columns.reduce((sum, col) => sum + (pivotData.data[row][col] || 0), 0);
                return (
                  <tr key={row} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-200 bg-gray-50">
                      {row}
                    </td>
                    {pivotData.columns.map(col => {
                      const value = pivotData.data[row][col] || 0;
                      const cellKey = `${row}-${col}`;
                      const isSelected = selectedCells.has(cellKey);
                      return (
                        <td 
                          key={col} 
                          className={`px-6 py-4 whitespace-nowrap text-sm text-center border-r border-gray-200 cursor-pointer transition-colors ${
                            isSelected ? 'bg-blue-100 text-blue-900' : 'text-gray-900 hover:bg-blue-50'
                          }`}
                          onClick={() => toggleCellSelection(row, col)}
                        >
                          {pivotConfig.aggregation === 'avg' ? value.toFixed(2) : value.toLocaleString()}
                        </td>
                      );
                    })}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-center bg-blue-50 text-blue-900">
                      {pivotConfig.aggregation === 'avg' ? (rowTotal / pivotData.columns.length).toFixed(2) : rowTotal.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
              <tr className="bg-blue-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 border-r border-gray-200">
                  Total
                </td>
                {pivotData.columns.map(col => {
                  const colTotal = pivotData.rows.reduce((sum, row) => sum + (pivotData.data[row][col] || 0), 0);
                  return (
                    <td key={col} className="px-6 py-4 whitespace-nowrap text-sm font-bold text-center text-blue-900 border-r border-gray-200">
                      {pivotConfig.aggregation === 'avg' ? (colTotal / pivotData.rows.length).toFixed(2) : colTotal.toLocaleString()}
                    </td>
                  );
                })}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-center text-blue-900">
                  {pivotData.rows.reduce((sum, row) => 
                    sum + pivotData.columns.reduce((rowSum, col) => rowSum + (pivotData.data[row][col] || 0), 0), 0
                  ).toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {selectedCells.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-blue-600" />
              <span className="text-blue-900 font-medium">
                {selectedCells.size} cells selected
              </span>
            </div>
            <button
              onClick={() => setSelectedCells(new Set())}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryPivotTable;
