import React, { useState, useEffect, useCallback, useRef, memo, useMemo } from 'react';
import { galleryAPI, type GalleryItemDocument } from '@/services/api/galleryAPI';
import { storage } from '@/services/firebase/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Button, Input, Modal, Icon } from '@/components/common';
import './GalleryManagement.css';

const GALLERY_CATEGORIES = [
  'Cortes',
  'Barba',
  'Color',
  'Tratamientos',
  'Estilos',
  'Antes/Después'
];

export const GalleryManagement: React.FC = memo(() => {
  const [galleryItems, setGalleryItems] = useState<GalleryItemDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItemDocument | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: GALLERY_CATEGORIES[0],
    order: '0',
    imageUrl: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const loadGalleryItems = useCallback(async () => {
    try {
      setLoading(true);
      const items = await galleryAPI.getGalleryItems();
      setGalleryItems(items);
    } catch (err: any) {
      setError(err.message || 'Error al cargar galería');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGalleryItems();
  }, [loadGalleryItems]);

  const filteredItems = useMemo(() => {
    let filtered = [...galleryItems];

    if (filterCategory !== 'all') {
      filtered = filtered.filter(item => item.category === filterCategory);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(term) ||
        item.description?.toLowerCase().includes(term) ||
        item.category.toLowerCase().includes(term)
      );
    }

    return filtered.sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [galleryItems, filterCategory, searchTerm]);

  const stats = useMemo(() => {
    return {
      total: galleryItems.length,
      byCategory: GALLERY_CATEGORIES.map(cat => ({
        category: cat,
        count: galleryItems.filter(item => item.category === cat).length
      }))
    };
  }, [galleryItems]);

  const handleOpenModal = useCallback((item?: GalleryItemDocument) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        title: item.title,
        description: item.description || '',
        category: item.category,
        order: (item.order || 0).toString(),
        imageUrl: item.imageUrl || ''
      });
      setPreviewUrl(item.imageUrl || '');
    } else {
      setEditingItem(null);
      setFormData({
        title: '',
        description: '',
        category: GALLERY_CATEGORIES[0],
        order: '0',
        imageUrl: ''
      });
      setPreviewUrl('');
    }
    setImageFile(null);
    setError(null);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingItem(null);
    setFormData({
      title: '',
      description: '',
      category: GALLERY_CATEGORIES[0],
      order: '0',
      imageUrl: ''
    });
    setImageFile(null);
    setPreviewUrl('');
    setError(null);
  }, []);

  const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('La imagen no debe superar los 5MB');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const uploadImage = useCallback(async (file: File): Promise<string> => {
    const timestamp = Date.now();
    const fileName = `gallery/${timestamp}_${file.name}`;
    const storageRef = ref(storage, fileName);
    
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.title.trim()) {
      setError('El título es requerido');
      return;
    }

    if (!imageFile && !formData.imageUrl) {
      setError('Debes seleccionar una imagen');
      return;
    }

    try {
      setUploading(true);
      let imageUrl = formData.imageUrl;

      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      if (editingItem) {
        await galleryAPI.updateGalleryItem(editingItem.id!, {
          title: formData.title.trim(),
          description: formData.description.trim(),
          category: formData.category,
          order: parseInt(formData.order) || 0,
          imageUrl
        });
      } else {
        await galleryAPI.createGalleryItem({
          title: formData.title.trim(),
          description: formData.description.trim(),
          category: formData.category,
          order: parseInt(formData.order) || 0,
          imageUrl
        });
      }
      await loadGalleryItems();
      handleCloseModal();
    } catch (err: any) {
      setError(err.message || 'Error al guardar el elemento');
    } finally {
      setUploading(false);
    }
  }, [formData, imageFile, editingItem, uploadImage, loadGalleryItems, handleCloseModal]);

  const handleDelete = useCallback(async (itemId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este elemento de la galería?')) {
      return;
    }

    try {
      await galleryAPI.deleteGalleryItem(itemId);
      await loadGalleryItems();
    } catch (err: any) {
      setError(err.message || 'Error al eliminar el elemento');
    }
  }, [loadGalleryItems]);

  if (loading) {
    return (
      <div className="gallery-loading">
        <div className="spinner"></div>
        <p>Cargando galería...</p>
      </div>
    );
  }

  return (
    <div className="gallery-management">
      <div className="management-header">
        <div>
          <h2 className="management-title">Gestión de Galería</h2>
          <p className="management-subtitle">Administra las imágenes y trabajos destacados</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Icon name="plus" size={18} color="currentColor" />
          <span>Agregar Elemento</span>
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

      <div className="gallery-stats-grid">
        <div className="stat-mini-card">
          <div className="stat-mini-icon" style={{ background: '#7FD3B0' }}>
            <Icon name="image" size={20} color="white" />
          </div>
          <div className="stat-mini-content">
            <span className="stat-mini-label">Total Imágenes</span>
            <span className="stat-mini-value">{stats.total}</span>
          </div>
        </div>

        {stats.byCategory.filter(c => c.count > 0).slice(0, 3).map((cat, index) => (
          <div key={cat.category} className="stat-mini-card">
            <div className="stat-mini-icon" style={{ background: ['#A8E6CF', '#4ECDC4', '#ff9500'][index] || '#7FD3B0' }}>
              <Icon name="grid" size={20} color="white" />
            </div>
            <div className="stat-mini-content">
              <span className="stat-mini-label">{cat.category}</span>
              <span className="stat-mini-value">{cat.count}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="gallery-controls">
        <div className="search-filter-group">
          <div className="search-box">
            <input
              type="text"
              placeholder="Buscar en galería..."
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
              {GALLERY_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="results-info">
          <span className="results-count">{filteredItems.length} imágenes</span>
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="gallery-empty-state">
          <Icon name="image" size={64} color="var(--text-tertiary)" />
          <h3>No hay elementos</h3>
          <p>No se encontraron elementos en la galería con los filtros seleccionados</p>
        </div>
      ) : (
        <div className="gallery-grid-modern">
          {filteredItems.map((item) => (
            <div key={item.id} className="gallery-item-card-modern">
              {item.imageUrl && (
                <div className="gallery-item-image-modern">
                  <img src={item.imageUrl} alt={item.title} />
                  <div className="gallery-item-overlay">
                    <button
                      onClick={() => handleOpenModal(item)}
                      className="overlay-action-btn"
                      title="Editar"
                    >
                      <Icon name="edit" size={18} color="white" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id!)}
                      className="overlay-action-btn delete"
                      title="Eliminar"
                    >
                      <Icon name="trash" size={18} color="white" />
                    </button>
                  </div>
                </div>
              )}

              <div className="gallery-item-info-modern">
                <div className="gallery-item-header-modern">
                  <h3 className="gallery-item-title-modern">{item.title}</h3>
                  <span className="gallery-category-badge-modern">{item.category}</span>
                </div>

                {item.description && (
                  <p className="gallery-item-description-modern">{item.description}</p>
                )}

                <div className="gallery-item-meta-modern">
                  <div className="meta-item">
                    <Icon name="grid" size={14} color="var(--text-tertiary)" />
                    <span>Orden: {item.order || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <div className="gallery-form-modern">
          <div className="form-header-modern">
            <Icon name="image" size={28} color="var(--accent-primary)" />
            <h3 className="form-title-modern">
              {editingItem ? 'Editar Elemento' : 'Nuevo Elemento'}
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
              id="gallery-title"
              label="Título"
              value={formData.title}
              onChange={(value) => setFormData({ ...formData, title: value })}
              placeholder="Ej: Corte Fade Moderno"
              required
            />

            <div className="form-group-modern">
              <label htmlFor="gallery-description" className="input-label-modern">
                Descripción
              </label>
              <textarea
                id="gallery-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe brevemente el trabajo..."
                className="textarea-field-modern"
                rows={3}
              />
            </div>

            <div className="form-row-modern">
              <div className="form-group-modern">
                <label htmlFor="gallery-category" className="input-label-modern">
                  Categoría
                </label>
                <div className="input-with-icon">
                  <Icon name="tag" size={18} color="var(--text-tertiary)" />
                  <select
                    id="gallery-category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="select-field-modern"
                    required
                  >
                    {GALLERY_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <Input
                id="gallery-order"
                label="Orden"
                type="number"
                value={formData.order}
                onChange={(value) => setFormData({ ...formData, order: value })}
                placeholder="0"
                min="0"
              />
            </div>

            <div className="form-group-modern">
              <label htmlFor="gallery-image" className="input-label-modern">
                <Icon name="image" size={16} color="var(--text-tertiary)" />
                <span>Imagen</span>
              </label>

              {previewUrl && (
                <div className="image-preview-modern">
                  <img src={previewUrl} alt="Preview" />
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                id="gallery-image"
                accept="image/*"
                onChange={handleImageSelect}
                className="file-input-hidden"
              />

              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                <Icon name="upload" size={18} color="currentColor" />
                <span>Seleccionar Imagen</span>
              </Button>

              <span className="input-help-text">
                Tamaño máximo: 5MB. Formatos: JPG, PNG, WEBP
              </span>
            </div>

            <div className="form-actions-modern">
              <Button type="button" variant="outline" onClick={handleCloseModal} disabled={uploading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={uploading}>
                <Icon name={uploading ? 'clock' : 'check'} size={18} color="currentColor" />
                <span>{uploading ? 'Subiendo...' : (editingItem ? 'Actualizar' : 'Crear')}</span>
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
});

GalleryManagement.displayName = 'GalleryManagement';
