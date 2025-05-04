import { AssetType, Currency, RiskLevel } from '@/lib/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface PortfolioFiltersProps {
  filters: {
    assetType: AssetType | 'all';
    currency: Currency | 'all';
    riskLevel: RiskLevel | 'all';
    location: string | 'all';
  };
  onFilterChange: (key: string, value: string) => void;
  onResetFilters: () => void;
}

export function PortfolioFilters({ filters, onFilterChange, onResetFilters }: PortfolioFiltersProps) {
  const assetTypes: Array<AssetType | 'all'> = ['all', 'stock', 'etf', 'realEstate', 'cash', 'crypto', 'bond', 'other'];
  const currencies: Array<Currency | 'all'> = ['all', 'USD', 'EUR', 'ILS', 'GBP'];
  const riskLevels: Array<RiskLevel | 'all'> = ['all', 'low', 'medium', 'high'];
  const locations: Array<string | 'all'> = ['all', 'US', 'EU', 'Israel', 'UK', 'Asia', 'Other'];

  const formatLabel = (str: string) => {
    if (str === 'all') return 'All';
    if (str === 'realEstate') return 'Real Estate';
    if (str === 'etf') return 'ETF';
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const hasActiveFilters = filters.assetType !== 'all' || filters.currency !== 'all' || filters.riskLevel !== 'all' || filters.location !== 'all';

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Asset Type</Label>
          <Select
            value={filters.assetType}
            onValueChange={(value) => onFilterChange('assetType', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select asset type" />
            </SelectTrigger>
            <SelectContent>
              {assetTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {formatLabel(type)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Currency</Label>
          <Select
            value={filters.currency}
            onValueChange={(value) => onFilterChange('currency', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              {currencies.map((currency) => (
                <SelectItem key={currency} value={currency}>
                  {formatLabel(currency)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Risk Level</Label>
          <Select
            value={filters.riskLevel}
            onValueChange={(value) => onFilterChange('riskLevel', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select risk level" />
            </SelectTrigger>
            <SelectContent>
              {riskLevels.map((level) => (
                <SelectItem key={level} value={level}>
                  {formatLabel(level)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Location</Label>
          <Select
            value={filters.location}
            onValueChange={(value) => onFilterChange('location', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent>
              {locations.map((location) => (
                <SelectItem key={location} value={location}>
                  {formatLabel(location)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {hasActiveFilters && (
        <Button
          variant="outline"
          className="w-full flex items-center gap-2"
          onClick={onResetFilters}
        >
          <X className="h-4 w-4" />
          Reset Filters
        </Button>
      )}
    </div>
  );
} 