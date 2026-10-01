import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { UserRole, Language } from '../../types';
import {
  Sprout,
  Phone,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Loader2,
  MapPin,
  Building2,
  Globe
} from 'lucide-react';

type ViewMode = 'login' | 'register' | 'profile_setup' | 'forgot_password';
type LoginMethod = 'mobile' | 'email';

const COMMON_BUYER_CROPS = [
  'Tomato',
  'Small Onion',
  'Banana',
  'Coconut',
  'Green Chilli',
  'Potato',
  'Brinjal',
  'Turmeric'
];

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, updateUserProfile, language, setLanguage, addToast } = useApp();

  const fromPath = (location.state as any)?.from?.pathname;

  // Main view mode
  const [viewMode, setViewMode] = useState<ViewMode>('login');
  // Segmented login method selector: default 'mobile'
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('mobile');

  // Provider configuration status from backend
  const [smsOtpConfigured, setSmsOtpConfigured] = useState(false);

  // Loading & feedback states
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [recoverySuccess, setRecoverySuccess] = useState<string | null>(null);

  // Mobile Login states
  const [mobileNumber, setMobileNumber] = useState('');
  const [otpStep, setOtpStep] = useState(false);
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);

  // Email Login states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Forgot Password & Reset Password flow states
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryStage, setRecoveryStage] = useState<'enter_email' | 'reset_password'>('enter_email');
  const [newResetPassword, setNewResetPassword] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);

  // Step-based Registration states (Step 1 -> Step 2 -> Step 3)
  const [regStep, setRegStep] = useState<1 | 2 | 3>(1);
  const [regName, setRegName] = useState('');
  const [regMobile, setRegMobile] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regRole, setRegRole] = useState<'farmer' | 'buyer'>('farmer');

  // First-Time User Profile Setup Wizard states (1. Basic Info -> 2. Location -> 3. Preferences -> 4. Done)
  const [setupStep, setSetupStep] = useState<1 | 2 | 3 | 4>(1);
  const [setupVillage, setSetupVillage] = useState('Oddanchatram');
  const [setupDistrict, setSetupDistrict] = useState('Dindigul');
  const [setupBusinessName, setSetupBusinessName] = useState('');
  const [setupLanguage, setSetupLanguage] = useState<Language>(language || 'en');
  const [setupCrops, setSetupCrops] = useState<string[]>(['Tomato', 'Small Onion']);

  useEffect(() => {
    api.auth
      .getProviders()
      .then((res) => {
        if (res.success && res.data) {
          setSmsOtpConfigured(Boolean(res.data.smsOtpConfigured));
        }
      })
      .catch(() => {
        // default false
      });
  }, []);

  // Listen for official Google OAuth callback message
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS' && event.data?.user && event.data?.token) {
        localStorage.removeItem('farmgrade_logged_out');
        localStorage.setItem('farmgrade_token', event.data.token);
        localStorage.setItem('farmgrade_user', JSON.stringify(event.data.user));
        window.location.href =
          event.data.user.role === 'buyer'
            ? '/buyer/dashboard'
            : event.data.user.role === 'admin'
            ? '/admin/dashboard'
            : '/farmer/dashboard';
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const validateMobile = (value: string): boolean => {
    const digits = value.replace(/\D/g, '');
    return /^[6-9]\d{9}$/.test(digits);
  };

  const validateEmail = (value: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  };

  const redirectUserByRole = (detectedRole: UserRole) => {
    if (fromPath && fromPath.startsWith(`/${detectedRole}/`)) {
      navigate(fromPath, { replace: true });
      return;
    }
    if (detectedRole === 'farmer') {
      navigate('/farmer/dashboard', { replace: true });
    } else if (detectedRole === 'buyer') {
      navigate('/buyer/dashboard', { replace: true });
    } else {
      navigate('/admin/dashboard', { replace: true });
    }
  };

  // Handle Mobile Login Submit
  const handleMobileLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setRecoverySuccess(null);

    const cleanDigits = mobileNumber.replace(/\D/g, '');
    if (!validateMobile(cleanDigits)) {
      setErrorMessage('Please enter a valid mobile number.');
      return;
    }

    if (smsOtpConfigured && !otpStep) {
      setOtpStep(true);
      return;
    }

    setIsSigningIn(true);
    const result = await login(cleanDigits, undefined, undefined, 'mobile');
    setIsSigningIn(false);

    if (result.success && result.role) {
      redirectUserByRole(result.role);
    } else {
      setErrorMessage(result.error || 'Your email/mobile number or password is incorrect.');
    }
  };

  // Handle Email Login Submit
  const handleEmailLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setRecoverySuccess(null);

    const trimmedEmail = loginEmail.trim();
    if (!validateEmail(trimmedEmail)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (!loginPassword) {
      setErrorMessage('Your email/mobile number or password is incorrect.');
      return;
    }

    setIsSigningIn(true);
    const result = await login(trimmedEmail, loginPassword, undefined, 'email');
    setIsSigningIn(false);

    if (result.success && result.role) {
      redirectUserByRole(result.role);
    } else {
      setErrorMessage(result.error || 'Your email/mobile number or password is incorrect.');
    }
  };

  // Handle Official Google Login
  const handleGoogleLogin = async () => {
    setErrorMessage(null);
    setRecoverySuccess(null);
    setIsSigningIn(true);
    try {
      const res = await api.auth.getGoogleAuthUrl();
      setIsSigningIn(false);
      if (res.success && res.configured && res.url) {
        window.location.href = res.url;
      } else {
        setErrorMessage('Google sign-in could not be completed. Please try again.');
      }
    } catch {
      setIsSigningIn(false);
      setErrorMessage('Google sign-in could not be completed. Please try again.');
    }
  };

  // Handle Forgot Password Submit (Step 1: Send Recovery Instructions)
  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setRecoverySuccess(null);

    const trimmed = recoveryEmail.trim();
    if (!validateEmail(trimmed)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setIsSigningIn(true);
    try {
      const res = await api.auth.forgotPassword(trimmed);
      setIsSigningIn(false);
      setRecoverySuccess(
        res.message || 'Check your email for password recovery instructions.'
      );
      setRecoveryStage('reset_password');
    } catch {
      setIsSigningIn(false);
      setRecoverySuccess('Check your email for password recovery instructions.');
      setRecoveryStage('reset_password');
    }
  };

  // Handle Reset Password Submit (Step 2: Reset Password -> Login)
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!newResetPassword || newResetPassword.length < 4) {
      setErrorMessage('Please enter a new password with at least 4 characters.');
      return;
    }

    setIsSigningIn(true);
    try {
      const res = await api.auth.resetPassword(recoveryEmail.trim(), newResetPassword);
      setIsSigningIn(false);
      if (res.success) {
        setLoginEmail(recoveryEmail.trim());
        setLoginPassword('');
        setNewResetPassword('');
        setRecoveryStage('enter_email');
        setViewMode('login');
        setLoginMethod('email');
        setRecoverySuccess('Your password has been updated. Please sign in.');
      } else {
        setErrorMessage("We couldn't sign you in. Please try again.");
      }
    } catch {
      setIsSigningIn(false);
      setErrorMessage("We couldn't sign you in. Please try again.");
    }
  };

  // Handle Step 1 of Registration: Validate Name + Mobile + Email
  const handleRegStep1Continue = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!regName.trim() || regName.trim().length < 2) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!validateMobile(regMobile)) {
      setErrorMessage('Please enter a valid mobile number.');
      return;
    }
    if (!validateEmail(regEmail)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!regPassword || regPassword.length < 4) {
      setErrorMessage('Please create a password with at least 4 characters.');
      return;
    }

    setRegStep(2);
  };

  // Handle Step 2 of Registration: Choose Account Type (Farmer / Buyer)
  const handleRegStep2Continue = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setRegStep(3);
  };

  // Handle Step 3 of Registration: Complete Registration & Launch First-Time Profile Setup
  const handleRegStep3Complete = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSigningIn(true);

    const cleanPhone = regMobile.replace(/\D/g, '');
    const result = await register({
      name: regName.trim(),
      phone: cleanPhone,
      email: regEmail.trim().toLowerCase(),
      password: regPassword,
      role: regRole,
      village: setupVillage.trim() || 'Oddanchatram',
      district: setupDistrict.trim() || 'Dindigul',
      state: 'Tamil Nadu',
      preferredLanguage: setupLanguage,
    });

    setIsSigningIn(false);

    if (result.success) {
      addToast({
        type: 'success',
        title: 'Account created successfully.',
      });
      setSetupStep(1);
      setViewMode('profile_setup');
    } else {
      setErrorMessage(result.error || "We couldn't sign you in. Please try again.");
    }
  };

  // Toggle crop in Buyer Preferences
  const toggleSetupCrop = (crop: string) => {
    setSetupCrops((prev) =>
      prev.includes(crop) ? prev.filter((c) => c !== crop) : [...prev, crop]
    );
  };

  // Save First-Time User Profile Setup & Proceed to Dashboard
  const handleCompleteProfileSetup = async () => {
    setIsSigningIn(true);
    setLanguage(setupLanguage);
    await updateUserProfile({
      name: regName.trim(),
      phone: regMobile.replace(/\D/g, ''),
      email: regEmail.trim().toLowerCase(),
      village: setupVillage.trim() || (regRole === 'farmer' ? 'Oddanchatram' : 'Salem Central'),
      district: setupDistrict.trim() || (regRole === 'farmer' ? 'Dindigul' : 'Salem'),
      businessName: regRole === 'buyer' ? setupBusinessName.trim() || 'Verified Buyer Partner' : undefined,
      preferredLanguage: setupLanguage,
      preferredCrops: regRole === 'buyer' ? setupCrops : undefined,
    });
    setIsSigningIn(false);
    setSetupStep(4);
  };

  const handleOtpChange = (index: number, val: string) => {
    const digit = val.replace(/\D/g, '').slice(-1);
    const next = [...otpDigits];
    next[index] = digit;
    setOtpDigits(next);
    if (digit && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  return (
    <div className="min-h-[calc(100vh-120px)] flex flex-col justify-center max-w-md w-full mx-auto px-4 py-8 sm:py-12 text-left">
      {/* Brand Header */}
      <div className="text-center mb-6">
        <div className="w-14 h-14 rounded-2xl bg-emerald-700 text-white flex items-center justify-center mx-auto mb-3 shadow-sm">
          <Sprout className="w-8 h-8 text-emerald-100" />
        </div>
        <div className="text-2xl sm:text-3xl font-black tracking-tight text-emerald-950 leading-none">
          Farm<span className="text-emerald-700">Grade</span>
        </div>
        <p className="text-xs sm:text-sm font-bold text-stone-500 mt-1">
          Right Price. Right Buyer. Right Time.
        </p>

        <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight mt-5">
          {viewMode === 'login'
            ? 'Welcome to FarmGrade'
            : viewMode === 'register'
            ? regStep === 1
              ? 'Create your account'
              : regStep === 2
              ? 'Choose your account type'
              : 'Verify your details'
            : viewMode === 'profile_setup'
            ? "Let's complete your profile"
            : 'Account Recovery'}
        </h1>
        <p className="text-stone-600 text-sm sm:text-base mt-1">
          {viewMode === 'login'
            ? 'Connect with the right market for your produce.'
            : viewMode === 'register'
            ? `Step ${regStep} of 3`
            : viewMode === 'profile_setup'
            ? setupStep === 1
              ? '1. Basic Information'
              : setupStep === 2
              ? '2. Location'
              : setupStep === 3
              ? '3. Preferences'
              : '4. Done'
            : "Enter your email address and we'll help you recover your account."}
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-3xl border-2 border-stone-200 p-6 sm:p-8 shadow-xs space-y-6">
        {/* Signing In Loading Banner */}
        {isSigningIn && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-center gap-3 font-bold text-base">
            <Loader2 className="w-5 h-5 text-emerald-700 animate-spin shrink-0" />
            <span>Signing you in...</span>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && !isSigningIn && (
          <div
            role="alert"
            className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <p className="font-bold text-sm leading-snug">{errorMessage}</p>
          </div>
        )}

        {/* Recovery Success Alert */}
        {recoverySuccess && !isSigningIn && (
          <div
            role="status"
            className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 flex items-start gap-3"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <p className="font-bold text-sm leading-snug">{recoverySuccess}</p>
          </div>
        )}

        {/* ==================================================
            VIEW 1: LOGIN (MOBILE NUMBER / EMAIL + GOOGLE)
           ================================================== */}
        {viewMode === 'login' && (
          <>
            {/* Segmented Selector: [ Mobile Number ] [ Email ] */}
            <div
              role="tablist"
              aria-label="Login Method"
              className="grid grid-cols-2 bg-stone-100 p-1.5 rounded-2xl border border-stone-200"
            >
              <button
                type="button"
                role="tab"
                aria-selected={loginMethod === 'mobile'}
                onClick={() => {
                  setLoginMethod('mobile');
                  setErrorMessage(null);
                  setRecoverySuccess(null);
                  setOtpStep(false);
                }}
                className={`py-3 px-4 rounded-xl font-black text-sm sm:text-base transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  loginMethod === 'mobile'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-stone-700 hover:text-stone-950'
                }`}
              >
                <Phone className="w-4 h-4 shrink-0" />
                <span>Mobile Number</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={loginMethod === 'email'}
                onClick={() => {
                  setLoginMethod('email');
                  setErrorMessage(null);
                  setRecoverySuccess(null);
                }}
                className={`py-3 px-4 rounded-xl font-black text-sm sm:text-base transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  loginMethod === 'email'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-stone-700 hover:text-stone-950'
                }`}
              >
                <Mail className="w-4 h-4 shrink-0" />
                <span>Email</span>
              </button>
            </div>

            {/* MOBILE NUMBER LOGIN FORM */}
            {loginMethod === 'mobile' && (
              <form onSubmit={handleMobileLoginSubmit} className="space-y-5" noValidate>
                {!otpStep ? (
                  <div>
                    <label
                      htmlFor="login-mobile-input"
                      className="block text-sm font-black text-stone-800 mb-2"
                    >
                      Mobile Number
                    </label>
                    <div className="flex items-stretch rounded-2xl border-2 border-stone-300 focus-within:border-emerald-700 bg-white overflow-hidden">
                      <span className="px-4 py-3.5 bg-stone-100 border-r border-stone-300 text-stone-800 font-black text-base flex items-center select-none">
                        +91
                      </span>
                      <input
                        id="login-mobile-input"
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        placeholder="Enter your mobile number"
                        value={mobileNumber}
                        onChange={(e) => {
                          setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10));
                          if (errorMessage) setErrorMessage(null);
                        }}
                        className="w-full px-4 py-3.5 text-base font-bold text-stone-900 placeholder:text-stone-400 focus:outline-none min-h-[52px]"
                        required
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm font-bold text-stone-800">
                      Enter the OTP sent to your mobile number.
                    </p>
                    <div className="grid grid-cols-6 gap-2">
                      {otpDigits.map((digit, idx) => (
                        <input
                          key={idx}
                          id={`otp-input-${idx}`}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(idx, e.target.value)}
                          className="w-full h-12 text-center text-lg font-black rounded-xl border-2 border-stone-300 focus:border-emerald-700 focus:outline-none"
                        />
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-xs font-bold">
                      <button
                        type="button"
                        onClick={() => setOtpStep(false)}
                        className="text-stone-600 hover:text-stone-900 cursor-pointer"
                      >
                        Change number
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          addToast({
                            type: 'info',
                            title: 'OTP resent to your mobile number.',
                          })
                        }
                        className="text-emerald-700 hover:text-emerald-900 cursor-pointer"
                      >
                        Resend OTP
                      </button>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSigningIn}
                  className="w-full py-4 px-6 rounded-2xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white font-black text-base sm:text-lg flex items-center justify-center gap-2 cursor-pointer transition-colors min-h-[54px] shadow-xs"
                >
                  <span>
                    {isSigningIn
                      ? 'Signing you in...'
                      : otpStep
                      ? 'Verify & Continue'
                      : 'Continue'}
                  </span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </form>
            )}

            {/* EMAIL LOGIN FORM */}
            {loginMethod === 'email' && (
              <form onSubmit={handleEmailLoginSubmit} className="space-y-5" noValidate>
                <div>
                  <label
                    htmlFor="login-email-input"
                    className="block text-sm font-black text-stone-800 mb-2"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-5 h-5 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="login-email-input"
                      type="email"
                      placeholder="Enter your email"
                      value={loginEmail}
                      onChange={(e) => {
                        setLoginEmail(e.target.value);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 border-stone-300 focus:border-emerald-700 focus:outline-none text-base font-bold text-stone-900 placeholder:text-stone-400 min-h-[52px]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label
                      htmlFor="login-password-input"
                      className="block text-sm font-black text-stone-800"
                    >
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setViewMode('forgot_password');
                        setRecoveryStage('enter_email');
                        setRecoveryEmail(loginEmail);
                        setErrorMessage(null);
                        setRecoverySuccess(null);
                      }}
                      className="text-xs sm:text-sm font-bold text-emerald-700 hover:text-emerald-900 hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-5 h-5 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="login-password-input"
                      type={showLoginPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={loginPassword}
                      onChange={(e) => {
                        setLoginPassword(e.target.value);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      className="w-full pl-12 pr-12 py-3.5 rounded-2xl border-2 border-stone-300 focus:border-emerald-700 focus:outline-none text-base font-bold text-stone-900 placeholder:text-stone-400 min-h-[52px]"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-stone-500 hover:text-stone-800 cursor-pointer"
                    >
                      {showLoginPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSigningIn}
                  className="w-full py-4 px-6 rounded-2xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white font-black text-base sm:text-lg flex items-center justify-center gap-2 cursor-pointer transition-colors min-h-[54px] shadow-xs"
                >
                  <span>{isSigningIn ? 'Signing you in...' : 'Continue'}</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </form>
            )}

            {/* DIVIDER: ──────── OR ──────── */}
            <div className="relative flex items-center py-1">
              <div className="flex-grow border-t border-stone-200" />
              <span className="shrink-0 mx-4 text-xs font-black uppercase tracking-widest text-stone-400">
                OR
              </span>
              <div className="flex-grow border-t border-stone-200" />
            </div>

            {/* CONTINUE WITH GOOGLE */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isSigningIn}
              className="w-full py-3.5 px-6 rounded-2xl border-2 border-stone-300 bg-white hover:bg-stone-50 text-stone-900 font-black text-base flex items-center justify-center gap-3 cursor-pointer transition-colors min-h-[54px]"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.54-5.17 3.54-8.97z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* NEW TO FARMGRADE? CREATE AN ACCOUNT */}
            <div className="pt-4 border-t border-stone-200 text-center space-y-2">
              <p className="text-sm font-bold text-stone-600">New to FarmGrade?</p>
              <button
                type="button"
                onClick={() => {
                  setViewMode('register');
                  setRegStep(1);
                  setErrorMessage(null);
                  setRecoverySuccess(null);
                }}
                className="w-full py-3.5 px-5 rounded-2xl bg-stone-100 hover:bg-emerald-50 hover:text-emerald-900 border border-stone-200 text-stone-900 font-black text-sm sm:text-base cursor-pointer transition-colors min-h-[48px]"
              >
                Create an account
              </button>
            </div>
          </>
        )}

        {/* ==================================================
            VIEW 2: STEP-BASED REGISTRATION (FARMER / BUYER)
           ================================================== */}
        {viewMode === 'register' && (
          <>
            {/* Step Progress Bar */}
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`h-2 rounded-full transition-colors ${
                    regStep >= step ? 'bg-emerald-700' : 'bg-stone-200'
                  }`}
                />
              ))}
            </div>

            {/* STEP 1: Name, Mobile Number, Email, Password */}
            {regStep === 1 && (
              <form onSubmit={handleRegStep1Continue} className="space-y-4" noValidate>
                <div>
                  <label className="block text-sm font-black text-stone-800 mb-1.5">
                    Name
                  </label>
                  <div className="relative">
                    <User className="w-5 h-5 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Enter your full name"
                      value={regName}
                      onChange={(e) => {
                        setRegName(e.target.value);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 border-stone-300 focus:border-emerald-700 focus:outline-none text-base font-bold text-stone-900 min-h-[52px]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-black text-stone-800 mb-1.5">
                    Mobile Number
                  </label>
                  <div className="flex items-stretch rounded-2xl border-2 border-stone-300 focus-within:border-emerald-700 bg-white overflow-hidden">
                    <span className="px-4 py-3.5 bg-stone-100 border-r border-stone-300 text-stone-800 font-black text-base flex items-center select-none">
                      +91
                    </span>
                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      placeholder="Enter your mobile number"
                      value={regMobile}
                      onChange={(e) => {
                        setRegMobile(e.target.value.replace(/\D/g, '').slice(0, 10));
                        if (errorMessage) setErrorMessage(null);
                      }}
                      className="w-full px-4 py-3.5 text-base font-bold text-stone-900 focus:outline-none min-h-[52px]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-black text-stone-800 mb-1.5">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="w-5 h-5 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={regEmail}
                      onChange={(e) => {
                        setRegEmail(e.target.value);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 border-stone-300 focus:border-emerald-700 focus:outline-none text-base font-bold text-stone-900 min-h-[52px]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-black text-stone-800 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-5 h-5 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      placeholder="Create a password"
                      value={regPassword}
                      onChange={(e) => {
                        setRegPassword(e.target.value);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      className="w-full pl-12 pr-12 py-3.5 rounded-2xl border-2 border-stone-300 focus:border-emerald-700 focus:outline-none text-base font-bold text-stone-900 min-h-[52px]"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      aria-label={showRegPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-stone-500 hover:text-stone-800 cursor-pointer"
                    >
                      {showRegPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 px-6 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-base flex items-center justify-center gap-2 cursor-pointer transition-colors min-h-[54px]"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </form>
            )}

            {/* STEP 2: Choose Account Type (Farmer / Buyer only — no Admin) */}
            {regStep === 2 && (
              <form onSubmit={handleRegStep2Continue} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <button
                    type="button"
                    onClick={() => setRegRole('farmer')}
                    className={`p-5 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between min-h-[130px] ${
                      regRole === 'farmer'
                        ? 'border-emerald-700 bg-emerald-50/70'
                        : 'border-stone-200 bg-white hover:bg-stone-50'
                    }`}
                  >
                    <span className="text-3xl" role="img" aria-label="Farmer">
                      🌾
                    </span>
                    <div className="mt-3">
                      <p className="text-lg font-black text-stone-900">Farmer</p>
                      <p className="text-xs font-semibold text-stone-600 mt-0.5">
                        Check market prices, list produce, and receive buyer offers.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRegRole('buyer')}
                    className={`p-5 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between min-h-[130px] ${
                      regRole === 'buyer'
                        ? 'border-emerald-700 bg-emerald-50/70'
                        : 'border-stone-200 bg-white hover:bg-stone-50'
                    }`}
                  >
                    <span className="text-3xl" role="img" aria-label="Buyer">
                      🤝
                    </span>
                    <div className="mt-3">
                      <p className="text-lg font-black text-stone-900">Buyer</p>
                      <p className="text-xs font-semibold text-stone-600 mt-0.5">
                        Find graded produce lots, place offers, and complete purchases.
                      </p>
                    </div>
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setRegStep(1)}
                    className="py-3.5 px-5 rounded-2xl border-2 border-stone-300 bg-white hover:bg-stone-100 text-stone-800 font-black text-sm flex items-center justify-center gap-1.5 cursor-pointer min-h-[52px]"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>

                  <button
                    type="submit"
                    className="flex-1 py-3.5 px-6 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-base flex items-center justify-center gap-2 cursor-pointer transition-colors min-h-[52px]"
                  >
                    <span>Continue</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: Complete Authentication Verification */}
            {regStep === 3 && (
              <form onSubmit={handleRegStep3Complete} className="space-y-5">
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2.5 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-stone-500 font-bold">Name</span>
                    <span className="text-stone-900 font-black">{regName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-stone-500 font-bold">Mobile Number</span>
                    <span className="text-stone-900 font-black">+91 {regMobile}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-stone-500 font-bold">Email</span>
                    <span className="text-stone-900 font-black truncate max-w-[200px]">
                      {regEmail}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-stone-500 font-bold">Account Type</span>
                    <span className="text-emerald-800 font-black capitalize">
                      {regRole === 'farmer' ? '🌾 Farmer' : '🤝 Buyer'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setRegStep(2)}
                    disabled={isSigningIn}
                    className="py-3.5 px-5 rounded-2xl border-2 border-stone-300 bg-white hover:bg-stone-100 text-stone-800 font-black text-sm flex items-center justify-center gap-1.5 cursor-pointer min-h-[52px]"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isSigningIn}
                    className="flex-1 py-3.5 px-6 rounded-2xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white font-black text-base flex items-center justify-center gap-2 cursor-pointer transition-colors min-h-[52px]"
                  >
                    <span>
                      {isSigningIn ? 'Signing you in...' : 'Complete Registration'}
                    </span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </form>
            )}

            <div className="pt-4 border-t border-stone-200 text-center">
              <button
                type="button"
                onClick={() => {
                  setViewMode('login');
                  setErrorMessage(null);
                }}
                className="text-sm font-black text-emerald-700 hover:text-emerald-900 hover:underline cursor-pointer"
              >
                Already have an account? Sign In
              </button>
            </div>
          </>
        )}

        {/* ==================================================
            VIEW 3: FIRST-TIME USER PROFILE SETUP
            Progress: 1. Basic Information -> 2. Location -> 3. Preferences -> 4. Done
           ================================================== */}
        {viewMode === 'profile_setup' && (
          <div className="space-y-5">
            {/* 4-Step Progress Indicator */}
            <div className="space-y-2">
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`h-2 rounded-full transition-colors ${
                      setupStep >= step ? 'bg-emerald-700' : 'bg-stone-200'
                    }`}
                  />
                ))}
              </div>
              <div className="flex items-center justify-between text-[11px] font-bold text-stone-500">
                <span className={setupStep === 1 ? 'text-emerald-800 font-black' : ''}>
                  1. Basic Info
                </span>
                <span className={setupStep === 2 ? 'text-emerald-800 font-black' : ''}>
                  2. Location
                </span>
                <span className={setupStep === 3 ? 'text-emerald-800 font-black' : ''}>
                  3. Preferences
                </span>
                <span className={setupStep === 4 ? 'text-emerald-800 font-black' : ''}>
                  4. Done
                </span>
              </div>
            </div>

            {/* SETUP STEP 1: Basic Information */}
            {setupStep === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-stone-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-stone-300 font-bold text-stone-900 min-h-[48px]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-black text-stone-700 mb-1">
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      value={regMobile}
                      onChange={(e) =>
                        setRegMobile(e.target.value.replace(/\D/g, '').slice(0, 10))
                      }
                      className="w-full px-3.5 py-3 rounded-xl border border-stone-300 font-bold text-stone-900 min-h-[48px]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-stone-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full px-3.5 py-3 rounded-xl border border-stone-300 font-bold text-stone-900 min-h-[48px]"
                    />
                  </div>
                </div>

                {regRole === 'buyer' && (
                  <div>
                    <label className="block text-xs font-black text-stone-700 mb-1">
                      Business Name
                    </label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="e.g. FreshBasket Retail"
                        value={setupBusinessName}
                        onChange={(e) => setSetupBusinessName(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-300 font-bold text-stone-900 min-h-[48px]"
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => redirectUserByRole(regRole)}
                    className="text-xs sm:text-sm font-bold text-stone-500 hover:text-stone-800 cursor-pointer"
                  >
                    Skip for now
                  </button>
                  <button
                    type="button"
                    onClick={() => setSetupStep(2)}
                    className="py-3.5 px-6 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-sm sm:text-base flex items-center gap-2 cursor-pointer min-h-[48px]"
                  >
                    <span>Next: Location</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* SETUP STEP 2: Location */}
            {setupStep === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-stone-700 mb-1">
                    {regRole === 'farmer' ? 'Village' : 'Location'}
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      placeholder={
                        regRole === 'farmer' ? 'Enter your village' : 'Enter your market/city'
                      }
                      value={setupVillage}
                      onChange={(e) => setSetupVillage(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-300 font-bold text-stone-900 min-h-[48px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-stone-700 mb-1">
                    District
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your district"
                    value={setupDistrict}
                    onChange={(e) => setSetupDistrict(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-stone-300 font-bold text-stone-900 min-h-[48px]"
                  />
                </div>

                <div className="flex items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSetupStep(1)}
                    className="py-3 px-4 rounded-xl border border-stone-300 text-stone-700 font-bold text-xs sm:text-sm cursor-pointer"
                  >
                    Back
                  </button>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setSetupStep(3)}
                      className="text-xs sm:text-sm font-bold text-stone-500 hover:text-stone-800 cursor-pointer"
                    >
                      Skip
                    </button>
                    <button
                      type="button"
                      onClick={() => setSetupStep(3)}
                      className="py-3.5 px-6 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-sm sm:text-base flex items-center gap-2 cursor-pointer min-h-[48px]"
                    >
                      <span>Next: Preferences</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* SETUP STEP 3: Preferences (Language + Buyer Crops) */}
            {setupStep === 3 && (
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-black text-stone-700 mb-2 flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-emerald-700" />
                    <span>Preferred Language</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {(
                      [
                        { code: 'en', label: 'English' },
                        { code: 'ta', label: 'தமிழ் (Tamil)' },
                        { code: 'hi', label: 'हिंदी (Hindi)' },
                      ] as const
                    ).map((langOpt) => (
                      <button
                        key={langOpt.code}
                        type="button"
                        onClick={() => setSetupLanguage(langOpt.code)}
                        className={`py-3 px-3 rounded-xl border-2 font-black text-xs sm:text-sm cursor-pointer transition-all min-h-[48px] ${
                          setupLanguage === langOpt.code
                            ? 'border-emerald-700 bg-emerald-50 text-emerald-950'
                            : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                        }`}
                      >
                        {langOpt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {regRole === 'buyer' && (
                  <div>
                    <label className="block text-xs font-black text-stone-700 mb-2">
                      Crops You Usually Buy
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {COMMON_BUYER_CROPS.map((crop) => {
                        const selected = setupCrops.includes(crop);
                        return (
                          <button
                            key={crop}
                            type="button"
                            onClick={() => toggleSetupCrop(crop)}
                            className={`px-3.5 py-2 rounded-xl border font-bold text-xs cursor-pointer transition-colors ${
                              selected
                                ? 'bg-emerald-700 text-white border-emerald-700'
                                : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                            }`}
                          >
                            {crop}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSetupStep(2)}
                    className="py-3 px-4 rounded-xl border border-stone-300 text-stone-700 font-bold text-xs sm:text-sm cursor-pointer"
                  >
                    Back
                  </button>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => redirectUserByRole(regRole)}
                      className="text-xs sm:text-sm font-bold text-stone-500 hover:text-stone-800 cursor-pointer"
                    >
                      Skip
                    </button>
                    <button
                      type="button"
                      onClick={handleCompleteProfileSetup}
                      disabled={isSigningIn}
                      className="py-3.5 px-6 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-sm sm:text-base flex items-center gap-2 cursor-pointer min-h-[48px]"
                    >
                      <span>Save & Finish</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* SETUP STEP 4: Done */}
            {setupStep === 4 && (
              <div className="text-center space-y-5 py-2">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-stone-900">
                    Your profile is ready!
                  </h2>
                  <p className="text-sm text-stone-600 mt-1">
                    Your preferences and location have been saved.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => redirectUserByRole(regRole)}
                  className="w-full py-4 px-6 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-base flex items-center justify-center gap-2 cursor-pointer min-h-[54px]"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* ==================================================
            VIEW 4: FORGOT PASSWORD / ACCOUNT RECOVERY
            Flow: Forgot Password -> Enter Email -> Send Recovery Instructions -> Reset Password -> Login
           ================================================== */}
        {viewMode === 'forgot_password' && (
          <>
            {recoveryStage === 'enter_email' ? (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-5" noValidate>
                <div>
                  <label
                    htmlFor="recovery-email-input"
                    className="block text-sm font-black text-stone-800 mb-2"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-5 h-5 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="recovery-email-input"
                      type="email"
                      placeholder="Enter your email"
                      value={recoveryEmail}
                      onChange={(e) => {
                        setRecoveryEmail(e.target.value);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 border-stone-300 focus:border-emerald-700 focus:outline-none text-base font-bold text-stone-900 min-h-[52px]"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSigningIn}
                  className="w-full py-4 px-6 rounded-2xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white font-black text-base flex items-center justify-center gap-2 cursor-pointer transition-colors min-h-[54px]"
                >
                  <span>Send Recovery Instructions</span>
                  <ArrowRight className="w-5 h-5" />
                </button>

                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode('login');
                      setLoginMethod('email');
                      setErrorMessage(null);
                      setRecoverySuccess(null);
                    }}
                    className="inline-flex items-center gap-1.5 text-sm font-black text-stone-700 hover:text-stone-950 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Sign In</span>
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleResetPasswordSubmit} className="space-y-5" noValidate>
                <div>
                  <label
                    htmlFor="reset-password-input"
                    className="block text-sm font-black text-stone-800 mb-2"
                  >
                    Reset Password
                  </label>
                  <div className="relative">
                    <Lock className="w-5 h-5 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="reset-password-input"
                      type={showResetPassword ? 'text' : 'password'}
                      placeholder="Enter your new password"
                      value={newResetPassword}
                      onChange={(e) => {
                        setNewResetPassword(e.target.value);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      className="w-full pl-12 pr-12 py-3.5 rounded-2xl border-2 border-stone-300 focus:border-emerald-700 focus:outline-none text-base font-bold text-stone-900 min-h-[52px]"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowResetPassword(!showResetPassword)}
                      aria-label={showResetPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-stone-500 hover:text-stone-800 cursor-pointer"
                    >
                      {showResetPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSigningIn}
                  className="w-full py-4 px-6 rounded-2xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white font-black text-base flex items-center justify-center gap-2 cursor-pointer transition-colors min-h-[54px]"
                >
                  <span>Reset Password & Sign In</span>
                  <ArrowRight className="w-5 h-5" />
                </button>

                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode('login');
                      setLoginMethod('email');
                      setRecoveryStage('enter_email');
                      setErrorMessage(null);
                      setRecoverySuccess(null);
                    }}
                    className="inline-flex items-center gap-1.5 text-sm font-black text-stone-700 hover:text-stone-950 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Sign In</span>
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
};
