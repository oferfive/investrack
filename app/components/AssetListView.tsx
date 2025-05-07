import { useState } from 'react';
import { Asset } from '@/lib/types';
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
import { MoreHorizontal, TrendingUp, TrendingDown } from 'lucide-react';

interface AssetListViewProps {
  assets: Asset[];
  onEdit: (asset: Asset) => void;
  onDelete: (id: string) => void;
}

export function AssetListView({ assets, onEdit, onDelete }: AssetListViewProps) {
  const [deleteConfirmation, setDeleteConfirmation] = useState<{id: string, name: string} | null>(null);

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

  return (
    <>
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Asset List</h2>
        <p className="text-sm text-muted-foreground mb-4">All your investment assets</p>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Value</TableHead>
                <TableHead className="text-right">Annual Yield</TableHead>
                <TableHead>Risk Level</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No assets found. Add your first asset to get started.
                  </TableCell>
                </TableRow>
              ) : (
                assets.map(asset => (
                  <TableRow key={asset.id}>
                    <TableCell className="font-medium">{asset.name}</TableCell>
                    <TableCell>
                      {asset.type.charAt(0).toUpperCase() + asset.type.slice(1)}
                    </TableCell>
                    <TableCell>
                      {asset.value.toLocaleString('en-US', { style: 'currency', currency: asset.currency, minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </TableCell>
                    <TableCell>
                      {asset.annual_yield !== undefined && asset.annual_yield !== null ? (
                        <div className="flex items-center">
                          {asset.annual_yield >= 0 ? (
                            <TrendingUp className="mr-1 h-4 w-4 text-green-500" />
                          ) : (
                            <TrendingDown className="mr-1 h-4 w-4 text-red-500" />
                          )}
                          <span className={asset.annual_yield >= 0 ? 'text-green-500' : 'text-red-500'}>
                            {typeof asset.annual_yield === 'number' ? asset.annual_yield.toFixed(2) : 'N/A'}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">N/A</span>
                      )}
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
    </>
  );
} 