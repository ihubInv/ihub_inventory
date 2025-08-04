

import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, Chrome, Facebook, ArrowRight, Check, X } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { validateEmail } from '../../utils/validation';

interface RegisterPageProps {
  onSwitchToLogin: () => void;
}


interface FormData {
  name: string;
  email: string;
  password: string;
  role: string;
  department:string
}

const RegisterPage: React.FC = () => {

     const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        password: '',
        role: 'employee',
        department:""
       
      });
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const roleOptions = [
  { value: 'employee', label: 'Employee '},
  { value: 'stock-manager', label: 'Stock Manager ' },
  { value: 'admin', label: 'Administrator' }
];


    const validateForm = (): string[] => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors);
  };
  
  


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    const allowedDomain = "@ihubiitmandi.in";
    if (!formData.email.endsWith(allowedDomain)) {
      toast.error(`Only emails ending with ${allowedDomain} are allowed to register.`, {
        autoClose: 5000,
        position: 'top-right'
      });
      return;
    }
  
    if (!validateForm()) return;
    setIsLoading(true);
  
    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            role: formData.role
          }
        }
      });
  
      if (error) throw error;
  
      const userId = data.user?.id;
      const { error: insertError } = await supabase.from('users').insert({
        id: userId,
        email: formData.email,
        name: formData.name,
        role: formData.role,
        department: formData.department || null,
        isactive: true,
        createdat: new Date().toISOString(),
        lastlogin: new Date().toISOString()
      });
  
      if (insertError) throw insertError;
  
      toast.success('Registration successful! Please check your email to confirm.', {
        autoClose: 5000,
        position: 'top-right',
      });
  
      setTimeout(() => {
        navigate('/login');
      }, 2000);
  
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(`Registration failed: ${error.message || 'An unexpected error occurred'}`, {
        autoClose: 5000,
        position: 'top-right'
      });
    } finally {
      setIsLoading(false);
    }
  };
  

  


const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
          ...prev,
          [name]: value
        }));
        if (errors[name]) {
          setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[name];
            return newErrors;
          });
        }
      };



  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
      

        {/* Main Form Card */}
        <div className="p-8 bg-white shadow-xl rounded-2xl backdrop-blur-sm bg-opacity-95">
            <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 shadow-lg bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
  iHub Inventory Request Portal
</h1>
<p className="text-gray-600">
  Submit a formal request to access items or resources from the iHub inventory system.
</p>
        </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name Field */}
            <div className="relative">
              <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-700">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <User className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                    errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                  placeholder="Enter your full name"
                  aria-describedby={errors.name ? 'name-error' : undefined}
                />
              </div>
              {errors.name && (
                <p id="name-error" className="mt-2 text-sm text-red-600" role="alert">
                  {errors.name}
                </p>
              )}
            </div>
      
            {/* Email Field */}
            <div className="relative">
              <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Mail className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                    errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                  placeholder="xyz@ihubiitmandi.in"
                  aria-describedby={errors.email ? 'email-error' : undefined}
                />
              </div>
              {errors.email && (
                <p id="email-error" className="mt-2 text-sm text-red-600" role="alert">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="relative">
              <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-10 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                    errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                  placeholder="Create a password"
                  aria-describedby={errors.password ? 'password-error' : 'password-strength'}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-gray-400 transition-colors hover:text-gray-600" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-400 transition-colors hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p id="password-error" className="mt-2 text-sm text-red-600" role="alert">
                  {errors.password}
                </p>
              )}

            </div>

            {/* department Field */}
            <div className="relative">
              <label htmlFor="department" className="block mb-2 text-sm font-medium text-gray-700">
              Department
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <User className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                    errors.department ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                  placeholder="Your department"
                  aria-describedby={errors.department ? 'name-error' : undefined}
                />
              </div>
              {errors.department && (
                <p id="name-error" className="mt-2 text-sm text-red-600" role="alert">
                  {errors.department}
                </p>
              )}
            </div>

            <div className="relative">
  <label htmlFor="role" className="block mb-2 text-sm font-medium text-gray-700">
    Role
  </label>
  <div className="relative">
    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
      <User className="w-5 h-5 text-gray-400" />
    </div>
    <select
      id="role"
      name="role"
      value={formData.role}
      onChange={handleChange}
      className={`block w-full pl-10 pr-3 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
        errors.role ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
      }`}
      aria-describedby={errors.role ? 'role-error' : undefined}
    >
      {roleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
    </select>
  </div>
  {errors.role && (
    <p id="role-error" className="mt-2 text-sm text-red-600" role="alert">
      {errors.role}
    </p>
  )}
</div>


            {/* Register Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition-all duration-200 transform border border-transparent shadow-lg rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 text-gray-500 bg-white">Already have an account?</span>
              </div>
            </div>
          </div>


          <div className="flex items-center justify-between">
             <div className="text-sm">
               <a href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
               Already have an account? Sign in
              </a>
           </div>
         </div>
        </div>

      


      </div>
    </div>
  );
};

export default RegisterPage;