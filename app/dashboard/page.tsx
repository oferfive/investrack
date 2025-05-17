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
import { useCurrency } from '@/lib/currency-context';
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { AuthGuard } from '@/components/auth-guard';

function DashboardContent() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const { selectedCurrency, setSelectedCurrency } = useCurrency();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [breakdownType, setBreakdownType] = useState<'type' | 'currency' | 'risk' | 'location'>('type');
  const [includeRealEstate, setIncludeRealEstate] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('includeRealEstate');
      return stored === null ? true : stored === 'true';
    }
    return true;
  });

  const { isLoading: isConverting, ratesAvailable, error: conversionError, convertAssetsToCurrency } = useCurrencyConversion();

  useEffect(() => {
    fetchAssets();
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('includeRealEstate', includeRealEstate.toString());
    }
  }, [includeRealEstate]);

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  const fetchAssets = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error('No authenticated user found');
        return;
      }

      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('user_id', user.id)
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

  const handleExportData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error('No authenticated user found');
        return;
      }

      // Fetch assets again to ensure we have the latest data
      const { data: exportData, error } = await supabase
        .from('assets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const csvContent = [
        // CSV Headers
        ['Name', 'Type', 'Value (USD)', 'Original Value', 'Currency', 'Risk Level', 'Annual Yield', 'Location'],
        // CSV Data
        ...(exportData || []).map(asset => [
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
      link.download = `portfolio_data_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  // Filter assets based on includeRealEstate toggle
  const filteredAssets = includeRealEstate
    ? assets
    : assets.filter(asset => asset.type !== 'realEstate');

  // Calculate total value and average yield
  const { totalValue, averageYield } = useMemo(() => {
    if (filteredAssets.length === 0) return { totalValue: 0, averageYield: 0 };

    // Convert all assets to selected currency for total value calculation
    const total = convertAssetsToCurrency(filteredAssets.map(asset => ({
      amount: asset.value,
      currency: asset.currency
    })), selectedCurrency);

    const weightedYield = filteredAssets.reduce((sum, asset) => {
      const weight = asset.value / total;
      return sum + (asset.annual_yield || 0) * weight;
    }, 0);

    return {
      totalValue: total,
      averageYield: weightedYield
    };
  }, [filteredAssets, convertAssetsToCurrency, selectedCurrency]);

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
        managing_institution: updatedAsset.managing_institution || "",
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
    <div className="container mx-auto p-4 sm:p-6 space-y-6 relative">
      {/* User Avatar - Top Right on Mobile */}
      <div className="block sm:hidden absolute top-4 right-4 z-20">
        <UserNav user={user} onLogout={handleLogout} />
      </div>
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Portfolio Dashboard</h1>
          <p className="text-muted-foreground">Track and manage all your investments in one place.</p>
        </div>
        {/* Hide avatar in top bar on mobile */}
        <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center w-full sm:w-auto">
          <div className="hidden sm:block">
            <UserNav user={user} onLogout={handleLogout} />
          </div>
          <div className="w-full h-0.5 sm:w-0.5 sm:h-auto bg-border sm:bg-transparent my-2 sm:my-0" />
          <Button variant="outline" className="flex items-center gap-2 w-full sm:w-auto" onClick={handleExportData}>
            <Download className="h-4 w-4" />
            Export Data
          </Button>
          <Button variant="outline" className="flex items-center gap-2 w-full sm:w-auto">
            <Upload className="h-4 w-4" />
            Upload Statement
          </Button>
          <Button className="flex items-center gap-2 w-full sm:w-auto" onClick={() => setShowAddForm(true)}>
            <Plus className="h-4 w-4" />
            Add Asset
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start mb-2">
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Total Portfolio Value</span>
              <div className="flex items-baseline gap-2">
                {isConverting || !ratesAvailable ? (
                  <span className="text-2xl font-bold animate-pulse">Loading...</span>
                ) : (
                  <span className="text-2xl font-bold">
                    {totalValue.toLocaleString('en-US', {
                      style: 'currency',
                      currency: selectedCurrency,
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0
                    })}
                  </span>
                )}
                <span className="text-xs text-muted-foreground">{selectedCurrency}</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {isConverting || !ratesAvailable ? 'Converting currencies...' : ``}
                {conversionError && <span className="text-red-500"> ({conversionError})</span>}
              </span>
            </div>
            <div className="flex flex-col gap-2 w-full sm:w-auto mt-2 sm:mt-0">
              <div className="flex flex-row items-center space-x-2 justify-start sm:justify-end">
                <Label htmlFor="currency-toggle" className="text-xs">USD</Label>
                <Switch
                  id="currency-toggle"
                  checked={selectedCurrency === 'ILS'}
                  onCheckedChange={(checked) => setSelectedCurrency(checked ? 'ILS' : 'USD')}
                />
                <Label htmlFor="currency-toggle" className="text-xs">ILS</Label>
              </div>
              <div className="flex flex-row items-center space-x-2 justify-start sm:justify-end">
                <input
                  type="checkbox"
                  id="exclude-real-estate"
                  checked={includeRealEstate}
                  onChange={e => setIncludeRealEstate(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 accent-primary"
                />
                <label htmlFor="exclude-real-estate" className="text-xs text-muted-foreground select-none cursor-pointer break-words">
                  Include Real Estate
                </label>
              </div>
            </div>
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
              <Card className="p-4 sm:p-6">
                <div className="w-full flex justify-center items-center overflow-x-auto sm:overflow-x-visible">
                  {isLoading ? (
                    <div className="h-[300px] sm:h-[400px] flex items-center justify-center w-full">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <PortfolioBreakdown assets={filteredAssets} />
                  )}
                </div>
              </Card>
            </div>
            {/* Analytics */}
            <div className="lg:col-span-1">
              <Card className="p-4 sm:p-6 h-full">
                {isLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <PortfolioAnalytics assets={filteredAssets} />
                )}
              </Card>
            </div>
          </div>
        </div>
        {/* Asset List - full width */}
        <div className="col-span-1 lg:col-span-4 mt-6">
          <AssetListView 
            assets={filteredAssets} 
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
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
} 