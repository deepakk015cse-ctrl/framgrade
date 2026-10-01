import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  PlusCircle,
  TrendingUp,
  Package,
  ShoppingBag,
  Clock,
  PackageCheck,
  Users,
  Building2,
  Layers,
  MoreHorizontal,
  X,
  Tag,
  Receipt,
  User,
  Settings,
  DollarSign,
  Globe,
  PhoneCall,
  LogOut,
  Compass
} from 'lucide-react';

interface MobileNavItem {
  label: string;
  path: string;
  icon: any;
  badge?: number;
}

export const MobileBottomNav: React.FC = () => {
  const { role, setRole, bids, sales, user, requestLogout, language, setLanguage, t } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  const pendingBidsCount = bids.filter((b) => b.status === 'pending').length;

  const farmerPrimary: MobileNavItem[] = [
    { label: t('nav_home'), path: '/farmer/dashboard', icon: LayoutDashboard },
    { label: t('nav_add_produce'), path: '/farmer/add-produce', icon: PlusCircle },
    { label: t('nav_market_prices'), path: '/farmer/market-prices', icon: TrendingUp },
    { label: t('nav_my_listings'), path: '/farmer/listings', icon: Package },
  ];

  const buyerPrimary: MobileNavItem[] = [
    { label: t('nav_home'), path: '/buyer/dashboard', icon: LayoutDashboard },
    { label: t('nav_find_produce'), path: '/buyer/market', icon: ShoppingBag },
    { label: t('nav_my_bids'), path: '/buyer/my-bids', icon: Clock, badge: pendingBidsCount },
    { label: t('nav_purchases'), path: '/buyer/purchases', icon: PackageCheck },
  ];

  const adminPrimary: MobileNavItem[] = [
    { label: t('nav_dashboard'), path: '/admin/dashboard', icon: LayoutDashboard },
    { label: t('nav_farmers'), path: '/admin/farmers', icon: Users },
    { label: t('nav_buyers'), path: '/admin/buyers', icon: Building2 },
    { label: t('nav_listings'), path: '/admin/listings', icon: Layers },
  ];

  const primaryItems =
    role === 'farmer'
      ? farmerPrimary
      : role === 'buyer'
      ? buyerPrimary
      : adminPrimary;

  const handleRoleSwitch = (newRole: 'farmer' | 'buyer' | 'admin') => {
    setRole(newRole);
    setMoreMenuOpen(false);
    if (newRole === 'farmer') navigate('/farmer/dashboard');
    else if (newRole === 'buyer') navigate('/buyer/dashboard');
    else if (newRole === 'admin') navigate('/admin/dashboard');
  };

  return (
    <>
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-300 shadow-lg px-2 py-1 flex items-center justify-around safe-bottom"
      >
        {primaryItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center py-1.5 px-1.5 rounded-xl transition-all relative flex-1 min-h-[52px] cursor-pointer ${
                isActive
                  ? 'text-emerald-800 font-black'
                  : 'text-stone-600 hover:text-stone-900 font-semibold'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 ${
                    isActive ? 'text-emerald-700 stroke-[2.5]' : 'text-stone-500 stroke-[2]'
                  }`}
                />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-2 bg-amber-500 text-stone-950 font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight text-center leading-tight line-clamp-1">
                {item.label}
              </span>
            </NavLink>
          );
        })}

        <button
          type="button"
          onClick={() => setMoreMenuOpen(true)}
          className={`flex flex-col items-center justify-center py-1.5 px-1.5 rounded-xl transition-all relative flex-1 min-h-[52px] cursor-pointer ${
            moreMenuOpen ? 'text-emerald-800 font-black' : 'text-stone-600 font-semibold'
          }`}
          aria-label={t('nav_more')}
        >
          <MoreHorizontal className="w-5 h-5 text-stone-500 stroke-[2]" />
          <span className="text-[10px] mt-1 tracking-tight leading-tight">{t('nav_more')}</span>
        </button>
      </nav>

      {moreMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
          <div
            className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMoreMenuOpen(false)}
          />

          <div className="relative bg-white rounded-t-3xl border-t-2 border-stone-300 p-5 shadow-2xl max-h-[85vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="text-lg font-black text-stone-900">
                {t('nav_menu')}
              </h3>
              <button
                type="button"
                onClick={() => setMoreMenuOpen(false)}
                className="p-2 text-stone-500 hover:text-stone-900 rounded-xl hover:bg-stone-100 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
                aria-label="Close menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-2">
              {role === 'farmer' && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setMoreMenuOpen(false);
                      navigate('/farmer/decision');
                    }}
                    className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-950 font-black text-sm min-h-[48px] text-left cursor-pointer transition-colors border border-emerald-200"
                  >
                    <div className="flex items-center gap-3">
                      <Compass className="w-5 h-5 text-emerald-700" />
                      <span>{t('Farm Decision & Net Realisation')}</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMoreMenuOpen(false);
                      navigate('/farmer/bids');
                    }}
                    className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-stone-50 hover:bg-emerald-50 text-stone-900 font-bold text-sm min-h-[48px] text-left cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Tag className="w-5 h-5 text-emerald-700" />
                      <span>{t('nav_buyer_offers')}</span>
                    </div>
                    {pendingBidsCount > 0 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-400 text-stone-950 font-black">
                        {pendingBidsCount}
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMoreMenuOpen(false);
                      navigate('/farmer/sales');
                    }}
                    className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-stone-50 hover:bg-emerald-50 text-stone-900 font-bold text-sm min-h-[48px] text-left cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Receipt className="w-5 h-5 text-emerald-700" />
                      <span>{t('nav_my_sales')}</span>
                    </div>
                    <span className="text-xs text-stone-500 font-semibold">
                      {sales.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMoreMenuOpen(false);
                      navigate('/farmer/profile');
                    }}
                    className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-stone-50 hover:bg-emerald-50 text-stone-900 font-bold text-sm min-h-[48px] text-left cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-emerald-700" />
                      <span>{t('nav_profile')}</span>
                    </div>
                  </button>
                </>
              )}

              {role === 'buyer' && (
                <button
                  type="button"
                  onClick={() => {
                    setMoreMenuOpen(false);
                    navigate('/buyer/profile');
                  }}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-stone-50 hover:bg-emerald-50 text-stone-900 font-bold text-sm min-h-[48px] text-left cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-emerald-700" />
                    <span>{t('nav_profile')}</span>
                  </div>
                </button>
              )}

              {role === 'admin' && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setMoreMenuOpen(false);
                      navigate('/admin/bids');
                    }}
                    className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-stone-50 hover:bg-stone-100 text-stone-900 font-bold text-sm min-h-[48px] text-left cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Tag className="w-5 h-5 text-stone-700" />
                      <span>{t('nav_bids')}</span>
                    </div>
                    <span className="text-xs text-stone-500 font-semibold">{bids.length}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMoreMenuOpen(false);
                      navigate('/admin/transactions');
                    }}
                    className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-stone-50 hover:bg-stone-100 text-stone-900 font-bold text-sm min-h-[48px] text-left cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <DollarSign className="w-5 h-5 text-stone-700" />
                      <span>{t('nav_transactions')}</span>
                    </div>
                    <span className="text-xs text-stone-500 font-semibold">{sales.length}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMoreMenuOpen(false);
                      navigate('/admin/market-data');
                    }}
                    className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-stone-50 hover:bg-stone-100 text-stone-900 font-bold text-sm min-h-[48px] text-left cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-5 h-5 text-stone-700" />
                      <span>{t('Market Data')}</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMoreMenuOpen(false);
                      navigate('/admin/settings');
                    }}
                    className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-stone-50 hover:bg-stone-100 text-stone-900 font-bold text-sm min-h-[48px] text-left cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Settings className="w-5 h-5 text-stone-700" />
                      <span>{t('nav_settings')}</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMoreMenuOpen(false);
                      navigate('/admin/profile');
                    }}
                    className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-stone-50 hover:bg-stone-100 text-stone-900 font-bold text-sm min-h-[48px] text-left cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-stone-700" />
                      <span>{t('nav_profile')}</span>
                    </div>
                  </button>
                </>
              )}
            </div>

            <div className="pt-3 border-t border-stone-200">
              <span className="text-xs uppercase font-black tracking-wider text-stone-500 block mb-2">
                {t('role_label')}
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleRoleSwitch('farmer')}
                  className={`py-2.5 px-2 rounded-xl text-xs font-black min-h-[44px] cursor-pointer transition-colors ${
                    role === 'farmer'
                      ? 'bg-emerald-700 text-white'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  {t('role_farmer')}
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleSwitch('buyer')}
                  className={`py-2.5 px-2 rounded-xl text-xs font-black min-h-[44px] cursor-pointer transition-colors ${
                    role === 'buyer'
                      ? 'bg-emerald-700 text-white'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  {t('role_buyer')}
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleSwitch('admin')}
                  className={`py-2.5 px-2 rounded-xl text-xs font-black min-h-[44px] cursor-pointer transition-colors ${
                    role === 'admin'
                      ? 'bg-stone-900 text-white'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  {t('role_admin')}
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-stone-200 flex items-center justify-between">
              <span className="text-xs font-bold text-stone-600 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-emerald-700" />
                <span>{t('language_label')}</span>
              </span>
              <div className="flex items-center gap-1" data-no-translate="true">
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`px-2.5 py-1 text-xs font-black rounded-lg cursor-pointer ${
                    language === 'en' ? 'bg-emerald-700 text-white' : 'bg-stone-100 text-stone-700'
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('ta')}
                  className={`px-2.5 py-1 text-xs font-black rounded-lg cursor-pointer ${
                    language === 'ta' ? 'bg-emerald-700 text-white' : 'bg-stone-100 text-stone-700'
                  }`}
                >
                  தமிழ்
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('hi')}
                  className={`px-2.5 py-1 text-xs font-black rounded-lg cursor-pointer ${
                    language === 'hi' ? 'bg-emerald-700 text-white' : 'bg-stone-100 text-stone-700'
                  }`}
                >
                  हिन्दी
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-stone-200 flex items-center justify-between text-xs">
              <a
                href="tel:18004253276"
                className="text-emerald-700 font-bold flex items-center gap-1"
              >
                <PhoneCall className="w-4 h-4" />
                <span>1800-425-3276</span>
              </a>

              {user && (
                <button
                  type="button"
                  onClick={() => {
                    setMoreMenuOpen(false);
                    requestLogout(() => {
                      navigate('/login', { replace: true });
                    });
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-black cursor-pointer transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t('nav_logout')}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
