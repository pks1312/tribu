import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Header } from '@/components/layout';
import { Footer } from '@/components/layout';

const Home = lazy(() => import('@/pages/Home').then(module => ({ default: module.Home })));
const ServicesPage = lazy(() => import('@/pages/Services').then(module => ({ default: module.ServicesPage })));
const Booking = lazy(() => import('@/pages/Booking').then(module => ({ default: module.Booking })));
const Login = lazy(() => import('@/pages/Auth').then(module => ({ default: module.Login })));
const Dashboard = lazy(() => import('@/pages/Admin').then(module => ({ default: module.Dashboard })));

const LoadingFallback = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    minHeight: '50vh',
    fontSize: '18px',
    color: 'var(--text-secondary)'
  }}>
    Cargando...
  </div>
);

const AppContent: React.FC = () => {
  const location = useLocation();
  const isBookingPage = location.pathname === '/booking';
  const isAdminPage = location.pathname.startsWith('/admin');
  const isLoginPage = location.pathname === '/login';

  return (
    <>
      {!isAdminPage && !isLoginPage && <Header />}
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<Dashboard />} />
        </Routes>
      </Suspense>
      {!isBookingPage && !isAdminPage && !isLoginPage && <Footer />}
    </>
  );
};

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};
