'use client';
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { Badge } from '@/components/ui/badge'

const navItems = [
  { name: 'Dashboard', href: '/' },
  { name: 'Issue Management', href: '/issues' },
  { name: 'User Management', href: '/users' },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // This is a placeholder. In a real application, you'd fetch this from your backend.
  const userCount = 3

  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <Sidebar>
          <SidebarHeader>
            <h1 className="text-2xl font-bold p-4">Task Manager</h1>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item) => (
                    <SidebarMenuItem key={item.name}>
                      <SidebarMenuButton asChild isActive={pathname === item.href}>
                        <Link href={item.href} className="flex justify-between items-center">
                          {item.name}
                          {item.name === 'User Management' && (
                            <Badge variant="secondary" className="ml-2">{userCount}</Badge>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <div className="flex-1 p-8 overflow-auto">
          <SidebarTrigger className="mb-4" />
          {children}
        </div>
      </div>
    </SidebarProvider>
  )
}

