import React, { useState, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeToggle } from '@/components/common';
import { Statistics } from './components/Statistics';
import { ServicesManagement } from './components/ServicesManagement';
import { ProfessionalsManagement } from './components/ProfessionalsManagement';
import { GalleryManagement } from './components/GalleryManagement';
import { BookingsManagement } from './components/BookingsManagement';
import { TestimonialsManagement } from './components/TestimonialsManagement';
import { MySchedule } from './components/MySchedule';
import './Dashboard.css';

type AdminSection = 'dashboard' | 'services' | 'professionals' | 'gallery' | 'bookings' | 'testimonials' | 'schedule';

export const Dashboard: React.FC = memo(() => {
  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard');
  const { isAdmin, isWorker, userProfile } = useAuth();
  const navigate = useNavigate();

  const handleSectionChange = useCallback((section: AdminSection) => {
    setActiveSection(section);
  }, []);

  if (!isAdmin && !isWorker) {
    return (
      <div className="admin-access-denied">
        <div className="access-denied-content">
          <h1>Acceso Denegado</h1>
          <p>No tienes permisos para acceder al panel de administración.</p>
          <button onClick={() => navigate('/')} className="btn-primary">
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-sidebar">
        <div className="admin-header">
          <div className="admin-header-content">
            <div>
              <h1 className="admin-title">Panel de Administración</h1>
              <p className="admin-subtitle">
                {isAdmin ? 'Administrador' : 'Trabajador'}: {userProfile?.displayName || userProfile?.email}
              </p>
            </div>
            <div className="admin-theme-toggle">
              <ThemeToggle />
            </div>
          </div>
        </div>

        <nav className="admin-nav">
          <button
            className={`admin-nav-item ${activeSection === 'dashboard' ? 'active' : ''}`}
            onClick={() => handleSectionChange('dashboard')}
          >
            <span>Dashboard</span>
          </button>

          {(isAdmin || isWorker) && (
            <>
              <button
                className={`admin-nav-item ${activeSection === 'schedule' ? 'active' : ''}`}
                onClick={() => handleSectionChange('schedule')}
              >
                <span>Mi Agenda</span>
              </button>

              <button
                className={`admin-nav-item ${activeSection === 'bookings' ? 'active' : ''}`}
                onClick={() => handleSectionChange('bookings')}
              >
                <span>Reservas</span>
              </button>
            </>
          )}

          {isAdmin && (
            <>
              <button
                className={`admin-nav-item ${activeSection === 'services' ? 'active' : ''}`}
                onClick={() => handleSectionChange('services')}
              >
                <span>Servicios</span>
              </button>

              <button
                className={`admin-nav-item ${activeSection === 'professionals' ? 'active' : ''}`}
                onClick={() => handleSectionChange('professionals')}
              >
                <span>Usuarios</span>
              </button>

              <button
                className={`admin-nav-item ${activeSection === 'gallery' ? 'active' : ''}`}
                onClick={() => handleSectionChange('gallery')}
              >
                <span>Galería</span>
              </button>

              <button
                className={`admin-nav-item ${activeSection === 'testimonials' ? 'active' : ''}`}
                onClick={() => handleSectionChange('testimonials')}
              >
                <span>Comentarios</span>
              </button>
            </>
          )}
        </nav>

        <div className="admin-footer">
          <button onClick={() => navigate('/')} className="btn-outline">
            Volver al Sitio
          </button>
        </div>
      </div>

      <div className="admin-content">
        {activeSection === 'dashboard' && <Statistics />}
        {activeSection === 'schedule' && (isAdmin || isWorker) && <MySchedule />}
        {activeSection === 'bookings' && (isAdmin || isWorker) && <BookingsManagement />}
        {activeSection === 'services' && isAdmin && <ServicesManagement />}
        {activeSection === 'professionals' && isAdmin && <ProfessionalsManagement />}
        {activeSection === 'gallery' && isAdmin && <GalleryManagement />}
        {activeSection === 'testimonials' && isAdmin && <TestimonialsManagement />}
      </div>
    </div>
  );
});

Dashboard.displayName = 'Dashboard';

