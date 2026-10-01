import React from 'react';
import { useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { RoleSidebar } from './RoleSidebar';
import { MobileBottomNav } from './MobileBottomNav';

export const RoleLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated, user } = useApp();
  const isRoleRoute =
    location.pathname.startsWith('/farmer') ||
    location.pathname.startsWith('/buyer') ||
    location.pathname.startsWith('/admin');

  if (!isRoleRoute || !isAuthenticated || !user) {
    return <main className="flex-1 w-full">{children}</main>;
  }

  return (
    <div className="flex-1 w-full flex flex-col min-h-0">
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <RoleSidebar />
        <main className="flex-1 w-full min-w-0 pb-24 md:pb-8 overflow-x-hidden">
          {children}
        </main>
      </div>
      <MobileBottomNav />
    </div>
  );
};
