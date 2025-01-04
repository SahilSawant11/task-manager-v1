'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '../contexts/auth-context'
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from './theme-toggle'

const navItems = [
  { name: 'Dashboard', href: '/' },
  { name: 'Issue Management', href: '/issues' },
  { name: 'User Management', href: '/users' },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user, loading, logout } = useAuth()
  const router = useRouter()

  // This is a placeholder. In a real application, you'd fetch this from your backend.
  const userCount = 3

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return <div>Loading...</div> // Or a more sophisticated loading indicator
  }

  if (!user) {
    return null // Return null while redirecting
  }

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
          <div className="mt-auto p-4">
            <p className="mb-2">Logged in as: {user.username}</p>
            <div className="flex items-center justify-between">
              <Button onClick={handleLogout} variant="outline" className="w-full mr-2">
                Logout
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </Sidebar>
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-auto">
            <SidebarTrigger className="mb-4" />
            {children}
          </div>
        </div>
      </div>
    </SidebarProvider>
  )
}

