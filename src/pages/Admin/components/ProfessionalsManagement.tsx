import React, { useState, useEffect, useCallback, memo, useMemo } from 'react';
import { usersAPI, type UserDocument } from '@/services/api/usersAPI';
import { AuthService } from '@/services/firebase/auth';
import { Button, Modal, Icon } from '@/components/common';
import type { UserRole } from '@/types/user';
import './ProfessionalsManagement.css';

export const ProfessionalsManagement: React.FC = memo(() => {
  const [users, setUsers] = useState<UserDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserDocument | null>(null);
  const [formData, setFormData] = useState({
    role: 'worker' as UserRole,
    specialties: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [resetPasswordLoading, setResetPasswordLoading] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const allUsers = await usersAPI.getAllUsers();
      setUsers(allUsers);
    } catch (err: any) {
      setError(err.message || 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const filteredUsers = useMemo(() => {
    let filtered = [...users];

    if (filterRole === 'workers') {
      filtered = filtered.filter(u => u.role === 'worker' || u.role === 'admin');
    } else if (filterRole === 'clients') {
      filtered = filtered.filter(u => u.role === 'client');
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(u =>
        u.displayName?.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        u.specialties?.some(s => s.toLowerCase().includes(term))
      );
    }

    return filtered.filter(u => u.active !== false);
  }, [users, filterRole, searchTerm]);

  const stats = useMemo(() => {
    return {
      totalUsers: users.length,
      totalWorkers: users.filter(u => u.role === 'worker' || u.role === 'admin').length,
      activeWorkers: users.filter(u => (u.role === 'worker' || u.role === 'admin') && u.active !== false).length,
      totalClients: users.filter(u => u.role === 'client').length,
      activeUsers: users.filter(u => u.active !== false).length
    };
  }, [users]);

  const handleOpenModal = useCallback((user: UserDocument) => {
    setEditingUser(user);
    setFormData({
      role: user.role,
      specialties: user.specialties?.join(', ') || ''
    });
    setError(null);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingUser(null);
    setFormData({
      role: 'worker',
      specialties: ''
    });
    setError(null);
  }, []);

  const handleResetPassword = useCallback(async (email: string, userId: string) => {
    if (!window.confirm(`¿Estás seguro de que deseas enviar un email de recuperación de contraseña a ${email}?`)) {
      return;
    }

    try {
      setResetPasswordLoading(userId);
      await AuthService.resetPassword(email);
      alert(`Se ha enviado un email de recuperación de contraseña a ${email}`);
    } catch (err: any) {
      alert(`Error al enviar el email: ${err.message || 'Error desconocido'}`);
    } finally {
      setResetPasswordLoading(null);
    }
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setError(null);

    try {
      const specialtiesArray = formData.specialties
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      await usersAPI.updateUser(editingUser.id, {
        role: formData.role,
        specialties: specialtiesArray
      });

      await loadUsers();
      handleCloseModal();
    } catch (err: any) {
      setError(err.message || 'Error al actualizar el usuario');
    }
  }, [formData, editingUser, loadUsers, handleCloseModal]);

  if (loading) {
    return (
      <div className="professionals-loading">
        <div className="spinner"></div>
        <p>Cargando usuarios...</p>
      </div>
    );
  }

  return (
    <div className="professionals-management">
      <div className="management-header">
        <div>
          <h2 className="management-title">Gestión de Usuarios</h2>
          <p className="management-subtitle">Administra todos los usuarios registrados y sus roles</p>
        </div>
      </div>

      {error && !isModalOpen && (
        <div className="error-banner">
          <Icon name="x" size={18} />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="error-dismiss">
            <Icon name="x" size={16} />
          </button>
        </div>
      )}

      <div className="professionals-stats">
        <div className="stat-mini-card">
          <div className="stat-mini-icon" style={{ background: '#7FD3B0' }}>
            <Icon name="users" size={20} color="white" />
          </div>
          <div className="stat-mini-content">
            <span className="stat-mini-label">Total Usuarios</span>
            <span className="stat-mini-value">{stats.totalUsers}</span>
          </div>
        </div>

        <div className="stat-mini-card">
          <div className="stat-mini-icon" style={{ background: '#A8E6CF' }}>
            <Icon name="scissors" size={20} color="white" />
          </div>
          <div className="stat-mini-content">
            <span className="stat-mini-label">Trabajadores</span>
            <span className="stat-mini-value">{stats.totalWorkers}</span>
          </div>
        </div>

        <div className="stat-mini-card">
          <div className="stat-mini-icon" style={{ background: '#4ECDC4' }}>
            <Icon name="users" size={20} color="white" />
          </div>
          <div className="stat-mini-content">
            <span className="stat-mini-label">Clientes</span>
            <span className="stat-mini-value">{stats.totalClients}</span>
          </div>
        </div>

        <div className="stat-mini-card">
          <div className="stat-mini-icon" style={{ background: '#FFB347' }}>
            <Icon name="checkCircle" size={20} color="white" />
          </div>
          <div className="stat-mini-content">
            <span className="stat-mini-label">Activos</span>
            <span className="stat-mini-value">{stats.activeUsers}</span>
          </div>
        </div>
      </div>

      <div className="professionals-controls">
        <div className="search-filter-group">
          <div className="search-box">
            <input
              type="text"
              placeholder="Buscar por nombre, email o especialidad..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="category-filter">
            <label htmlFor="role-filter">Filtrar por rol</label>
            <select
              id="role-filter"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="category-select"
            >
              <option value="all">Todos los usuarios</option>
              <option value="workers">Trabajadores y Admins</option>
              <option value="clients">Clientes</option>
            </select>
          </div>
        </div>

        <div className="results-info">
          <span className="results-count">{filteredUsers.length} usuarios</span>
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="professionals-empty-state">
          <Icon name="users" size={64} color="var(--text-tertiary)" />
          <h3>No hay usuarios</h3>
          <p>No se encontraron usuarios con los filtros seleccionados</p>
        </div>
      ) : (
        <div className="professionals-grid-modern">
          {filteredUsers.map((user) => (
            <div key={user.id} className="professional-card-modern">
              <div className="professional-card-header">
                <div className="professional-avatar-modern">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || user.email} />
                  ) : (
                    <span>{(user.displayName || user.email).charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className="professional-badges">
                  <span className={`role-badge role-${user.role}`}>
                    {user.role === 'admin' ? 'Admin' : user.role === 'worker' ? 'Trabajador' : 'Cliente'}
                  </span>
                  {user.active !== false && (
                    <span className="active-badge">
                      <Icon name="check" size={12} color="white" />
                      <span>Activo</span>
                    </span>
                  )}
                </div>
              </div>

              <h3 className="professional-name-modern">{user.displayName || 'Sin nombre'}</h3>
              
              <div className="professional-info-list">
                <div className="info-item">
                  <Icon name="mail" size={14} color="var(--text-secondary)" />
                  <span>{user.email}</span>
                </div>
                {user.phone && (
                  <div className="info-item">
                    <Icon name="phone" size={14} color="var(--text-secondary)" />
                    <span>{user.phone}</span>
                  </div>
                )}
                {!user.phone && (
                  <div className="info-item">
                    <Icon name="phone" size={14} color="var(--text-tertiary)" />
                    <span style={{ color: 'var(--text-tertiary)' }}>Sin teléfono</span>
                  </div>
                )}
              </div>

              {user.specialties && user.specialties.length > 0 && (
                <div className="specialties-container">
                  {user.specialties.map((specialty, index) => (
                    <span key={index} className="specialty-tag-modern">
                      <Icon name="scissors" size={12} color="var(--accent-primary)" />
                      <span>{specialty}</span>
                    </span>
                  ))}
                </div>
              )}

              <div className="professional-card-actions">
                <button
                  onClick={() => handleOpenModal(user)}
                  className="professional-action-btn edit-btn"
                  title="Editar usuario"
                >
                  <Icon name="edit" size={16} />
                  <span>Editar</span>
                </button>
                <button
                  onClick={() => handleResetPassword(user.email, user.id)}
                  className="professional-action-btn reset-btn"
                  title="Restablecer contraseña"
                  disabled={resetPasswordLoading === user.id}
                >
                  <Icon name="mail" size={16} />
                  <span>{resetPasswordLoading === user.id ? 'Enviando...' : 'Restablecer Contraseña'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <div className="professional-form-modern">
          <div className="form-header-modern">
            <Icon name="users" size={28} color="var(--accent-primary)" />
            <h3 className="form-title-modern">
              Editar Usuario: {editingUser?.displayName || editingUser?.email}
            </h3>
          </div>

          {error && (
            <div className="error-banner">
              <Icon name="x" size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="modern-form">
            <div className="form-group-modern">
              <label htmlFor="user-role" className="input-label-modern">
                <Icon name="users" size={16} color="var(--text-tertiary)" />
                <span>Rol del Usuario</span>
              </label>
              <select
                id="user-role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                className="select-field-modern"
                required
              >
                <option value="client">Cliente</option>
                <option value="worker">Trabajador</option>
                <option value="admin">Administrador</option>
              </select>
              <span className="input-help-text">
                Los trabajadores y administradores tendrán acceso al panel de administración
              </span>
            </div>

            {(formData.role === 'worker' || formData.role === 'admin') && (
              <div className="form-group-modern">
                <label htmlFor="user-specialties" className="input-label-modern">
                  <Icon name="scissors" size={16} color="var(--text-tertiary)" />
                  <span>Especialidades (separadas por comas)</span>
                </label>
                <textarea
                  id="user-specialties"
                  value={formData.specialties}
                  onChange={(e) => setFormData({ ...formData, specialties: e.target.value })}
                  placeholder="Ej: Cortes Modernos, Barba Clásica, Afeitado Premium, Color"
                  className="textarea-field-modern"
                  rows={4}
                />
                <span className="input-help-text">
                  Lista las especialidades del profesional separadas por comas
                </span>
              </div>
            )}

            <div className="form-actions-modern">
              <Button type="button" variant="outline" onClick={handleCloseModal}>
                Cancelar
              </Button>
              <Button type="submit">
                <Icon name="check" size={18} color="currentColor" />
                <span>Actualizar</span>
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
});

ProfessionalsManagement.displayName = 'ProfessionalsManagement';
