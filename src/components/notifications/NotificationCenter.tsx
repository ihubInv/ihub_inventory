// import React from 'react';
// import { useNotifications } from '../../contexts/NotificationContext';
// import { sendNotificationEmail } from '../../services/emailService';
// import { Bell, Check, Trash2, AlertTriangle, CheckCircle, XCircle, Package, User } from 'lucide-react';
// import { useInventory } from '../../contexts/InventoryContext';

// const NotificationCenter: React.FC = () => {
//   const { notifications, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
//   const { requests } = useInventory();
//   const getNotificationIcon = (type: string) => {
//     switch (type) {
//       case 'request':
//         return Bell;
//       case 'approval':
//         return CheckCircle;
//       case 'rejection':
//         return XCircle;
//       case 'low-stock':
//         return AlertTriangle;
//       case 'system':
//         return Package;
//       default:
//         return Bell;
//     }
//   };

//   const getNotificationColor = (type: string) => {
//     switch (type) {
//       case 'request':
//         return 'from-blue-500 to-cyan-600';
//       case 'approval':
//         return 'from-green-500 to-teal-600';
//       case 'rejection':
//         return 'from-red-500 to-pink-600';
//       case 'low-stock':
//         return 'from-yellow-500 to-orange-600';
//       case 'system':
//         return 'from-purple-500 to-indigo-600';
//       default:
//         return 'from-gray-500 to-gray-600';
//     }
//   };

//   const formatTime = (date: Date) => {
//     const now = new Date();
//     const diff = now.getTime() - new Date(date).getTime();
//     const hours = Math.floor(diff / (1000 * 60 * 60));
//     const days = Math.floor(hours / 24);

//     if (days > 0) return `${days}d ago`;
//     if (hours > 0) return `${hours}h ago`;
//     return 'Just now';
//   };

//   // const pandingNotifications = notifications.filter(n => !n.isread);
//   // const readNotifications = notifications.filter(n => n.isread);
// console.log("notifications>>>",notifications)
// const pandingNotifications = requests.filter(n => n.status === 'pending');
// const approvedNotifications = requests.filter(n => n.status === 'approved');
// const rejectedNotifications = requests.filter(n => n.status === 'rejected');



// // Mock notifications for demonstration
// console.log("????",pandingNotifications)

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
//           <p className="mt-1 text-gray-600">Stay updated with system alerts and requests</p>
//         </div>
//         {pandingNotifications.length > 0 && (
//           <button
//             onClick={markAllAsRead}
//             className="flex items-center px-4 py-2 space-x-2 text-white transition-all duration-200 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
//           >
//             <Check size={16} />
//             <span>Mark All Read</span>
//           </button>
//         )}
//       </div>

//       {/* Stats */}
//       <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6">
//         <div className="p-4 bg-white border border-gray-100 shadow-sm rounded-2xl">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium text-gray-600">Total Notifications</p>
//               <p className="text-2xl font-bold text-gray-900">{requests.length}</p>
//             </div>
//             <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600">
//               <Bell className="w-6 h-6 text-white" />
//             </div>
//           </div>
//         </div>

//         <div className="p-4 bg-white border border-gray-100 shadow-sm rounded-2xl">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium text-gray-600">panding</p>
//               <p className="text-2xl font-bold text-gray-900">{pandingNotifications.length}</p>
//             </div>
//             <div className="p-3 rounded-xl bg-gradient-to-r from-red-500 to-pink-600">
//               <AlertTriangle className="w-6 h-6 text-white" />
//             </div>
//           </div>
//         </div>

//         <div className="p-4 bg-white border border-gray-100 shadow-sm rounded-2xl">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium text-gray-600">Approved</p>
//               <p className="text-2xl font-bold text-gray-900">{pandingNotifications.length}</p>
//             </div>
//             <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-teal-600">
//               <CheckCircle className="w-6 h-6 text-white" />
//             </div>
//           </div>
//         </div>

