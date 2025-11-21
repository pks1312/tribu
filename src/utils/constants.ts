export const WORKING_HOURS = {
  start: 9,
  end: 18,
};

export const TIME_SLOTS = Array.from({ length: WORKING_HOURS.end - WORKING_HOURS.start + 1 }, (_, i) => {
  const hour = WORKING_HOURS.start + i;
  return `${hour.toString().padStart(2, '0')}:00`;
});

export const MIN_BOOKING_HOURS = 2;
