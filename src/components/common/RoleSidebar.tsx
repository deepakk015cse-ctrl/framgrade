import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  PlusCircle,
  TrendingUp,
  Package,
  Clock,
  Receipt,
  User,
  ShoppingBag,
  PackageCheck,
  Users,
  Building2,
  Layers,
  Tag,
  DollarSign,
  Settings,
  PhoneCall,
  LogOut,
  Compass
} from 'lucide-react';

interface RoleNavItem {
  label: string;
  path: string;
  icon: any;
  badge?: number;
  badgeHighlight?: boolean;
}

export const RoleSidebar: React.FC = () => {
  const { role, listings, bids, sales, requestLogout, t } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  const pendingBidsCount = bids.filter((b) => b.status === 'pending').length;
  const activeListingsCount = listings.filter((l) => l.status === 'active' || l.status === 'negotiating').length;

  const farmerNavItems: RoleNavItem[] = [
    { label: t('nav_home'), path: '/farmer/dashboard', icon: LayoutDashboard },
    { label: t('nav_farm_decision'), path: '/farmer/decision', icon: Compass },
    { label: t('nav_add_produce'), path: '/farmer/add-produce', icon: PlusCircle },
    { label: t('nav_market_prices'), path: '/farmer/market-prices', icon: TrendingUp },
    { label: t('nav_my_listings'), path: '/farmer/listings', icon: Package, badge: activeListingsCount },
    { label: t('nav_buyer_offers'), path: '/farmer/bids', icon: Tag, badge: pendingBidsCount, badgeHighlight: pendingBidsCount > 0 },
    { label: t('nav_my_sales'), path: '/farmer/sales', icon: Receipt },
    { label: t('nav_profile'), path: '/farmer/profile', icon: User },
  ];

  const buyerNavItems: RoleNavItem[] = [
    { label: t('nav_home'), path: '/buyer/dashboard', icon: LayoutDashboard },
    { label: t('nav_find_produce'), path: '/buyer/market', icon: ShoppingBag },
    { label: t('nav_my_bids'), path: '/buyer/my-bids', icon: Clock, badge: pendingBidsCount },
    { label: t('nav_purchases'), path: '/buyer/purchases', icon: PackageCheck, badge: sales.length },
    { label: t('nav_profile'), path: '/buyer/profile', icon: User },
  ];

  const adminNavItems: RoleNavItem[] = [
    { label: t('nav_dashboard'), path: '/admin/dashboard', icon: LayoutDashboard },
    { label: t('nav_farmers'), path: '/admin/farmers', icon: Users },
    { label: t('nav_buyers'), path: '/admin/buyers', icon: Building2 },
    { label: t('nav_listings'), path: '/admin/listings', icon: Layers, badge: listings.length },
    { label: t('nav_bids'), path: '/admin/bids', icon: Tag, badge: bids.length },
    { label: t('nav_transactions'), path: '/admin/transactions', icon: DollarSign },
    { label: t('nav_market_prices'), path: '/admin/market-data', icon: TrendingUp },
    { label: t('nav_reports'), path: '/admin/settings', icon: Settings },
    { label: t('nav_profile'), path: '/admin/profile', icon: User },
  ];

  const navItems =
    role === 'farmer'
      ? farmerNavItems
      : role === 'buyer'
      ? buyerNavItems
      : adminNavItems;

  const roleTitle =
    role === 'farmer'
      ? t('role_farmer')
      : role === 'buyer'
      ? t('role_buyer')
      : t('role_admin');

  return (
    <aside className="hidden md:flex flex-col w-56 lg:w-64 shrink-0 bg-white border-r border-stone-200 py-6 px-3 lg:px-4 space-y-6 self-stretch min-h-[calc(100vh-110px)]">
      {/* Role Header */}
      <div className="px-3 py-2 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between">
        <span className="text-sm font-black text-stone-900">{roleTitle}</span>
        <span
          className={`w-2 h-2 rounded-full ${
            role === 'admin' ? 'bg-stone-900' : 'bg-emerald-600'
          }`}
        />
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-extrabold transition-all group ${
                isActive
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-stone-700 hover:bg-stone-100 hover:text-stone-950'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon
                  className={`w-5 h-5 shrink-0 ${
                    isActive ? 'text-white' : 'text-stone-500 group-hover:text-emerald-700'
                  }`}
                />
                <span className="leading-snug">{item.label}</span>
              </div>

              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ${
                    isActive
                      ? 'bg-white text-emerald-900'
                      : item.badgeHighlight
                      ? 'bg-amber-400 text-stone-950'
                      : 'bg-stone-200 text-stone-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}

        <div className="pt-2 mt-2 border-t border-stone-200">
          <button
            type="button"
            onClick={() =>
              requestLogout(() => {
                navigate('/login', { replace: true });
              })
            }
            className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-extrabold text-rose-700 hover:bg-rose-50 transition-all cursor-pointer text-left"
          >
            <LogOut className="w-5 h-5 shrink-0 text-rose-600" />
            <span>{t('nav_logout')}</span>
          </button>
        </div>
      </nav>

      {/* Helpline Support */}
      <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs space-y-1">
        <div className="flex items-center gap-2 text-stone-900 font-bold">
          <PhoneCall className="w-4 h-4 text-emerald-700" />
          <span>{t('helpline_short')}</span>
        </div>
        <a href="tel:18004253276" className="text-stone-600 font-medium block hover:underline">
          1800-425-3276
        </a>
      </div>
    </aside>
  );
};
