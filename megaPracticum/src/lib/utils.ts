import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getTenantTheme = (tenant: string) => {
  return tenant.toLowerCase() === 'uvu' 
    ? 'bg-[#275D38] text-white' 
    : 'bg-[#CC0000] text-white';
};

export const getTenantAccent = (tenant: string) => {
  return tenant.toLowerCase() === 'uvu'
    ? 'hover:bg-[#4C8C2B]'
    : 'hover:bg-[#990000]';
};