import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User } from "@supabase/supabase-js"

interface UserNavProps {
  user: User | null;
  onLogout: () => Promise<void>;
}

export function UserNav({ user, onLogout }: UserNavProps) {
  const userInitials = user?.email?.substring(0, 2).toUpperCase() || "JD";
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || "John Doe";
  const userEmail = user?.email || "john.doe@example.com";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="h-10 w-10 p-0 rounded-full border border-input bg-background hover:bg-accent hover:text-accent-foreground focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring !outline-none !shadow-none flex items-center justify-center">
        <Avatar className="h-8 w-8">
          <AvatarImage src="/placeholder-user.jpg" alt="User" />
          <AvatarFallback className="text-base">{userInitials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{userName}</p>
            <p className="text-xs leading-none text-muted-foreground">{userEmail}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onLogout}>Log out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
