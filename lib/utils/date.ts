import { format, isToday, isPast, addDays, subDays } from 'date-fns';
import { es } from 'date-fns/locale';

export function formatDateForId(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function formatDateForDisplay(date: Date): string {
  return format(date, 'dd/MM/yyyy', { locale: es });
}

export function getCurrentSeason(): 'verano' | 'invierno' {
  const month = new Date().getMonth() + 1; // 1-12
  // In Argentina (Southern Hemisphere): Summer (Dec-Mar), Winter (Jun-Sep)
  if (month >= 12 || month <= 3) return 'verano';
  if (month >= 6 && month <= 9) return 'invierno';
  return 'verano'; // Default to summer for transitional months
}

export function isWithinDays(date: Date, days: number): boolean {
  const today = new Date();
  const cutoffDate = subDays(today, days);
  return date >= cutoffDate;
}

export function getTodayId(): string {
  return formatDateForId(new Date());
}