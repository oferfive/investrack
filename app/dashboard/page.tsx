'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/lib/auth-context';
import ProtectedRoute from '@/components/ProtectedRoute';
import AddAssetForm from '@/components/AddAssetForm';
import { supabase } from '@/lib/supabase';
import { Asset, AssetType, Currency, RiskLevel } from '@/lib/types';
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowUpDown, Upload, Plus, Download } from "lucide-react"
import { PortfolioBreakdown } from "@/app/components/PortfolioBreakdown"
import { PortfolioFilters } from "@/app/components/PortfolioFilters"
import { PortfolioAnalytics } from "@/app/components/PortfolioAnalytics"
import { AssetListView } from "@/app/components/AssetListView"
import { EditAssetDialog } from "@/components/edit-asset-dialog"
import { useCurrencyConversion } from '@/hooks/useCurrencyConversion';
import { UserNav } from "@/components/user-nav"
import { useRouter } from 'next/navigation';

function DashboardContent() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [breakdownType, setBreakdownType] = useState<'type' | 'currency' | 'risk' | 'location'>('type');

  const { isLoading: isConverting, ratesAvailable, error: conversionError, convertAssetsToUSD } = useCurrencyConversion();

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  const fetchAssets = async () => {
    try {
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAssets(data || []);
    } catch (error) {
      console.error('Error fetching assets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssetAdded = () => {
    setShowAddForm(false);
    fetchAssets();
  };

  const handleExportData = () => {
    const csvContent = [
      // CSV Headers
      ['Name', 'Type', 'Value (USD)', 'Original Value', 'Currency', 'Risk Level', 'Annual Yield', 'Location'],
      // CSV Data
      ...assets.map(asset => [
        asset.name,
        asset.type,
        asset.value,
        asset.currency,
        asset.risk_level,
        asset.annual_yield || '',
        asset.location
      ])
    ]
    .map(row => row.join(','))
    .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'portfolio_data.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculate total value and average yield
  const { totalValue, averageYield } = useMemo(() => {
    if (assets.length === 0) return { totalValue: 0, averageYield: 0 };

    // Convert all assets to USD for total value calculation
    const total = convertAssetsToUSD(assets.map(asset => ({
      amount: asset.value,
      currency: asset.currency
    })));

    const weightedYield = assets.reduce((sum, asset) => {
      const weight = asset.value / total;
      return sum + (asset.annual_yield || 0) * weight;
    }, 0);

    return {
      totalValue: total,
      averageYield: weightedYield
    };
  }, [assets, convertAssetsToUSD]);

  // Handle edit asset
  const handleEditAsset = (asset: Asset) => {
    console.log("Opening edit dialog for asset:", asset);
    setEditingAsset(asset);
  };

  // Handle update asset
  const handleUpdateAsset = async (updatedAsset: Partial<Asset>) => {
    if (!editingAsset) {
      console.error("No asset being edited");
      return;
    }
    
    try {
      const assetToUpdate = {
        name: updatedAsset.name,
        type: updatedAsset.type,
        value: updatedAsset.value,
        currency: updatedAsset.currency,
        location: updatedAsset.location,
        risk_level: updatedAsset.risk_level,
        annual_yield: updatedAsset.annual_yield,
        has_recurring_contribution: updatedAsset.has_recurring_contribution || false,
        recurring_amount: updatedAsset.recurring_amount || 0,
        recurring_frequency: updatedAsset.recurring_frequency,
        notes: updatedAsset.notes || "",
        updated_at: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from('assets')
        .update(assetToUpdate)
        .eq('id', editingAsset.id);

      if (error) {
        console.error("Error updating asset:", error);
        throw error;
      }
      
      setAssets(assets.map(asset => 
        asset.id === editingAsset.id ? { ...asset, ...updatedAsset } : asset
      ));
      setEditingAsset(null);
    } catch (error) {
      console.error('Error updating asset:', error);
    }
  };

  // Handle delete asset
  const handleDeleteAsset = async (id: string) => {
    try {
      const { error } = await supabase
        .from('assets')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Refresh the assets list
      fetchAssets();
    } catch (error) {
      console.error('Error deleting asset:', error);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Portfolio Dashboard</h1>
          <p className="text-muted-foreground">Track and manage all your investments in one place.</p>
        </div>
        <div className="flex gap-2 items-center">
          <UserNav user={user} onLogout={handleLogout} />
          <div className="w-0.5" />
          <Button variant="outline" className="flex items-center gap-2" onClick={handleExportData}>
            <Download className="h-4 w-4" />
            Export Data
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload Statement
          </Button>
          <Button className="flex items-center gap-2" onClick={() => setShowAddForm(true)}>
            <Plus className="h-4 w-4" />
            Add Asset
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">Total Portfolio Value</span>
            <div className="flex items-baseline gap-2">
              {isConverting || !ratesAvailable ? (
                <span className="text-2xl font-bold animate-pulse">Loading...</span>
              ) : (
                <span className="text-2xl font-bold">
                  {totalValue.toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'USD'
                  })}
                </span>
              )}
              <span className="text-xs text-muted-foreground">USD</span>
            </div>
            <span className="text-xs text-muted-foreground">
              {isConverting || !ratesAvailable ? 'Converting currencies...' : 'Consolidated value in USD'}
              {conversionError && <span className="text-red-500"> ({conversionError})</span>}
            </span>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">Average Annual Yield</span>
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-bold ${averageYield >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {averageYield.toFixed(2)}%
              </span>
              <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
            </div>
            <span className="text-xs text-muted-foreground">Weighted average across all assets</span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">Monthly Update</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">7 days</span>
            </div>
            <span className="text-xs text-muted-foreground">Until your next portfolio review</span>
          </div>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Portfolio Breakdown and Analytics - full width */}
        <div className="col-span-1 lg:col-span-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Portfolio Breakdown */}
            <div className="lg:col-span-2">
              <Card className="p-6">
                {isLoading ? (
                  <div className="h-[400px] flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <PortfolioBreakdown assets={assets} />
                )}
              </Card>
            </div>
            {/* Analytics */}
            <div className="lg:col-span-1">
              <Card className="p-6 h-full">
                {isLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <PortfolioAnalytics assets={assets} />
                )}
              </Card>
            </div>
          </div>
        </div>
        {/* Asset List - full width */}
        <div className="col-span-1 lg:col-span-4 mt-6">
          <AssetListView 
            assets={assets} 
            onEdit={handleEditAsset} 
            onDelete={handleDeleteAsset} 
          />
        </div>
      </div>

      {/* Add Asset Form Overlay */}
      {showAddForm && (
        <>
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] transition-all duration-300 ease-in-out z-40" 
            onClick={() => setShowAddForm(false)}
            style={{ opacity: showAddForm ? 1 : 0 }}
          />
          <AddAssetForm 
            onSuccess={handleAssetAdded} 
            onClose={() => setShowAddForm(false)}
          />
        </>
      )}
      
      {/* Edit Asset Dialog */}
      {editingAsset && (
        <EditAssetDialog
          asset={editingAsset}
          open={!!editingAsset}
          onOpenChange={(open) => {
            if (!open) setEditingAsset(null);
          }}
          onSave={handleUpdateAsset}
        />
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
} 