//         <div className="p-4 bg-white border border-gray-100 shadow-sm rounded-2xl">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium text-gray-600">Rejected</p>
//               <p className="text-2xl font-bold text-gray-900">{pandingNotifications.length}</p>
//             </div>
//             <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-teal-600">
//               <CheckCircle className="w-6 h-6 text-white" />
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Notifications List */}
//       <div className="space-y-4">
//         {/* Unread Notifications */}
//         {pandingNotifications.length > 0 && (
//           <div className="overflow-hidden bg-white border border-gray-100 shadow-sm rounded-2xl">
//             <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
//               <h3 className="text-lg font-semibold text-gray-900">
//                 Unread Notifications ({pandingNotifications.length})
//               </h3>
//             </div>
//             <div className="divide-y divide-gray-200">
//               {pandingNotifications.map((notification) => {
//                 const IconComponent = getNotificationIcon(notification.status);
//                 const colorClass = getNotificationColor(notification.status);
                
//                 return (
//                   <div key={notification.id} className="p-6 transition-colors hover:bg-gray-50">
//                     <div className="flex items-start space-x-4">
//                       <div className={`flex-shrink-0 p-2 rounded-lg bg-gradient-to-r ${colorClass}`}>
//                         <IconComponent className="w-5 h-5 text-white" />
//                       </div>
//                       <div className="flex-1 min-w-0">
//                         <div className="flex items-start justify-between">
//                           <div>
//                             <h4 className="text-sm font-medium text-gray-900">{notification.employeename}</h4>
//                             <p className="mt-1 text-sm text-gray-600"><i>{notification.itemtype}</i></p>
//                             <p className="mt-1 text-sm text-gray-600">{notification.justification}</p>
//                             <p className="mt-2 text-xs text-gray-500">{formatTime(notification.submittedat)}</p>
//                           </div>
//                           <div className="flex items-center ml-4 space-x-2">
//                             <button
//                               onClick={() => markAsRead(notification.id)}
//                               className="p-1 text-blue-600 rounded hover:text-blue-800"
//                               title="Mark as read"
//                             >
//                               <Check size={16} />
//                             </button>
//                             <button
//                               onClick={() => deleteNotification(notification.id)}
//                               className="p-1 text-red-600 rounded hover:text-red-800"
//                               title="Delete notification"
//                             >
//                               <Trash2 size={16} />
//                             </button>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
//         )}

//         {/* Read Notifications */}
//         {approvedNotifications.length > 0 && (
//           <div className="overflow-hidden bg-white border border-gray-100 shadow-sm rounded-2xl">
//             <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
//               <h3 className="text-lg font-semibold text-gray-900">
//                 Read Notifications ({approvedNotifications.length})
//               </h3>
//             </div>
//             <div className="divide-y divide-gray-200">
//               {approvedNotifications.map((notification) => {
//                 const IconComponent = getNotificationIcon(notification.status);
                
//                 return (
//                   <div key={notification.id} className="p-6 transition-colors opacity-75 hover:bg-gray-50">
//                     <div className="flex items-start space-x-4">
//                       <div className="flex-shrink-0 p-2 bg-gray-200 rounded-lg">
//                         <IconComponent className="w-5 h-5 text-gray-600" />
//                       </div>
//                       <div className="flex-1 min-w-0">
//                         <div className="flex items-start justify-between">
//                           <div>
//                           <h4 className="text-sm font-medium text-gray-900">{notification.employeename}</h4>
//                           <p className="mt-1 text-sm text-gray-600"><b><i>{notification.itemtype}</i></b></p>
//                             <p className="mt-1 text-sm text-gray-600">{notification.justification}</p>
//                             <p className="mt-2 text-xs text-gray-500">{formatTime(notification.submittedat)}</p>
//                           </div>
//                           <button
//                             onClick={() => deleteNotification(notification.id)}
//                             className="p-1 ml-4 text-red-600 rounded hover:text-red-800"
//                             title="Delete notification"
//                           >
//                             <Trash2 size={16} />
//                           </button>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
//         )}


//   {/* Read Notifications */}
//   {rejectedNotifications.length > 0 && (
//           <div className="overflow-hidden bg-white border border-gray-100 shadow-sm rounded-2xl">
//             <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
//               <h3 className="text-lg font-semibold text-gray-900">
//                 Read Notifications ({rejectedNotifications.length})
//               </h3>
//             </div>
//             <div className="divide-y divide-gray-200">
//               {rejectedNotifications.map((notification) => {
//                 const IconComponent = getNotificationIcon(notification.status);
                
