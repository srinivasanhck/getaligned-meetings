import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const APIURL = process.env.NEXT_PUBLIC_API_URL;

export const CLIENTID = process.env.NEXT_PUBLIC_CLIENT_ID;


