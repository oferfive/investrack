"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { PieChart, Pie, Cell } from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Asset, AssetType, Currency, RiskLevel } from "@/lib/types"
import { getAssetTypeColor, getRiskLevelColor, getAssetTypeLabel } from "@/lib/utils"

interface AssetBreakdownProps {
  assets: Asset[]
  filters: {
    assetType: AssetType | "all"
    currency: Currency | "all"
    riskLevel: RiskLevel | "all"
    location: string | "all"
  }
  setFilters: React.Dispatch<
    React.SetStateAction<{
      assetType: AssetType | "all"
      currency: Currency | "all"
      riskLevel: RiskLevel | "all"
      location: string | "all"
    }>
  >
}

export function AssetBreakdown({ assets, filters, setFilters }: AssetBreakdownProps) {
  // Prepare data for asset type breakdown
  const assetTypeData = assets.reduce(
    (acc, asset) => {
      const existingType = acc.find((item) => item.name === asset.type)
      if (existingType) {
        existingType.value += asset.value
      } else {
        acc.push({
          name: asset.type,
          value: asset.value,
        })
      }
      return acc
    },
    [] as { name: string; value: number }[],
  )

  // Prepare data for risk level breakdown
  const riskLevelData = assets.reduce(
    (acc, asset) => {
      const existingRisk = acc.find((item) => item.name === asset.risk_level)
      if (existingRisk) {
        existingRisk.value += asset.value
      } else {
        acc.push({
          name: asset.risk_level,
          value: asset.value,
        })
      }
      return acc
    },
    [] as { name: string; value: number }[],
  )

  // Prepare data for managing institution breakdown
  const managingInstitutionData = assets.reduce(
    (acc, asset) => {
      const institution = asset.managing_institution || 'Unspecified';
      const existingInstitution = acc.find((item) => item.name === institution);
      if (existingInstitution) {
        existingInstitution.value += asset.value;
      } else {
        acc.push({
          name: institution,
          value: asset.value,
        });
      }
      return acc;
    },
    [] as { name: string; value: number }[],
  );

  // Get unique locations
  const locations = [...new Set(assets.map((asset) => asset.location))]

  return (
    <>
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Portfolio Breakdown</CardTitle>
          <CardDescription>View your portfolio allocation by different criteria</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="type">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="type">By Type</TabsTrigger>
              <TabsTrigger value="risk">By Risk</TabsTrigger>
              <TabsTrigger value="institution">By Institution</TabsTrigger>
            </TabsList>
            <TabsContent value="type" className="space-y-4">
              <div className="h-[300px]">
                <ChartContainer
                  config={assetTypeData.reduce(
                    (config, item) => {
                      config[item.name] = {
                        label: getAssetTypeLabel(item.name as AssetType),
                        color: getAssetTypeColor(item.name as AssetType),
                      }
                      return config
                    },
                    {} as Record<string, { label: string; color: string }>,
                  )}
                >
                  <PieChart className="h-full w-full">
                    <Pie
                      data={assetTypeData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {assetTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={`var(--color-${entry.name})`} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ChartContainer>
              </div>
            </TabsContent>
            <TabsContent value="risk" className="space-y-4">
              <div className="h-[300px]">
                <ChartContainer
                  config={riskLevelData.reduce(
                    (config, item) => {
                      config[item.name] = {
                        label: item.name.charAt(0).toUpperCase() + item.name.slice(1),
                        color: getRiskLevelColor(item.name as RiskLevel),
                      }
                      return config
                    },
                    {} as Record<string, { label: string; color: string }>,
                  )}
                >
                  <PieChart className="h-full w-full">
                    <Pie
                      data={riskLevelData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {riskLevelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={`var(--color-${entry.name})`} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ChartContainer>
              </div>
            </TabsContent>
            <TabsContent value="institution" className="space-y-4">
              <div className="h-[300px]">
                <ChartContainer
                  config={managingInstitutionData.reduce(
                    (config, item) => {
                      config[item.name] = {
                        label: item.name,
                        color: `hsl(${Math.random() * 360}, 70%, 50%)`,
                      }
                      return config
                    },
                    {} as Record<string, { label: string; color: string }>,
                  )}
                >
                  <PieChart className="h-full w-full">
                    <Pie
                      data={managingInstitutionData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {managingInstitutionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={`var(--color-${entry.name})`} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ChartContainer>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter your portfolio view</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Asset Type</label>
            <Select
              value={filters.assetType}
              onValueChange={(value) => setFilters({ ...filters, assetType: value as AssetType | "all" })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Asset Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Asset Types</SelectItem>
                <SelectItem value="stock">Stocks</SelectItem>
                <SelectItem value="etf">ETFs</SelectItem>
                <SelectItem value="realEstate">Real Estate</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="crypto">Crypto</SelectItem>
                <SelectItem value="bond">Bonds</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Risk Level</label>
            <Select
              value={filters.riskLevel}
              onValueChange={(value) => setFilters({ ...filters, riskLevel: value as RiskLevel | "all" })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Risk Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risk Levels</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Location</label>
            <Select
              value={filters.location}
              onValueChange={(value) => setFilters({ ...filters, location: value as string | "all" })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {locations.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