//                 return (
//                   <div key={notification.id} className="p-6 transition-colors opacity-75 hover:bg-gray-50">
//                     <div className="flex items-start space-x-4">
//                       <div className="flex-shrink-0 p-2 bg-gray-200 rounded-lg">
//                         <IconComponent className="w-5 h-5 text-gray-600" />
//                       </div>
//                       <div className="flex-1 min-w-0">
//                         <div className="flex items-start justify-between">
//                           <div>
//                           <h4 className="text-sm font-medium text-gray-900">{notification.employeename}</h4>
//                             <p className="mt-1 text-sm text-gray-600">{notification.justification}</p>
//                             <p className="mt-1 text-sm text-gray-600"><b>{notification.itemtype}</b></p>
//                             <p className="mt-2 text-xs text-gray-500">{formatTime(notification.submittedat)}</p>
//                           </div>
//                           <button
//                             onClick={() => deleteNotification(notification.id)}
//                             className="p-1 ml-4 text-red-600 rounded hover:text-red-800"
//                             title="Delete notification"
//                           >
//                             <Trash2 size={16} />
//                           </button>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
//         )}
//         {/* Empty State */}
//         {requests.length === 0 && (
//           <div className="p-12 text-center bg-white border border-gray-100 shadow-sm rounded-2xl">
//             <Bell className="w-12 h-12 mx-auto mb-4 text-gray-400" />
//             <h3 className="mb-2 text-lg font-medium text-gray-900">No notifications</h3>
//             <p className="text-gray-600">You're all caught up! Notifications will appear here when you have updates.</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default NotificationCenter;






// import React, { useState } from 'react';
// import { useInventory } from '../../contexts/InventoryContext';
// import { Bell,AlertTriangle, CheckCircle, XCircle, Trash2, CheckCircleIcon, CrossIcon, X } from 'lucide-react';
// import { useNotifications } from '../../contexts/NotificationContext';

// const NotificationCenter: React.FC = () => {
//   const { requests } = useInventory();
//   const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  

//   const pendingNotifications = requests.filter(n => n.status === 'pending');
//   const approvedNotifications = requests.filter(n => n.status === 'approved');
//   const rejectedNotifications = requests.filter(n => n.status === 'rejected');

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
//           <p className="mt-1 text-gray-600">Stay updated with system alerts and requests</p>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6">
      
// <div
//   onClick={() => setActiveTab('all')}
//   className={`cursor-pointer rounded-2xl transition-shadow hover:shadow-md ${
//     activeTab === 'all' ? 'ring-2 ring-blue-400' : ''
//   }`}
// >
//   <StatCard
//     title="Total Notifications"
//     value={requests.length}
//     icon={<Bell />}
//     color="from-blue-500 to-cyan-600"
//   />
// </div>

// <div
//   onClick={() => setActiveTab('pending')}
//   className={`cursor-pointer rounded-2xl transition-shadow hover:shadow-md ${
//     activeTab === 'pending' ? 'ring-2 ring-yellow-400' : ''
//   }`}
// >
//   <StatCard
//     title="Pending"
//     value={pendingNotifications.length}
//     icon={<AlertTriangle />}
//     color="from-yellow-500 to-orange-600"
//   />
// </div>

// <div
//   onClick={() => setActiveTab('approved')}
//   className={`cursor-pointer rounded-2xl transition-shadow hover:shadow-md ${
//     activeTab === 'approved' ? 'ring-2 ring-green-400' : ''
//   }`}
// >
//   <StatCard
//     title="Approved"
//     value={approvedNotifications.length}
//     icon={<CheckCircle />}
//     color="from-green-500 to-teal-600"
//   />
// </div>

// <div
//   onClick={() => setActiveTab('rejected')}
//   className={`cursor-pointer rounded-2xl transition-shadow hover:shadow-md ${
//     activeTab === 'rejected' ? 'ring-2 ring-red-400' : ''
//   }`}
// >
//   <StatCard
//     title="Rejected"
//     value={rejectedNotifications.length}
//     icon={<XCircle />}
//     color="from-red-500 to-pink-600"
//   />
// </div>





