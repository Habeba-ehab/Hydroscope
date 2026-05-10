import {useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { FiChevronLeft } from 'react-icons/fi';
import { useState } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email address is required')
    .email('Please enter a valid email address'),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, touchedFields },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordValues) => {
    setIsLoading(true);
    try {
      // Send email as a query parameter as per documentation
      const response = await api.post(`/forgot-password?email=${data.email}`, {});
      toast.success(response.data.message || 'Verification code sent to your email.');
      // Pass the email to the next page so we can use it in Step 2
      navigate('/verify-code', { state: { email: data.email } });
    } catch (error: any) {
      toast.error(error.response?.data?.detail || error.response?.data?.message || 'Failed to send code. Please try again.');
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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3 tracking-tight">
            Forget Password?
          </h1>
          <p className="text-gray-500 text-sm mb-8 leading-relaxed px-4">
            Enter your email address and we will send a verification code to verify your identity
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pb-4 px-1">
            <div className="space-y-1.5 text-left">
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1" htmlFor="email">
                Email address
              </label>
              <input 
                id="email"
                type="email" 
                {...register('email')}
                className={`w-full px-4 py-3.5 rounded-xl border focus:outline-none focus:ring-4 transition-all bg-white text-gray-800 text-sm ${
                  errors.email && touchedFields.email
                    ? 'border-red-500 focus:ring-red-500/10' 
                    : 'border-gray-100 focus:border-navy focus:ring-navy/5'
                }`}
                placeholder="Enter your Email"
              />
              {errors.email && touchedFields.email && (
                <p className="text-red-500 text-xs mt-1 ml-1">{errors.email.message}</p>
              )}
            </div>

            <button 
              type="submit" 
              disabled={!isValid || isLoading}
              className="w-full bg-navy hover:bg-lightnavy text-white font-bold py-2.5 sm:py-3 px-6 rounded-xl transition-all mt-2 text-sm shadow-xl shadow-navy/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Send a code'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
