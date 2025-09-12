import React, { useState, useMemo } from 'react';
import { useInventory } from '../../contexts/InventoryContext';
import { TrendingDown, Download, Filter } from 'lucide-react';
import YearDropdown from '../common/YearDropdown';
import DepreciationMethodDropdown from '../common/DepreciationMethodDropdown';
import FilterDropdown from '../common/FilterDropdown';

const DepreciationReport: React.FC = () => {
  const { inventoryItems } = useInventory();
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [filterMethod, setFilterMethod] = useState<string>('all');

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

  const itemsWithDepreciation = useMemo(() => {
    return inventoryItems.filter(item => 
      item.depreciationmethod && 
      item.expectedlifespan && 
      item.rateinclusivetax > 0 &&
      (filterMethod === 'all' || item.depreciationmethod === filterMethod)
    );
  }, [inventoryItems, filterMethod]);

  const totalDepreciation = useMemo(() => {
    return itemsWithDepreciation.reduce((total, item) => {
      const purchaseYear = item.dateofinvoice ? new Date(item.dateofinvoice).getFullYear() : currentYear;
      const yearsElapsed = selectedYear - purchaseYear;
      
      if (yearsElapsed <= 0) return total;
      
      let depreciation = 0;
      const usefulLife = Number(item.expectedlifespan);
      const salvageValue = item.salvagevalue || 0;
      
      switch (item.depreciationmethod) {
        case 'straight-line':
          depreciation = (item.rateinclusivetax - salvageValue) / usefulLife;
          break;
        case 'declining-balance':
          const rate = 2 / usefulLife;
          let currentValue = item.rateinclusivetax;
          for (let year = 1; year <= Math.min(yearsElapsed, usefulLife); year++) {
            const yearDepreciation = Math.min(currentValue * rate, currentValue - salvageValue);
            currentValue -= yearDepreciation;
            if (year === yearsElapsed) depreciation = yearDepreciation;
          }
          break;
        case 'sum-of-years':
          const sumOfYears = (usefulLife * (usefulLife + 1)) / 2;
          if (yearsElapsed <= usefulLife) {
            depreciation = ((usefulLife - yearsElapsed + 1) / sumOfYears) * (item.rateinclusivetax - salvageValue);
          }
          break;
      }
      
      return total + depreciation;
    }, 0);
  }, [itemsWithDepreciation, selectedYear, currentYear]);

  const exportReport = () => {
    const headers = ['Asset Name', 'Category', 'Purchase Value', 'Method', 'Useful Life', 'Current Value', 'Depreciation'];
    const csvContent = [
      headers.join(','),
      ...itemsWithDepreciation.map(item => {
        const purchaseYear = item.dateofinvoice ? new Date(item.dateofinvoice).getFullYear() : currentYear;
        const yearsElapsed = selectedYear - purchaseYear;
        let currentValue = item.rateinclusivetax;
        let depreciation = 0;
        
        if (yearsElapsed > 0) {
          const usefulLife = Number(item.expectedlifespan);
          const salvageValue = item.salvagevalue || 0;
          
          switch (item.depreciationmethod) {
            case 'straight-line':
              depreciation = (item.rateinclusivetax - salvageValue) / usefulLife;
              currentValue = item.rateinclusivetax - (depreciation * yearsElapsed);
              break;
            case 'declining-balance':
              const rate = 2 / usefulLife;
              for (let year = 1; year <= Math.min(yearsElapsed, usefulLife); year++) {
                const yearDepreciation = Math.min(currentValue * rate, currentValue - salvageValue);
                currentValue -= yearDepreciation;
                if (year === yearsElapsed) depreciation = yearDepreciation;
              }
              break;
            case 'sum-of-years':
              const sumOfYears = (usefulLife * (usefulLife + 1)) / 2;
              if (yearsElapsed <= usefulLife) {
                depreciation = ((usefulLife - yearsElapsed + 1) / sumOfYears) * (item.rateinclusivetax - salvageValue);
                currentValue = item.rateinclusivetax - (depreciation * yearsElapsed);
              }
              break;
          }
        }
        
        return [
          item.assetname,
          item.assetcategory,
          item.rateinclusivetax,
          item.depreciationmethod,
          item.expectedlifespan,
          currentValue.toFixed(2),
          depreciation.toFixed(2)
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `depreciation-report-${selectedYear}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Depreciation Report</h1>
          <p className="mt-1 text-gray-600">Track asset depreciation and financial impact</p>
        </div>
        <button
          onClick={exportReport}
          className="flex items-center px-4 py-2 space-x-2 text-white transition-all duration-200 rounded-lg bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
        >
          <Download size={16} className="text-blue-500" />
          <span>Export Report</span>
        </button>
      </div>

      {/* Filters */}
      <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <YearDropdown
              label="Year"
              value={selectedYear}
              onChange={setSelectedYear}
              placeholder="Select year"
              yearsBack={10}
              yearsForward={2}
            />
          </div>

          <div>
            <FilterDropdown
              label="Depreciation Method"
              value={filterMethod}
              onChange={setFilterMethod}
              options={[
                { value: 'all', label: 'All Methods', description: 'Show all depreciation methods' },
                { value: 'straight-line', label: 'Straight Line', description: 'Equal depreciation each year' },
                { value: 'declining-balance', label: 'Declining Balance', description: 'Higher depreciation in early years' },
                { value: 'sum-of-years', label: 'Sum of Years Digits', description: 'Accelerated depreciation method' }
              ]}
              placeholder="Select method"
            />
          </div>

          <div className="flex items-end">
            <div className="w-full p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <TrendingDown className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Total Depreciation ({selectedYear})</span>
              </div>
              <p className="text-2xl font-bold text-blue-900">₹{totalDepreciation.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Depreciation Details */}
      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Asset Depreciation Details</h3>
        </div>
        
        {itemsWithDepreciation.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Asset</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Purchase Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Useful Life</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Depreciation</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {itemsWithDepreciation.map((item) => {
                  const purchaseYear = item.dateofinvoice ? new Date(item.dateofinvoice).getFullYear() : currentYear;
                  const yearsElapsed = selectedYear - purchaseYear;
                  let currentValue = item.rateinclusivetax;
                  let depreciation = 0;
                  
                  if (yearsElapsed > 0) {
                    const usefulLife = Number(item.expectedlifespan);
                    const salvageValue = item.salvagevalue || 0;
                    
                    switch (item.depreciationmethod) {
                      case 'straight-line':
                        depreciation = (item.rateinclusivetax - salvageValue) / usefulLife;
                        currentValue = item.rateinclusivetax - (depreciation * yearsElapsed);
                        break;
                      case 'declining-balance':
                        const rate = 2 / usefulLife;
                        for (let year = 1; year <= Math.min(yearsElapsed, usefulLife); year++) {
                          const yearDepreciation = Math.min(currentValue * rate, currentValue - salvageValue);
                          currentValue -= yearDepreciation;
                          if (year === yearsElapsed) depreciation = yearDepreciation;
                        }
                        break;
                      case 'sum-of-years':
                        const sumOfYears = (usefulLife * (usefulLife + 1)) / 2;
                        if (yearsElapsed <= usefulLife) {
                          depreciation = ((usefulLife - yearsElapsed + 1) / sumOfYears) * (item.rateinclusivetax - salvageValue);
                          currentValue = item.rateinclusivetax - (depreciation * yearsElapsed);
                        }
                        break;
                    }
                  }
                  
                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.assetname}</div>
                          <div className="text-sm text-gray-500">{item.assetcategory}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">₹{item.rateinclusivetax.toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{item.depreciationmethod}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{item.expectedlifespan} years</td>
                      <td className="px-6 py-4 text-sm text-gray-900">₹{currentValue.toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">₹{depreciation.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center">
            <TrendingDown className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="mb-2 text-lg font-medium text-gray-900">No depreciation data found</h3>
            <p className="text-gray-600">Add depreciation information to your assets to see reports</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DepreciationReport;
