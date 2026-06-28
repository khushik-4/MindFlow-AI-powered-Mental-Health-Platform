import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function resolveApiUrl(path: string): string {
  const basePath = process.env.NODE_ENV === "production" ? "/mindflow" : "";
  return `${basePath}${path}`;
}