//       </div>

// <div>
//       {activeTab === 'all' && (
//   <NotificationList
//     title="Pending Requests"
//     notifications={pendingNotifications}
//     iconColor="from-yellow-500 to-orange-600"
//   />
// )}
// {activeTab === 'pending' && (
//   <NotificationList
//     title="Pending Requests"
//     notifications={pendingNotifications}
//     iconColor="from-yellow-500 to-orange-600"
//   />
// )}

// {activeTab === 'approved' && (
//   <NotificationList
//     title="Approved Requests"
//     notifications={approvedNotifications}
//     iconColor="from-green-500 to-teal-600"
//     readOnly
//   />
// )}

// {activeTab === 'rejected' && (
//   <NotificationList
//     title="Rejected Requests"
//     notifications={rejectedNotifications}
//     iconColor="from-red-500 to-pink-600"
//     readOnly
//   />
// )}

//       {requests.length === 0 && (
//         <div className="p-12 text-center bg-white border border-gray-100 shadow-sm rounded-2xl">
//           <Bell className="w-12 h-12 mx-auto mb-4 text-gray-400" />
//           <h3 className="mb-2 text-lg font-medium text-gray-900">No notifications</h3>
//           <p className="text-gray-600">You're all caught up! Notifications will appear here when you have updates.</p>
//         </div>
//       )}

// </div>
//     </div>
//   );
// };

// const StatCard = ({ title, value, icon, color }: { title: string, value: number, icon: React.ReactNode, color: string }) => (
//   <div className="p-4 bg-white border border-gray-100 shadow-sm rounded-2xl">
//     <div className="flex items-center justify-between">
//       <div>
//         <p className="text-sm font-medium text-gray-600">{title}</p>
//         <p className="text-2xl font-bold text-gray-900">{value}</p>
//       </div>
//       <div className={`p-3 rounded-xl bg-gradient-to-r ${color}`}>
//         {icon}
//       </div>
//     </div>
//   </div>
// );

// const NotificationList = ({ title, notifications, iconColor, readOnly = false }: { title: string, notifications: any[], iconColor: string, readOnly?: boolean }) => {
//   const {deleteNotification}=useNotifications()
//   const { updateRequestStatus } = useInventory();
  
//   const formatTime = (date: string) => {
//     const now = new Date();
//     const submittedDate = new Date(date);
//     const diff = now.getTime() - submittedDate.getTime();
//     const hours = Math.floor(diff / (1000 * 60 * 60));
//     const days = Math.floor(hours / 24);

//     if (days > 0) return `${days}d ago`;
//     if (hours > 0) return `${hours}h ago`;
//     return 'Just now';
//   };

//   const handleApprovedStatus = (notification: any) => {
//     debugger
//     console.log("notification", notification);
//     const user = JSON.parse(localStorage.getItem('user') || '{}');
//    console.log(user);
//     if (notification) {
//       updateRequestStatus(
//         notification.id,
//         "approved",
//         user.role,
//         user.id
//       );
//     }
//   };
  


//   const handleRejectStatus = (notification: any) => {
//     debugger
//     console.log("notification", notification);
//     const user = JSON.parse(localStorage.getItem('user') || '{}');
//    console.log(user);
//     if (notification) {
//       updateRequestStatus(
//         notification.id,
//         "rejected",
//         user.role,
//         user.id
//       );
//     }
//   };
  












  
//   return notifications?.length > 0 ? (
//     <div className="overflow-hidden bg-white border border-gray-100 shadow-sm rounded-2xl">
//       <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
//         <h3 className="text-lg font-semibold text-gray-900">{title} ({notifications?.length})</h3>
//       </div>
//       <div className="divide-y divide-gray-200">
//         {notifications?.map((notification) => (
//           <div key={notification.id} className={`p-6 transition-colors ${readOnly ? 'opacity-75' : ''} hover:bg-gray-50`}>
//             <div className="flex items-start space-x-4">
//               <div className={`flex-shrink-0 p-2 rounded-lg bg-gradient-to-r ${iconColor}`}>
//                 <Bell className="w-5 h-5 text-white" />
//               </div>
//               <div className="flex-1 min-w-0">
//                 <div className="flex items-start justify-between">
//                   <div>
//                     <h4 className="text-sm font-medium text-gray-900">{notification?.employeename}</h4>
//                     <p className="mt-1 text-sm text-gray-600">{notification?.justification}</p>
//                     <p className="mt-1 text-sm text-gray-600"><b>{notification?.itemtype}</b></p>
//                     <p className="mt-2 text-xs text-gray-500">{formatTime(notification?.submittedat)}</p>
//                   </div>
//                   <div className='flex items-end justify-between'>
//                   <button
//                             onClick={() => handleApprovedStatus(notification)}
//                             className="p-1 ml-4 text-red-600 rounded hover:text-red-800"
//                             title="Approved notification"
//                           >
//                             <CheckCircleIcon size={16} />
//                           </button>
//                   <button
//                             onClick={() => handleRejectStatus(notification)}
//                             className="p-1 ml-4 text-red-600 rounded hover:text-red-800"
//                             title="Reject notification"
//                           >
//                             <X size={16} />
//                           </button>
                  
