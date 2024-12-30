'use client'

import React, { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

type Issue = {
  id: number
  title: string
  status: string
  priority: string
}

type SortConfig = {
  key: keyof Issue
  direction: 'asc' | 'desc'
}

export default function IssueTable({ initialIssues }: { initialIssues: Issue[] }) {
  const [issues, setIssues] = useState(initialIssues)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'id', direction: 'asc' })

  const handleEdit = (id: number) => {
    setEditingId(id)
  }

  const handleSave = (id: number, field: keyof Issue, value: string) => {
    setIssues(issues.map(issue => 
      issue.id === id ? { ...issue, [field]: value } : issue
    ))
    setEditingId(null)
  }

  const handleSort = (key: keyof Issue) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const sortedIssues = [...issues].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1
    if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1
    return 0
  })

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {['id', 'title', 'status', 'priority'].map(key => (
            <TableHead key={key} onClick={() => handleSort(key as keyof Issue)} className="cursor-pointer">
              {key.charAt(0).toUpperCase() + key.slice(1)}
              {sortConfig.key === key && (sortConfig.direction === 'asc' ? ' ▲' : ' ▼')}
            </TableHead>
          ))}
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedIssues.map(issue => (
          <TableRow key={issue.id}>
            <TableCell>{issue.id}</TableCell>
            <TableCell>
              {editingId === issue.id ? (
                <Input 
                  defaultValue={issue.title} 
                  onBlur={(e) => handleSave(issue.id, 'title', e.target.value)}
                />
              ) : issue.title}
            </TableCell>
            <TableCell>
              {editingId === issue.id ? (
                <Input 
                  defaultValue={issue.status} 
                  onBlur={(e) => handleSave(issue.id, 'status', e.target.value)}
                />
              ) : issue.status}
            </TableCell>
            <TableCell>
              {editingId === issue.id ? (
                <Input 
                  defaultValue={issue.priority} 
                  onBlur={(e) => handleSave(issue.id, 'priority', e.target.value)}
                />
              ) : issue.priority}
            </TableCell>
            <TableCell>
              <Button onClick={() => handleEdit(issue.id)}>Edit</Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

