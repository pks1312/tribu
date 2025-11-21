import api from './config';

export interface GalleryImage {
  id: number;
  title: string;
  description: string;
  image?: File;
  image_url?: string;
  category: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const galleryAPI = {
  async getAllImages(category?: string): Promise<GalleryImage[]> {
    const params = category ? { category } : {};
    const response = await api.get('/gallery/', { params });
    return response.data;
  },

  async getImage(id: number): Promise<GalleryImage> {
    const response = await api.get(`/gallery/${id}/`);
    return response.data;
  },

  async uploadImage(imageData: FormData): Promise<GalleryImage> {
    const response = await api.post('/gallery/', imageData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async updateImage(id: number, imageData: Partial<GalleryImage> | FormData): Promise<GalleryImage> {
    const headers = imageData instanceof FormData 
      ? { 'Content-Type': 'multipart/form-data' }
      : {};
    
    const response = await api.patch(`/gallery/${id}/`, imageData, { headers });
    return response.data;
  },

  async deleteImage(id: number): Promise<void> {
    await api.delete(`/gallery/${id}/`);
  }
};
