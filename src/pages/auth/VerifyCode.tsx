import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { FiChevronLeft } from 'react-icons/fi';
import { useState, useEffect, useRef } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

const verifyCodeSchema = z.object({
  code: z
    .string()
    .length(6, 'Verification code must be 6 digits'),
});

type VerifyCodeValues = z.infer<typeof verifyCodeSchema>;

export default function VerifyCode() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, touchedFields },
  } = useForm<VerifyCodeValues>({
    resolver: zodResolver(verifyCodeSchema),
    mode: 'onChange',
    defaultValues: {
      code: '',
    },
  });

  const startCooldown = () => {
    setResendCooldown(60);
    cooldownRef.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownRef.current!);
          cooldownRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    startCooldown();
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, []);

  const handleResendCode = async () => {
    if (!email || resendCooldown > 0) return;
    try {
      const response = await api.post(`/forgot-password?email=${email}`, {});
      toast.success(response.data.message || 'Verification code resent!');
      startCooldown();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || error.response?.data?.message || 'Failed to resend code.');
    }
  };

  const onSubmit = async (data: VerifyCodeValues) => {
    setIsLoading(true);
    try {
      // Send email and otp as query parameters as per documentation
      const response = await api.post(`/verify-otp?email=${email}&otp=${data.code}`, {});
      toast.success(response.data.message || 'Code verified successfully!');
      // Pass the email and verified OTP forward to the reset password page
      navigate('/reset-password', { state: { email, otp: data.code } });
    } catch (error: any) {
      toast.error(error.response?.data?.detail || error.response?.data?.message || 'Invalid verification code.');
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
            Enter verification code
          </h1>
          <p className="text-gray-500 text-sm mb-8 leading-relaxed px-4">
            The verification code has been sent to <br />
            <span className="font-semibold text-gray-700">{email || 'your email'}</span>
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pb-4 px-1">
            <div className="space-y-1.5 text-left">
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1" htmlFor="code">
                Enter code
              </label>
              <input 
                id="code"
                type="text" 
                {...register('code')}
                className={`w-full px-4 py-3.5 rounded-xl border focus:outline-none focus:ring-4 transition-all bg-white text-gray-800 text-sm ${
                  errors.code && touchedFields.code
                    ? 'border-red-500 focus:ring-red-500/10' 
                    : 'border-gray-100 focus:border-navy focus:ring-navy/5'
                }`}
                placeholder="Enter code"
              />
              {errors.code && touchedFields.code && (
                <p className="text-red-500 text-xs mt-1 ml-1">{errors.code.message}</p>
              )}
            </div>

            <div className="text-left ml-1">
              <p className="text-xs text-gray-500">
                Didn't get a code?{' '}
                <button
                  type="button"
                  disabled={resendCooldown > 0}
                  className="text-navy font-bold hover:text-lightnavy transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-navy"
                  onClick={handleResendCode}
                >
                  {resendCooldown > 0 ? `Resend (${resendCooldown}s)` : 'Resend'}
                </button>
              </p>
            </div>

            <button 
              type="submit" 
              disabled={!isValid || isLoading}
              className="w-full bg-navy hover:bg-lightnavy text-white font-bold py-2.5 sm:py-3 px-6 rounded-xl transition-all mt-2 text-sm shadow-xl shadow-navy/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Verify'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
