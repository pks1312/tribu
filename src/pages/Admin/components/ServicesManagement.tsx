import React, { useState, useEffect, useCallback, memo, useMemo } from 'react';
import { servicesAPI, type ServiceDocument } from '@/services/api/servicesAPI';
import { Button, Input, Modal, Icon } from '@/components/common';
import { formatCurrency } from '@/utils/helpers';
import './ServicesManagement.css';

const SERVICE_CATEGORIES = [
  'PELUQUERIA',
  'BARBERIA',
  'SERVICIO DE COLOR',
  'SERVICIO DE COLOR HOMBRES',
  'TRIBU PACK',
  'TRATAMIENTOS CAPILARES'
];

export const ServicesManagement: React.FC = memo(() => {
  const [services, setServices] = useState<ServiceDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceDocument | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
    category: SERVICE_CATEGORIES[0]
  });
  const [error, setError] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const loadServices = useCallback(async () => {
    try {
      setLoading(true);
      const allServices = await servicesAPI.getServices();
      setServices(allServices);
    } catch (err: any) {
      setError(err.message || 'Error al cargar servicios');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  const filteredServices = useMemo(() => {
    let filtered = [...services];

    if (filterCategory !== 'all') {
      filtered = filtered.filter(s => s.category === filterCategory);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(term) ||
        s.description?.toLowerCase().includes(term) ||
        s.category.toLowerCase().includes(term)
      );
    }

    return filtered.sort((a, b) => {
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category);
      }
      return a.name.localeCompare(b.name);
    });
  }, [services, filterCategory, searchTerm]);

  const stats = useMemo(() => {
    return {
      total: services.length,
      byCategory: SERVICE_CATEGORIES.map(cat => ({
        category: cat,
        count: services.filter(s => s.category === cat).length
      }))
    };
  }, [services]);

  const handleOpenModal = useCallback((service?: ServiceDocument) => {
    if (service) {
      setEditingService(service);
      setFormData({
        name: service.name,
        description: service.description || '',
        price: service.price.toString(),
        duration: service.duration.toString(),
        category: service.category
      });
    } else {
      setEditingService(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        duration: '',
        category: SERVICE_CATEGORIES[0]
      });
    }
    setError(null);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingService(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      duration: '',
      category: SERVICE_CATEGORIES[0]
    });
    setError(null);
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError('El nombre es requerido');
      return;
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      setError('El precio debe ser mayor a 0');
      return;
    }

    if (!formData.duration || parseInt(formData.duration) <= 0) {
      setError('La duración debe ser mayor a 0');
      return;
    }

    try {
      if (editingService) {
        await servicesAPI.updateService(editingService.id!, {
          name: formData.name.trim(),
          description: formData.description.trim(),
          price: parseFloat(formData.price),
          duration: parseInt(formData.duration),
          category: formData.category
        });
      } else {
        await servicesAPI.createService({
          name: formData.name.trim(),
          description: formData.description.trim(),
          price: parseFloat(formData.price),
          duration: parseInt(formData.duration),
          category: formData.category
        });
      }
      await loadServices();
      handleCloseModal();
    } catch (err: any) {
      setError(err.message || 'Error al guardar el servicio');
    }
  }, [formData, editingService, loadServices, handleCloseModal]);

  const handleDelete = useCallback(async (serviceId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este servicio?')) {
      return;
    }

    try {
      await servicesAPI.deleteService(serviceId);
      await loadServices();
    } catch (err: any) {
      setError(err.message || 'Error al eliminar el servicio');
    }
  }, [loadServices]);

  if (loading) {
    return (
      <div className="services-loading">
        <div className="spinner"></div>
        <p>Cargando servicios...</p>
      </div>
    );
  }

  return (
    <div className="services-management">
      <div className="management-header">
        <div>
          <h2 className="management-title">Gestión de Servicios</h2>
          <p className="management-subtitle">Administra los servicios disponibles en la barbería</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Icon name="plus" size={18} color="currentColor" />
          <span>Agregar Servicio</span>
        </Button>
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

      <div className="services-stats-grid">
        <div className="stat-mini-card">
          <div className="stat-mini-icon" style={{ background: '#7FD3B0' }}>
            <Icon name="scissors" size={20} color="white" />
          </div>
          <div className="stat-mini-content">
            <span className="stat-mini-label">Total Servicios</span>
            <span className="stat-mini-value">{stats.total}</span>
          </div>
        </div>

        {stats.byCategory.filter(c => c.count > 0).slice(0, 3).map((cat, index) => (
          <div key={cat.category} className="stat-mini-card">
            <div className="stat-mini-icon" style={{ background: ['#A8E6CF', '#4ECDC4', '#ff9500'][index] || '#7FD3B0' }}>
              <Icon name="tag" size={20} color="white" />
            </div>
            <div className="stat-mini-content">
              <span className="stat-mini-label">{cat.category}</span>
              <span className="stat-mini-value">{cat.count}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="services-controls">
        <div className="search-filter-group">
          <div className="search-box">
            <input
              type="text"
              placeholder="Buscar servicios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="category-filter">
            <label htmlFor="category-filter">Categoría</label>
            <select
              id="category-filter"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="category-select"
            >
              <option value="all">Todas las categorías</option>
              {SERVICE_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="results-info">
          <span className="results-count">{filteredServices.length} servicios</span>
        </div>
      </div>

      {filteredServices.length === 0 ? (
        <div className="services-empty-state">
          <Icon name="scissors" size={64} color="var(--text-tertiary)" />
          <h3>No hay servicios</h3>
          <p>No se encontraron servicios con los filtros seleccionados</p>
        </div>
      ) : (
        <div className="services-grid-modern">
          {filteredServices.map((service) => (
            <div key={service.id} className="service-card-modern">
              <div className="service-card-header">
                <div className="service-icon-badge">
                  <Icon name="scissors" size={20} color="var(--accent-primary)" />
                </div>
                <span className="service-category-badge">{service.category}</span>
              </div>

              <h3 className="service-card-title">{service.name}</h3>

              {service.description && (
                <p className="service-card-description">{service.description}</p>
              )}

              <div className="service-card-details">
                <div className="service-detail-item">
                  <Icon name="dollarSign" size={16} color="var(--text-tertiary)" />
                  <span className="service-price">{formatCurrency(service.price)}</span>
                </div>
                <div className="service-detail-item">
                  <Icon name="clock" size={16} color="var(--text-tertiary)" />
                  <span className="service-duration">{service.duration} min</span>
                </div>
              </div>

              <div className="service-card-actions">
                <button
                  onClick={() => handleOpenModal(service)}
                  className="service-action-btn edit-btn"
                  title="Editar servicio"
                >
                  <Icon name="edit" size={16} />
                  <span>Editar</span>
                </button>
                <button
                  onClick={() => handleDelete(service.id!)}
                  className="service-action-btn delete-btn"
                  title="Eliminar servicio"
                >
                  <Icon name="trash" size={16} />
                  <span>Eliminar</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <div className="service-form-modern">
          <div className="form-header-modern">
            <Icon name="scissors" size={28} color="var(--accent-primary)" />
            <h3 className="form-title-modern">
              {editingService ? 'Editar Servicio' : 'Nuevo Servicio'}
            </h3>
          </div>

          {error && (
            <div className="error-banner">
              <Icon name="x" size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="modern-form">
            <Input
              id="service-name"
              label="Nombre del Servicio"
              value={formData.name}
              onChange={(value) => setFormData({ ...formData, name: value })}
              placeholder="Ej: Corte de Cabello Clásico"
              required
            />

            <div className="form-group-modern">
              <label htmlFor="service-description" className="input-label-modern">
                Descripción
              </label>
              <textarea
                id="service-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe el servicio en detalle..."
                className="textarea-field-modern"
                rows={4}
              />
            </div>

            <div className="form-row-modern">
              <div className="form-group-modern">
                <label htmlFor="service-price" className="input-label-modern">
                  Precio (CLP)
                </label>
                <div className="input-with-icon">
                  <Icon name="dollarSign" size={18} color="var(--text-tertiary)" />
                  <input
                    type="number"
                    id="service-price"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="15000"
                    className="input-field-modern"
                    required
                    min="0"
                    step="1000"
                  />
                </div>
              </div>

              <div className="form-group-modern">
                <label htmlFor="service-duration" className="input-label-modern">
                  Duración (minutos)
                </label>
                <div className="input-with-icon">
                  <Icon name="clock" size={18} color="var(--text-tertiary)" />
                  <input
                    type="number"
                    id="service-duration"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="30"
                    className="input-field-modern"
                    required
                    min="1"
                  />
                </div>
              </div>
            </div>

            <div className="form-group-modern">
              <label htmlFor="service-category" className="input-label-modern">
                Categoría
              </label>
              <div className="input-with-icon">
                <Icon name="tag" size={18} color="var(--text-tertiary)" />
                <select
                  id="service-category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="select-field-modern"
                  required
                >
                  {SERVICE_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-actions-modern">
              <Button type="button" variant="outline" onClick={handleCloseModal}>
                Cancelar
              </Button>
              <Button type="submit">
                <Icon name="check" size={18} color="currentColor" />
                <span>{editingService ? 'Actualizar' : 'Crear'}</span>
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
});

ServicesManagement.displayName = 'ServicesManagement';
