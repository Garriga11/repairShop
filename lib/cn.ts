// lib/utils/cn.ts

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Conditionally join classNames (via clsx) 
 * and dedupe/merge Tailwind classes (via twMerge).
 */
export default function cn(...inputs: ClassValue[]) {
  // clsx wants args spread, not an array
  const merged = clsx(...inputs);
  return twMerge(merged);
}
