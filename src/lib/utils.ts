import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(
  minutes: number | null | undefined,
  seconds: number | null | undefined = 0
): string {
  const totalMins = minutes || 0;
  const secs = seconds || 0;

  if (totalMins <= 0 && secs <= 0) return "Duração não informada";

  const hours = Math.floor(totalMins / 60);
  const remainingMins = totalMins % 60;

  if (hours > 0) {
    if (remainingMins > 0) return `${hours}h ${remainingMins}min`;
    return `${hours}h`;
  }

  if (remainingMins > 0 && secs > 0) {
    return `${remainingMins}min ${secs}s`;
  }

  if (remainingMins > 0) {
    return `${remainingMins}min`;
  }

  return `${secs}s`;
}

