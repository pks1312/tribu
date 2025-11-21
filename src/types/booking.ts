export interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
  description?: string;
  category?: string;
}

export interface Professional {
  id: string;
  name?: string;
  displayName?: string;
  email?: string;
  image?: string;
  photoURL?: string;
  specialties?: string[];
  active?: boolean;
}

export interface TimeSlot {
  time: string;
  available: boolean;
  professionalId: string;
  date: string;
}

export interface BookingData {
  serviceId: string;
  professionalId: string;
  date: string;
  time: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  notes?: string;
}

export interface BookingStep {
  id: number;
  name: string;
  completed: boolean;
}

export interface ProfessionalSchedule {
  professionalId: string;
  date: string;
  availableSlots: string[];
  bookedSlots: string[];
}
