export type UserRole = 'admin' | 'worker' | 'client';

export interface User {
  id: string;
  name?: string;
  email: string;
  displayName?: string;
  role: UserRole;
  phone?: string;
  photoURL?: string;
  specialties?: string[];
  active?: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export interface UserProfile {
  uid: string;
  name?: string;
  email: string;
  displayName?: string;
  role: UserRole;
  phone?: string;
  photoURL?: string;
  specialties?: string[];
}

