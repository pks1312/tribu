import React, { useState, useCallback, memo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeToggle } from '@/components/common';
import './Header.css';

export const Header: React.FC = memo(() => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, userProfile, signOut, isAdmin, isWorker } = useAuth();

  const isBookingPage = location.pathname === '/booking';
  const isAdminRoute = location.pathname.startsWith('/admin');

  const toggleMenu = useCallback(() => {
    setIsMenuOpen(prev => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  const handleSignOut = useCallback(async () => {
    await signOut();
    navigate('/');
    closeMenu();
  }, [signOut, navigate, closeMenu]);

  const displayName = userProfile?.displayName || user?.displayName || user?.email?.split('@')[0] || 'Usuario';

  return (
    <header className={`header ${isBookingPage ? 'header-booking' : ''}`}>
      <div className="header-container">
        <Link to="/" className="header-logo" onClick={closeMenu}>
          <div className="logo-text-wrapper">
            <span className="logo-text">La Tribu</span>
            <span className="logo-subtitle">Salón y Barbería</span>
          </div>
        </Link>

        <nav className={`header-nav ${isMenuOpen ? 'nav-open' : ''}`}>
          <span className="nav-separator">|</span>
          <Link to="/" className="nav-link" onClick={closeMenu}>
            Inicio
          </Link>
          <span className="nav-separator">|</span>
          <Link to="/services" className="nav-link" onClick={closeMenu}>
            Servicios
          </Link>
          <span className="nav-separator">|</span>
          <Link to="/#galeria" className="nav-link" onClick={closeMenu}>
            Galería
          </Link>
          <span className="nav-separator">|</span>
          <Link to="/booking" className="nav-link nav-cta" onClick={closeMenu}>
            Reservar Cita
          </Link>
          {user ? (
            <>
              <span className="nav-separator">|</span>
              <div className="header-user">
                <span className="user-name">{displayName}</span>
                {(isAdmin || isWorker) && (
                  <span className="user-role">
                    {isAdmin ? 'Admin' : 'Trabajador'}
                  </span>
                )}
              </div>
              {(isAdmin || isWorker) && isAdminRoute && (
                <>
                  <span className="nav-separator">|</span>
                  <Link to="/admin" className="nav-link nav-admin" onClick={closeMenu}>
                    Panel Admin
                  </Link>
                </>
              )}
              <span className="nav-separator">|</span>
              <button
                className="nav-link nav-logout"
                onClick={handleSignOut}
              >
                Cerrar Sesión
              </button>
            </>
          ) : (
            <>
              <span className="nav-separator">|</span>
              <Link to="/login" className="nav-link nav-login" onClick={closeMenu}>
                Iniciar Sesión
              </Link>
            </>
          )}
          <ThemeToggle />
        </nav>

        <button
          className="header-menu-toggle"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span className={`menu-icon ${isMenuOpen ? 'menu-open' : ''}`}></span>
        </button>
      </div>
    </header>
  );
});

Header.displayName = 'Header';
