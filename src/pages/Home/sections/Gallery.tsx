import React, { useState, useMemo } from 'react';
import { useGallery } from '@/hooks/useGallery';
import './Gallery.css';

export const Gallery: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const { galleryItems, loading } = useGallery(selectedCategory === 'Todos' ? undefined : selectedCategory);

  const categories = useMemo(() => {
    const allCategories = Array.from(new Set(galleryItems.map(item => item.category)));
    return ['Todos', ...allCategories];
  }, [galleryItems]);

  return (
    <section id="galeria" className="gallery">
      <div className="gallery-container">
        <div className="gallery-header">
          <h2 className="section-title">Nuestros Trabajos</h2>
          <p className="section-subtitle">
            Echa un vistazo a los resultados de nuestros trabajos realizados
          </p>
        </div>

        {loading ? (
          <div className="gallery-loading">
            <p>Cargando galería...</p>
          </div>
        ) : galleryItems.length > 0 ? (
          <>
            {categories.length > 1 && (
              <div className="gallery-filters">
                {categories.map((category) => (
                  <button
                    key={category}
                    className={`gallery-filter ${selectedCategory === category ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            )}

            <div className="gallery-grid">
              {galleryItems.map((item) => (
                <div key={item.id} className="gallery-item">
                  <div className="gallery-image">
                    {item.imageUrl ? (
                      <img 
                        src={item.imageUrl} 
                        alt={item.title}
                        className="gallery-img"
                        loading="lazy"
                      />
                    ) : (
                      <div className="gallery-placeholder">
                        <span className="gallery-category-badge">{item.category}</span>
                      </div>
                    )}
                    <div className="gallery-overlay">
                      <div className="gallery-info">
                        <h3 className="gallery-item-title">{item.title}</h3>
                        {item.description && (
                          <p className="gallery-item-description">{item.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="gallery-empty">
            <p className="empty-message">
              Próximamente mostraremos nuestra galería de trabajos realizados.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
