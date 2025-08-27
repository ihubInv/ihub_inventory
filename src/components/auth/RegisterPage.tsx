import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, Chrome, Facebook, ArrowRight, Check, X } from 'lucide-react';
import RoleDropdown from '../common/RoleDropdown';
import DepartmentDropdown from '../common/DepartmentDropdown';
import { AuthToasts } from '../../services/toastService';
import toast from 'react-hot-toast';
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
    { value: 'employee', label: 'Employee' },
    { value: 'stock-manager', label: 'Stock Manager' },
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
      
      if (!formData.department.trim()) {
        newErrors.department = 'Department is required';
      }
      
      setErrors(newErrors);
      return Object.keys(newErrors);
    };
  
  


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      toast.error('Please fix the form errors before submitting.');
      return;
    }

    // Check email domain
    const allowedDomain = "@ihubiitmandi.in";
    if (!formData.email.endsWith(allowedDomain)) {
      toast.error(`Only emails ending with ${allowedDomain} are allowed to register.`, {
        position: 'top-right',
        autoClose: 5000,
      });
      return;
    }

    setIsLoading(true);

    try {
      // First, check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('email')
        .eq('email', formData.email)
        .maybeSingle();

      if (existingUser) {
        toast.error('An account with this email already exists.');
        setIsLoading(false);
        return;
      }

      // Create auth user
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            role: formData.role,
            department: formData.department
          }
        }
      });

      if (error) throw error;

      // Insert user data into users table
      const userId = data.user?.id;
      if (userId) {
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: userId,
            email: formData.email,
            name: formData.name,
            role: formData.role,
            department: formData.department,
            isactive: true,
            createdat: new Date().toISOString(),
            lastlogin: null
          });

        if (insertError) {
          console.error('Insert error:', insertError);
          // If user table insert fails, we should clean up the auth user
          await supabase.auth.admin.deleteUser(userId);
          throw new Error('Failed to create user profile. Please try again.');
        }
      }

      toast.success('Registration successful! Please check your email to confirm.');

      // Reset form
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'employee',
        department: ''
      });

      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (error: any) {
      console.error('Registration error:', error);
      
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error.message?.includes('User already registered')) {
        errorMessage = 'An account with this email already exists.';
      } else if (error.message?.includes('Invalid email')) {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.message?.includes('Password')) {
        errorMessage = 'Password must be at least 6 characters long.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
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
    
    // Clear error when user starts typing
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
                  required
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
                  required
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
                  required
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
              <DepartmentDropdown
                label="Department"
                value={formData.department}
                onChange={(value) => setFormData(prev => ({ ...prev, department: value }))}
                placeholder="Select your department"
                error={errors.department}
                required
                searchable
              />
            </div>

            <div className="relative">
              <RoleDropdown
                label="Role"
                value={formData.role}
                onChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
                placeholder="Select your role"
                error={errors.role}
                required
              />
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