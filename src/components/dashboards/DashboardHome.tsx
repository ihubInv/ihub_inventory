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
  XCircle,
  Activity,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react';
import StatsCard from '../common/StatsCard';
import RecentActivity from '../common/RecentActivity';
import AttractiveLoader from '../common/AttractiveLoader';
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
    return <AttractiveLoader message="Loading dashboard data..." variant="fullscreen" />;
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Enhanced Welcome Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-3xl shadow-2xl">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-72 h-72 bg-white opacity-10 rounded-full -translate-x-36 -translate-y-36 animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full translate-x-48 translate-y-48 animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-white opacity-5 rounded-full -translate-x-32 -translate-y-32 animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
        
        <div className="relative z-10 p-8 md:p-12">
          <div className="flex items-center justify-between">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-white bg-opacity-20 rounded-2xl backdrop-blur-sm">
                  <Activity className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 animate-slideInLeft">
                    {getGreeting()}, {user?.name}!
                  </h1>
                  <p className="text-xl text-blue-100 animate-slideInLeft" style={{ animationDelay: '0.2s' }}>
                    Welcome to your {user?.role.replace('-', ' ')} dashboard
                  </p>
                </div>
              </div>
              <p className="text-lg text-blue-100 max-w-2xl animate-slideInLeft" style={{ animationDelay: '0.4s' }}>
                Here's a comprehensive overview of your inventory system with real-time analytics and insights.
              </p>
            </div>
            
            {/* Quick Stats Preview */}
            <div className="hidden lg:flex space-x-4 animate-slideInRight" style={{ animationDelay: '0.6s' }}>
              <div className="text-center p-4 bg-white bg-opacity-10 rounded-2xl backdrop-blur-sm">
                <div className="text-2xl font-bold text-white">{stats.totalitems}</div>
                <div className="text-sm text-blue-100">Total Items</div>
              </div>
              <div className="text-center p-4 bg-white bg-opacity-10 rounded-2xl backdrop-blur-sm">
                <div className="text-2xl font-bold text-white">{stats.availableitems}</div>
                <div className="text-sm text-blue-100">Available</div>
              </div>
              <div className="text-center p-4 bg-white bg-opacity-10 rounded-2xl backdrop-blur-sm">
                <div className="text-2xl font-bold text-white">{stats.pendingrequests}</div>
                <div className="text-sm text-blue-100">Pending</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="animate-slideInUp" style={{ animationDelay: '0.1s' }}>
          <StatsCard
            title="Total Inventory"
            value={stats.totalitems}
            icon={Package}
            color="blue"
            trend={{ value: Math.round((stats.totalitems / Math.max(stats.totalitems - 10, 1)) * 100 - 100), direction: 'up' }}
          />
        </div>
        
        <div className="animate-slideInUp" style={{ animationDelay: '0.2s' }}>
          <StatsCard
            title="Available Items"
            value={stats.availableitems}
            icon={CheckCircle}
            color="green"
            trend={{ value: Math.round((stats.availableitems / Math.max(stats.totalitems, 1)) * 100), direction: 'up' }}
          />
        </div>
        
        <div className="animate-slideInUp" style={{ animationDelay: '0.3s' }}>
          <StatsCard
            title="Pending Requests"
            value={stats.pendingrequests}
            icon={Clock}
            color="yellow"
            trend={{ value: stats.pendingrequests > 0 ? 100 : 0, direction: stats.pendingrequests > 0 ? 'up' : 'down' }}
          />
        </div>
        
        <div className="animate-slideInUp" style={{ animationDelay: '0.4s' }}>
          {stats.lowstockitems > 0 ? (
            <StatsCard
              title="Low Stock Alert"
              value={stats.lowstockitems}
              icon={AlertTriangle}
              color="red"
              trend={{ value: 100, direction: 'up' }}
            />
          ) : (
            <StatsCard
              title="Stock Status"
              value="All Good"
              icon={CheckCircle}
              color="green"
              trend={{ value: 0, direction: 'down' }}
            />
          )}
        </div>

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

      {/* Enhanced Charts Section */}
      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        {/* Inventory Trend Chart */}
        <div className="group p-8 bg-white border border-gray-100 shadow-lg rounded-3xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 animate-slideInUp" style={{ animationDelay: '0.5s' }}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-lg">
                <LineChart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Inventory Trends</h3>
                <p className="text-sm text-gray-500">Growth over time</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 px-3 py-1 bg-blue-50 rounded-full">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-blue-700">Last 6 months</span>
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
        <div className="group p-8 bg-white border border-gray-100 shadow-lg rounded-3xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 animate-slideInUp" style={{ animationDelay: '0.6s' }}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl shadow-lg">
                <PieChart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Request Status</h3>
                <p className="text-sm text-gray-500">Current distribution</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 px-3 py-1 bg-orange-50 rounded-full">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-orange-700">Current period</span>
            </div>
          </div>
          <div className="h-80">
            <RequestStatusChart data={requestStatusData} />
          </div>
        </div>
      </div>

      {/* Additional Charts Row */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 xl:grid-cols-3">
        {/* Category Distribution */}
        <div className="group p-8 bg-white border border-gray-100 shadow-lg rounded-3xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 animate-slideInUp" style={{ animationDelay: '0.7s' }}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Category Distribution</h3>
                <p className="text-sm text-gray-500">By asset type</p>
              </div>
            </div>
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 animate-pulse"></div>
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