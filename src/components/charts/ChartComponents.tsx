import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

// Inventory Trend Line Chart
export const InventoryTrendChart: React.FC<{ data: any }> = ({ data }) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: '500',
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(59, 130, 246, 0.5)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
          },
          color: '#6B7280',
        },
      },
      y: {
        grid: {
          color: 'rgba(156, 163, 175, 0.2)',
        },
        ticks: {
          font: {
            size: 11,
          },
          color: '#6B7280',
        },
      },
    },
    elements: {
      line: {
        tension: 0.4,
      },
      point: {
        radius: 4,
        hoverRadius: 6,
      },
    },
  };

  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: 'Total Items',
        data: data.totalItems,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        borderWidth: 3,
      },
      {
        label: 'Available Items',
        data: data.availableItems,
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        borderWidth: 3,
      },
    ],
  };

  return <Line options={options} data={chartData} />;
};

// Request Status Doughnut Chart
export const RequestStatusChart: React.FC<{ data: any }> = ({ data }) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: '500',
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        cornerRadius: 8,
        displayColors: false,
      },
    },
    cutout: '60%',
  };

  const chartData = {
    labels: ['Pending', 'Approved', 'Rejected'],
    datasets: [
      {
        data: [data.pending, data.approved, data.rejected],
        backgroundColor: [
          'rgba(251, 191, 36, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgb(251, 191, 36)',
          'rgb(16, 185, 129)',
          'rgb(239, 68, 68)',
        ],
        borderWidth: 2,
        hoverBackgroundColor: [
          'rgba(251, 191, 36, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(239, 68, 68, 1)',
        ],
      },
    ],
  };

  return <Doughnut options={options} data={chartData} />;
};

// Category Distribution Bar Chart
export const CategoryDistributionChart: React.FC<{ data: any }> = ({ data }) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        cornerRadius: 8,
        displayColors: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
          },
          color: '#6B7280',
          maxRotation: 45,
        },
      },
      y: {
        grid: {
          color: 'rgba(156, 163, 175, 0.2)',
        },
        ticks: {
          font: {
            size: 11,
          },
          color: '#6B7280',
        },
      },
    },
    elements: {
      bar: {
        borderRadius: 8,
        borderSkipped: false,
      },
    },
  };

  const chartData = {
    labels: data.categories,
    datasets: [
      {
        label: 'Items',
        data: data.counts,
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(6, 182, 212, 0.8)',
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(16, 185, 129)',
          'rgb(168, 85, 247)',
          'rgb(251, 191, 36)',
          'rgb(239, 68, 68)',
          'rgb(6, 182, 212)',
        ],
        borderWidth: 2,
        hoverBackgroundColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(168, 85, 247, 1)',
          'rgba(251, 191, 36, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(6, 182, 212, 1)',
        ],
      },
    ],
  };

  return <Bar options={options} data={chartData} />;
};

// Asset Condition Pie Chart
export const AssetConditionChart: React.FC<{ data: any }> = ({ data }) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: '500',
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        cornerRadius: 8,
        displayColors: false,
      },
    },
  };

  const chartData = {
    labels: ['Excellent', 'Good', 'Fair', 'Poor', 'Damaged'],
    datasets: [
      {
        data: [data.excellent, data.good, data.fair, data.poor, data.damaged],
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(249, 115, 22, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgb(16, 185, 129)',
          'rgb(59, 130, 246)',
          'rgb(251, 191, 36)',
          'rgb(249, 115, 22)',
          'rgb(239, 68, 68)',
        ],
        borderWidth: 2,
        hoverBackgroundColor: [
          'rgba(16, 185, 129, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(251, 191, 36, 1)',
          'rgba(249, 115, 22, 1)',
          'rgba(239, 68, 68, 1)',
        ],
      },
    ],
  };

  return <Pie options={options} data={chartData} />;
};

// Monthly Activity Line Chart
export const MonthlyActivityChart: React.FC<{ data: any }> = ({ data }) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: '500',
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        cornerRadius: 8,
        displayColors: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
          },
          color: '#6B7280',
        },
      },
      y: {
        grid: {
          color: 'rgba(156, 163, 175, 0.2)',
        },
        ticks: {
          font: {
            size: 11,
          },
          color: '#6B7280',
        },
      },
    },
    elements: {
      line: {
        tension: 0.4,
      },
      point: {
        radius: 5,
        hoverRadius: 7,
      },
    },
  };

  const chartData = {
    labels: data.months,
    datasets: [
      {
        label: 'Items Added',
        data: data.itemsAdded,
        borderColor: 'rgb(168, 85, 247)',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        fill: true,
        borderWidth: 3,
      },
      {
        label: 'Requests Submitted',
        data: data.requestsSubmitted,
        borderColor: 'rgb(6, 182, 212)',
        backgroundColor: 'rgba(6, 182, 212, 0.1)',
        fill: true,
        borderWidth: 3,
      },
    ],
  };

  return <Line options={options} data={chartData} />;
};