//                   <button
//                             onClick={() => deleteNotification(notification.id)}
//                             className="p-1 ml-4 text-red-600 rounded hover:text-red-800"
//                             title="Delete notification"
//                           >
//                             <Trash2 size={16} />
//                           </button>
//                           </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   ) : null;
// };

// export default NotificationCenter;






import React, { useState } from 'react';
import { useInventory } from '../../contexts/InventoryContext';
import { Bell, AlertTriangle, CheckCircle, XCircle, Trash2, CheckCircleIcon, X, Filter, Search } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
;

const NotificationCenter: React.FC = () => {
  const { requests } = useInventory();
 
 
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  const userRequests = user?.role === 'employee'
    ? requests.filter(req => req.employeeid === user.id)
    : requests;
  
  const filteredRequests = userRequests.filter(request => {
    const matchesSearch =
      request.itemtype.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.employeename.toLowerCase().includes(searchTerm.toLowerCase());
  
    const matchesStatus = activeTab === 'all' || request.status === activeTab || request.status === 'pending'||request.status === 'approved'||request.status === 'rejected';
    return matchesSearch && matchesStatus;
  });
 
  const pendingNotifications = filteredRequests.filter(n => n.status === 'pending');
  const approvedNotifications = filteredRequests.filter(n => n.status === 'approved');
  const rejectedNotifications = filteredRequests.filter(n => n.status === 'rejected');
  
  // const pendingNotifications = requests.filter(n => n.status === 'pending');
  // const approvedNotifications = requests.filter(n => n.status === 'approved');
  // const rejectedNotifications = requests.filter(n => n.status === 'rejected');

  const renderList = () => {
    if (activeTab === 'all') {
      if (requests.length === 0) return renderEmpty();
      return (
        <>
          {pendingNotifications.length > 0 && (
            <NotificationList title="Pending Requests" notifications={pendingNotifications} iconColor="from-yellow-500 to-orange-600" />
          )}
          {approvedNotifications.length > 0 && (
            <NotificationList title="Approved Requests" notifications={approvedNotifications} iconColor="from-green-500 to-teal-600" readOnly />
          )}
          {rejectedNotifications.length > 0 && (
            <NotificationList title="Rejected Requests" notifications={rejectedNotifications} iconColor="from-red-500 to-pink-600" readOnly />
          )}
        </>
      );
    }

    const tabData = {
      pending: pendingNotifications,
      approved: approvedNotifications,
      rejected: rejectedNotifications
    };

    const titleMap = {
      pending: 'Pending Requests',
      approved: 'Approved Requests',
      rejected: 'Rejected Requests'
    };

    const colorMap = {
      pending: 'from-yellow-500 to-orange-600',
      approved: 'from-green-500 to-teal-600',
      rejected: 'from-red-500 to-pink-600'
    };

    const list = tabData[activeTab];
    if (!list.length) return renderEmpty();
    return <NotificationList title={titleMap[activeTab]} notifications={list} iconColor={colorMap[activeTab]} readOnly={activeTab !== 'pending'} />;
  };

  const renderEmpty = () => (
    <div className="p-12 text-center bg-white border border-gray-100 shadow-sm rounded-2xl">
      <Bell className="w-12 h-12 mx-auto mb-4 text-gray-400" />
      <h3 className="mb-2 text-lg font-medium text-gray-900">No notifications</h3>
      <p className="text-gray-600">You're all caught up! Notifications will appear here when you have updates.</p>
    </div>
  );

  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="mt-1 text-gray-600">Stay updated with system alerts and requests</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6">
        {[
          { key: 'all', title: 'Total Notifications', value: filteredRequests.length, icon: <Bell />, color: 'from-blue-500 to-cyan-600', ring: 'ring-blue-400' },
          { key: 'pending', title: 'Pending', value: pendingNotifications.length, icon: <AlertTriangle />, color: 'from-yellow-500 to-orange-600', ring: 'ring-yellow-400' },
          { key: 'approved', title: 'Approved', value: approvedNotifications.length, icon: <CheckCircle />, color: 'from-green-500 to-teal-600', ring: 'ring-green-400' },
          { key: 'rejected', title: 'Rejected', value: rejectedNotifications.length, icon: <XCircle />, color: 'from-red-500 to-pink-600', ring: 'ring-red-400' }
        ].map(({ key, title, value, icon, color, ring }) => (
          <div
            key={key}
            onClick={() => setActiveTab(key as any)}
            className={`cursor-pointer rounded-2xl transition-shadow hover:shadow-md ${activeTab === key ? `ring-2 ${ring}` : ''}`}
          >
            <StatCard title={title} value={value} icon={icon} color={color} />
          </div>
        ))}
      </div>
      <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="relative">
            <Search className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" size={16} />
            <input
              type="text"
              placeholder="Search requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          
        </div>
      </div>
      <div>{renderList()}</div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }: { title: string, value: number, icon: React.ReactNode, color: string }) => (
  <div className="p-4 bg-white border border-gray-100 shadow-sm rounded-2xl">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
      <div className={`p-3 rounded-xl bg-gradient-to-r ${color}`}>{icon}</div>
    </div>
  </div>
);

