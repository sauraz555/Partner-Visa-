import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string, format: 'australian' | 'international' = 'australian'): string {
  if (!dateStr) return 'Date unknown';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  if (format === 'australian') {
    return date.toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' });
  }
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function formatDateShort(dateStr: string): string {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatMonthYear(dateStr: string): string {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('en-AU', { month: 'long', year: 'numeric' });
}

export function getYear(dateStr: string): number {
  return new Date(dateStr).getFullYear();
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export function generateId(prefix = 'id'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

export function statusLabel(status: string): string {
  const labels: Record<string, string> = {
    ready: 'Ready',
    needs_date: 'Needs Date',
    needs_location: 'Needs Location',
    needs_names: 'Needs Names',
    needs_explanation: 'Needs Explanation',
    possible_duplicate: 'Possible Duplicate',
    low_quality: 'Low Quality',
    sensitive_detected: 'Sensitive Detected',
    excluded: 'Excluded',
    approved: 'Approved',
    uploading: 'Uploading',
    processing: 'Processing',
  };
  return labels[status] || status;
}

export function statusColour(status: string): string {
  const colours: Record<string, string> = {
    ready: 'bg-emerald-100 text-emerald-700',
    needs_date: 'bg-amber-100 text-amber-700',
    needs_location: 'bg-amber-100 text-amber-700',
    needs_names: 'bg-amber-100 text-amber-700',
    needs_explanation: 'bg-amber-100 text-amber-700',
    possible_duplicate: 'bg-orange-100 text-orange-700',
    low_quality: 'bg-red-100 text-red-700',
    sensitive_detected: 'bg-red-100 text-red-700',
    excluded: 'bg-gray-100 text-gray-500',
    approved: 'bg-blue-100 text-blue-700',
    uploading: 'bg-blue-100 text-blue-700',
    processing: 'bg-purple-100 text-purple-700',
  };
  return colours[status] || 'bg-gray-100 text-gray-600';
}

export function confidenceLabel(level: string): string {
  const labels: Record<string, string> = {
    high: 'High relevance',
    medium: 'Useful supporting context',
    low: 'Missing context',
    unknown: 'Unknown',
  };
  return labels[level] || level;
}

export function confirmationLabel(status: string): string {
  const labels: Record<string, string> = {
    ai_suggested: 'AI suggested',
    client_confirmed: 'Client confirmed',
    reviewer_confirmed: 'Reviewer confirmed',
    approximate: 'Approximate',
    unknown: 'Unknown',
  };
  return labels[status] || status;
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
