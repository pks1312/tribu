import { TIME_SLOTS, WORKING_HOURS } from './constants';

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('es-CL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatTime = (time: string): string => {
  return time;
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP'
  }).format(amount);
};

export const getAvailableDates = (daysAhead: number = 30): Date[] => {
  const dates: Date[] = [];
  const today = new Date();
  
  for (let i = 0; i < daysAhead; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    if (date.getDay() !== 0) {
      dates.push(date);
    }
  }
  
  return dates;
};

export const isTimeSlotAvailable = (date: Date, time: string): boolean => {
  const now = new Date();
  const selectedDateTime = new Date(date);
  const [hours] = time.split(':').map(Number);
  selectedDateTime.setHours(hours, 0, 0, 0);
  
  return selectedDateTime > now;
};

export const getDateString = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const getAllTimeSlots = (): string[] => {
  return TIME_SLOTS;
};

export const isTimeInWorkingHours = (time: string): boolean => {
  const [hours] = time.split(':').map(Number);
  return hours >= WORKING_HOURS.start && hours <= WORKING_HOURS.end;
};
