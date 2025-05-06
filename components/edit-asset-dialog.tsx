"use client"

import { useState } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import type { Asset } from "@/lib/types"

const assetFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["stock", "etf", "realEstate", "cash", "crypto", "bond", "other", "gemel", "kaspit"]),
  ticker: z.string().optional(),
  value: z.coerce.number().min(0, "Value must be positive"),
  currency: z.enum(["USD", "EUR", "ILS", "GBP"]),
  location: z.string().min(1, "Location is required"),
  risk_level: z.enum(["low", "medium", "high"]),
  annual_yield: z.coerce.number().optional(),
  has_recurring_contribution: z.boolean().default(false),
  recurring_amount: z.coerce.number().optional(),
  recurring_frequency: z.enum(["weekly", "monthly", "quarterly", "annually"]).optional(),
  notes: z.string().optional(),
})

type AssetFormValues = z.infer<typeof assetFormSchema>

interface EditAssetDialogProps {
  asset: Asset
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (asset: Partial<Asset>) => void
}

export function EditAssetDialog({ asset, open, onOpenChange, onSave }: EditAssetDialogProps) {
  const [hasRecurring, setHasRecurring] = useState(asset.has_recurring_contribution || false)

  const form = useForm<AssetFormValues>({
    resolver: zodResolver(assetFormSchema),
    defaultValues: {
      name: asset.name,
      type: asset.type,
      ticker: asset.ticker || "",
      value: asset.value,
      currency: asset.currency,
      location: asset.location,
      risk_level: asset.risk_level,
      annual_yield: asset.annual_yield,
      has_recurring_contribution: asset.has_recurring_contribution || false,
      recurring_amount: asset.recurring_amount,
      recurring_frequency: asset.recurring_frequency,
      notes: asset.notes || "",
    },
  })

  function onSubmit(data: AssetFormValues) {
    console.log("Form submitted with data:", data);
    
    // Create updated asset object with all necessary fields
    const updatedAsset: Partial<Asset> = {
      name: data.name,
      type: data.type,
      ticker: data.ticker,
      value: Number(data.value),
      currency: data.currency,
      location: data.location,
      risk_level: data.risk_level,
      annual_yield: data.annual_yield,
      has_recurring_contribution: data.has_recurring_contribution,
      recurring_amount: data.recurring_amount,
      recurring_frequency: data.recurring_frequency,
      notes: data.notes,
      updated_at: new Date().toISOString(),
    };

    console.log("Calling onSave with updated asset:", updatedAsset);
    
    // Call the onSave callback with the updated asset data
    onSave(updatedAsset);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Asset</DialogTitle>
          <DialogDescription>Update the details of your investment</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Asset Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Apple Inc. or Downtown Apartment" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Asset Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="etf">ETF</SelectItem>
                          <SelectItem value="realEstate">Real Estate</SelectItem>
                          <SelectItem value="kaspit">Money Market Fund (Kaspit)</SelectItem>
                          <SelectItem value="gemel">Gemel</SelectItem>
                          <SelectItem value="stock">Stock</SelectItem>
                          <SelectItem value="bond">Bond</SelectItem>
                          <SelectItem value="crypto">Cryptocurrency</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ticker"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ticker Symbol (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., AAPL" {...field} />
                      </FormControl>
                      <FormDescription>For stocks, ETFs, etc.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Value (USD)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="ILS">ILS</SelectItem>
                          <SelectItem value="GBP">GBP</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location/Country</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., US, EU, Global" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="risk_level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Risk Level</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select risk level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="annual_yield"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Annual Yield % (optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 5.25" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="has_recurring_contribution"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 col-span-2">
                      <div className="space-y-0.5">
                        <FormLabel>Recurring Contribution</FormLabel>
                        <FormDescription>Do you regularly add to this investment?</FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            field.onChange(checked)
                            setHasRecurring(checked)
                          }}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {hasRecurring && (
                  <>
                    <FormField
                      control={form.control}
                      name="recurring_amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Recurring Amount</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="recurring_frequency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Frequency</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select frequency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                              <SelectItem value="quarterly">Quarterly</SelectItem>
                              <SelectItem value="annually">Annually</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Notes (optional)</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button 
                  type="button" 
                  onClick={() => {
                    console.log("Manual save button clicked");
                    const values = form.getValues();
                    console.log("Form values:", values);
                    
                    // Create updated asset object with all necessary fields
                    const updatedAsset: Partial<Asset> = {
                      id: asset.id,
                      name: values.name,
                      type: values.type,
                      ticker: values.ticker,
                      value: Number(values.value),
                      currency: values.currency,
                      location: values.location,
                      risk_level: values.risk_level,
                      annual_yield: values.annual_yield,
                      has_recurring_contribution: values.has_recurring_contribution,
                      recurring_amount: values.recurring_amount,
                      recurring_frequency: values.recurring_frequency,
                      notes: values.notes,
                      updated_at: new Date().toISOString(),
                    };
                    
                    console.log("Calling onSave with updated asset:", updatedAsset);
                    onSave(updatedAsset);
                  }}
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
