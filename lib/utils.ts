import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function isShiftActive(startTime: string, endTime: string): boolean {
  const now = new Date();
  const start = new Date(startTime);
  const end = new Date(endTime);
  return now >= start && now <= end;
}

export function isShiftUpcoming(startTime: string): boolean {
  const now = new Date();
  const start = new Date(startTime);
  const hoursDiff = (start.getTime() - now.getTime()) / (1000 * 60 * 60);
  return hoursDiff > 0 && hoursDiff <= 24;
}

export function getCertificationStatus(expiryDate: string): 'valid' | 'expiring_soon' | 'expired' {
  const now = new Date();
  const expiry = new Date(expiryDate);
  const daysUntilExpiry = Math.floor((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (daysUntilExpiry < 0) {
    return 'expired';
  } else if (daysUntilExpiry <= 30) {
    return 'expiring_soon';
  } else {
    return 'valid';
  }
}

export function getCertificationStatusColor(status: string): string {
  switch (status) {
    case 'valid':
      return 'text-green-600 bg-green-50';
    case 'expiring_soon':
      return 'text-yellow-600 bg-yellow-50';
    case 'expired':
      return 'text-red-600 bg-red-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
}

