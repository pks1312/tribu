import { useState, useEffect, useCallback } from 'react';
import { galleryAPI, type GalleryImage } from '@/services/api';

export const useGallery = (category?: string) => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchImages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await galleryAPI.getAllImages(category);
      setImages(data);
    } catch (err: any) {
      console.error('Error fetching gallery images:', err);
      setError(err.response?.data?.message || 'Error al cargar las imágenes');
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const uploadImage = useCallback(async (imageData: FormData) => {
    try {
      const newImage = await galleryAPI.uploadImage(imageData);
      setImages(prev => [newImage, ...prev]);
      return newImage;
    } catch (err: any) {
      console.error('Error uploading image:', err);
      throw new Error(err.response?.data?.message || 'Error al subir la imagen');
    }
  }, []);

  const updateImage = useCallback(async (id: number, imageData: Partial<GalleryImage> | FormData) => {
    try {
      const updatedImage = await galleryAPI.updateImage(id, imageData);
      setImages(prev => prev.map(img => img.id === id ? updatedImage : img));
      return updatedImage;
    } catch (err: any) {
      console.error('Error updating image:', err);
      throw new Error(err.response?.data?.message || 'Error al actualizar la imagen');
    }
  }, []);

  const deleteImage = useCallback(async (id: number) => {
    try {
      await galleryAPI.deleteImage(id);
      setImages(prev => prev.filter(img => img.id !== id));
    } catch (err: any) {
      console.error('Error deleting image:', err);
      throw new Error(err.response?.data?.message || 'Error al eliminar la imagen');
    }
  }, []);

  return {
    images,
    loading,
    error,
    refetch: fetchImages,
    uploadImage,
    updateImage,
    deleteImage
  };
};
