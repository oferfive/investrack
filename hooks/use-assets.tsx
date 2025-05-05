"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { assetService } from "@/lib/asset-service"
import type { Asset } from "@/lib/types"

// Sample mock data for testing
const initialAssets: Asset[] = [
  {
    id: "asset-1",
    name: "S&P 500 ETF",
    type: "etf",
    ticker: "SPY",
    value: 25000,
    currency: "USD",
    location: "US",
    risk_level: "medium",
    annual_yield: 8.5,
    has_recurring_contribution: true,
    recurring_amount: 500,
    recurring_frequency: "monthly",
    created_at: "2023-01-15T00:00:00.000Z",
    updated_at: "2023-04-15T00:00:00.000Z",
  },
  {
    id: "asset-2",
    name: "Rental Property",
    type: "realEstate",
    value: 350000,
    currency: "EUR",
    location: "US",
    risk_level: "low",
    annual_yield: 5.2,
    created_at: "2022-06-10T00:00:00.000Z",
    updated_at: "2023-03-20T00:00:00.000Z",
  },
  {
    id: "asset-3",
    name: "Apple Inc.",
    type: "stock",
    ticker: "AAPL",
    value: 15000,
    currency: "GBP",
    location: "US",
    risk_level: "medium",
    annual_yield: 0.5,
    created_at: "2022-11-05T00:00:00.000Z",
    updated_at: "2023-04-01T00:00:00.000Z",
  },
  {
    id: "asset-4",
    name: "Bitcoin",
    type: "crypto",
    ticker: "BTC",
    value: 12000,
    currency: "ILS",
    location: "Global",
    risk_level: "high",
    annual_yield: -20,
    created_at: "2023-02-20T00:00:00.000Z",
    updated_at: "2023-04-10T00:00:00.000Z",
  },
  {
    id: "asset-5",
    name: "European Bond Fund",
    type: "bond",
    ticker: "EUBND",
    value: 30000,
    currency: "USD",
    location: "EU",
    risk_level: "low",
    annual_yield: 3.1,
    created_at: "2022-09-15T00:00:00.000Z",
    updated_at: "2023-03-15T00:00:00.000Z",
  },
]

export function useAssets() {
  const { user } = useAuth()
  const [assets, setAssets] = useState<Asset[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchAssets() {
      if (!user) {
        setAssets([])
        setIsLoading(false)
        return
      }
      
      try {
        setIsLoading(true)
        setError(null)
        const fetchedAssets = await assetService.getAssets()
        setAssets(fetchedAssets)
      } catch (err) {
        console.error('Error fetching assets:', err)
        setError('Failed to load assets')
        setAssets([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchAssets()
  }, [user])

  const addAsset = async (asset: Omit<Asset, "id">) => {
    if (!user) return null
    
    try {
      // Make sure to set the user_id field
      const assetWithUserId = {
        ...asset,
        user_id: user.id
      }
      const newAsset = await assetService.addAsset(assetWithUserId)
      setAssets((prev) => [...prev, newAsset])
      return newAsset
    } catch (err) {
      console.error('Error adding asset:', err)
      throw err
    }
  }

  const updateAsset = async (id: string, asset: Partial<Asset>) => {
    const updatedAsset = await assetService.updateAsset(id, asset)
    setAssets((prev) => prev.map((a) => (a.id === id ? updatedAsset : a)))
  }

  const deleteAsset = async (id: string) => {
    await assetService.deleteAsset(id)
    setAssets((prev) => prev.filter((a) => a.id !== id))
  }

  return {
    assets,
    isLoading,
    error,
    addAsset,
    updateAsset,
    deleteAsset,
  }
}
