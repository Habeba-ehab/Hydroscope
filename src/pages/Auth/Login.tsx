import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import Cookies from 'js-cookie';

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email address is required')
    .email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, touchedFields },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginValues) => {
    setIsLoading(true);
    try {
      const response = await api.post('/login', {
        email: data.email,
        password: data.password
      });
      
      const { access_token, refresh_token, username } = response.data;
      const displayName = username || 'User';

      // Clear any previous user's session data (like uploaded images)
      sessionStorage.clear();
      
      // Store tokens in cookies (secure: true means HTTPS only in production)
      Cookies.set('access_token', access_token, { expires: 1/48 }); // 30 minutes
      Cookies.set('refresh_token', refresh_token, { expires: 7 }); // 7 days
      Cookies.set('user_name', displayName, { expires: 7 }); // Store name for UI
      
      toast.success(`Hello ${displayName}! Login successful.`);
      navigate('/');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || error.response?.data?.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex w-full h-dvh bg-white overflow-hidden">
      {/* Left Side - Image and Branding */}
      <div className="hidden lg:flex relative w-[55%] h-full bg-black">
        <img 
          src="/login_image.png" 
          alt="Bacteria visualization" 
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        />
        {/* Subtle overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent"></div>
        
        {/* Decorative elements - faint grid or lines */}
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10 bg-repeat"></div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center h-full px-16 xl:px-24 text-white">
          <div className="relative">
            {/* Techy Corner Accents */}
            <div className="absolute -top-4 -left-4 w-8 h-8 border-t-2 border-l-2 border-white/30 rounded-tl"></div>
            <div className="absolute -bottom-4 -left-4 w-8 h-8 border-b-2 border-l-2 border-white/30 rounded-bl"></div>
            
            <h1 className="text-4xl xl:text-5xl font-bold mb-2 leading-tight font-body tracking-tight">
              Hydroscope
            </h1>
            <h2 className="text-3xl xl:text-4xl font-bold mb-6 text-white/90 leading-tight">
              AI Powered Bacterial<br />
              Classification System
            </h2>
            
            <p className="text-lg xl:text-xl text-white/80 max-w-xl leading-relaxed mt-4 font-light">
              Empowering research facilities with secure data management, AI-driven analysis, and real-time laboratory tracking systems.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 lg:p-16 h-full relative">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center sm:text-left">
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-2 font-body">Welcome Back</h2>
            <p className="text-gray-500 text-xs sm:text-sm">
              Please enter your credentials to access the system
            </p>
          </div>

          <form className="pb-4 px-1" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-6 mb-10">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-600" htmlFor="email">
                Email address
              </label>
              <input 
                id="email"
                type="email" 
                {...register('email')}
                className={`w-full px-3.5 py-2.5 rounded border focus:outline-none focus:ring-2 transition-colors bg-white text-gray-800 text-sm ${
                  errors.email && touchedFields.email
                    ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-navy/50 focus:border-navy'
                }`}
                placeholder=""
              />
              {errors.email && touchedFields.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-600" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input 
                  id="password"
                  type={showPassword ? 'text' : 'password'} 
                  {...register('password')}
                  className={`w-full px-3.5 py-2.5 pr-10 rounded border focus:outline-none focus:ring-2 transition-colors bg-white text-gray-800 text-sm ${
                    errors.password && touchedFields.password
                      ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-navy/50 focus:border-navy'
                  }`}
                  placeholder=""
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  onMouseDown={(e) => e.preventDefault()}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
              {errors.password && touchedFields.password && <p className="text-red-500 text-xs whitespace-pre-wrap">{errors.password.message}</p>}
            </div>

            <div className="flex items-center justify-end pt-1">
              <Link to="/forgot-password" title="Forget Password?" className="text-sm font-bold text-navy hover:text-lightnavy transition-colors">
                Forget Password?
              </Link>
            </div>

            </div>

            <button 
              type="submit" 
              disabled={!isValid || isLoading}
              className="w-full bg-navy hover:bg-lightnavy text-white font-bold py-2.5 sm:py-3 px-6 rounded-xl transition-all text-sm shadow-xl shadow-navy/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Login'}
            </button>
          </form>

          <div className="mt-3 text-center text-sm text-gray-600">
            Dont have an account ?{' '}
            <Link to="/signup" className="font-bold text-navy hover:text-lightnavy transition-colors">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
