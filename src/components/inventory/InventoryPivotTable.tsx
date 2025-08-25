import React, { useState, useMemo } from 'react';
import { useInventory } from '../../contexts/InventoryContext';
import { Download, Filter, RotateCcw, Table, BarChart3 } from 'lucide-react';
import AttractiveDropdown from '../common/AttractiveDropdown';
import * as XLSX from 'xlsx';

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

  const exportToExcel = () => {
    const worksheetData = [
      ['', ...pivotData.columns],
      ...pivotData.rows.map(row => [
        row,
        ...pivotData.columns.map(col => pivotData.data[row][col] || 0)
      ])
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Pivot Table');
    XLSX.writeFile(workbook, `inventory-pivot-${new Date().toISOString().split('T')[0]}.xlsx`);
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
          
          <button
            onClick={exportToCSV}
            className="flex items-center px-3 py-2 space-x-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download size={16} />
            <span>CSV</span>
          </button>
          
          <button
            onClick={exportToExcel}
            className="flex items-center px-3 py-2 space-x-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download size={16} />
            <span>Excel</span>
          </button>
          
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
