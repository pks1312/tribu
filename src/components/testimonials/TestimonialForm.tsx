import React, { useState } from 'react';
import { Button } from '@/components/common';
import { testimonialsAPI } from '@/services/api/testimonialsAPI';
import { useAuth } from '@/contexts/AuthContext';
import './TestimonialForm.css';

interface TestimonialFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const TestimonialForm: React.FC<TestimonialFormProps> = ({ onSuccess, onCancel }) => {
  const { user, userProfile } = useAuth();
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user) {
      setError('Debes iniciar sesión para dejar un comentario');
      return;
    }

    if (!content.trim()) {
      setError('Por favor, escribe tu comentario');
      return;
    }

    if (rating < 1 || rating > 5) {
      setError('La calificación debe estar entre 1 y 5');
      return;
    }

    try {
      setLoading(true);
      await testimonialsAPI.createTestimonial({
        name: userProfile?.displayName || user.email?.split('@')[0] || 'Usuario',
        content: content.trim(),
        rating: rating,
        userId: user.uid,
        userEmail: user.email || undefined,
        date: new Date().toLocaleDateString('es-CL', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      });

      setContent('');
      setRating(5);

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Error al enviar el comentario');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="testimonial-form-login">
        <p>Debes iniciar sesión para dejar un comentario</p>
      </div>
    );
  }

  return (
    <form className="testimonial-form" onSubmit={handleSubmit}>
      <h3 className="testimonial-form-title">Deja tu Comentario</h3>
      
      {error && (
        <div className="testimonial-form-error">
          {error}
        </div>
      )}

      <div className="testimonial-form-group">
        <label htmlFor="content">Tu Comentario</label>
        <textarea
          id="content"
          className="testimonial-form-textarea"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Comparte tu experiencia con nosotros..."
          rows={5}
          required
        />
      </div>

      <div className="testimonial-form-group">
        <label htmlFor="rating">Calificación</label>
        <div className="testimonial-form-rating">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className={`rating-star ${rating >= star ? 'active' : ''}`}
              onClick={() => setRating(star)}
            >
              ★
            </button>
          ))}
          <span className="rating-value">{rating}/5</span>
        </div>
      </div>

      <div className="testimonial-form-actions">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? 'Publicando...' : 'Publicar Comentario'}
        </Button>
      </div>
    </form>
  );
};
