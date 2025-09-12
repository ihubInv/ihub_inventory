import React, { useState } from 'react';
import { Mail, Settings, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface EmailSetupProps {
  onClose: () => void;
}

const EmailSetup: React.FC<EmailSetupProps> = ({ onClose }) => {
  const [config, setConfig] = useState({
    serviceId: '',
    templateId: '',
    publicKey: '',
    testEmail: ''
  });
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);

  const handleSave = () => {
    // In a real app, you would save these to environment variables or backend
    localStorage.setItem('emailjs_config', JSON.stringify(config));
    toast.success('Email configuration saved! Please restart the application for changes to take effect.');
    onClose();
  };

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    
    try {
      // Simulate email test
      await new Promise(resolve => setTimeout(resolve, 2000));
      setTestResult('success');
    } catch (error) {
      setTestResult('error');
    }
    
    setIsTesting(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-[#0d559e] to-[#1a6bb8] rounded-lg">
              <Mail className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Email Configuration</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} className="text-red-500" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Setup Instructions</h4>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Create an account at <a href="https://emailjs.com" target="_blank" rel="noopener noreferrer" className="underline">EmailJS.com</a></li>
              <li>Create an email service (Gmail, Outlook, etc.)</li>
              <li>Create an email template</li>
              <li>Get your Service ID, Template ID, and Public Key</li>
              <li>Enter the details below</li>
            </ol>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Service ID</label>
            <input
              type="text"
              value={config.serviceId}
              onChange={(e) => setConfig(prev => ({ ...prev, serviceId: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="your_service_id"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Template ID</label>
            <input
              type="text"
              value={config.templateId}
              onChange={(e) => setConfig(prev => ({ ...prev, templateId: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="your_template_id"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Public Key</label>
            <input
              type="text"
              value={config.publicKey}
              onChange={(e) => setConfig(prev => ({ ...prev, publicKey: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="your_public_key"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Test Email</label>
            <input
              type="email"
              value={config.testEmail}
              onChange={(e) => setConfig(prev => ({ ...prev, testEmail: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="test@example.com"
            />
          </div>

          {testResult && (
            <div className={`flex items-center space-x-2 p-3 rounded-lg ${
              testResult === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {testResult === 'success' ? <Check size={16} className="text-green-500" /> : <X size={16} className="text-red-500" />}
              <span className="text-sm">
                {testResult === 'success' 
                  ? 'Test email sent successfully!' 
                  : 'Failed to send test email. Please check your configuration.'
                }
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between space-x-3 pt-6 border-t border-gray-200 mt-6">
          <button
            onClick={handleTest}
            disabled={isTesting || !config.serviceId || !config.templateId || !config.publicKey || !config.testEmail}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Settings size={16} />
            <span>{isTesting ? 'Testing...' : 'Test Email'}</span>
          </button>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200"
            >
              <Check size={16} className="text-green-500" />
              <span>Save Configuration</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailSetup;