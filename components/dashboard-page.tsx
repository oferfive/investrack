"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { PortfolioSummary } from "@/components/portfolio-summary"
import { AssetBreakdown } from "@/components/asset-breakdown"
import { RecentTransactions } from "@/components/recent-transactions"
import { AssetList } from "@/components/asset-list"
import { AddAssetSheet } from "@/components/add-asset-sheet"
import { UploadStatementDialog } from "@/components/upload-statement-dialog"
import { useAssets } from "@/hooks/use-assets"
import type { AssetType, Currency, RiskLevel } from "@/lib/types"

export function DashboardPage() {
  const { assets, addAsset, updateAsset, deleteAsset } = useAssets()
  const [isAddAssetOpen, setIsAddAssetOpen] = useState(false)
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [filters, setFilters] = useState({
    assetType: "all" as AssetType | "all",
    currency: "all" as Currency | "all",
    riskLevel: "all" as RiskLevel | "all",
    location: "all" as string | "all",
  })

  const filteredAssets = assets.filter((asset) => {
    return (
      (filters.assetType === "all" || asset.type === filters.assetType) &&
      (filters.currency === "all" || asset.currency === filters.currency) &&
      (filters.riskLevel === "all" || asset.risk_level === filters.riskLevel) &&
      (filters.location === "all" || asset.location === filters.location)
    )
  })

  const totalValue = filteredAssets.reduce((sum, asset) => sum + asset.value, 0)
  const totalYield = filteredAssets.reduce((sum, asset) => sum + (asset.annual_yield || 0), 0) / assets.length

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Portfolio Dashboard"
        text="Track and manage all your investments in one place."
        onAddAsset={() => setIsAddAssetOpen(true)}
        onUploadStatement={() => setIsUploadOpen(true)}
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <PortfolioSummary totalValue={totalValue} totalYield={totalYield} />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <AssetBreakdown assets={filteredAssets} filters={filters} setFilters={setFilters} />
      </div>
      <div className="grid gap-4 md:grid-cols-7">
        <div className="col-span-4">
          <AssetList
            assets={filteredAssets}
            onEdit={updateAsset}
            onDelete={deleteAsset}
            onAddAsset={() => setIsAddAssetOpen(true)}
          />
        </div>
        <div className="col-span-3">
          <RecentTransactions assets={filteredAssets} />
        </div>
      </div>
      <AddAssetSheet open={isAddAssetOpen} onOpenChange={setIsAddAssetOpen} onAddAsset={addAsset} />
      <UploadStatementDialog
        open={isUploadOpen}
        onOpenChange={setIsUploadOpen}
        onImportAssets={(assets) => {
          assets.forEach(addAsset)
          setIsUploadOpen(false)
        }}
      />
    </DashboardShell>
  )
}
