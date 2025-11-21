import React, { useState, useCallback, useMemo, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useServices } from '@/hooks/useServices';
import { useProfessionals } from '@/hooks/useProfessionals';
import { formatCurrency } from '@/utils/helpers';
import { debounce } from '@/utils/debounce';
import type { Professional } from '@/types/booking';
import './ServicesPage.css';

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
  professionalId?: string;
}

const ServiceCard = memo<ServiceCardProps>(({ service, professionalId }) => {
  const durationText = formatDuration(service.duration);
  const navigate = useNavigate();

  const handleBook = useCallback(() => {
    const params = new URLSearchParams();
    if (professionalId) {
      params.set('professional', professionalId);
    }
    params.set('service', service.id);
    navigate(`/booking?${params.toString()}`);
  }, [service.id, professionalId, navigate]);

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
        <button onClick={handleBook} className="service-book-btn">
          Agendar servicio
        </button>
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
  professionalId?: string;
}

const CategorySection = memo<CategorySectionProps>(({ category, services, isExpanded, onToggle, professionalId }) => {
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
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} professionalId={professionalId} />
          ))}
        </div>
      )}
    </div>
  );
});

CategorySection.displayName = 'CategorySection';

export const ServicesPage: React.FC = memo(() => {
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const { services: firebaseServices, loading: servicesLoading } = useServices();
  const { professionals, loading: professionalsLoading } = useProfessionals();

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

  const handleProfessionalSelect = useCallback((professional: Professional) => {
    setSelectedProfessional(professional);
  }, []);

  const handleClearProfessional = useCallback(() => {
    setSelectedProfessional(null);
  }, []);

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
    <div className="services-page">
      <div className="services-page-container">
        <div className="services-page-header">
          <h1 className="page-title">Nuestros Servicios</h1>
          <p className="page-subtitle">
            Selecciona un profesional y explora nuestros servicios disponibles
          </p>
        </div>

        {!selectedProfessional ? (
          <div className="professional-selection-section">
            <h2 className="section-title">Selecciona un Profesional</h2>
            <p className="section-description">
              Elige el profesional con el que deseas agendar tu servicio
            </p>
            
            {professionalsLoading ? (
              <div className="loading-state">
                <p>Cargando profesionales...</p>
              </div>
            ) : (
              <div className="professionals-grid">
                {professionals.map((professional) => (
                  <button
                    key={professional.id}
                    className="professional-card-select"
                    onClick={() => handleProfessionalSelect(professional)}
                  >
                    <div className="professional-avatar-select">
                      {(professional.displayName || professional.name || professional.email || 'P').charAt(0)}
                    </div>
                    <h3 className="professional-name-select">{professional.displayName || professional.name || professional.email}</h3>
                    {professional.specialties && professional.specialties.length > 0 && (
                      <p className="professional-specialties-select">
                        {professional.specialties.join(', ')}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="services-section">
            <div className="selected-professional-banner">
              <div className="professional-info">
                <div className="professional-avatar-small">
                  {(selectedProfessional.displayName || selectedProfessional.name || selectedProfessional.email || 'P').charAt(0)}
                </div>
                <div>
                  <h3 className="professional-name-small">{selectedProfessional.displayName || selectedProfessional.name || selectedProfessional.email}</h3>
                  {selectedProfessional.specialties && selectedProfessional.specialties.length > 0 && (
                    <p className="professional-specialties-small">
                      {selectedProfessional.specialties.join(', ')}
                    </p>
                  )}
                </div>
              </div>
              <button onClick={handleClearProfessional} className="change-professional-btn">
                Cambiar Profesional
              </button>
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
                          professionalId={selectedProfessional.id}
                        />
                      ))
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

ServicesPage.displayName = 'ServicesPage';

