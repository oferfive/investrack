"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Asset, AssetType, Currency, RiskLevel } from "@/lib/types"
import { Upload, Check, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface UploadStatementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImportAssets: (assets: Asset[]) => void
}

export function UploadStatementDialog({ open, onOpenChange, onImportAssets }: UploadStatementDialogProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setUploadStatus("idle")
      setErrorMessage("")
    }
  }

  const handleUpload = () => {
    if (!file) return

    setUploading(true)
    setUploadStatus("idle")
    setErrorMessage("")

    // Simulate file processing
    setTimeout(() => {
      try {
        // In a real app, this would parse the CSV/PDF and extract asset data
        const mockAssets: Asset[] = [
          {
            id: `import-${Date.now()}-1`,
            name: `${file.name.split(".")[0]} Stock`,
            type: "stock" as AssetType,
            value_usd: 10000 + Math.random() * 5000,
            original_value: 9000 + Math.random() * 1000,
            currency: "USD" as Currency,
            location: "US",
            risk_level: "medium" as RiskLevel,
            annual_yield: 5 + Math.random() * 3,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: `import-${Date.now()}-2`,
            name: `${file.name.split(".")[0]} ETF`,
            type: "etf" as AssetType,
            value_usd: 5000 + Math.random() * 2000,
            original_value: 4500 + Math.random() * 500,
            currency: "USD" as Currency,
            location: "Global",
            risk_level: "low" as RiskLevel,
            annual_yield: 3 + Math.random() * 2,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ]

        setUploadStatus("success")
        onImportAssets(mockAssets)
      } catch (error) {
        setUploadStatus("error")
        setErrorMessage("Failed to parse the statement. Please check the file format.")
      } finally {
        setUploading(false)
      }
    }, 1500)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Statement</DialogTitle>
          <DialogDescription>
            Upload your investment statement to automatically import your assets.
            We support CSV and PDF formats.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="statement">Statement File</Label>
            <Input
              id="statement"
              type="file"
              accept=".csv,.pdf"
              onChange={handleFileChange}
              disabled={uploading}
            />
          </div>
          {uploadStatus === "success" && (
            <Alert>
              <Check className="h-4 w-4" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>
                Your statement has been processed and assets have been imported.
              </AlertDescription>
            </Alert>
          )}
          {uploadStatus === "error" && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={!file || uploading}>
            {uploading ? (
              <>
                <Upload className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
