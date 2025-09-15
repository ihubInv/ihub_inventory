import React, { useState } from 'react';
import { debugRequestApproval } from '../../utils/debugRequestApproval';
import { useAppSelector } from '../../store/hooks';
import { AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';

const RequestApprovalDebugger: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [requestId, setRequestId] = useState('');
  const [isDebugging, setIsDebugging] = useState(false);
  const [debugResult, setDebugResult] = useState<any>(null);

  const handleDebug = async () => {
    if (!requestId.trim()) {
      alert('Please enter a request ID');
      return;
    }

    setIsDebugging(true);
    try {
      const result = await debugRequestApproval(requestId, user?.id || '');
      setDebugResult(result);
    } catch (error) {
      console.error('Debug error:', error);
      setDebugResult({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setIsDebugging(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-200">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <AlertTriangle className="w-8 h-8 mr-3 text-orange-600" />
          Request Approval Debugger
        </h2>
        <p className="mt-2 text-gray-600">
          Debug request approval issues and check permissions
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Request ID to Debug
          </label>
          <input
            type="text"
            value={requestId}
            onChange={(e) => setRequestId(e.target.value)}
            placeholder="Enter request ID..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          onClick={handleDebug}
          disabled={isDebugging || !requestId.trim()}
          className="flex items-center px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw size={16} className={`mr-2 ${isDebugging ? 'animate-spin' : ''}`} />
          {isDebugging ? 'Debugging...' : 'Debug Request'}
        </button>

        {debugResult && (
          <div className="mt-6 p-4 border rounded-lg">
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              {debugResult.success ? (
                <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
              ) : (
                <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
              )}
              Debug Results
            </h3>

            <div className="space-y-3">
              <div>
                <strong>Current User:</strong>
                <pre className="mt-1 p-2 bg-gray-100 rounded text-sm overflow-auto">
                  {JSON.stringify(debugResult.user, null, 2)}
                </pre>
              </div>

              <div>
                <strong>Request Data:</strong>
                <pre className="mt-1 p-2 bg-gray-100 rounded text-sm overflow-auto">
                  {JSON.stringify(debugResult.request, null, 2)}
                </pre>
              </div>

              <div>
                <strong>Has Permission:</strong>
                <span className={`ml-2 px-2 py-1 rounded text-sm ${
                  debugResult.hasPermission ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {debugResult.hasPermission ? 'YES' : 'NO'}
                </span>
              </div>

              <div>
                <strong>SELECT Test:</strong>
                <pre className="mt-1 p-2 bg-gray-100 rounded text-sm overflow-auto">
                  {JSON.stringify(debugResult.selectTest, null, 2)}
                </pre>
              </div>

              <div>
                <strong>UPDATE Test:</strong>
                <pre className="mt-1 p-2 bg-gray-100 rounded text-sm overflow-auto">
                  {JSON.stringify(debugResult.updateTest, null, 2)}
                </pre>
              </div>

              {debugResult.error && (
                <div>
                  <strong>Error:</strong>
                  <p className="mt-1 p-2 bg-red-100 text-red-800 rounded text-sm">
                    {debugResult.error}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestApprovalDebugger;
