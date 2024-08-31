// lib/utils.js
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function generateColorFromAddress(address, isBackground = false) {
  const cleanAddress = address.slice(2);
  const colorCode = isBackground ? cleanAddress.slice(0, 6) : cleanAddress.slice(-6);
  return `#${colorCode}`;
}