export type AssetType = "stock" | "etf" | "realEstate" | "cash" | "crypto" | "bond" | "other" | "gemel" | "kaspit"
export type Currency = "USD" | "EUR" | "ILS" | "GBP"
export type RiskLevel = "low" | "medium" | "high"
export type RecurringFrequency = "weekly" | "monthly" | "quarterly" | "annually"

export interface Asset {
  id: string
  name: string
  type: AssetType
  ticker?: string
  value: number
  currency: Currency
  location: string
  risk_level: RiskLevel
  annual_yield?: number
  has_recurring_contribution?: boolean
  recurring_amount?: number
  recurring_frequency?: RecurringFrequency
  notes?: string
  managing_institution?: string
  created_at: string
  updated_at: string
}
