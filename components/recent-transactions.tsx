import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Asset } from "@/lib/types"
import { formatCurrency, formatDate } from "@/lib/utils"
import { ArrowDownRight, ArrowUpRight } from "lucide-react"

interface RecentTransactionsProps {
  assets: Asset[]
}

// Mock transactions based on assets
const generateMockTransactions = (assets: Asset[]) => {
  const transactions = []
  const now = new Date()

  for (let i = 0; i < Math.min(5, assets.length); i++) {
    const asset = assets[i]
    const date = new Date(now)
    date.setDate(date.getDate() - i * 3)

    transactions.push({
      id: `tx-${i}`,
      assetId: asset.id,
      assetName: asset.name,
      type: i % 2 === 0 ? "buy" : "income",
      amount: i % 2 === 0 ? asset.valueUSD * 0.05 : asset.valueUSD * 0.01,
      date: date.toISOString(),
    })
  }

  return transactions
}

export function RecentTransactions({ assets }: RecentTransactionsProps) {
  const transactions = generateMockTransactions(assets)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>Your latest investment activities</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {transactions.length === 0 ? (
            <div className="text-center text-muted-foreground">No recent transactions found.</div>
          ) : (
            transactions.map((transaction) => (
              <div className="flex items-center" key={transaction.id}>
                <div className={`mr-4 rounded-full p-2 ${transaction.type === "buy" ? "bg-blue-100" : "bg-green-100"}`}>
                  {transaction.type === "buy" ? (
                    <ArrowDownRight
                      className={`h-4 w-4 ${transaction.type === "buy" ? "text-blue-500" : "text-green-500"}`}
                    />
                  ) : (
                    <ArrowUpRight
                      className={`h-4 w-4 ${transaction.type === "buy" ? "text-blue-500" : "text-green-500"}`}
                    />
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {transaction.type === "buy" ? "Purchased" : "Income from"} {transaction.assetName}
                  </p>
                  <p className="text-xs text-muted-foreground">{formatDate(transaction.date)}</p>
                </div>
                <div className={`${transaction.type === "buy" ? "text-blue-500" : "text-green-500"}`}>
                  {transaction.type === "buy" ? "-" : "+"}
                  {formatCurrency(transaction.amount)}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
