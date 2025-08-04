import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LogIn, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const Login: React.FC = () => {
  debugger
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const demoAccounts = [
    { email: 'rksaklani90@gmail.com', role: 'admin', password: 'rksaklani90@' },
    { email: 'rksaklani9090@gmail.com', role: 'stock-manager', password: 'rksaklani9090@' },
    { email: 'rohit@ihubiitmandi.in', role: 'employee', password: 'rohit@' },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  // const handleSubmit = async (e: React.FormEvent) => {
  
  //   e.preventDefault();
  //   setIsLoading(true);
  //   setError('');

  //   try {
  //     const success = await login(formData.email, formData.password);
  //     if (!success) {
  //       setError('Invalid email or password');
  //     } else {
  //       const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  //       const role = storedUser?.role;

  //       const from = location.state?.from?.pathname || `/${role}`;
  //       navigate(from, { replace: true });
  //     }
  //   } catch (err) {
  //     setError('An error occurred during login');
  //   }

  //   setIsLoading(false);
  // };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
  
    try {
      const { success, error: loginError } = await login(formData.email, formData.password);
  
      if (!success) {
        setError(loginError || 'Invalid email or password');
        return;
      }
  
      // Safely parse user from localStorage
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const role = storedUser?.role;
  
      if (!role) {
        setError('User role not found. Please contact support.');
        return;
      }
  
      // Redirect to role-based dashboard
      const from = location.state?.from?.pathname || `/${role}`;
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDemoLogin = (email: string, password: string) => {
    setFormData({ email, password });
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl">
            <span className="text-2xl font-bold text-white">IM</span>
          </div>
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your inventory management account</p>
        </div>

        {/* Form */}
        <div className="p-8 bg-white border border-gray-100 shadow-xl rounded-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">Email Address</label>
              <div className="relative">
                <Mail className="absolute text-gray-400 -translate-y-1/2 left-3 top-1/2" size={20} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full py-3 pr-4 border border-gray-300 rounded-lg pl-11 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <Lock className="absolute text-gray-400 -translate-y-1/2 left-3 top-1/2" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full py-3 border border-gray-300 rounded-lg pl-11 pr-11 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute text-gray-400 -translate-y-1/2 right-3 top-1/2 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 border border-red-200 rounded-lg bg-red-50">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition-all duration-200 transform border border-transparent shadow-lg rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"

            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          {/* Demo Accounts */}
          <div className="pt-6 mt-8 border-t border-gray-200">
            <p className="mb-3 text-sm font-medium text-gray-700">Demo Accounts:</p>
            <div className="space-y-2">
              {demoAccounts.map((acc, idx) => (
                <button
                  key={idx}
                  onClick={() => handleDemoLogin(acc.email, acc.password)}
                  className="w-full p-3 text-left transition border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 capitalize">{acc.role}</p>
                      <p className="text-xs text-gray-600">{acc.email}</p>
                    </div>
                    <span className="text-xs text-gray-500">Click to use</span>
                  </div>
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs text-gray-500">
              All demo accounts use password: <code className="px-1 bg-gray-100 rounded">password</code>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">Inventory Management System © 2025</p>
        </div>

        {/* Registration Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="font-medium text-blue-600 hover:text-blue-500 hover:underline"
            >
              Register here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
