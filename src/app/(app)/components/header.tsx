"use client"
import { Menu } from "lucide-react"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
// import { signOut, useSession } from "next-auth/react"



interface HeaderProps {
  onMenuClick: () => void
  pageTitle: string
}

export function Header({ onMenuClick, pageTitle }: HeaderProps) {
//   const { data: session } = useSession()

//   const user = {
//     name: session?.user?.name,
//     email: session?.user?.email,
//     image: session?.user?.image,
//   }

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" className="mr-2 md:hidden" onClick={onMenuClick}>
              <Menu className="h-6 w-6" />
            </Button>
            <h2 className="font-semibold text-xl text-gray-800">{pageTitle}</h2>
          </div>
          <div className="flex items-center">
            {/* <span className="mr-4 text-sm font-medium text-gray-700 hidden sm:inline-block">{user.name}</span> */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    {/* <AvatarImage src={user.image || undefined} alt={user.name || undefined} />
                    <AvatarFallback>{user.name ? user.name.charAt(0) : ""}</AvatarFallback> */}
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    {/* <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p> */}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="hover:cursor-pointer">Perfil</DropdownMenuItem>
                <DropdownMenuItem className="hover:cursor-pointer">Configurações</DropdownMenuItem>
                {/* <DropdownMenuItem className="hover:cursor-pointer" onClick={() => signOut()}>Sign Out</DropdownMenuItem> */}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}