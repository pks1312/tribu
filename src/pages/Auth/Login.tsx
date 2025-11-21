import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button, Input } from '@/components/common';
import './Login.css';

export const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
    phone: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isLogin) {
      try {
        setLoading(true);
        await signIn(formData.email, formData.password);
        navigate('/');
      } catch (err: any) {
        setError(err.message || 'Error al iniciar sesión');
      } finally {
        setLoading(false);
      }
    } else {
      // Validaciones para registro
      if (formData.password !== formData.confirmPassword) {
        setError('Las contraseñas no coinciden');
        return;
      }

      if (formData.password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres');
        return;
      }

      if (!formData.displayName.trim()) {
        setError('Por favor, ingresa tu nombre');
        return;
      }

      if (!formData.phone.trim()) {
        setError('Por favor, ingresa tu número de teléfono');
        return;
      }

      try {
        setLoading(true);
        // TODO: Implementar registro con el backend Django
        await signIn(formData.email, formData.password);
        navigate('/');
      } catch (err: any) {
        setError(err.message || 'Error al crear la cuenta. Por favor, intenta nuevamente.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleResetPassword = async () => {
    if (!formData.email) {
      setError('Por favor, ingresa tu email');
      return;
    }

    try {
      setLoading(true);
      // TODO: Implementar recuperación de contraseña con el backend Django
      alert('Funcionalidad de recuperación de contraseña en desarrollo');
    } catch (err: any) {
      setError(err.message || 'Error al enviar el email de recuperación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <Link to="/" className="login-logo">
            <span className="login-logo-text">La Tribu</span>
            <span className="login-logo-subtitle">Salón y Barbería</span>
          </Link>
        </div>

        <div className="login-content">
          <h1 className="login-title">
            {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </h1>
          <p className="login-subtitle">
            {isLogin 
              ? 'Ingresa a tu cuenta para continuar' 
              : 'Crea una cuenta para reservar citas y dejar comentarios'}
          </p>

          <form className="login-form" onSubmit={handleSubmit}>
            {error && (
              <div className="login-error">
                {error}
              </div>
            )}

            {!isLogin && (
              <>
                <div className="form-group">
                  <label htmlFor="displayName">Nombre Completo</label>
                  <Input
                    id="displayName"
                    type="text"
                    value={formData.displayName}
                    onChange={(value) => setFormData({ ...formData, displayName: value })}
                    placeholder="Tu nombre completo"
                    required={!isLogin}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Teléfono</label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(value) => setFormData({ ...formData, phone: value })}
                    placeholder="+56 9 1234 5678"
                    required={!isLogin}
                  />
                </div>
              </>
            )}

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(value) => setFormData({ ...formData, email: value })}
                placeholder="tu@email.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(value) => setFormData({ ...formData, password: value })}
                placeholder="••••••••"
                required
              />
            </div>

            {!isLogin && (
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirmar Contraseña</label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(value) => setFormData({ ...formData, confirmPassword: value })}
                  placeholder="••••••••"
                  required={!isLogin}
                />
              </div>
            )}

            {isLogin && (
              <div className="login-forgot">
                <button
                  type="button"
                  className="forgot-link"
                  onClick={handleResetPassword}
                  disabled={loading}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            )}

            <Button
              type="submit"
              fullWidth
              disabled={loading}
            >
              {loading 
                ? (isLogin ? 'Iniciando sesión...' : 'Creando cuenta...')
                : (isLogin ? 'Iniciar Sesión' : 'Crear Cuenta')
              }
            </Button>
          </form>

          <div className="login-switch">
            <p>
              {isLogin ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
              <button
                type="button"
                className="switch-link"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError(null);
                  setFormData({
                    email: '',
                    password: '',
                    displayName: '',
                    phone: '',
                    confirmPassword: ''
                  });
                }}
              >
                {isLogin ? 'Regístrate' : 'Inicia sesión'}
              </button>
            </p>
          </div>

          <div className="login-back">
            <Link to="/" className="back-link">
              ← Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
