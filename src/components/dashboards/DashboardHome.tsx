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
  const { inventoryItems, requests, users } = useInventory();
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

  // Mock chart data - in real app, this would come from API
  const inventoryTrendData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    totalitems: [120, 135, 142, 158, 165, 172],
    availableitems: [95, 108, 115, 125, 132, 138],
  };

  const requestStatusData = {
    pending: stats.pendingrequests,
    approved: stats.approvedrequests,
    rejected: stats.rejectedrequests,
  };

  const categoryData = {
    categories: ['Electronics', 'Furniture', 'Software', 'Office Supplies', 'Equipment'],
    counts: [45, 32, 18, 28, 15],
  };

  const assetConditionData = {
    excellent: inventoryItems.filter(item => item.conditionofasset === 'excellent').length,
    good: inventoryItems.filter(item => item.conditionofasset === 'good').length,
    fair: inventoryItems.filter(item => item.conditionofasset === 'fair').length,
    poor: inventoryItems.filter(item => item.conditionofasset === 'poor').length,
    damaged: inventoryItems.filter(item => item.conditionofasset === 'damaged').length,
  };

  const monthlyActivityData = {
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    itemsAdded: [12, 18, 8, 22, 15, 25],
    requestsSubmitted: [8, 12, 15, 10, 18, 14],
  };


  const handleNavigateAddInventory=()=>{
    if(user?.role === 'admin'){
      navigate('/admin/add-inventory')
    }else{
      navigate('/stock-manager/add-inventory')
    }
    
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
            <InventoryTrendChart data={inventoryTrendData} />
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
            <CategoryDistributionChart data={categoryData} />
          </div>
        </div>

        {/* Asset Condition */}
        <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Asset Condition</h3>
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-400 to-blue-500"></div>
          </div>
          <div className="h-64">
            <AssetConditionChart data={assetConditionData} />
          </div>
        </div>

        {/* Monthly Activity */}
        <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Monthly Activity</h3>
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-orange-400 to-red-500"></div>
          </div>
          <div className="h-64">
            <MonthlyActivityChart data={monthlyActivityData} />
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