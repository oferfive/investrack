import Link from "next/link"
import { BarChart3 } from "lucide-react"

export function MainNav() {
  return (
    <div className="flex gap-6 md:gap-10">
      <Link href="/" className="flex items-center space-x-2">
        <BarChart3 className="h-6 w-6" />
        <span className="hidden font-bold sm:inline-block">Portfolio Tracker</span>
      </Link>
      <nav className="flex gap-6">
        <Link href="/" className="flex items-center text-sm font-medium text-primary">
          Dashboard
        </Link>
        <Link href="#" className="flex items-center text-sm font-medium text-muted-foreground">
          Assets
        </Link>
        <Link href="#" className="flex items-center text-sm font-medium text-muted-foreground">
          Transactions
        </Link>
        <Link href="#" className="flex items-center text-sm font-medium text-muted-foreground">
          Reports
        </Link>
      </nav>
    </div>
  )
}
