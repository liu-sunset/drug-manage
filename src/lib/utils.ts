import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateExpiryDate(productionDate: string, shelfLifeDays: number): string {
  const date = new Date(productionDate)
  date.setDate(date.getDate() + shelfLifeDays)
  return date.toISOString().split("T")[0]!
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
}

export function getExpiryStatus(expiryDate: string): "expired" | "urgent" | "warning" | "safe" {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const expiry = new Date(expiryDate)
  expiry.setHours(0, 0, 0, 0)
  const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return "expired"
  if (diffDays <= 7) return "urgent"
  if (diffDays <= 30) return "warning"
  return "safe"
}

export const USERNAME_REGEX = /^[a-z0-9]+$/
export const PASSWORD_MIN_LENGTH = 8