// Pivot Data Bar Chart
export const PivotBarChart: React.FC<{ pivotData: any; config: any }> = ({ pivotData, config }) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 11,
            weight: '500',
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context: any) {
            const label = context.dataset.label || '';
            const value = config.aggregation === 'avg' 
              ? parseFloat(context.parsed.y).toFixed(2) 
              : context.parsed.y.toLocaleString();
            return `${label}: ${value}`;
          }
        }
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 10,
          },
          color: '#6B7280',
          maxRotation: 45,
        },
      },
      y: {
        grid: {
          color: 'rgba(156, 163, 175, 0.2)',
        },
        ticks: {
          font: {
            size: 10,
          },
          color: '#6B7280',
          callback: function(value: any) {
            return config.aggregation === 'avg' 
              ? parseFloat(value).toFixed(1)
              : value.toLocaleString();
          }
        },
      },
    },
    elements: {
      bar: {
        borderRadius: 6,
        borderSkipped: false,
      },
    },
  };

  // Generate colors for each column
  const colors = [
    'rgba(59, 130, 246, 0.8)', 'rgba(16, 185, 129, 0.8)', 'rgba(168, 85, 247, 0.8)',
    'rgba(251, 191, 36, 0.8)', 'rgba(239, 68, 68, 0.8)', 'rgba(6, 182, 212, 0.8)',
    'rgba(245, 101, 101, 0.8)', 'rgba(52, 211, 153, 0.8)', 'rgba(167, 139, 250, 0.8)'
  ];

  const borderColors = [
    'rgb(59, 130, 246)', 'rgb(16, 185, 129)', 'rgb(168, 85, 247)',
    'rgb(251, 191, 36)', 'rgb(239, 68, 68)', 'rgb(6, 182, 212)',
    'rgb(245, 101, 101)', 'rgb(52, 211, 153)', 'rgb(167, 139, 250)'
  ];

  const chartData = {
    labels: pivotData.rows,
    datasets: pivotData.columns.map((col: string, index: number) => ({
      label: col,
      data: pivotData.rows.map((row: string) => pivotData.data[row][col] || 0),
      backgroundColor: colors[index % colors.length],
      borderColor: borderColors[index % borderColors.length],
      borderWidth: 2,
      hoverBackgroundColor: borderColors[index % borderColors.length],
    }))
  };

  return <Bar options={options} data={chartData} />;
};

// Pivot Data Pie Chart
export const PivotPieChart: React.FC<{ pivotData: any; config: any }> = ({ pivotData, config }) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          usePointStyle: true,
          padding: 12,
          font: {
            size: 10,
            weight: '500',
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = config.aggregation === 'avg' 
              ? parseFloat(context.parsed).toFixed(2) 
              : context.parsed.toLocaleString();
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      },
    },
  };

  // Calculate row totals for pie chart
  const rowTotals = pivotData.rows.map((row: string) => 
    pivotData.columns.reduce((sum: number, col: string) => sum + (pivotData.data[row][col] || 0), 0)
  );

  const colors = [
    'rgba(59, 130, 246, 0.8)', 'rgba(16, 185, 129, 0.8)', 'rgba(168, 85, 247, 0.8)',
    'rgba(251, 191, 36, 0.8)', 'rgba(239, 68, 68, 0.8)', 'rgba(6, 182, 212, 0.8)',
    'rgba(245, 101, 101, 0.8)', 'rgba(52, 211, 153, 0.8)', 'rgba(167, 139, 250, 0.8)'
  ];

  const borderColors = [
    'rgb(59, 130, 246)', 'rgb(16, 185, 129)', 'rgb(168, 85, 247)',
    'rgb(251, 191, 36)', 'rgb(239, 68, 68)', 'rgb(6, 182, 212)',
    'rgb(245, 101, 101)', 'rgb(52, 211, 153)', 'rgb(167, 139, 250)'
  ];

  const chartData = {
    labels: pivotData.rows,
    datasets: [{
      data: rowTotals,
      backgroundColor: colors.slice(0, pivotData.rows.length),
      borderColor: borderColors.slice(0, pivotData.rows.length),
      borderWidth: 2,
      hoverBackgroundColor: borderColors.slice(0, pivotData.rows.length),
    }]
  };

  return <Pie options={options} data={chartData} />;
};

// Pivot Data Line Chart
export const PivotLineChart: React.FC<{ pivotData: any; config: any }> = ({ pivotData, config }) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 11,
            weight: '500',
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context: any) {
            const label = context.dataset.label || '';
            const value = config.aggregation === 'avg' 
              ? parseFloat(context.parsed.y).toFixed(2) 
              : context.parsed.y.toLocaleString();
            return `${label}: ${value}`;
          }
        }
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 10,
          },
          color: '#6B7280',
          maxRotation: 45,
        },
      },
      y: {
        grid: {
          color: 'rgba(156, 163, 175, 0.2)',
        },
        ticks: {
          font: {
            size: 10,
          },
          color: '#6B7280',
          callback: function(value: any) {
            return config.aggregation === 'avg' 
              ? parseFloat(value).toFixed(1)
              : value.toLocaleString();
          }
        },
      },
    },
    elements: {
      line: {
        tension: 0.4,
      },
      point: {
        radius: 4,
        hoverRadius: 6,
      },
    },
  };

  const colors = [
    'rgb(59, 130, 246)', 'rgb(16, 185, 129)', 'rgb(168, 85, 247)',
    'rgb(251, 191, 36)', 'rgb(239, 68, 68)', 'rgb(6, 182, 212)',
    'rgb(245, 101, 101)', 'rgb(52, 211, 153)', 'rgb(167, 139, 250)'
  ];

  const chartData = {
    labels: pivotData.rows,
    datasets: pivotData.columns.map((col: string, index: number) => ({
      label: col,
      data: pivotData.rows.map((row: string) => pivotData.data[row][col] || 0),
      borderColor: colors[index % colors.length],
      backgroundColor: colors[index % colors.length].replace('rgb', 'rgba').replace(')', ', 0.1)'),
      fill: false,
      borderWidth: 3,
    }))
  };

  return <Line options={options} data={chartData} />;
};