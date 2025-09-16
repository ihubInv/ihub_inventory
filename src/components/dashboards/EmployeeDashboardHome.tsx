import React from 'react';
import { useAppSelector } from '../../store/hooks';
import { useGetRequestsQuery, useGetInventoryItemsQuery } from '../../store/api';
import { RequestStatusChart } from '../charts/ChartComponents';
import { 
  ClipboardList, 
  CheckCircle,
  Clock,
  XCircle,
  Plus,
  FileText,
  Package
} from 'lucide-react';
import StatsCard from '../common/StatsCard';
import { useNavigate } from 'react-router-dom';
import AttractiveLoader from '../common/AttractiveLoader';

const EmployeeDashboardHome: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const { data: requests = [], isLoading: requestsLoading } = useGetRequestsQuery();
  const { data: inventoryItems = [], isLoading: itemsLoading } = useGetInventoryItemsQuery();
  const navigate = useNavigate();

  // Filter requests for current user
  const userRequests = requests.filter(req => req.employeeid === user?.id);
  
  // Get issued items for current employee
  const myIssuedItems = inventoryItems
    .filter(item => item.status === 'issued')
    .filter(item => {
      // Use actual database column and match by user NAME (not ID)
      const issuedTo = item.issuedto || '';
      const matches = issuedTo === user?.name;
      
      // Debug logging
      console.log('🔍 EmployeeDashboardHome Debug:', {
        itemId: item.id,
        itemName: item.assetname,
        status: item.status,
        issuedTo: issuedTo,
        currentUserName: user?.name,
        currentUserId: user?.id,
        matches: matches
      });
      
      return matches;
    });
  
  // Additional debug logging
  console.log('🔍 EmployeeDashboardHome Summary:', {
    totalInventoryItems: inventoryItems.length,
    issuedItems: inventoryItems.filter(item => item.status === 'issued').length,
    myIssuedItemsCount: myIssuedItems.length,
    currentUser: user?.name,
    currentUserId: user?.id,
    allIssuedItems: inventoryItems.filter(item => item.status === 'issued').map(item => ({
      id: item.id,
      name: item.assetname,
      issuedTo: item.issuedto,
      issuedBy: item.issuedby
    }))
  });
  
  const stats = {
    totalRequests: userRequests.length,
    pendingRequests: userRequests.filter(req => req.status === 'pending').length,
    approvedRequests: userRequests.filter(req => req.status === 'approved').length,
    rejectedRequests: userRequests.filter(req => req.status === 'rejected').length,
    issuedItems: myIssuedItems.length,
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const recentRequests = userRequests.slice(0, 5);
  const recentIssuedItems = myIssuedItems.slice(0, 3);

  // Chart data for employee dashboard
  const requestStatusData = {
    pending: stats.pendingRequests,
    approved: stats.approvedRequests,
    rejected: stats.rejectedRequests,
  };



  // Show loading state while data is being fetched
  if (requestsLoading || itemsLoading) {
    return <AttractiveLoader message="Loading your dashboard..." variant="fullscreen" />;
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 sm:gap-6">
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
        
        <StatsCard
          title="Issued Items"
          value={stats.issuedItems}
          icon={Package}
          color="purple"
          trend={{ value: 0, direction: 'neutral' }}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Recent Requests - Left Column */}
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

        {/* Recent Issued Items - Center Column */}
        <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-900">Recent Issued Items</h3>
            <button
              onClick={() => navigate('/employee/issued-items')}
              className="text-sm font-medium text-purple-600 hover:text-purple-800"
            >
              View All
            </button>
          </div>
          
          {recentIssuedItems.length > 0 ? (
            <div className="space-y-4">
              {recentIssuedItems.map((item) => {
                // Use actual database columns instead of parsing description
                const issuedBy = item.issuedby || 'Unknown';
                const issueDate = item.issueddate?.toISOString() || 
                                 item.dateofissue?.toISOString() || 
                                 (item.lastmodifieddate ? new Date(item.lastmodifieddate).toISOString() : 'Unknown');
                
                // Parse purpose from description as fallback (for backward compatibility)
                const description = item.description || '';
                const purposeMatch = description.match(/PURPOSE: (.+)/);
                const purpose = purposeMatch ? purposeMatch[1] : 'Direct Issue';
                
                return (
                  <div key={item.id} className="flex items-center justify-between p-4 rounded-lg bg-purple-50">
                    <div>
                      <p className="font-medium text-gray-900">{item.assetname}</p>
                      <p className="text-sm text-gray-600">{purpose}</p>
                      <p className="text-xs text-gray-500">
                        Issued by: {issuedBy} • {new Date(issueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        Issued
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center">
              <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">No items issued to you yet</p>
              <p className="text-sm text-gray-500">Items will appear here when issued by managers</p>
            </div>
          )}
        </div>

        {/* Request Status Chart - Right Column */}
        <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-900">My Request Status</h3>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-[#0d559e] to-[#1a6bb8]"></div>
              <span className="text-sm text-gray-600">All time</span>
            </div>
          </div>
          <div className="h-80">
            <RequestStatusChart data={requestStatusData} />
          </div>
        </div>

        {/* Right Column - Quick Actions and Request Activity */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
            <h3 className="mb-4 text-xl font-semibold text-gray-900">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/employee/create-request')}
                className="flex items-center justify-between w-full p-4 text-white transition-all duration-200 rounded-lg bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
              >
                <span className="font-medium">Create New Request</span>
                <Plus size={20} className="text-green-500" />
              </button>
              
              <button
                onClick={() => navigate('/employee/requests')}
                className="flex items-center justify-between w-full p-4 text-white transition-all duration-200 rounded-lg bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
              >
                <span className="font-medium">View Request Status</span>
                <ClipboardList size={20} />
              </button>
              
              <button
                onClick={() => navigate('/employee/issued-items')}
                className="flex items-center justify-between w-full p-4 text-white transition-all duration-200 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
              >
                <span className="font-medium">View Issued Items</span>
                <Package size={20} />
              </button>
              
              <button
                onClick={() => navigate('/employee/profile')}
                className="flex items-center justify-between w-full p-4 text-white transition-all duration-200 rounded-lg bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
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
    </div>
  );
};

export default EmployeeDashboardHome;