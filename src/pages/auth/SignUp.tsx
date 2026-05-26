import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { validatePassword } from '../../utils/validation';
import { Check, X, Loader2 } from 'lucide-react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const signupSchema = z
  .object({
    username: z.string().min(2, 'Username must be at least 2 characters'),
    email: z
      .string()
      .min(1, 'Email address is required')
      .email('Please enter a valid email address'),
    password: z.string().superRefine((val, ctx) => {
      const validation = validatePassword(val);
      if (!validation.isValid) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Password does not meet requirements',
          fatal: true,
        });
      }
    }),
    confirmPassword: z.string().min(1, 'Confirm password is required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type SignupValues = z.infer<typeof signupSchema>;

function PasswordRule({ met, label }: { met: boolean; label: string }) {
  return (
    <li className={`flex items-center gap-1.5 text-xs ${met ? 'text-green-600' : 'text-gray-400'}`}>
      {met ? <Check className="h-3 w-3 shrink-0" /> : <X className="h-3 w-3 shrink-0" />}
      {label}
    </li>
  );
}

export default function SignUp() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid, touchedFields },
  } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    mode: 'onChange',
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const passwordValue = watch('password');
  const pwValidation = validatePassword(passwordValue);

  const onSubmit = async (data: SignupValues) => {
    setIsLoading(true);
    try {
      // Map the data to match the backend's expected fields
      const requestData = {
        username: data.username,
        email: data.email,
        password: data.password
      };

      await api.post('/register', requestData);
      toast.success('Registration successful! Please login.');
      navigate('/login');
    } catch (error: any) {
      const detail = error.response?.data?.detail;
      const message = Array.isArray(detail)
        ? detail.map((d: any) => d.msg).join(', ')
        : detail || error.response?.data?.message || 'Failed to register. Please try again.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex w-full h-dvh bg-white overflow-hidden">
      {/* Left Side - Image and Branding */}
      <div className="hidden lg:flex relative w-[55%] h-full bg-black">
        <img
          src="/signup_image.png"
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

      {/* Right Side - SignUp Form */}
      <div className="flex-1 h-full relative overflow-y-auto bg-white">
        <div className="min-h-full flex flex-col justify-center items-center p-6 sm:p-12 lg:p-16">
          <div className="w-full max-w-sm">
            <div className="mb-5 text-center sm:text-left">
              <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-1 font-body">Sign Up</h2>
              <p className="text-gray-500 text-xs sm:text-sm">
                Please enter your credentials to access the system
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="pb-4 px-2">
              <div className="space-y-4 mb-6">
              {/* Username Field */}
              <div className="space-y-0.5">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider" htmlFor="username">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  {...register('username')}
                  className={`w-full px-3.5 py-2.5 rounded border focus:outline-none focus:ring-2 transition-colors bg-white text-gray-800 text-sm ${errors.username && touchedFields.username
                      ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500'
                      : 'border-gray-300 focus:ring-navy/50 focus:border-navy'
                    }`}
                  placeholder=""
                />
                {errors.username && touchedFields.username && <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>}
              </div>

              {/* Email Field */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider" htmlFor="email">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  {...register('email')}
                  className={`w-full px-3.5 py-2.5 rounded border focus:outline-none focus:ring-2 transition-colors bg-white text-gray-800 text-sm ${errors.email && touchedFields.email
                      ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500'
                      : 'border-gray-300 focus:ring-navy/50 focus:border-navy'
                    }`}
                  placeholder=""
                />
                {errors.email && touchedFields.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>

              {/* Password Field */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                    className={`w-full px-3.5 py-2.5 pr-10 rounded border focus:outline-none focus:ring-2 transition-colors bg-white text-gray-800 text-sm ${errors.password && touchedFields.password
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
                {(touchedFields.password || passwordValue.length > 0) && (
                  <ul className="mt-1.5 flex flex-col gap-0.5 pl-0.5">
                    <PasswordRule met={pwValidation.hasMinLength} label="At least 8 characters" />
                    <PasswordRule met={pwValidation.hasCapital} label="At least 1 capital letter" />
                    <PasswordRule met={pwValidation.hasNumber} label="At least 1 number" />
                    <PasswordRule
                      met={pwValidation.hasSpecial}
                      label="At least 1 special character"
                    />
                  </ul>
                )}
                {errors.password && !passwordValue && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider" htmlFor="confirmPassword">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    {...register('confirmPassword')}
                    className={`w-full px-3.5 py-2.5 pr-10 rounded border focus:outline-none focus:ring-2 transition-colors bg-white text-gray-800 text-sm ${errors.confirmPassword && touchedFields.confirmPassword
                        ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500'
                        : 'border-gray-300 focus:ring-navy/50 focus:border-navy'
                      }`}
                    placeholder=""
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    onMouseDown={(e) => e.preventDefault()}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                  >
                    {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
                {errors.confirmPassword && touchedFields.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
              </div>
              </div>

              <button
                type="submit"
                disabled={!isValid || isLoading}
                className="w-full bg-navy hover:bg-lightnavy text-white font-bold py-2.5 sm:py-3 px-6 rounded-xl transition-all text-sm shadow-xl shadow-navy/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
              >
                {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Sign Up'}
              </button>
            </form>

            <div className="mt-3 text-center text-sm text-gray-600">
              Already have an account ?{' '}
              <Link to="/login" className="font-bold text-navy hover:text-lightnavy transition-colors">
                Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
