"use client"

import { Button } from "@/components/ui/button"
import { Upload, Plus } from "lucide-react"

interface DashboardHeaderProps {
  heading: string
  text?: string
  onAddAsset: () => void
  onUploadStatement: () => void
}

export function DashboardHeader({ heading, text, onAddAsset, onUploadStatement }: DashboardHeaderProps) {
  return (
    <div className="flex items-center justify-between px-2">
      <div className="grid gap-1">
        <h1 className="text-2xl font-bold tracking-tight">{heading}</h1>
        {text && <p className="text-muted-foreground">{text}</p>}
      </div>
      <div className="flex items-center gap-2">
        <Button onClick={onUploadStatement} variant="outline" size="sm">
          <Upload className="mr-2 h-4 w-4" />
          Upload Statement
        </Button>
        <Button onClick={onAddAsset} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Asset
        </Button>
      </div>
    </div>
  )
}
