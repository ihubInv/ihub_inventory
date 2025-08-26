import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useInventory } from '../../contexts/InventoryContext';
import { RequestStatusChart, MonthlyActivityChart } from '../charts/ChartComponents';
import { 
  ClipboardList, 
  CheckCircle,
  Clock,
  XCircle,
  Plus,
  FileText
} from 'lucide-react';
import StatsCard from '../common/StatsCard';
import { useNavigate } from 'react-router-dom';

const EmployeeDashboardHome: React.FC = () => {
  const { user } = useAuth();
  const { requests, loading } = useInventory();
  const navigate = useNavigate();

  // Filter requests for current user
  const userRequests = requests.filter(req => req.employeeid === user?.id);
  
  const stats = {
    totalRequests: userRequests.length,
    pendingRequests: userRequests.filter(req => req.status === 'pending').length,
    approvedRequests: userRequests.filter(req => req.status === 'approved').length,
    rejectedRequests: userRequests.filter(req => req.status === 'rejected').length,
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const recentRequests = userRequests.slice(0, 5);

  // Chart data for employee dashboard
  const requestStatusData = {
    pending: stats.pendingRequests,
    approved: stats.approvedRequests,
    rejected: stats.rejectedRequests,
  };

  const monthlyActivityData = {
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    itemsAdded: [0, 0, 0, 0, 0, 0], // Employees don't add items
    requestsSubmitted: [2, 3, 1, 4, 2, 3],
  };

  // Show loading state while data is being fetched
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
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
        <p className="text-lg text-purple-100">
          Track your inventory requests and submit new ones as needed.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6">
        <StatsCard
          title="Total Requests"
          value={stats.totalRequests}
          icon={ClipboardList}
          color="blue"
          trend={{ value: 2, direction: 'up' }}
        />
        
        <StatsCard
          title="Pending Requests"
          value={stats.pendingRequests}
          icon={Clock}
          color="yellow"
          trend={{ value: 1, direction: 'up' }}
        />
        
        <StatsCard
          title="Approved Requests"
          value={stats.approvedRequests}
          icon={CheckCircle}
          color="green"
          trend={{ value: 1, direction: 'up' }}
        />
        
        <StatsCard
          title="Rejected Requests"
          value={stats.rejectedRequests}
          icon={XCircle}
          color="red"
          trend={{ value: 0, direction: 'neutral' }}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Recent Requests */}
        <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-900">Recent Requests</h3>
            <button
              onClick={() => navigate('/employee/requests')}
              className="text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              View All
            </button>
          </div>
          
          {recentRequests.length > 0 ? (
            <div className="space-y-4">
              {recentRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
                  <div>
                    <p className="font-medium text-gray-900">{request.itemtype}</p>
                    <p className="text-sm text-gray-600">Qty: {request.quantity} - {request.purpose}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(request.submittedat).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      request.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : request.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">No requests submitted yet</p>
              <p className="text-sm text-gray-500">Start by creating your first request</p>
            </div>
          )}
        </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Request Status Chart */}
        <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-900">My Request Status</h3>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-400 to-pink-500"></div>
              <span className="text-sm text-gray-600">All time</span>
            </div>
          </div>
          <div className="h-80">
            <RequestStatusChart data={requestStatusData} />
          </div>
        </div>

        {/* Monthly Request Activity */}
        <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-900">Request Activity</h3>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-400 to-cyan-500"></div>
              <span className="text-sm text-gray-600">Last 6 months</span>
            </div>
          </div>
          <div className="h-80">
            <MonthlyActivityChart data={monthlyActivityData} />
          </div>
        </div>
      </div>

        {/* Quick Actions */}
        <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
          <h3 className="mb-4 text-xl font-semibold text-gray-900">Quick Actions</h3>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/employee/create-request')}
              className="flex items-center justify-between w-full p-4 text-white transition-all duration-200 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
            >
              <span className="font-medium">Create New Request</span>
              <Plus size={20} />
            </button>
            
            <button
              onClick={() => navigate('/employee/requests')}
              className="flex items-center justify-between w-full p-4 text-white transition-all duration-200 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700"
            >
              <span className="font-medium">View Request Status</span>
              <ClipboardList size={20} />
            </button>
            
            <button
              onClick={() => navigate('/employee/profile')}
              className="flex items-center justify-between w-full p-4 text-white transition-all duration-200 rounded-lg bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700"
            >
              <span className="font-medium">Update Profile</span>
              <FileText size={20} />
            </button>
          </div>

          {/* Request Guidelines */}
          <div className="p-4 mt-6 rounded-lg bg-blue-50">
            <h4 className="mb-2 font-medium text-blue-900">Request Guidelines</h4>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>• Provide detailed justification for your request</li>
              <li>• Include exact specifications when needed</li>
              <li>• Allow 2-3 business days for approval</li>
              <li>• Contact admin for urgent requests</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboardHome;