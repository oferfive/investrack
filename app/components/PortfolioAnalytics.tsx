import { Asset } from '@/lib/types';
import { Card } from "@/components/ui/card"
import { ArrowDown, ArrowUp, AlertTriangle, Wallet } from 'lucide-react';
import { useCurrencyConversion } from '@/hooks/useCurrencyConversion';

interface PortfolioAnalyticsProps {
  assets: Asset[];
}

export function PortfolioAnalytics({ assets }: PortfolioAnalyticsProps) {
  const { isLoading: isConverting, ratesAvailable, error: conversionError, convertToUSD } = useCurrencyConversion();

  if (assets.length === 0) return null;

  if (isConverting || !ratesAvailable) {
    return <div className="p-4 text-center animate-pulse">Loading analytics...</div>;
  }

  // Calculate insights
  const totalValue = assets.reduce((sum, asset) => {
    return sum + convertToUSD(asset.value, asset.currency);
  }, 0);
  
  const riskBreakdown = assets.reduce((acc, asset) => {
    const value = convertToUSD(asset.value, asset.currency);
    acc[asset.risk_level] = (acc[asset.risk_level] || 0) + value;
    return acc;
  }, {} as Record<string, number>);

  const highRiskPercentage = ((riskBreakdown.high || 0) / totalValue) * 100;
  
  const topAssets = [...assets]
    .sort((a, b) => convertToUSD(b.value, b.currency) - convertToUSD(a.value, a.currency))
    .slice(0, 3);

  const lowestYieldAsset = assets
    .filter(asset => asset.annual_yield !== undefined)
    .reduce((min, asset) => 
      !min || (asset.annual_yield || 0) < (min.annual_yield || 0) ? asset : min
    , assets[0]);

  const highestYieldAsset = assets
    .filter(asset => asset.annual_yield !== undefined)
    .reduce((max, asset) => 
      !max || (asset.annual_yield || 0) > (max.annual_yield || 0) ? asset : max
    , assets[0]);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Portfolio Insights</h3>
      {conversionError && <div className="text-red-500">{conversionError}</div>}
      <div className="grid grid-cols-1 gap-4">
        {/* Risk Warning */}
        {highRiskPercentage > 30 && (
          <Card className="p-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-700 dark:text-yellow-300">High Risk Exposure</h4>
                <p className="text-sm text-yellow-600 dark:text-yellow-400">
                  {highRiskPercentage.toFixed(1)}% of your portfolio is in high-risk assets. 
                  Consider diversifying to reduce risk.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Top Holdings */}
        <Card className="p-4">
          <div className="flex items-start gap-3">
            <Wallet className="h-5 w-5 text-blue-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100">Top Holdings</h4>
              <div className="mt-2 space-y-2">
                {topAssets.map(asset => (
                  <div key={asset.id} className="flex justify-between text-sm gap-x-4">
                    <span className="text-gray-600 dark:text-gray-400">{asset.name}</span>
                    <span className="font-medium">
                      {convertToUSD(asset.value, asset.currency).toLocaleString('en-US', { 
                        style: 'currency', 
                        currency: 'USD',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0
                      })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Yield Analysis */}
        <Card className="p-4">
          <div className="space-y-4">
            {/* Best Performing */}
            <div className="flex items-start gap-3">
              <ArrowUp className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100">Best Performing</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {highestYieldAsset.name}: {typeof highestYieldAsset.annual_yield === 'number' ? highestYieldAsset.annual_yield.toFixed(2) : 'N/A'}% annual yield
                </p>
              </div>
            </div>

            {/* Worst Performing */}
            <div className="flex items-start gap-3">
              <ArrowDown className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100">Needs Attention</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {lowestYieldAsset.name}: {typeof lowestYieldAsset.annual_yield === 'number' ? lowestYieldAsset.annual_yield.toFixed(2) : 'N/A'}% annual yield
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
} 