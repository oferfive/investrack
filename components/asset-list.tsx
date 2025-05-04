"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EditAssetDialog } from "@/components/edit-asset-dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import type { Asset } from "@/lib/types"
import { formatCurrency, getAssetTypeLabel } from "@/lib/utils"
import { MoreHorizontal, Plus, TrendingUp, TrendingDown } from "lucide-react"

interface AssetListProps {
  assets: Asset[]
  onEdit: (id: string, asset: Partial<Asset>) => void
  onDelete: (id: string) => void
  onAddAsset: () => void
}

export function AssetList({ assets, onEdit, onDelete, onAddAsset }: AssetListProps) {
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null)
  const [deleteAssetId, setDeleteAssetId] = useState<string | null>(null)
  const [deleteAssetName, setDeleteAssetName] = useState<string>("")

  const handleDelete = (id: string, name: string) => {
    setDeleteAssetId(id)
    setDeleteAssetName(name)
  }

  const confirmDelete = () => {
    if (deleteAssetId) {
      onDelete(deleteAssetId)
      setDeleteAssetId(null)
    }
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center">
          <div>
            <CardTitle>Your Assets</CardTitle>
            <CardDescription>Manage and track all your investments</CardDescription>
          </div>
          <Button onClick={onAddAsset} variant="outline" size="sm" className="ml-auto">
            <Plus className="mr-2 h-4 w-4" />
            Add Asset
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Value (USD)</TableHead>
                <TableHead className="text-right">Yield</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No assets found. Add your first asset to get started.
                  </TableCell>
                </TableRow>
              ) : (
                assets.map((asset) => (
                  <TableRow key={asset.id}>
                    <TableCell className="font-medium">{asset.name}</TableCell>
                    <TableCell>{getAssetTypeLabel(asset.type)}</TableCell>
                    <TableCell className="text-right">{asset.value.toLocaleString('en-US', { style: 'currency', currency: asset.currency })}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end">
                        {asset.annual_yield !== undefined && (
                          <>
                            {asset.annual_yield >= 0 ? (
                              <TrendingUp className="mr-1 h-4 w-4 text-green-500" />
                            ) : (
                              <TrendingDown className="mr-1 h-4 w-4 text-red-500" />
                            )}
                            <span className={asset.annual_yield >= 0 ? "text-green-500" : "text-red-500"}>
                              {asset.annual_yield.toFixed(2)}%
                            </span>
                          </>
                        )}
                        {asset.annual_yield === undefined && <span className="text-muted-foreground">N/A</span>}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => setEditingAsset(asset)}>Edit</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600" 
                            onClick={() => handleDelete(asset.id, asset.name)}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      {editingAsset && (
        <EditAssetDialog
          asset={editingAsset}
          open={!!editingAsset}
          onOpenChange={(open) => {
            if (!open) setEditingAsset(null)
          }}
          onSave={(updatedAsset) => {
            onEdit(editingAsset.id, updatedAsset)
            setEditingAsset(null)
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteAssetId} onOpenChange={(open) => !open && setDeleteAssetId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the asset <span className="font-medium">{deleteAssetName}</span> from your portfolio.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
