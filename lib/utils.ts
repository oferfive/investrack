import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { AssetType, RiskLevel } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatPercentage(value: number | undefined): string {
  if (value === undefined) return 'N/A';
  
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value / 100)
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date)
}

export function getAssetTypeLabel(type: AssetType): string {
  const labels: Record<AssetType, string> = {
    stock: "Stock",
    etf: "ETF",
    realEstate: "Real Estate",
    kaspit: "Money Market Fund (Kaspit)",
    cash: "Cash",
    crypto: "Crypto",
    bond: "Bond",
    other: "Other",
    gemel: "Gemel",
  }
  return labels[type]
}

export function getAssetTypeColor(type: AssetType): string {
  const colors: Record<AssetType, string> = {
    stock: "#4f46e5", // indigo-600
    etf: "#0891b2", // cyan-600
    realEstate: "#16a34a", // green-600
    cash: "#ca8a04", // yellow-600
    crypto: "#9333ea", // purple-600
    bond: "#0284c7", // sky-600
    other: "#6b7280", // gray-500
    gemel: "#dc2626", // red-600
    kaspit: "#0ea5e9", // sky-500
  }
  return colors[type]
}

export function getRiskLevelColor(level: RiskLevel): string {
  const colors: Record<RiskLevel, string> = {
    low: "#16a34a", // green-600
    medium: "#ca8a04", // yellow-600
    high: "#dc2626", // red-600
  }
  return colors[level]
}
