import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Navigation } from './components/common/Navigation';
import { RoleLayout } from './components/common/RoleLayout';
import { Footer } from './components/common/Footer';
import { ToastContainer } from './components/common/Toast';
import { ConfirmationModal } from './components/common/ConfirmationModal';
import { ProtectedRoute } from './components/common/ProtectedRoute';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { AboutPage } from './pages/public/AboutPage';
import { HowItWorksPage } from './pages/public/HowItWorksPage';
import { LoginPage } from './pages/public/LoginPage';
import { SihDemoPage } from './pages/public/SihDemoPage';

// Common Role Page
import { ProfilePage } from './pages/common/ProfilePage';

// Farmer Pages
import { FarmerDashboard } from './pages/farmer/FarmerDashboard';
import { FarmDecisionPage } from './pages/farmer/FarmDecisionPage';
import { AddProducePage } from './pages/farmer/AddProducePage';
import { FarmerListingsPage } from './pages/farmer/FarmerListingsPage';
import { MarketPricesPage } from './pages/farmer/MarketPricesPage';
import { FarmerBidsPage } from './pages/farmer/FarmerBidsPage';
import { FarmerSalesPage } from './pages/farmer/FarmerSalesPage';

// Buyer Pages
import { BuyerDashboard } from './pages/buyer/BuyerDashboard';
import { BuyerMarketPage } from './pages/buyer/BuyerMarketPage';
import { BuyerBidsPage } from './pages/buyer/BuyerBidsPage';
import { BuyerPurchasesPage } from './pages/buyer/BuyerPurchasesPage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminFarmersPage } from './pages/admin/AdminFarmersPage';
import { AdminBuyersPage } from './pages/admin/AdminBuyersPage';
import { AdminListingsPage } from './pages/admin/AdminListingsPage';
import { AdminBidsPage } from './pages/admin/AdminBidsPage';
import { AdminTransactionsPage } from './pages/admin/AdminTransactionsPage';
import { AdminMarketDataPage } from './pages/admin/AdminMarketDataPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col font-sans selection:bg-emerald-200 selection:text-emerald-950">
          <Navigation />

          <RoleLayout>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/sih-demo" element={<SihDemoPage />} />
              <Route path="/demo" element={<SihDemoPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/how-it-works" element={<HowItWorksPage />} />
              <Route path="/login" element={<LoginPage />} />

              {/* Farmer Routes - Protected with RBAC */}
              <Route
                path="/farmer/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['farmer', 'admin']}>
                    <FarmerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/farmer/decision"
                element={
                  <ProtectedRoute allowedRoles={['farmer', 'admin']}>
                    <FarmDecisionPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/farmer/add-produce"
                element={
                  <ProtectedRoute allowedRoles={['farmer', 'admin']}>
                    <AddProducePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/farmer/listings"
                element={
                  <ProtectedRoute allowedRoles={['farmer', 'admin']}>
                    <FarmerListingsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/farmer/market-prices"
                element={
                  <ProtectedRoute allowedRoles={['farmer', 'buyer', 'admin']}>
                    <MarketPricesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/farmer/bids"
                element={
                  <ProtectedRoute allowedRoles={['farmer', 'admin']}>
                    <FarmerBidsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/farmer/sales"
                element={
                  <ProtectedRoute allowedRoles={['farmer', 'admin']}>
                    <FarmerSalesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/farmer/profile"
                element={
                  <ProtectedRoute allowedRoles={['farmer', 'admin']}>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />

              {/* Buyer Routes - Protected with RBAC */}
              <Route
                path="/buyer/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['buyer', 'admin']}>
                    <BuyerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/buyer/market"
                element={
                  <ProtectedRoute allowedRoles={['buyer', 'admin']}>
                    <BuyerMarketPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/buyer/my-bids"
                element={
                  <ProtectedRoute allowedRoles={['buyer', 'admin']}>
                    <BuyerBidsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/buyer/purchases"
                element={
                  <ProtectedRoute allowedRoles={['buyer', 'admin']}>
                    <BuyerPurchasesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/buyer/profile"
                element={
                  <ProtectedRoute allowedRoles={['buyer', 'admin']}>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes - Protected with Admin Role */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/farmers"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminFarmersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/buyers"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminBuyersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/listings"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminListingsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/bids"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminBidsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/transactions"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminTransactionsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/market-data"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminMarketDataPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/settings"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminSettingsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/profile"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </RoleLayout>

          <Footer />
          <ConfirmationModal />
          <ToastContainer />
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}
