import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useInventory } from '../../contexts/InventoryContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { 
  InventoryTrendChart, 
  RequestStatusChart, 
  CategoryDistributionChart, 
  AssetConditionChart,
  MonthlyActivityChart 
} from '../charts/ChartComponents';
import { 
  Package, 
  Users, 
  ClipboardList, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import StatsCard from '../common/StatsCard';
import RecentActivity from '../common/RecentActivity';
import { useNavigate } from 'react-router-dom';

const DashboardHome: React.FC = () => {
  const { user } = useAuth();
  const { inventoryItems, requests, users, loading } = useInventory();
  const { notifications } = useNotifications();
  const navigate = useNavigate();
  const stats = {
    totalitems: inventoryItems.length,
    availableitems: inventoryItems.filter(item => item.status === 'available').length,
    issueditems: inventoryItems.filter(item => item.status === 'issued').length,
    pendingrequests: requests.filter(req => req.status === 'pending').length,
    approvedrequests: requests.filter(req => req.status === 'approved').length,
    rejectedrequests: requests.filter(req => req.status === 'rejected').length,
    lowstockitems: inventoryItems.filter(item => item.balancequantityinstock <= item.minimumstocklevel).length,
    maintenanceitems: inventoryItems.filter(item => item.status === 'maintenance').length,
    totalusers: users.length,
    activeusers: users.filter(user => user.isactive).length
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const isAdmin = user?.role === 'admin';
  const isStockManager = user?.role === 'stock-manager';

  // Generate dynamic chart data from actual inventory data
  const generateInventoryTrendData = () => {
    const last6Months = [];
    const currentDate = new Date();
    
    // Generate last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      last6Months.push(date.toLocaleDateString('en-US', { month: 'short' }));
    }
    
    // Calculate cumulative inventory data for each month
    const totalItemsData = [];
    const availableItemsData = [];
    
    for (let i = 5; i >= 0; i--) {
      const cutoffDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      
      // Count items created up to this month
      const totalItems = inventoryItems.filter(item => 
        item.createdat && new Date(item.createdat) <= cutoffDate
      ).length;
      
      // Count available items up to this month
      const availableItems = inventoryItems.filter(item => 
        item.createdat && 
        new Date(item.createdat) <= cutoffDate && 
        item.status === 'available'
      ).length;
      
      totalItemsData.push(totalItems);
      availableItemsData.push(availableItems);
    }
    
    return {
      labels: last6Months,
      totalItems: totalItemsData,
      availableItems: availableItemsData,
    };
  };

  const inventoryTrendData = generateInventoryTrendData();
  
  // Add fallback data if no inventory items exist
  const hasInventoryData = inventoryItems.length > 0;

  const requestStatusData = {
    pending: stats.pendingrequests,
    approved: stats.approvedrequests,
    rejected: stats.rejectedrequests,
  };

  // Generate dynamic category data from actual inventory
  const generateCategoryData = () => {
    const categoryCounts: { [key: string]: number } = {};
    
    inventoryItems.forEach(item => {
      const category = item.assetcategory || 'Uncategorized';
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });
    
    const categories = Object.keys(categoryCounts);
    const counts = Object.values(categoryCounts);
    
    return {
      categories,
      counts,
    };
  };

  const categoryData = generateCategoryData();

  const assetConditionData = {
    excellent: inventoryItems.filter(item => item.conditionofasset === 'excellent').length,
    good: inventoryItems.filter(item => item.conditionofasset === 'good').length,
    fair: inventoryItems.filter(item => item.conditionofasset === 'fair').length,
    poor: inventoryItems.filter(item => item.conditionofasset === 'poor').length,
    damaged: inventoryItems.filter(item => item.conditionofasset === 'damaged').length,
  };

  // Generate dynamic monthly activity data from actual data
  const generateMonthlyActivityData = () => {
    const last6Months = [];
    const currentDate = new Date();
    
    // Generate last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      last6Months.push(date.toLocaleDateString('en-US', { month: 'short' }));
    }
    
    const itemsAdded = [];
    const requestsSubmitted = [];
    
    for (let i = 5; i >= 0; i--) {
      const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 0);
      
      // Count items added in this month
      const itemsInMonth = inventoryItems.filter(item => {
        if (!item.createdat) return false;
        const itemDate = new Date(item.createdat);
        return itemDate >= startDate && itemDate <= endDate;
      }).length;
      
      // Count requests submitted in this month
      const requestsInMonth = requests.filter(request => {
        if (!request.submittedat) return false;
        const requestDate = new Date(request.submittedat);
        return requestDate >= startDate && requestDate <= endDate;
      }).length;
      
      itemsAdded.push(itemsInMonth);
      requestsSubmitted.push(requestsInMonth);
    }
    
    return {
      months: last6Months,
      itemsAdded,
      requestsSubmitted,
    };
  };

  const monthlyActivityData = generateMonthlyActivityData();


  const handleNavigateAddInventory=()=>{
    if(user?.role === 'admin'){
      navigate('/admin/add-inventory')
    }else{
      navigate('/stock-manager/add-inventory')
    }
    
  }

  // Show loading state while data is being fetched
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition-all duration-200 transform border border-transparent shadow-lg p-8flex bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 rounded-2xl">

        <h1 className="mb-2 text-3xl font-bold">
          {getGreeting()}, {user?.name}!
        </h1>
        <p className="text-lg text-blue-100">
          Welcome to your {user?.role.replace('-', ' ')} dashboard. Here's an overview of your inventory system.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6">
        <StatsCard
          title="Total Inventory"
          value={stats.totalitems}
          icon={Package}
          color="blue"
          trend={{ value: 12, direction: 'up' }}
        />
        
        <StatsCard
          title="Available Items"
          value={stats.availableitems}
          icon={CheckCircle}
          color="green"
          trend={{ value: 5, direction: 'up' }}
        />
        
        <StatsCard
          title="Pending Requests"
          value={stats.pendingrequests}
          icon={Clock}
          color="yellow"
          trend={{ value: 2, direction: 'down' }}
        />
        
        {stats.lowstockitems > 0 && (
          <StatsCard
            title="Low Stock Alert"
            value={stats.lowstockitems}
            icon={AlertTriangle}
            color="red"
            trend={{ value: 1, direction: 'up' }}
          />
        )}

        {(isAdmin || isStockManager) && (
          <>
            <StatsCard
              title="Issued Items"
              value={stats.issueditems}
              icon={TrendingUp}
              color="purple"
              trend={{ value: 8, direction: 'up' }}
            />
            
            <StatsCard
              title="Approved Requests"
              value={stats.approvedrequests}
              icon={CheckCircle}
              color="green"
              trend={{ value: 15, direction: 'up' }}
            />
            
            <StatsCard
              title="Rejected Requests"
              value={stats.rejectedrequests}
              icon={XCircle}
              color="red"
              trend={{ value: 3, direction: 'down' }}
            />

            {isAdmin && (
              <StatsCard
                title="Total Users"
                value={stats.totalusers}
                icon={Users}
                color="indigo"
                trend={{ value: 2, direction: 'up' }}
              />
            )}
          </>
        )}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Inventory Trend Chart */}
        <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-900">Inventory Trends</h3>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Last 6 months</span>
            </div>
          </div>
          <div className="h-80">
            {hasInventoryData ? (
              <InventoryTrendChart data={inventoryTrendData} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">No inventory data available</p>
                  <p className="text-sm text-gray-400">Add some inventory items to see trends</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Request Status Chart */}
        <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-900">Request Status</h3>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500"></div>
              <span className="text-sm text-gray-600">Current period</span>
            </div>
          </div>
          <div className="h-80">
            <RequestStatusChart data={requestStatusData} />
          </div>
        </div>
      </div>

      {/* Additional Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {/* Category Distribution */}
        <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Category Distribution</h3>
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-400 to-pink-500"></div>
          </div>
          <div className="h-64">
            {categoryData.categories.length > 0 ? (
              <CategoryDistributionChart data={categoryData} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Package className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                  <p className="text-gray-500">No categories found</p>
                  <p className="text-sm text-gray-400">Add inventory items to see distribution</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Asset Condition */}
        <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Asset Condition</h3>
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-400 to-blue-500"></div>
          </div>
          <div className="h-64">
            {hasInventoryData ? (
              <AssetConditionChart data={assetConditionData} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Package className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                  <p className="text-gray-500">No asset data available</p>
                  <p className="text-sm text-gray-400">Add inventory items to see conditions</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Monthly Activity */}
        <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Monthly Activity</h3>
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-orange-400 to-red-500"></div>
          </div>
          <div className="h-64">
            {(hasInventoryData || requests.length > 0) ? (
              <MonthlyActivityChart data={monthlyActivityData} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Package className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                  <p className="text-gray-500">No activity data available</p>
                  <p className="text-sm text-gray-400">Add inventory items or requests to see activity</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <RecentActivity />
        
        {/* Quick Actions */}
        <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
          <h3 className="mb-4 text-xl font-semibold text-gray-900">Quick Actions</h3>
          <div className="space-y-3">
            {(isAdmin || isStockManager) && (
              <>
                <button
                onClick={handleNavigateAddInventory}
                 className="flex items-center justify-between w-full p-4 text-white transition-all duration-200 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                  <span className="font-medium">Add New Inventory Item</span>
                  <Package size={20} />
                </button>
                
                <button 
                  onClick={() => {
                    if (user?.role === 'admin') {
                      navigate('/admin/requests');
                    } else {
                      navigate('/stock-manager/requests');
                    }
                  }}
                  className="flex items-center justify-between w-full p-4 text-white transition-all duration-200 rounded-lg bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700"
                >
                  <span className="font-medium">Review Pending Requests</span>
                  <ClipboardList size={20} />
                </button>
              </>
            )}
            
            {user?.role === 'employee' && (
              <button 
                onClick={() => navigate('/employee/create-request')}
                className="flex items-center justify-between w-full p-4 text-white transition-all duration-200 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
              >
                <span className="font-medium">Create New Request</span>
                <ClipboardList size={20} />
              </button>
            )}
            
            <button 
              onClick={() => {
                if (user?.role === 'admin') {
                  navigate('/admin/reports');
                } else if (user?.role === 'stock-manager') {
                  navigate('/stock-manager/reports');
                } else {
                  navigate('/employee/reports');
                }
              }}
              className="flex items-center justify-between w-full p-4 text-white transition-all duration-200 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
            >
              <span className="font-medium">Generate Report</span>
              <TrendingUp size={20} />
            </button>
          </div>
        </div>
      </div>


    </div>
  );
};

export default DashboardHome;