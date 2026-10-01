import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { Button } from '../../components/common/Button';
import {
  Phone,
  Mail,
  MapPin,
  Building2,
  ShieldCheck,
  CreditCard,
  Bell,
  Globe,
  CheckCircle2,
  Edit2,
  Save,
  ArrowLeft,
  LogOut,
  Lock,
  Eye,
  EyeOff,
  Trash2,
  AlertCircle,
  Link2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ProfilePage: React.FC = () => {
  const {
    role,
    user,
    language,
    setLanguage,
    updateUserProfile,
    deleteAccount,
    addToast,
    requestLogout
  } = useApp();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(
    user?.name || (role === 'farmer' ? 'Murugan Selvam' : role === 'buyer' ? 'Ramesh Kumar' : 'Admin')
  );
  const [phone, setPhone] = useState(user?.phone || '9842177312');
  const [email, setEmail] = useState(
    user?.email ||
      (role === 'farmer'
        ? 'murugan@farmgrade.in'
        : role === 'buyer'
        ? 'ramesh@freshbasket.in'
        : 'admin@farmgrade.in')
  );
  const [village, setVillage] = useState(
    user?.village || (role === 'farmer' ? 'Oddanchatram' : 'Salem Central')
  );
  const [district, setDistrict] = useState(
    user?.district || (role === 'farmer' ? 'Dindigul' : 'Salem')
  );
  const [upiId, setUpiId] = useState(
    role === 'farmer' ? 'murugan.selvam@upi' : 'freshbasket.settle@okhdfcbank'
  );
  const [businessName, setBusinessName] = useState(
    user?.businessName || (role === 'buyer' ? 'FreshBasket Hypermarkets Ltd' : 'Self Farm Gate')
  );
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Account Linking inline states
  const [linkingMethod, setLinkingMethod] = useState<'mobile' | 'email' | null>(null);
  const [linkInputVal, setLinkInputVal] = useState('');
  const [linkFeedback, setLinkFeedback] = useState<{ type: 'error' | 'success'; text: string } | null>(
    null
  );

  // Security -> Change Password states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState<{
    type: 'error' | 'success';
    text: string;
  } | null>(null);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Settings -> Account -> Delete My Account modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmCredential, setDeleteConfirmCredential] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);

    const res = await updateUserProfile({
      name: name.trim(),
      phone: phone.replace(/\D/g, ''),
      email: email.trim().toLowerCase(),
      village: village.trim(),
      district: district.trim(),
      businessName: businessName.trim(),
      preferredLanguage: language,
    });

    if (res.success) {
      setIsEditing(false);
      addToast({
        type: 'success',
        title: 'Profile Saved',
        message: 'Your profile details have been updated.',
      });
    } else {
      setProfileError(res.error || 'Could not update profile. Please try again.');
    }
  };

  // Handle Linking / Updating Mobile or Email in Account Login Methods
  const handleLinkMethodSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLinkFeedback(null);

    if (linkingMethod === 'mobile') {
      const cleanPhone = linkInputVal.replace(/\D/g, '');
      if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
        setLinkFeedback({ type: 'error', text: 'Please enter a valid mobile number.' });
        return;
      }
      const res = await updateUserProfile({ phone: cleanPhone, mobileVerified: true });
      if (res.success) {
        setPhone(cleanPhone);
        setLinkingMethod(null);
        setLinkInputVal('');
        setLinkFeedback({ type: 'success', text: 'Mobile number linked and verified.' });
      } else {
        setLinkFeedback({
          type: 'error',
          text: res.error || 'An account already exists with these details. Try signing in.',
        });
      }
    } else if (linkingMethod === 'email') {
      const cleanEmail = linkInputVal.trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        setLinkFeedback({ type: 'error', text: 'Please enter a valid email address.' });
        return;
      }
      const res = await updateUserProfile({ email: cleanEmail, emailVerified: true });
      if (res.success) {
        setEmail(cleanEmail);
        setLinkingMethod(null);
        setLinkInputVal('');
        setLinkFeedback({ type: 'success', text: 'Email address linked and verified.' });
      } else {
        setLinkFeedback({
          type: 'error',
          text: res.error || 'An account already exists with these details. Try signing in.',
        });
      }
    }
  };

  // Handle Connect Google Account
  const handleConnectGoogle = async () => {
    setLinkFeedback(null);
    try {
      const res = await api.auth.getGoogleAuthUrl();
      if (res.success && res.configured && res.url) {
        window.location.href = res.url;
      } else {
        setLinkFeedback({
          type: 'error',
          text: 'Google sign-in could not be completed. Please try again.',
        });
      }
    } catch {
      setLinkFeedback({
        type: 'error',
        text: 'Google sign-in could not be completed. Please try again.',
      });
    }
  };

  // Handle Change Password inside Profile -> Settings -> Security
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordFeedback(null);

    if (!currentPassword || !newPassword || newPassword.length < 4) {
      setPasswordFeedback({
        type: 'error',
        text: 'Please enter your current password and a new password (at least 4 characters).',
      });
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const res = await api.auth.changePassword(currentPassword, newPassword);
      setIsUpdatingPassword(false);
      if (res.success) {
        setCurrentPassword('');
        setNewPassword('');
        setPasswordFeedback({
          type: 'success',
          text: res.message || 'Your password has been updated successfully.',
        });
      } else {
        setPasswordFeedback({
          type: 'error',
          text: 'Your email/mobile number or password is incorrect.',
        });
      }
    } catch (err: any) {
      setIsUpdatingPassword(false);
      setPasswordFeedback({
        type: 'error',
        text: String(err?.message || 'Your email/mobile number or password is incorrect.'),
      });
    }
  };

  // Handle Account Deletion inside Profile -> Settings -> Account
  const handleConfirmDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeleteError(null);

    if (!deleteConfirmCredential.trim()) {
      setDeleteError('Please enter your password or mobile number to confirm.');
      return;
    }

    setIsDeletingAccount(true);
    const res = await deleteAccount(deleteConfirmCredential.trim());
    setIsDeletingAccount(false);

    if (res.success) {
      setShowDeleteModal(false);
      navigate('/login', { replace: true });
    } else {
      setDeleteError(res.error || 'Your email/mobile number or password is incorrect.');
    }
  };

  const roleLabel = role === 'farmer' ? 'Farmer' : role === 'buyer' ? 'Buyer' : 'Administrator';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 text-left space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-2.5 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-700 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer transition-colors"
            aria-label="Go Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
              {roleLabel} Profile & Settings
            </h1>
            <p className="text-stone-600 text-sm mt-0.5">
              Manage contact details, linked accounts, language, and security settings.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-900 font-bold text-sm min-h-[44px] cursor-pointer transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            <span>{isEditing ? 'Cancel Editing' : 'Edit Profile'}</span>
          </button>

          <button
            type="button"
            onClick={() =>
              requestLogout(() => {
                navigate('/login', { replace: true });
              })
            }
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-black text-sm min-h-[44px] cursor-pointer transition-colors"
          >
            <LogOut className="w-4 h-4 text-rose-600" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Profile Card */}
      <div className="bg-white rounded-3xl border-2 border-stone-200 p-6 sm:p-8 shadow-xs space-y-6">
        {/* User Identity Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-700 text-white font-black text-2xl flex items-center justify-center shadow-md">
              {name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-stone-900">{name}</h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold border border-emerald-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Verified</span>
                </span>
              </div>
              <p className="text-stone-600 text-sm mt-0.5">{roleLabel} Account</p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-stone-500 font-bold block uppercase tracking-wider">
              Verification Status
            </span>
            <span className="text-emerald-700 font-black text-sm flex items-center gap-1 sm:justify-end">
              <CheckCircle2 className="w-4 h-4" />
              Direct UPI Payouts Enabled
            </span>
          </div>
        </div>

        {profileError && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2.5 text-sm font-bold">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{profileError}</span>
          </div>
        )}

        {/* Profile Details Form */}
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-stone-900 font-semibold min-h-[44px]"
                  required
                />
              ) : (
                <div className="px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 font-bold text-sm">
                  {name}
                </div>
              )}
            </div>

            {/* Mobile Phone */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                Mobile Number (SMS & Calls)
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-stone-900 font-semibold min-h-[44px]"
                  required
                />
              ) : (
                <div className="px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 font-bold text-sm flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-700" />
                  <span>{phone ? `+91 ${phone}` : 'Not added'}</span>
                </div>
              )}
            </div>

            {/* Village / Town */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                {role === 'farmer' ? 'Village / Panchayat' : 'Business Location'}
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-stone-900 font-semibold min-h-[44px]"
                  required
                />
              ) : (
                <div className="px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 font-bold text-sm flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-700" />
                  <span>{village}</span>
                </div>
              )}
            </div>

            {/* District */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                District
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-stone-900 font-semibold min-h-[44px]"
                  required
                />
              ) : (
                <div className="px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 font-bold text-sm">
                  {district}, Tamil Nadu
                </div>
              )}
            </div>

            {/* Payout UPI ID */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                {role === 'farmer'
                  ? 'Payout UPI ID (Instant Bank Settlement)'
                  : 'Company UPI / Billing ID'}
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-stone-900 font-semibold min-h-[44px]"
                  required
                />
              ) : (
                <div className="px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 font-mono font-bold text-sm flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-700" />
                  <span>{upiId}</span>
                </div>
              )}
            </div>

            {/* Business / Farm Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                {role === 'farmer' ? 'Farm / Landholding' : 'Registered Business'}
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-stone-900 font-semibold min-h-[44px]"
                />
              ) : (
                <div className="px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 font-bold text-sm flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-emerald-700" />
                  <span>{businessName}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action buttons when editing */}
          {isEditing && (
            <div className="pt-4 border-t border-stone-200 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                icon={<Save className="w-4 h-4" />}
              >
                Save Changes
              </Button>
            </div>
          )}
        </form>
      </div>

      {/* ==================================================
          SETTINGS -> LANGUAGE & PREFERENCES
         ================================================== */}
      <div className="bg-white rounded-3xl border-2 border-stone-200 p-6 sm:p-8 shadow-xs space-y-5">
        <div>
          <h3 className="text-lg font-black text-stone-900">Settings — Language & Alerts</h3>
          <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
            Your selected language is remembered automatically on your next sign-in.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Language Selector */}
          <div className="p-4 rounded-2xl border border-stone-200 bg-stone-50/60 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-emerald-700" />
              <div>
                <span className="text-xs font-bold text-stone-500 uppercase block">
                  Language
                </span>
                <span className="text-sm font-bold text-stone-900">
                  {language === 'ta'
                    ? 'தமிழ் (Tamil)'
                    : language === 'hi'
                    ? 'हिंदी (Hindi)'
                    : 'English'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-stone-200">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-colors ${
                  language === 'en' ? 'bg-emerald-700 text-white' : 'text-stone-700'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLanguage('ta')}
                className={`px-2.5 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-colors ${
                  language === 'ta' ? 'bg-emerald-700 text-white' : 'text-stone-700'
                }`}
              >
                Tamil
              </button>
              <button
                type="button"
                onClick={() => setLanguage('hi')}
                className={`px-2.5 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-colors ${
                  language === 'hi' ? 'bg-emerald-700 text-white' : 'text-stone-700'
                }`}
              >
                Hindi
              </button>
            </div>
          </div>

          {/* SMS Notifications Toggle */}
          <div className="p-4 rounded-2xl border border-stone-200 bg-stone-50/60 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-emerald-700" />
              <div>
                <span className="text-xs font-bold text-stone-500 uppercase block">
                  Trade SMS Alerts
                </span>
                <span className="text-sm font-bold text-stone-900">
                  {smsAlerts ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSmsAlerts(!smsAlerts)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black min-h-[40px] cursor-pointer transition-colors ${
                smsAlerts ? 'bg-emerald-700 text-white' : 'bg-stone-300 text-stone-800'
              }`}
            >
              {smsAlerts ? 'Active' : 'Turn On'}
            </button>
          </div>
        </div>
      </div>

      {/* ==================================================
          PROFILE ACCOUNT LINKING — ACCOUNT LOGIN METHODS
         ================================================== */}
      <div className="bg-white rounded-3xl border-2 border-stone-200 p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex items-center gap-2.5">
          <Link2 className="w-5 h-5 text-emerald-700" />
          <div>
            <h3 className="text-lg font-black text-stone-900">Account Login Methods</h3>
            <p className="text-xs sm:text-sm text-stone-600">
              Manage your linked mobile number, email address, and Google account.
            </p>
          </div>
        </div>

        {linkFeedback && (
          <div
            className={`p-3.5 rounded-2xl border text-sm font-bold flex items-center gap-2.5 ${
              linkFeedback.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {linkFeedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{linkFeedback.text}</span>
          </div>
        )}

        <div className="divide-y divide-stone-200 border border-stone-200 rounded-2xl overflow-hidden">
          {/* Mobile Number Row */}
          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-50/40">
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-emerald-700 shrink-0" />
              <div>
                <p className="text-xs font-bold text-stone-500 uppercase">Mobile Number</p>
                <p className="text-sm font-black text-stone-900">
                  {phone ? `+91 ${phone}` : 'Not linked'}{' '}
                  {phone && (
                    <span className="text-xs font-bold text-emerald-700 ml-1">(Verified)</span>
                  )}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setLinkingMethod(linkingMethod === 'mobile' ? null : 'mobile');
                setLinkInputVal(phone || '');
                setLinkFeedback(null);
              }}
              className="px-3.5 py-2 rounded-xl border border-stone-300 bg-white hover:bg-stone-100 text-xs font-black text-stone-800 cursor-pointer self-start sm:self-auto"
            >
              {phone ? 'Update Mobile' : 'Add Mobile Number'}
            </button>
          </div>

          {/* Email Address Row */}
          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-50/40">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-emerald-700 shrink-0" />
              <div>
                <p className="text-xs font-bold text-stone-500 uppercase">Email Address</p>
                <p className="text-sm font-black text-stone-900">
                  {email || 'Not linked'}{' '}
                  {email && (
                    <span className="text-xs font-bold text-emerald-700 ml-1">(Verified)</span>
                  )}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setLinkingMethod(linkingMethod === 'email' ? null : 'email');
                setLinkInputVal(email || '');
                setLinkFeedback(null);
              }}
              className="px-3.5 py-2 rounded-xl border border-stone-300 bg-white hover:bg-stone-100 text-xs font-black text-stone-800 cursor-pointer self-start sm:self-auto"
            >
              {email ? 'Update Email' : 'Add Email'}
            </button>
          </div>

          {/* Google Account Row */}
          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-50/40">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-emerald-700 shrink-0" />
              <div>
                <p className="text-xs font-bold text-stone-500 uppercase">Google Account</p>
                <p className="text-sm font-black text-stone-900">
                  {user?.googleConnected ? 'Connected' : 'Not Connected'}
                </p>
              </div>
            </div>
            {!user?.googleConnected && (
              <button
                type="button"
                onClick={handleConnectGoogle}
                className="px-3.5 py-2 rounded-xl border border-stone-300 bg-white hover:bg-stone-100 text-xs font-black text-stone-800 cursor-pointer self-start sm:self-auto"
              >
                Connect Google Account
              </button>
            )}
          </div>
        </div>

        {/* Inline Form to Add/Update Mobile or Email */}
        {linkingMethod && (
          <form
            onSubmit={handleLinkMethodSubmit}
            className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
          >
            <input
              type={linkingMethod === 'mobile' ? 'tel' : 'email'}
              placeholder={
                linkingMethod === 'mobile'
                  ? 'Enter 10-digit mobile number'
                  : 'Enter your email address'
              }
              value={linkInputVal}
              onChange={(e) => setLinkInputVal(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-stone-300 bg-white font-bold text-sm text-stone-900 min-h-[44px]"
              required
            />
            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs min-h-[44px] cursor-pointer"
              >
                Save & Link
              </button>
              <button
                type="button"
                onClick={() => setLinkingMethod(null)}
                className="px-3 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-700 font-bold text-xs min-h-[44px] cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ==================================================
          PROFILE -> SETTINGS -> SECURITY (CHANGE PASSWORD)
         ================================================== */}
      <div className="bg-white rounded-3xl border-2 border-stone-200 p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex items-center gap-2.5">
          <Lock className="w-5 h-5 text-emerald-700" />
          <div>
            <h3 className="text-lg font-black text-stone-900">Settings — Security</h3>
            <p className="text-xs sm:text-sm text-stone-600">
              Change your account password securely.
            </p>
          </div>
        </div>

        {passwordFeedback && (
          <div
            className={`p-3.5 rounded-2xl border text-sm font-bold flex items-center gap-2.5 ${
              passwordFeedback.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {passwordFeedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{passwordFeedback.text}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 pr-11 py-3 rounded-xl border border-stone-300 font-bold text-sm text-stone-900 min-h-[44px]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-800 cursor-pointer"
                  aria-label="Toggle current password visibility"
                >
                  {showCurrentPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 pr-11 py-3 rounded-xl border border-stone-300 font-bold text-sm text-stone-900 min-h-[44px]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-800 cursor-pointer"
                  aria-label="Toggle new password visibility"
                >
                  {showNewPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isUpdatingPassword}
              className="px-5 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white font-black text-sm min-h-[44px] cursor-pointer transition-colors"
            >
              {isUpdatingPassword ? 'Updating...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>

      {/* ==================================================
          PROFILE -> SETTINGS -> ACCOUNT (DELETE MY ACCOUNT)
         ================================================== */}
      <div className="bg-white rounded-3xl border-2 border-rose-200 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-black text-stone-900">Settings — Account</h3>
            <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
              Permanently remove your FarmGrade account and personal data.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setShowDeleteModal(true);
              setDeleteConfirmCredential('');
              setDeleteError(null);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-800 font-black text-sm min-h-[44px] cursor-pointer transition-colors self-start sm:self-auto"
          >
            <Trash2 className="w-4 h-4 text-rose-700" />
            <span>Delete My Account</span>
          </button>
        </div>
      </div>

      {/* Delete Account Confirmation Dialog with Re-authentication */}
      {showDeleteModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-account-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 backdrop-blur-xs p-4"
        >
          <div className="bg-white rounded-3xl border-2 border-stone-200 max-w-md w-full p-6 sm:p-7 shadow-xl space-y-5 text-left">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4
                  id="delete-account-modal-title"
                  className="text-lg font-black text-stone-900 leading-snug"
                >
                  Are you sure you want to delete your account? This action cannot be undone.
                </h4>
                <p className="text-xs sm:text-sm text-stone-600 mt-1">
                  Please confirm your password or registered mobile number to continue.
                </p>
              </div>
            </div>

            {deleteError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{deleteError}</span>
              </div>
            )}

            <form onSubmit={handleConfirmDeleteAccount} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-stone-700 mb-1.5">
                  Password or Mobile Number
                </label>
                <input
                  type="text"
                  placeholder="Enter your password or mobile number"
                  value={deleteConfirmCredential}
                  onChange={(e) => {
                    setDeleteConfirmCredential(e.target.value);
                    if (deleteError) setDeleteError(null);
                  }}
                  className="w-full px-4 py-3 rounded-xl border border-stone-300 font-bold text-sm text-stone-900 min-h-[44px]"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-100 text-stone-800 font-black text-sm min-h-[44px] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isDeletingAccount}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white font-black text-sm min-h-[44px] cursor-pointer"
                >
                  {isDeletingAccount ? 'Deleting...' : 'Delete Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
