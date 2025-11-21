import React, { useState, useMemo, useCallback, memo } from 'react';
import { Link } from 'react-router-dom';
import { useServices } from '@/hooks/useServices';
import { formatCurrency } from '@/utils/helpers';
import { debounce } from '@/utils/debounce';
import './Services.css';

const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) {
    return `${hours} hrs`;
  }
  return `${hours} hrs ${mins} min`;
};

interface ServiceCardProps {
  service: {
    id: string;
    name: string;
    description?: string;
    price: number;
    duration: number;
  };
}

const ServiceCard = memo<ServiceCardProps>(({ service }) => {
  const durationText = formatDuration(service.duration);

  return (
    <div className="service-card">
      <div className="service-card-header">
        <h3 className="service-name">{service.name}</h3>
        <div className="service-meta">
          <span className="service-duration">{durationText}</span>
          <span className="service-price">{formatCurrency(service.price)}</span>
        </div>
      </div>
      
      {service.description && (
        <p className="service-description">{service.description}</p>
      )}
      
      <div className="service-card-footer">
        <Link to="/booking" className="service-info-link">
          Más información
        </Link>
        <Link to="/booking" className="service-book-btn">
          Agendar servicio
        </Link>
      </div>
    </div>
  );
});

ServiceCard.displayName = 'ServiceCard';

interface CategorySectionProps {
  category: string;
  services: Array<{
    id: string;
    name: string;
    description?: string;
    price: number;
    duration: number;
    category?: string;
  }>;
  isExpanded: boolean;
  onToggle: (category: string) => void;
}

const CategorySection = memo<CategorySectionProps>(({ category, services, isExpanded, onToggle }) => {
  const handleToggle = useCallback(() => {
    onToggle(category);
  }, [category, onToggle]);

  if (services.length === 0) return null;

  return (
    <div className="category-section">
      <button
        className="category-header"
        onClick={handleToggle}
        aria-expanded={isExpanded}
      >
        <h3 className="category-title">{category}</h3>
        <span className="category-toggle">{isExpanded ? '−' : '+'}</span>
      </button>
      
      {isExpanded && (
        <div className="services-grid">
          {services.map((service: { id: string; name: string; description?: string; price: number; duration: number }) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      )}
    </div>
  );
});

CategorySection.displayName = 'CategorySection';

export const Services: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const { services: firebaseServices, loading: servicesLoading } = useServices();

  const debouncedSetSearch = useMemo(
    () => debounce((value: string) => {
      setDebouncedSearchQuery(value);
    }, 300),
    []
  );

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    debouncedSetSearch(value);
  }, [debouncedSetSearch]);

  const filteredServices = useMemo(() => {
    if (!debouncedSearchQuery) return firebaseServices;
    const query = debouncedSearchQuery.toLowerCase();
    return firebaseServices.filter(service => 
      service.name.toLowerCase().includes(query) ||
      service.description?.toLowerCase().includes(query) ||
      service.category?.toLowerCase().includes(query)
    );
  }, [firebaseServices, debouncedSearchQuery]);

  const servicesByCategory = useMemo(() => {
    const grouped: Record<string, typeof filteredServices> = {};
    filteredServices.forEach(service => {
      const category = service.category || 'OTROS';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(service);
    });
    return grouped;
  }, [filteredServices]);

  const categories = useMemo(() => {
    const categoryOrder = [
      'PELUQUERIA',
      'BARBERIA',
      'SERVICIO DE COLOR',
      'SERVICIO DE COLOR HOMBRES',
      'TRIBU PACK',
      'TRATAMIENTOS CAPILARES'
    ];
    const allCategories = Object.keys(servicesByCategory);
    const ordered = categoryOrder.filter(cat => allCategories.includes(cat));
    const rest = allCategories.filter(cat => !categoryOrder.includes(cat));
    return [...ordered, ...rest];
  }, [servicesByCategory]);

  const toggleCategory = useCallback((category: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  }, []);

  return (
    <section id="servicios" className="services">
      <div className="services-container">
        <div className="services-header">
          <h2 className="section-title">Nuestros Servicios</h2>
          <p className="section-subtitle">
            Conoce nuestras especialidades y experimenta el arte de la barbería clásica
          </p>
        </div>

        <div className="services-content">
          <div className="services-sidebar">
            <div className="services-search">
              <input
                type="text"
                placeholder="¿Qué servicio buscas?"
                value={searchQuery}
                onChange={handleSearchChange}
                className="search-input"
              />
            </div>

            <nav className="services-categories">
              {categories.map((category) => {
                const count = servicesByCategory[category]?.length || 0;
                const isExpanded = expandedCategories.has(category);
                return (
                  <button
                    key={category}
                    className={`category-item ${isExpanded ? 'active' : ''}`}
                    onClick={() => toggleCategory(category)}
                  >
                    <span className="category-name">{category}</span>
                    <span className="category-count">({count})</span>
                    <span className="category-icon">{isExpanded ? '−' : '+'}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="services-main">
            {servicesLoading ? (
              <div className="services-loading">
                <p>Cargando servicios...</p>
              </div>
            ) : (
              <>
                {categories.length === 0 ? (
                  <div className="no-services">
                    <p>No se encontraron servicios.</p>
                  </div>
                ) : (
                  categories.map((category) => (
                    <CategorySection
                      key={category}
                      category={category}
                      services={servicesByCategory[category] || []}
                      isExpanded={expandedCategories.has(category)}
                      onToggle={toggleCategory}
                    />
                  ))
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