const NotificationList = ({ title, notifications, iconColor, readOnly = false }: { title: string, notifications: any[], iconColor: string, readOnly?: boolean }) => {
  // const { deleteNotification } = useNotifications();
  const { updateRequestStatus } = useInventory();

  const formatTime = (date: string) => {
    const now = new Date();
    const submittedDate = new Date(date);
    const diff = now.getTime() - submittedDate.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  const handleStatusUpdate = (notification: any, status: 'approved' | 'rejected') => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (notification) {
      updateRequestStatus(notification.id, status, user.role, user.id);
    }
  };

  return notifications.length > 0 ? (
    <div className="overflow-hidden bg-white border border-gray-100 shadow-sm rounded-2xl">
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <h3 className="text-lg font-semibold text-gray-900">{title} ({notifications.length})</h3>
      </div>
      <div className="divide-y divide-gray-200">
        {notifications.map(notification => (
          <div key={notification.id} className={`p-6 transition-colors ${readOnly ? 'opacity-75' : ''} hover:bg-gray-50`}>
            <div className="flex items-start space-x-4">
              <div className={`flex-shrink-0 p-2 rounded-lg bg-gradient-to-r ${iconColor}`}>
                <Bell className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{notification.employeename}</h4>
                    <p className="mt-1 text-sm text-gray-600">{notification.justification}</p>
                    <p className="mt-1 text-sm font-semibold text-gray-600">{notification.itemtype}</p>
                    <p className="mt-2 text-xs text-gray-500">{formatTime(notification.submittedat)}</p>
                  </div>
                  {!readOnly && (
                    <div className='flex items-end justify-between'>
                      <button onClick={() => handleStatusUpdate(notification, 'approved')} className="p-1 ml-4 text-green-600 rounded hover:text-green-800" title="Approve notification">
                        <CheckCircleIcon size={16} />
                      </button>
                      <button onClick={() => handleStatusUpdate(notification, 'rejected')} className="p-1 ml-4 text-yellow-600 rounded hover:text-yellow-800" title="Reject notification">
                        <X size={16} />
                      </button>
                     
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  ) : null;
};

export default NotificationCenter;
