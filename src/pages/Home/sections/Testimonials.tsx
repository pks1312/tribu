import React, { useState } from 'react';
import { useTestimonials } from '@/hooks/useTestimonials';
import { useAuth } from '@/contexts/AuthContext';
import { TestimonialForm } from '@/components/testimonials';
import { Button } from '@/components/common';
import './Testimonials.css';

export const Testimonials: React.FC = () => {
  const { testimonials, loading, error } = useTestimonials();
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);

  const handleFormSuccess = () => {
    setShowForm(false);
    window.location.reload();
  };

  return (
    <section className="testimonials">
      <div className="testimonials-container">
        <div className="testimonials-header">
          <h2 className="section-title">Lo Que Dicen Nuestros Clientes</h2>
          <p className="section-subtitle">
            La satisfacción de nuestros clientes es nuestra mayor recompensa
          </p>
          {user && !showForm && (
            <div className="testimonials-add-button">
              <Button onClick={() => setShowForm(true)} variant="outline">
                Dejar un Comentario
              </Button>
            </div>
          )}
        </div>

        {showForm ? (
          <div className="testimonials-form-container">
            <TestimonialForm
              onSuccess={handleFormSuccess}
              onCancel={() => setShowForm(false)}
            />
          </div>
        ) : (
          <>
            {loading ? (
              <div className="testimonials-loading">
                <p>Cargando testimonios...</p>
              </div>
            ) : error ? (
              <div className="testimonials-error">
                <p>{error}</p>
              </div>
            ) : testimonials.length > 0 ? (
              <>
                <div className="testimonials-rating">
                  <div className="rating-stars">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className="star">★</span>
                    ))}
                  </div>
                  <span className="rating-text">
                    {testimonials.length > 0 && (
                      <>
                        {(
                          testimonials.reduce((acc, t) => acc + t.rating, 0) / testimonials.length
                        ).toFixed(1)}
                        /5 ⭐ +{testimonials.length} opiniones
                      </>
                    )}
                  </span>
                </div>

                <div className="testimonials-grid">
                  {testimonials.map((testimonial) => (
                    <div key={testimonial.id} className="testimonial-card">
                      <div className="testimonial-header">
                        <div className="testimonial-rating">
                          {Array.from({ length: testimonial.rating }).map((_, i) => (
                            <span key={i} className="star">★</span>
                          ))}
                        </div>
                        {testimonial.date && (
                          <span className="testimonial-date">{testimonial.date}</span>
                        )}
                      </div>
                      <p className="testimonial-content">"{testimonial.content}"</p>
                      <div className="testimonial-author">
                        <div className="author-avatar">
                          {testimonial.name.charAt(0)}
                        </div>
                        <div className="author-info">
                          <div className="author-name">{testimonial.name}</div>
                          {testimonial.role && (
                            <div className="author-role">{testimonial.role}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="testimonials-empty">
                <p className="empty-message">
                  Próximamente mostraremos los testimonios de nuestros clientes satisfechos.
                </p>
                {user && (
                  <Button onClick={() => setShowForm(true)} variant="primary" style={{ marginTop: '16px' }}>
                    Sé el primero en comentar
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};
