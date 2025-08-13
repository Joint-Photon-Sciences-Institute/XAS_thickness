import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatSignificantDigits(value: number, digits: number = 3): string {
  if (value === 0) return '0';
  
  const magnitude = Math.floor(Math.log10(Math.abs(value)));
  const scale = Math.pow(10, digits - magnitude - 1);
  
  return String(Math.round(value * scale) / scale);
}

export function formatWithUnits(value: number, unit: string, digits: number = 3): string {
  return `${formatSignificantDigits(value, digits)} ${unit}`;
}

export function cmToMicrons(cm: number): number {
  return cm * 10000;
}

export function micronsToMm(microns: number): number {
  return microns / 1000;
}

export function formatError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}