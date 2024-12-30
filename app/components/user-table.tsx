'use client'

import React, { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

type User = {
  id: number
  name: string
  email: string
  role: string
}

type SortConfig = {
  key: keyof User
  direction: 'asc' | 'desc'
}

export default function UserTable({ initialUsers }: { initialUsers: User[] }) {
  const [users, setUsers] = useState(initialUsers)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'id', direction: 'asc' })
  const [newUser, setNewUser] = useState<Omit<User, 'id'>>({ name: '', email: '', role: '' })
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleEdit = (id: number) => {
    setEditingId(id)
  }

  const handleSave = (id: number, field: keyof User, value: string) => {
    setUsers(users.map(user => 
      user.id === id ? { ...user, [field]: value } : user
    ))
    setEditingId(null)
  }

  const handleDelete = (id: number) => {
    setUsers(users.filter(user => user.id !== id))
  }

  const handleSort = (key: keyof User) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const handleNewUserChange = (field: keyof Omit<User, 'id'>, value: string) => {
    setNewUser(prev => ({ ...prev, [field]: value }))
  }

  const handleNewUserSubmit = () => {
    const id = Math.max(...users.map(u => u.id), 0) + 1
    setUsers([...users, { id, ...newUser }])
    setNewUser({ name: '', email: '', role: '' })
    setIsDialogOpen(false)
  }

  const sortedUsers = [...users].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1
    if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1
    return 0
  })

  return (
    <div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button className="mb-4">Add New User</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              placeholder="Name"
              value={newUser.name}
              onChange={(e) => handleNewUserChange('name', e.target.value)}
            />
            <Input
              placeholder="Email"
              value={newUser.email}
              onChange={(e) => handleNewUserChange('email', e.target.value)}
            />
            <Input
              placeholder="Role"
              value={newUser.role}
              onChange={(e) => handleNewUserChange('role', e.target.value)}
            />
            <Button onClick={handleNewUserSubmit}>Add User</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Table>
        <TableHeader>
          <TableRow>
            {['id', 'name', 'email', 'role'].map(key => (
              <TableHead key={key} onClick={() => handleSort(key as keyof User)} className="cursor-pointer">
                {key.charAt(0).toUpperCase() + key.slice(1)}
                {sortConfig.key === key && (sortConfig.direction === 'asc' ? ' ▲' : ' ▼')}
              </TableHead>
            ))}
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedUsers.map(user => (
            <TableRow key={user.id}>
              <TableCell>{user.id}</TableCell>
              <TableCell>
                {editingId === user.id ? (
                  <Input 
                    defaultValue={user.name} 
                    onBlur={(e) => handleSave(user.id, 'name', e.target.value)}
                  />
                ) : user.name}
              </TableCell>
              <TableCell>
                {editingId === user.id ? (
                  <Input 
                    defaultValue={user.email} 
                    onBlur={(e) => handleSave(user.id, 'email', e.target.value)}
                  />
                ) : user.email}
              </TableCell>
              <TableCell>
                {editingId === user.id ? (
                  <Input 
                    defaultValue={user.role} 
                    onBlur={(e) => handleSave(user.id, 'role', e.target.value)}
                  />
                ) : user.role}
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button onClick={() => handleEdit(user.id)}>Edit</Button>
                  <Button variant="destructive" onClick={() => handleDelete(user.id)}>Delete</Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

