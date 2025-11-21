import React, { useState, useEffect, useCallback, memo, useMemo } from 'react';
import { testimonialsAPI, type TestimonialDocument } from '@/services/api/testimonialsAPI';
import { Icon } from '@/components/common';
import { formatDate } from '@/utils/helpers';
import './TestimonialsManagement.css';

export const TestimonialsManagement: React.FC = memo(() => {
  const [testimonials, setTestimonials] = useState<TestimonialDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('pending');
  const [processing, setProcessing] = useState<string | null>(null);

  const loadTestimonials = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const allTestimonials = await testimonialsAPI.getTestimonials(false);
      setTestimonials(allTestimonials);
    } catch (err: any) {
      setError(err.message || 'Error al cargar comentarios');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTestimonials();
  }, [loadTestimonials]);

  const filteredTestimonials = useMemo(() => {
    let filtered = [...testimonials];

    if (filterStatus === 'pending') {
      filtered = filtered.filter(t => !t.approved);
    } else if (filterStatus === 'approved') {
      filtered = filtered.filter(t => t.approved);
    }

    return filtered.sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 
                   a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0;
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 
                   b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0;
      return dateB - dateA;
    });
  }, [testimonials, filterStatus]);

  const stats = useMemo(() => {
    return {
      total: testimonials.length,
      pending: testimonials.filter(t => !t.approved).length,
      approved: testimonials.filter(t => t.approved).length
    };
  }, [testimonials]);

  const handleApprove = useCallback(async (testimonialId: string) => {
    try {
      setProcessing(testimonialId);
      setError(null);
      await testimonialsAPI.approveTestimonial(testimonialId);
      await loadTestimonials();
    } catch (err: any) {
      setError(err.message || 'Error al aprobar el comentario');
    } finally {
      setProcessing(null);
    }
  }, [loadTestimonials]);

  const handleReject = useCallback(async (testimonialId: string) => {
    if (!confirm('¿Estás seguro de que deseas rechazar este comentario? Será eliminado permanentemente.')) {
      return;
    }

    try {
      setProcessing(testimonialId);
      setError(null);
      await testimonialsAPI.deleteTestimonial(testimonialId);
      await loadTestimonials();
    } catch (err: any) {
      setError(err.message || 'Error al rechazar el comentario');
    } finally {
      setProcessing(null);
    }
  }, [loadTestimonials]);

  const renderStars = (rating: number) => {
    return (
      <div className="rating-stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className={star <= rating ? 'star-filled' : 'star-empty'}>
            ★
          </span>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="testimonials-loading">
        <div className="spinner"></div>
        <p>Cargando comentarios...</p>
      </div>
    );
  }

  return (
    <div className="testimonials-management">
      <div className="management-header">
        <div>
          <h2 className="management-title">Gestión de Comentarios</h2>
          <p className="management-subtitle">Revisa y aprueba los comentarios de clientes</p>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <Icon name="x" size={18} />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="error-dismiss">
            <Icon name="x" size={16} />
          </button>
        </div>
      )}

      <div className="testimonials-stats">
        <div className="stat-mini-card">
          <div className="stat-mini-icon" style={{ background: '#7FD3B0' }}>
            <Icon name="users" size={20} color="white" />
          </div>
          <div className="stat-mini-content">
            <span className="stat-mini-label">Total Comentarios</span>
            <span className="stat-mini-value">{stats.total}</span>
          </div>
        </div>

        <div className="stat-mini-card">
          <div className="stat-mini-icon" style={{ background: '#ff9500' }}>
            <Icon name="clock" size={20} color="white" />
          </div>
          <div className="stat-mini-content">
            <span className="stat-mini-label">Pendientes</span>
            <span className="stat-mini-value">{stats.pending}</span>
          </div>
        </div>

        <div className="stat-mini-card">
          <div className="stat-mini-icon" style={{ background: '#A8E6CF' }}>
            <Icon name="check" size={20} color="white" />
          </div>
          <div className="stat-mini-content">
            <span className="stat-mini-label">Aprobados</span>
            <span className="stat-mini-value">{stats.approved}</span>
          </div>
        </div>
      </div>

      <div className="testimonials-controls">
        <div className="filter-group">
          <label htmlFor="status-filter">Filtrar por estado</label>
          <select
            id="status-filter"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">Todos</option>
            <option value="pending">Pendientes de Aprobación</option>
            <option value="approved">Aprobados</option>
          </select>
        </div>

        <div className="results-info">
          <span className="results-count">{filteredTestimonials.length} comentarios</span>
        </div>
      </div>

      {filteredTestimonials.length === 0 ? (
        <div className="testimonials-empty-state">
          <Icon name="users" size={64} color="var(--text-tertiary)" />
          <h3>No hay comentarios</h3>
          <p>No se encontraron comentarios con los filtros seleccionados</p>
        </div>
      ) : (
        <div className="testimonials-grid">
          {filteredTestimonials.map((testimonial) => (
            <div key={testimonial.id} className="testimonial-card-modern">
              <div className="testimonial-header">
                <div className="testimonial-user-info">
                  <div className="user-avatar">
                    {testimonial.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="testimonial-name">{testimonial.name}</h3>
                    <p className="testimonial-email">{testimonial.userEmail}</p>
                  </div>
                </div>
                <div className="testimonial-status">
                  {testimonial.approved ? (
                    <span className="status-badge-approved">
                      <Icon name="check" size={14} color="white" />
                      <span>Aprobado</span>
                    </span>
                  ) : (
                    <span className="status-badge-pending">
                      <Icon name="clock" size={14} color="white" />
                      <span>Pendiente</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="testimonial-rating">
                {renderStars(testimonial.rating)}
                <span className="rating-value">{testimonial.rating}/5</span>
              </div>

              <p className="testimonial-content">{testimonial.content}</p>

              <div className="testimonial-footer">
                <span className="testimonial-date">
                  {testimonial.createdAt && formatDate(
                    testimonial.createdAt.toDate ? testimonial.createdAt.toDate() : new Date(testimonial.createdAt.seconds * 1000)
                  )}
                </span>

                {!testimonial.approved && (
                  <div className="testimonial-actions">
                    <button
                      onClick={() => handleApprove(testimonial.id!)}
                      className="action-btn approve-btn"
                      disabled={processing === testimonial.id}
                      title="Aprobar comentario"
                    >
                      <Icon name="check" size={16} />
                      <span>Aprobar</span>
                    </button>
                    <button
                      onClick={() => handleReject(testimonial.id!)}
                      className="action-btn reject-btn"
                      disabled={processing === testimonial.id}
                      title="Rechazar comentario"
                    >
                      <Icon name="x" size={16} />
                      <span>Rechazar</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

TestimonialsManagement.displayName = 'TestimonialsManagement';

