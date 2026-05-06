import { Link } from 'react-router-dom';
import { useState } from 'react';
import { getPasswordErrors, validatePassword } from '../../utils/validation';
import { FiCheck, FiX } from 'react-icons/fi';

function PasswordRule({ met, label }: { met: boolean; label: string }) {
  return (
    <li className={`flex items-center gap-1.5 text-xs ${met ? 'text-green-600' : 'text-gray-400'}`}>
      {met ? <FiCheck className="h-3 w-3 shrink-0" /> : <FiX className="h-3 w-3 shrink-0" />}
      {label}
    </li>
  );
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const pwValidation = validatePassword(password);
  const showValidation = password.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else {
      const pwdErrors = getPasswordErrors(password);
      if (pwdErrors.length > 0) {
        newErrors.password = pwdErrors.join('\n');
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    // TODO: Proceed with login
    console.log('Form is valid. Data:', { email, password });
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
            
            <h1 className="text-5xl xl:text-6xl font-bold mb-2 leading-tight font-body tracking-tight">
              Hydroscope
            </h1>
            <h2 className="text-4xl xl:text-5xl font-bold mb-6 text-white/90 leading-tight">
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
      <div className="flex-1 flex flex-col justify-center items-center p-8 sm:p-12 lg:p-16 h-full relative">
        {/* Subtle decorative square top right */}
        <div className="absolute top-12 right-12 w-2 h-2 bg-pink-100 opacity-50"></div>
        <div className="absolute top-1/3 right-8 w-1 h-1 bg-pink-200 opacity-50"></div>
        
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-3xl font-semibold text-gray-800 mb-2 font-body">Welcome Back</h2>
            <p className="text-gray-500 text-sm">
              Please enter your credentials to access the system
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-600" htmlFor="email">
                Email address
              </label>
              <input 
                id="email"
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded border focus:outline-none focus:ring-2 transition-colors bg-white text-gray-800 text-sm ${
                  errors.email 
                    ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-navy/50 focus:border-navy'
                }`}
                placeholder=""
              />
              {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-600" htmlFor="password">
                Password
              </label>
              <input 
                id="password"
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded border focus:outline-none focus:ring-2 transition-colors bg-white text-gray-800 text-sm ${
                  errors.password 
                    ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-navy/50 focus:border-navy'
                }`}
                placeholder=""
              />
              {showValidation && (
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
              {errors.password && !showValidation && <p className="text-red-500 text-xs whitespace-pre-wrap">{errors.password}</p>}
            </div>

            <div className="flex items-center justify-between pt-1">
              <a href="#" className="text-sm font-bold text-navy hover:text-lightnavy transition-colors">
                Forget Password?
              </a>
            </div>

            <button 
              type="submit" 
              className="w-full bg-navy hover:bg-lightnavy text-white font-medium py-2.5 px-4 rounded transition-colors mt-2 text-base"
            >
              Login
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
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
