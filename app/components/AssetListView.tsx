import { useState } from 'react';
import { Asset } from '@/lib/types';
import { getAssetTypeLabel } from '@/lib/utils';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { MoreHorizontal, TrendingUp, TrendingDown, ArrowUp, ArrowDown, Clock } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { useCurrencyConversion } from '@/hooks/useCurrencyConversion';

interface AssetListViewProps {
  assets: Asset[];
  onEdit: (asset: Asset) => void;
  onDelete: (id: string) => void;
}

export function AssetListView({ assets, onEdit, onDelete }: AssetListViewProps) {
  const [deleteConfirmation, setDeleteConfirmation] = useState<{id: string, name: string} | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Asset | 'recurring' | null, direction: 'asc' | 'desc' }>({ key: null, direction: 'asc' });
  const { convertToUSD } = useCurrencyConversion();

  // Sorting logic
  const sortedAssets = [...assets].sort((a, b) => {
    if (!sortConfig.key) return 0;
    let aValue: any = a[sortConfig.key as keyof Asset];
    let bValue: any = b[sortConfig.key as keyof Asset];

    // Normalize values for specific keys
    if (sortConfig.key === 'recurring') {
      aValue = a.recurring_amount && a.recurring_frequency ? a.recurring_amount + a.recurring_frequency : '';
      bValue = b.recurring_amount && b.recurring_frequency ? b.recurring_amount + b.recurring_frequency : '';
    } else if (sortConfig.key === 'value') {
      aValue = convertToUSD(a.value, a.currency);
      bValue = convertToUSD(b.value, b.currency);
    } else if (sortConfig.key === 'recurring_amount') {
      aValue = Number(aValue);
      bValue = Number(bValue);
    } else if (sortConfig.key === 'updated_at' || sortConfig.key === 'created_at') {
      aValue = aValue ? new Date(aValue).getTime() : 0;
      bValue = bValue ? new Date(bValue).getTime() : 0;
    } else if (sortConfig.key === 'risk_level') {
      // Define a custom order for risk levels
      const riskOrder = { low: 1, medium: 2, high: 3 };
      aValue = riskOrder[aValue as 'low' | 'medium' | 'high'] || 0;
      bValue = riskOrder[bValue as 'low' | 'medium' | 'high'] || 0;
    } else {
      // For strings (like ticker, managing_institution), normalize to lowercase string
      aValue = aValue ? String(aValue).toLowerCase() : '';
      bValue = bValue ? String(bValue).toLowerCase() : '';
    }

    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    // Secondary sort by value (always descending)
    if (sortConfig.key !== 'value') {
      const aVal = convertToUSD(a.value, a.currency);
      const bVal = convertToUSD(b.value, b.currency);
      if (aVal < bVal) return 1;
      if (aVal > bVal) return -1;
    }
    return 0;
  });

  const handleSort = (key: keyof Asset | 'recurring') => {
    setSortConfig(prev => {
      if (prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  // Handle deletion
  const handleDelete = (id: string, name: string) => {
    setDeleteConfirmation({ id, name });
  };

  const confirmDelete = () => {
    if (deleteConfirmation) {
      onDelete(deleteConfirmation.id);
      setDeleteConfirmation(null);
    }
  };

  // Helper to check if asset is stale (not updated in 3+ months)
  function isStaleAsset(updated_at: string): boolean {
    if (!updated_at) return false;
    const updatedDate = new Date(updated_at);
    const now = new Date();
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
    return updatedDate < threeMonthsAgo;
  }

  return (
    <TooltipProvider>
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Asset List</h2>
        <p className="text-sm text-muted-foreground mb-4">All your investment assets</p>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead onClick={() => handleSort('name')} className="cursor-pointer select-none">
                  Name {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? <ArrowUp className="inline h-3 w-3" /> : <ArrowDown className="inline h-3 w-3" />)}
                </TableHead>
                <TableHead onClick={() => handleSort('type')} className="cursor-pointer select-none">
                  Type {sortConfig.key === 'type' && (sortConfig.direction === 'asc' ? <ArrowUp className="inline h-3 w-3" /> : <ArrowDown className="inline h-3 w-3" />)}
                </TableHead>
                <TableHead onClick={() => handleSort('value')} className="cursor-pointer select-none">
                  Value {sortConfig.key === 'value' && (sortConfig.direction === 'asc' ? <ArrowUp className="inline h-3 w-3" /> : <ArrowDown className="inline h-3 w-3" />)}
                </TableHead>
                <TableHead onClick={() => handleSort('managing_institution')} className="cursor-pointer select-none">
                  Institution {sortConfig.key === 'managing_institution' && (sortConfig.direction === 'asc' ? <ArrowUp className="inline h-3 w-3" /> : <ArrowDown className="inline h-3 w-3" />)}
                </TableHead>
                <TableHead onClick={() => handleSort('ticker')} className="cursor-pointer select-none">
                  Ticker {sortConfig.key === 'ticker' && (sortConfig.direction === 'asc' ? <ArrowUp className="inline h-3 w-3" /> : <ArrowDown className="inline h-3 w-3" />)}
                </TableHead>
                <TableHead onClick={() => handleSort('updated_at')} className="cursor-pointer select-none">
                  Updated {sortConfig.key === 'updated_at' && (sortConfig.direction === 'asc' ? <ArrowUp className="inline h-3 w-3" /> : <ArrowDown className="inline h-3 w-3" />)}
                </TableHead>
                <TableHead onClick={() => handleSort('risk_level')} className="cursor-pointer select-none">
                  Risk Level {sortConfig.key === 'risk_level' && (sortConfig.direction === 'asc' ? <ArrowUp className="inline h-3 w-3" /> : <ArrowDown className="inline h-3 w-3" />)}
                </TableHead>
                <TableHead onClick={() => handleSort('recurring')} className="text-right cursor-pointer select-none">
                  Recurring {sortConfig.key === 'recurring' && (sortConfig.direction === 'asc' ? <ArrowUp className="inline h-3 w-3" /> : <ArrowDown className="inline h-3 w-3" />)}
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedAssets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No assets found. Add your first asset to get started.
                  </TableCell>
                </TableRow>
              ) : (
                sortedAssets.map(asset => (
                  <TableRow key={asset.id}>
                    <TableCell className="font-medium">{asset.name}</TableCell>
                    <TableCell>
                      {getAssetTypeLabel(asset.type)}
                    </TableCell>
                    <TableCell>
                      {asset.value.toLocaleString('en-US', { style: 'currency', currency: asset.currency, minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </TableCell>
                    <TableCell>
                      {asset.managing_institution || <span className="text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell>
                      {asset.ticker || <span className="text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell>
                      {asset.updated_at ? (
                        (() => {
                          const date = new Date(asset.updated_at);
                          const month = date.toLocaleString('en-US', { month: 'long' });
                          const year = String(date.getFullYear()).slice(-2);
                          const formatted = `${month} ${year}'`;
                          return isStaleAsset(asset.updated_at) ? (
                            <span className="inline-flex items-center">
                              {formatted}
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span><Clock className="ml-4 h-4 w-4 text-red-400 cursor-pointer" /></span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <div className="text-xs whitespace-pre-line text-center">
                                    {`It's been over 3 months
since this asset was updated`}
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </span>
                          ) : (
                            formatted
                          );
                        })()
                      ) : <span className="text-muted-foreground">N/A</span>}
                    </TableCell>
                    <TableCell>
                      <span className={`capitalize ${
                        asset.risk_level === 'high' 
                          ? 'text-red-500' 
                          : asset.risk_level === 'medium' 
                            ? 'text-yellow-500' 
                            : 'text-green-500'
                      }`}>
                        {asset.risk_level}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {asset.recurring_amount && asset.recurring_frequency ? (
                        `${asset.recurring_amount.toLocaleString('en-US', { style: 'currency', currency: asset.currency, minimumFractionDigits: 0, maximumFractionDigits: 0 })}/${asset.recurring_frequency.charAt(0).toUpperCase() + asset.recurring_frequency.slice(1)}`
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
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
                          <DropdownMenuItem onClick={() => onEdit(asset)}>
                            Edit
                          </DropdownMenuItem>
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
        </div>
      </Card>

      {/* Delete confirmation dialog */}
      <AlertDialog 
        open={deleteConfirmation !== null} 
        onOpenChange={(open) => !open && setDeleteConfirmation(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Asset</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the asset "{deleteConfirmation?.name}"? 
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
    </TooltipProvider>
  );
} 