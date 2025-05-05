import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Asset, AssetType, Currency, RiskLevel } from '@/lib/types';
import { useMemo, useState } from 'react';
import { useCurrencyConversion } from '@/hooks/useCurrencyConversion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Color mapping for different asset types
const COLOR_MAP: Record<AssetType, string> = {
  realEstate: '#10B981',  // Green
  etf: '#3B82F6',        // Blue
  bond: '#6366F1',       // Indigo
  crypto: '#8B5CF6',     // Purple
  stock: '#A855F7',      // Pink
  cash: '#F59E0B',       // Yellow
  other: '#6B7280',      // Gray
  gemel: '#DC2626',      // Red
};

// Color mapping for risk levels
const RISK_COLOR_MAP: Record<RiskLevel, string> = {
  low: '#10B981',    // Green
  medium: '#F59E0B', // Yellow
  high: '#EF4444',   // Red
};

// Color mapping for currencies
const CURRENCY_COLOR_MAP: Record<Currency, string> = {
  USD: '#3B82F6',   // Blue
  EUR: '#8B5CF6',   // Purple
  ILS: '#10B981',   // Green
  GBP: '#EF4444',   // Red
};

// Color mapping for locations
const LOCATION_COLOR_MAP: Record<string, string> = {
  'US': '#3B82F6',     // Blue
  'EU': '#8B5CF6',     // Purple
  'IL': '#10B981',     // Green
  'Other': '#6B7280',  // Gray
};

// Helper function to format labels
const formatLabel = (type: string): string => {
  switch (type) {
    case 'etf':
      return 'ETF';
    case 'realEstate':
      return 'Real Estate';
    case 'crypto':
      return 'Crypto';
    case 'stock':
      return 'Stock';
    case 'bond':
      return 'Bond';
    case 'cash':
      return 'Cash';
    case 'other':
      return 'Other';
    case 'gemel':
      return 'Gemel';
    case 'low':
      return 'Low Risk';
    case 'medium':
      return 'Medium Risk';
    case 'high':
      return 'High Risk';
    default:
      return type.charAt(0).toUpperCase() + type.slice(1);
  }
};

type BreakdownType = 'type' | 'currency' | 'risk' | 'location';

interface PortfolioBreakdownProps {
  assets: Asset[];
}

export function PortfolioBreakdown({ assets }: PortfolioBreakdownProps) {
  const [breakdownType, setBreakdownType] = useState<BreakdownType>('type');
  const { isLoading: isConverting, ratesAvailable, error: conversionError, convertToUSD } = useCurrencyConversion();

  // Calculate portfolio breakdown
  const data = useMemo(() => {
    const breakdown = assets.reduce((acc, asset) => {
      let key: string;
      let color: string;

      switch (breakdownType) {
        case 'type':
          key = asset.type;
          color = COLOR_MAP[asset.type];
          break;
        case 'currency':
          key = asset.currency;
          color = CURRENCY_COLOR_MAP[asset.currency];
          break;
        case 'risk':
          key = asset.risk_level;
          color = RISK_COLOR_MAP[asset.risk_level];
          break;
        case 'location':
          key = asset.location;
          color = LOCATION_COLOR_MAP[asset.location] || '#6B7280'; // Fallback to gray for unknown locations
          break;
      }

      if (!acc[key]) {
        acc[key] = {
          name: formatLabel(key),
          value: 0,
          color
        };
      }
      acc[key].value += convertToUSD(asset.value, asset.currency);
      return acc;
    }, {} as Record<string, { name: string; value: number; color: string }>);

    // Convert to array and calculate percentages
    const totalValue = assets.reduce((sum, asset) => sum + convertToUSD(asset.value, asset.currency), 0);
    return Object.values(breakdown).map(item => ({
      ...item,
      value: (item.value / totalValue) * 100
    }));
  }, [assets, convertToUSD, breakdownType]);

  if (assets.length === 0) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center text-muted-foreground">
        No assets to display
      </div>
    );
  }

  if (isConverting || !ratesAvailable) {
    return <div className="w-full h-[400px] flex items-center justify-center animate-pulse">Loading breakdown...</div>;
  }

  return (
    <div className="w-full h-full space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Portfolio Breakdown</h2>
        <Select value={breakdownType} onValueChange={(value) => setBreakdownType(value as BreakdownType)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select breakdown type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="type">By Asset Type</SelectItem>
            <SelectItem value="currency">By Currency</SelectItem>
            <SelectItem value="risk">By Risk Level</SelectItem>
            <SelectItem value="location">By Location</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {conversionError && <div className="text-red-500">{conversionError}</div>}
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={true}
            label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
            outerRadius={150}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => `${value.toFixed(1)}%`}
          />
          <Legend 
            layout="vertical" 
            align="right"
            verticalAlign="middle"
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
} 