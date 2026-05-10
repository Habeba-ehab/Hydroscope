import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { FiChevronLeft, FiEye, FiEyeOff } from 'react-icons/fi';
import { validatePassword } from '../../utils/validation';
import { Check, X, Loader2 } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, 'New password is required')
      .min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Confirm password is required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

function PasswordRule({ met, label }: { met: boolean; label: string }) {
  return (
    <li className={`flex items-center gap-1.5 text-xs ${met ? 'text-green-600' : 'text-gray-400'}`}>
      {met ? <Check className="h-3 w-3 shrink-0" /> : <X className="h-3 w-3 shrink-0" />}
      {label}
    </li>
  );
}

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';
  const otp = location.state?.otp || '';
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid, touchedFields },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onChange',
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const passwordValue = watch('password');
  const pwValidation = validatePassword(passwordValue);

  const onSubmit = async (data: ResetPasswordValues) => {
    setIsLoading(true);
    try {
      // Send email, otp, and new_password as query parameters as per documentation
      const response = await api.post(
        `/reset-password?email=${email}&otp=${otp}&new_password=${data.password}`, 
        {}
      );
      toast.success(response.data.message || 'Password changed successfully! Please login.');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || error.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col w-full h-dvh bg-slate-50/50 overflow-hidden">
      {/* Back Button */}
      <button 
        onClick={() => navigate(-1)}
        className="absolute top-6 left-6 p-2 transition-all text-gray-400 hover:text-navy z-50 cursor-pointer"
        aria-label="Go back"
      >
        <FiChevronLeft size={32} />
      </button>

      {/* Main Content - Centered Card */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-white/50 p-6 sm:p-12 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-8 tracking-tight">
            Change Password
          </h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pb-6 px-1">
            {/* New Password Field */}
            <div className="space-y-1 text-left">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1" htmlFor="password">
                New Password
              </label>
              <div className="relative">
                <input 
                  id="password"
                  type={showPassword ? 'text' : 'password'} 
                  {...register('password')}
                  className={`w-full px-4 py-3.5 pr-10 rounded-xl border focus:outline-none focus:ring-4 transition-all bg-white text-gray-800 text-sm ${
                    errors.password && touchedFields.password
                      ? 'border-red-500 focus:ring-red-500/10' 
                      : 'border-gray-100 focus:border-navy focus:ring-navy/5'
                  }`}
                  placeholder="Enter your Password"
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
                {errors.password && touchedFields.password && (
                  <p className="text-red-500 text-xs mt-1 ml-1">{errors.password.message}</p>
                )}
                {(touchedFields.password || passwordValue.length > 0) && (
                  <ul className="mt-2 flex flex-col gap-0.5 pl-0.5">
                    <PasswordRule met={pwValidation.hasMinLength} label="At least 8 characters" />
                    <PasswordRule met={pwValidation.hasCapital} label="At least 1 capital letter" />
                    <PasswordRule met={pwValidation.hasNumber} label="At least 1 number" />
                    <PasswordRule
                      met={pwValidation.hasSpecial}
                      label="At least 1 special character"
                    />
                  </ul>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-1 text-left">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1" htmlFor="confirmPassword">
                  Confirm Password
                </label>
                <div className="relative">
                  <input 
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'} 
                    {...register('confirmPassword')}
                    className={`w-full px-4 py-3.5 pr-10 rounded-xl border focus:outline-none focus:ring-4 transition-all bg-white text-gray-800 text-sm ${
                      errors.confirmPassword && touchedFields.confirmPassword
                        ? 'border-red-500 focus:ring-red-500/10' 
                        : 'border-gray-100 focus:border-navy focus:ring-navy/5'
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
                {errors.confirmPassword && touchedFields.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1 ml-1">{errors.confirmPassword.message}</p>
                )}
              </div>

              <button 
                type="submit" 
                disabled={!isValid || isLoading}
                className="w-full bg-navy hover:bg-lightnavy text-white font-bold py-2.5 sm:py-3 px-6 rounded-xl transition-all mt-4 text-sm shadow-xl shadow-navy/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
              >
                {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Change Password'}
              </button>
            </form>
        </div>
      </div>
    </div>
  );
}
