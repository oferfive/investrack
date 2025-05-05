"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { PortfolioSummary } from "@/components/portfolio-summary"
import { AssetBreakdown } from "@/components/asset-breakdown"
import { RecentTransactions } from "@/components/recent-transactions"
import { AssetList } from "@/components/asset-list"
import { EditAssetDialog } from "@/components/edit-asset-dialog"
import { UploadStatementDialog } from "@/components/upload-statement-dialog"
import { useAssets } from "@/hooks/use-assets"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { Asset, AssetType, Currency, RiskLevel } from "@/lib/types"

export function DashboardPage() {
  const { assets, isLoading, error, addAsset, updateAsset, deleteAsset } = useAssets()
  const [isAddAssetOpen, setIsAddAssetOpen] = useState(false)
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null)
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
  const totalYield = assets.length > 0 
    ? filteredAssets.reduce((sum, asset) => sum + (asset.annual_yield || 0), 0) / Math.max(1, assets.length)
    : 0

  if (isLoading) {
    return (
      <DashboardShell>
        <div className="flex justify-center items-center h-[60vh]">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
            <p className="text-muted-foreground">Loading your portfolio...</p>
          </div>
        </div>
      </DashboardShell>
    )
  }

  if (error) {
    return (
      <DashboardShell>
        <Alert variant="destructive" className="my-8">
          <AlertDescription>
            {error}. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      </DashboardShell>
    )
  }

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
            onEdit={(id, asset) => {
              const assetToEdit = assets.find(a => a.id === id);
              if (assetToEdit) {
                setEditingAsset(assetToEdit);
              }
            }}
            onDelete={deleteAsset}
            onAddAsset={() => setIsAddAssetOpen(true)}
          />
        </div>
        <div className="col-span-3">
          <RecentTransactions assets={filteredAssets} />
        </div>
      </div>
      {editingAsset && (
        <EditAssetDialog
          asset={editingAsset}
          open={!!editingAsset}
          onOpenChange={() => setEditingAsset(null)}
          onSave={(updatedAsset) => {
            if (updatedAsset && updatedAsset.id) {
              updateAsset(updatedAsset.id, updatedAsset);
              setEditingAsset(null);
            }
          }}
        />
      )}
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
