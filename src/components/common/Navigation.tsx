import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { LanguageSelector } from './LanguageSelector';
import { api } from '../../services/api';
import { translateText } from '../../locales/translations';
import {
  Sprout,
  Menu,
  X,
  Phone,
  Bell,
  User,
  Settings,
  LogOut,
  ChevronDown
} from 'lucide-react';

export const Navigation: React.FC = () => {
  const {
    role,
    setRole,
    user,
    requestLogout,
    simpleMode,
    setSimpleMode,
    language,
    t
  } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const [notifications, setNotifications] = useState<any[]>([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const fetchLiveNotifications = async () => {
    try {
      const res = await api.notifications.getAll();
      if (res.success && res.data) {
        setNotifications(res.data);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchLiveNotifications();
    const interval = setInterval(fetchLiveNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadNotifications = notifications.filter((n) => !n.read);

  const handleMarkAllRead = async () => {
    try {
      await api.notifications.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      // ignore
    }
  };

  const isActive = (path: string) => location.pathname === path;

  const handleRoleChange = (newRole: 'farmer' | 'buyer' | 'admin') => {
    setRole(newRole);
    setMobileMenuOpen(false);
    setProfileMenuOpen(false);
    if (!user) {
      navigate('/login');
      return;
    }
    if (newRole === 'farmer') navigate('/farmer/dashboard');
    else if (newRole === 'buyer') navigate('/buyer/dashboard');
    else if (newRole === 'admin') navigate('/admin/dashboard');
  };

  const profilePath =
    role === 'farmer'
      ? '/farmer/profile'
      : role === 'buyer'
      ? '/buyer/profile'
      : '/admin/profile';

  const settingsPath =
    role === 'farmer'
      ? '/farmer/profile?section=settings'
      : role === 'buyer'
      ? '/buyer/profile?section=settings'
      : '/admin/settings';

  const handleLogoutClick = () => {
    setProfileMenuOpen(false);
    setMobileMenuOpen(false);
    requestLogout(() => {
      navigate('/login', { replace: true });
    });
  };

  const roleBadgeLabel =
    role === 'farmer'
      ? t('role_farmer')
      : role === 'buyer'
      ? t('role_buyer')
      : t('role_admin');

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200">
      {/* Top Helpline Bar */}
      <div className="bg-emerald-900 text-emerald-100 text-xs py-1.5 px-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 truncate">
            <a href="tel:18004253276" className="flex items-center gap-1 font-bold text-amber-300 shrink-0 hover:underline">
              <Phone className="w-3.5 h-3.5" />
              1800-425-3276
            </a>
            <span className="hidden sm:inline text-emerald-400">·</span>
            <span className="hidden sm:inline text-emerald-200 truncate">
              {t('helpline_label')}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="sm:hidden">
              <LanguageSelector compact />
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 sm:py-3">
        <div className="flex items-center justify-between gap-3">
          {/* Logo & Brand */}
          <Link
            to={!user ? '/' : role === 'farmer' ? '/farmer/dashboard' : role === 'buyer' ? '/buyer/dashboard' : '/admin/dashboard'}
            className="flex items-center gap-2 focus:outline-none shrink-0"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shadow-sm">
              <Sprout className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-200" />
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-black tracking-tight text-emerald-950 block leading-none" data-no-translate="true">
                Farm<span className="text-emerald-700">Grade</span>
              </span>
              <p className="text-[10px] sm:text-[11px] font-semibold text-stone-500 tracking-wide mt-0.5 hidden xs:block">
                {t('brand_tagline')}
              </p>
            </div>
          </Link>

          {/* Desktop Global Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            <Link
              to="/"
              className={`px-3 py-1.5 rounded-xl text-sm font-bold transition-colors ${
                isActive('/') ? 'text-emerald-800 bg-emerald-50' : 'text-stone-700 hover:text-stone-950'
              }`}
            >
              {t('nav_home')}
            </Link>
            {user && (
              <Link
                to="/farmer/market-prices"
                className={`px-3 py-1.5 rounded-xl text-sm font-bold transition-colors ${
                  isActive('/farmer/market-prices') ? 'text-emerald-800 bg-emerald-50' : 'text-stone-700 hover:text-stone-950'
                }`}
              >
                {t('nav_market_prices')}
              </Link>
            )}
            <Link
              to="/how-it-works"
              className={`px-3 py-1.5 rounded-xl text-sm font-bold transition-colors ${
                isActive('/how-it-works') ? 'text-emerald-800 bg-emerald-50' : 'text-stone-700 hover:text-stone-950'
              }`}
            >
              {t('nav_how_it_works')}
            </Link>
          </nav>

          {/* Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:block">
              <LanguageSelector />
            </div>

            {/* Notification Bell */}
            {user && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setNotificationsOpen(!notificationsOpen);
                    setProfileMenuOpen(false);
                  }}
                  className="relative p-2 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
                  title={t('nav_notifications')}
                  aria-label={t('nav_notifications')}
                >
                  <Bell className="w-4 h-4" />
                  {unreadNotifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-black flex items-center justify-center">
                      {unreadNotifications.length}
                    </span>
                  )}
                </button>

                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl border-2 border-stone-200 shadow-xl z-50 overflow-hidden">
                    <div className="p-3 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-wider text-stone-900">
                        {t('nav_notifications')}
                      </span>
                      {unreadNotifications.length > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 cursor-pointer"
                        >
                          {t('mark_all_read')}
                        </button>
                      )}
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-stone-100">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-xs text-stone-500 font-semibold">
                          {t('no_notifications')}
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => {
                              setNotificationsOpen(false);
                              if (role === 'farmer') navigate('/farmer/bids');
                              else if (role === 'buyer') navigate('/buyer/my-bids');
                              else navigate('/admin/bids');
                            }}
                            className={`p-3 text-left hover:bg-stone-50 cursor-pointer transition-colors ${
                              !n.read ? 'bg-emerald-50/50' : 'bg-white'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-1">
                              <span className="text-xs font-bold text-stone-900">
                                {translateText(n.title, language)}
                              </span>
                              <span className="text-[10px] text-stone-500 shrink-0">
                                {new Date(n.createdAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                            <p className="text-xs text-stone-600 mt-1 leading-snug">
                              {translateText(n.message, language)}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Desktop Role Switcher */}
            {user && (
              <div className="hidden md:flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => handleRoleChange('farmer')}
                  className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                    role === 'farmer'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {t('role_farmer')}
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleChange('buyer')}
                  className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                    role === 'buyer'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {t('role_buyer')}
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleChange('admin')}
                  className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                    role === 'admin'
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {t('role_admin')}
                </button>
              </div>
            )}

            {/* Simple Mode Toggle for Farmer */}
            {user && role === 'farmer' && (
              <button
                type="button"
                onClick={() => setSimpleMode(!simpleMode)}
                className={`hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-black cursor-pointer transition-all ${
                  simpleMode
                    ? 'bg-amber-400 text-stone-950 border-amber-500 shadow-xs'
                    : 'bg-white hover:bg-stone-50 text-stone-800 border-stone-300'
                }`}
              >
                <span>{simpleMode ? t('simple_mode_on') : t('simple_mode')}</span>
              </button>
            )}

            {/* User Profile Dropdown Menu / Login Link */}
            {user ? (
              <div className="relative" ref={profileMenuRef}>
                <button
                  type="button"
                  onClick={() => {
                    setProfileMenuOpen(!profileMenuOpen);
                    setNotificationsOpen(false);
                  }}
                  aria-expanded={profileMenuOpen}
                  aria-haspopup="true"
                  className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-800 text-xs font-bold transition-colors cursor-pointer min-h-[40px]"
                  title={t('nav_profile')}
                >
                  <User className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span className="max-w-[85px] sm:max-w-[110px] truncate">
                    {user.name.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                </button>

                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border-2 border-stone-200 shadow-xl z-50 overflow-hidden text-left">
                    {/* Profile Header */}
                    <div className="px-4 py-3 bg-stone-50 border-b border-stone-200">
                      <p className="text-xs font-black uppercase tracking-wider text-stone-500">
                        {t('nav_profile')}
                      </p>
                      <p className="text-sm font-black text-stone-900 truncate mt-0.5">
                        {user.name}
                      </p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 text-[10px] font-black uppercase tracking-wider">
                        {roleBadgeLabel}
                      </span>
                    </div>

                    {/* Menu Options */}
                    <div className="p-1.5 space-y-0.5">
                      <button
                        type="button"
                        onClick={() => {
                          setProfileMenuOpen(false);
                          navigate(profilePath);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-bold text-stone-800 hover:bg-stone-100 transition-colors cursor-pointer text-left"
                      >
                        <User className="w-4 h-4 text-emerald-700 shrink-0" />
                        <span>{t('nav_my_profile')}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setProfileMenuOpen(false);
                          navigate(settingsPath);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-bold text-stone-800 hover:bg-stone-100 transition-colors cursor-pointer text-left"
                      >
                        <Settings className="w-4 h-4 text-emerald-700 shrink-0" />
                        <span>{t('nav_settings')}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setProfileMenuOpen(false);
                          setNotificationsOpen(true);
                        }}
                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold text-stone-800 hover:bg-stone-100 transition-colors cursor-pointer text-left"
                      >
                        <div className="flex items-center gap-2.5">
                          <Bell className="w-4 h-4 text-emerald-700 shrink-0" />
                          <span>{t('nav_notifications')}</span>
                        </div>
                        {unreadNotifications.length > 0 && (
                          <span className="px-1.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black">
                            {unreadNotifications.length}
                          </span>
                        )}
                      </button>
                    </div>

                    {/* Logout Action */}
                    <div className="p-1.5 border-t border-stone-200 bg-stone-50/50">
                      <button
                        type="button"
                        onClick={handleLogoutClick}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-black text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer text-left"
                      >
                        <LogOut className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>{t('nav_logout')}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="px-3.5 py-2 rounded-xl bg-emerald-700 text-white text-xs font-black hover:bg-emerald-800 transition-colors"
              >
                {t('nav_login')}
              </Link>
            )}

            {/* Mobile menu hamburger */}
            <div className="flex items-center lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-stone-700 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer border border-stone-200 min-h-[40px] min-w-[40px] flex items-center justify-center"
                aria-label={t('nav_menu')}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-stone-200 bg-white p-5 space-y-4">
          {user && (
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <span className="text-xs font-black uppercase text-stone-500">{t('role_label')}:</span>
              <div className="flex items-center bg-stone-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => handleRoleChange('farmer')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg cursor-pointer ${
                    role === 'farmer' ? 'bg-emerald-700 text-white' : 'text-stone-700'
                  }`}
                >
                  {t('role_farmer')}
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleChange('buyer')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg cursor-pointer ${
                    role === 'buyer' ? 'bg-emerald-700 text-white' : 'text-stone-700'
                  }`}
                >
                  {t('role_buyer')}
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleChange('admin')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg cursor-pointer ${
                    role === 'admin' ? 'bg-stone-900 text-white' : 'text-stone-700'
                  }`}
                >
                  {t('role_admin')}
                </button>
              </div>
            </div>
          )}

          <div className="space-y-1">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block p-3 rounded-xl font-bold text-stone-800 hover:bg-stone-100 text-sm"
            >
              {t('nav_home')}
            </Link>
            <Link
              to="/how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="block p-3 rounded-xl font-bold text-stone-800 hover:bg-stone-100 text-sm"
            >
              {t('nav_how_it_works')}
            </Link>
            {user && (
              <>
                <Link
                  to="/farmer/market-prices"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block p-3 rounded-xl font-bold text-stone-800 hover:bg-stone-100 text-sm"
                >
                  {t('nav_market_prices')}
                </Link>
                <Link
                  to={profilePath}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block p-3 rounded-xl font-bold text-stone-800 hover:bg-stone-100 text-sm"
                >
                  {t('nav_my_profile')}
                </Link>
                <Link
                  to={settingsPath}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block p-3 rounded-xl font-bold text-stone-800 hover:bg-stone-100 text-sm"
                >
                  {t('nav_settings')}
                </Link>
              </>
            )}
            <Link
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="block p-3 rounded-xl font-bold text-stone-800 hover:bg-stone-100 text-sm"
            >
              {t('nav_about')}
            </Link>
          </div>

          <div className="pt-2 border-t border-stone-200 flex items-center justify-between">
            <LanguageSelector />
            {user ? (
              <button
                type="button"
                onClick={handleLogoutClick}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-black cursor-pointer transition-colors"
              >
                <LogOut className="w-4 h-4 text-rose-600" />
                <span>{t('nav_logout')}</span>
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-xs font-bold text-stone-900 hover:underline"
              >
                {t('nav_login')}
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
