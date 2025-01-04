'use client'

import React, { useState, useEffect } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { IssueFilter } from './issue-filter'
import { IssueComments } from './issue-comments'
import { Issue } from '../types/issue'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'

type SortConfig = {
  key: keyof Issue
  direction: 'asc' | 'desc'
}

type IssueTableProps = {
  onIssuesUpdate: (issues: Issue[]) => void
}

const projectOptions = ['Panvel Tax', 'Trade', 'Water', 'Baramati Tax']
const teamLeads = ['Pravin Chavan', 'Abhilash Mahamuni', 'Shubham.P']

export default function IssueTable({ onIssuesUpdate }: IssueTableProps) {
  const [issues, setIssues] = useState<Issue[]>([])
  const [filteredIssues, setFilteredIssues] = useState<Issue[]>([])
  const [editingId, setEditingId] = useState<number | null>(null)
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'id', direction: 'asc' })
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null)

  useEffect(() => {
    const fetchIssues = () => {
      const storedIssues = localStorage.getItem('issues')
      if (storedIssues) {
        const parsedIssues = JSON.parse(storedIssues)
        setIssues(parsedIssues)
        setFilteredIssues(parsedIssues)
      }
    }

    fetchIssues()
    const intervalId = setInterval(fetchIssues, 1000) // Fetch every second

    return () => clearInterval(intervalId)
  }, [])

  const handleEdit = (id: number) => {
    setSelectedIssue(issues.find(issue => issue.id === id) || null)
  }

  const handleSave = (id: number, field: keyof Issue, value: string | string[]) => {
    const updatedIssues = issues.map(issue => {
      if (issue.id === id) {
        return { ...issue, [field]: value }
      }
      return issue
    })
    setIssues(updatedIssues)
    onIssuesUpdate(updatedIssues)
    setSelectedIssue(prev => prev ? { ...prev, [field]: value } : null)
    localStorage.setItem('issues', JSON.stringify(updatedIssues))

    // Dispatch a custom event to notify other components
    window.dispatchEvent(new Event('issuesUpdated'))
  }

  const handleDelete = (id: number) => {
    const updatedIssues = issues.filter(issue => issue.id !== id)
    setIssues(updatedIssues)
    onIssuesUpdate(updatedIssues)
    setSelectedIssue(null)
    localStorage.setItem('issues', JSON.stringify(updatedIssues))
    window.dispatchEvent(new Event('issuesUpdated'))
  }

  const handleSort = (key: keyof Issue) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const handleFilterChange = (filters: any) => {
    const filtered = issues.filter(issue => 
      (filters.search === '' || issue.description.toLowerCase().includes(filters.search.toLowerCase())) &&
      (filters.status === 'all' || issue.status.toLowerCase() === filters.status.toLowerCase()) &&
      (filters.priority === 'all' || issue.priority.toLowerCase() === filters.priority.toLowerCase()) &&
      (filters.category === 'all' || issue.category === filters.category) &&
      (filters.teamLead === 'all' || issue.teamLead === filters.teamLead) &&
      (filters.project === 'all' || issue.project === filters.project) &&
      (!filters.fromDate || new Date(issue.date) >= new Date(filters.fromDate)) &&
      (!filters.toDate || new Date(issue.date) <= new Date(filters.toDate))
    )
    setFilteredIssues(filtered)
  }

  const handleAddComment = (issueId: number, content: string) => {
    const updatedIssues = issues.map(issue => {
      if (issue.id === issueId) {
        const newComment = {
          id: issue.comments.length + 1,
          author: 'Current User', // Replace with actual user name
          content,
          createdAt: new Date().toISOString(),
        }
        return { ...issue, comments: [...issue.comments, newComment] }
      }
      return issue
    })
    setIssues(updatedIssues)
    onIssuesUpdate(updatedIssues)
  }

  const sortedIssues = [...filteredIssues].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1
    if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1
    return 0
  })

  const [newIssue, setNewIssue] = useState<Omit<Issue, 'id'>>({ 
    description: '', 
    status: '', 
    priority: '', 
    assignedTo: '', 
    devNote: '',
    category: '',
    teamLead: '',
    date: new Date().toISOString().split('T')[0], // Set default date to today
    attachments: [],
    comments: [],
    project: '',
    example: '',
    reportedBy: '',
    resolutionDate: ''
  })
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleNewIssueChange = (field: keyof Omit<Issue, 'id'>, value: string | string[]) => {
    setNewIssue(prev => ({ ...prev, [field]: value }))
  }

  const handleNewIssueSubmit = () => {
    const id = Math.max(...issues.map(i => i.id), 0) + 1
    const updatedIssues = [...issues, { id, ...newIssue }]
    setIssues(updatedIssues)
    onIssuesUpdate(updatedIssues)
    setNewIssue({ 
      description: '', 
      status: '', 
      priority: '', 
      assignedTo: '', 
      devNote: '',
      category: '',
      teamLead: '',
      date: new Date().toISOString().split('T')[0], // Set default date to today
      attachments: [],
      comments: [],
      project: '',
      example: '',
      reportedBy: '',
      resolutionDate: ''
    })
    setIsDialogOpen(false)
    window.dispatchEvent(new Event('issuesUpdated'))
  }

  const categories = Array.from(new Set(issues.map(issue => issue.category)))

  return (
    <>
    <div className="mb-4 overflow-x-auto">
      <IssueFilter onFilterChange={handleFilterChange} categories={categories} teamLeads={teamLeads} projects={projectOptions} />
    </div>
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button className="mb-4">Add New Issue</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Issue</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input
            placeholder="Description"
            value={newIssue.description}
            onChange={(e) => handleNewIssueChange('description', e.target.value)}
          />
          <Input
            placeholder="Example"
            value={newIssue.example}
            onChange={(e) => handleNewIssueChange('example', e.target.value)}
          />
          <Input
            placeholder="Reported By"
            value={newIssue.reportedBy}
            onChange={(e) => handleNewIssueChange('reportedBy', e.target.value)}
          />
          <Select onValueChange={(value) => handleNewIssueChange('status', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
          <Select onValueChange={(value) => handleNewIssueChange('priority', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
          <Input
            placeholder="Assigned To"
            value={newIssue.assignedTo}
            onChange={(e) => handleNewIssueChange('assignedTo', e.target.value)}
          />
          <Input
            placeholder="Category"
            value={newIssue.category}
            onChange={(e) => handleNewIssueChange('category', e.target.value)}
          />
          <Select onValueChange={(value) => handleNewIssueChange('teamLead', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Team Lead" />
            </SelectTrigger>
            <SelectContent>
              {teamLeads.map(lead => (
                <SelectItem key={lead} value={lead}>{lead}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="date"
            value={newIssue.date}
            onChange={(e) => handleNewIssueChange('date', e.target.value)}
          />
          <Select onValueChange={(value) => handleNewIssueChange('project', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Project" />
            </SelectTrigger>
            <SelectContent>
              {projectOptions.map(project => (
                <SelectItem key={project} value={project}>{project}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="date"
            value={newIssue.resolutionDate}
            onChange={(e) => handleNewIssueChange('resolutionDate', e.target.value)}
          />
          <Input
            placeholder="Notes"
            value={newIssue.devNote}
            onChange={(e) => handleNewIssueChange('devNote', e.target.value)}
          />
          <Button onClick={handleNewIssueSubmit}>Add Issue</Button>
        </div>
      </DialogContent>
    </Dialog>
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {['id', 'date', 'project', 'teamLead', 'status', 'description', 'example', 'reportedBy', 'priority', 'assignedTo', 'category'].map(key => (
              <TableHead key={key} onClick={() => handleSort(key as keyof Issue)} className="cursor-pointer">
                {key === 'id' ? 'ID' : 
                 key === 'date' ? 'Date' : 
                 key === 'teamLead' ? 'Lead' :
                 key === 'description' ? 'Description' :
                 key === 'priority' ? 'Priority' :
                 key === 'reportedBy' ? 'Reported By' :
                 key.charAt(0).toUpperCase() + key.slice(1)}
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
              <TableCell>{issue.date}</TableCell>
              <TableCell>{issue.project}</TableCell>
              <TableCell>{issue.teamLead}</TableCell>
              <TableCell>
                <Badge variant={issue.status.toLowerCase() === 'open' ? 'default' : issue.status.toLowerCase() === 'in progress' ? 'secondary' : 'outline'}>
                  {issue.status}
                </Badge>
              </TableCell>
              <TableCell>{issue.description.length > 30 ? `${issue.description.substring(0, 30)}...` : issue.description}</TableCell>
              <TableCell>{issue.example.length > 30 ? `${issue.example.substring(0, 30)}...` : issue.example}</TableCell>
              <TableCell>{issue.reportedBy}</TableCell>
              <TableCell>
                <Badge variant={issue.priority.toLowerCase() === 'high' ? 'destructive' : issue.priority.toLowerCase() === 'medium' ? 'warning' : 'success'}>
                  {issue.priority}
                </Badge>
              </TableCell>
              <TableCell>{issue.assignedTo}</TableCell>
              <TableCell>{issue.category}</TableCell>
              <TableCell>
                <Button variant="outline" size="sm" onClick={() => handleEdit(issue.id)}>Edit</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
    {selectedIssue && (
      <Dialog open={!!selectedIssue} onOpenChange={(open) => {
        if (!open) {
          setSelectedIssue(null)
        }
      }}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedIssue?.description}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                id="status"
                value={selectedIssue.status}
                onValueChange={(value) => handleSave(selectedIssue.id, 'status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select
                id="priority"
                value={selectedIssue.priority}
                onValueChange={(value) => handleSave(selectedIssue.id, 'priority', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={selectedIssue.description}
                onChange={(e) => handleSave(selectedIssue.id, 'description', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="example">Example</Label>
              <Input
                id="example"
                value={selectedIssue.example}
                onChange={(e) => handleSave(selectedIssue.id, 'example', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="reportedBy">Reported By</Label>
              <Input
                id="reportedBy"
                value={selectedIssue.reportedBy}
                onChange={(e) => handleSave(selectedIssue.id, 'reportedBy', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="assignedTo">Assigned To</Label>
              <Input
                id="assignedTo"
                value={selectedIssue.assignedTo}
                onChange={(e) => handleSave(selectedIssue.id, 'assignedTo', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={selectedIssue.category}
                onChange={(e) => handleSave(selectedIssue.id, 'category', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="teamLead">Team Lead</Label>
              <Select
                id="teamLead"
                value={selectedIssue.teamLead}
                onValueChange={(value) => handleSave(selectedIssue.id, 'teamLead', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Team Lead" />
                </SelectTrigger>
                <SelectContent>
                  {teamLeads.map(lead => (
                    <SelectItem key={lead} value={lead}>{lead}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={selectedIssue.date}
                onChange={(e) => handleSave(selectedIssue.id, 'date', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="project">Project</Label>
              <Select
                id="project"
                value={selectedIssue.project}
                onValueChange={(value) => handleSave(selectedIssue.id, 'project', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Project" />
                </SelectTrigger>
                <SelectContent>
                  {projectOptions.map(project => (
                    <SelectItem key={project} value={project}>{project}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="resolutionDate">Resolution Date</Label>
              <Input
                id="resolutionDate"
                type="date"
                value={selectedIssue.resolutionDate}
                onChange={(e) => handleSave(selectedIssue.id, 'resolutionDate', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="devNote">Notes</Label>
              <Input
                id="devNote"
                value={selectedIssue.devNote}
                onChange={(e) => handleSave(selectedIssue.id, 'devNote', e.target.value)}
              />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-lg font-semibold">Attachments</h3>
            <ul>
              {selectedIssue.attachments.map((attachment, index) => (
                <li key={index}>{attachment}</li>
              ))}
            </ul>
            <Input
              type="file"
              onChange={(e) => {
                if (e.target.files) {
                  const newAttachment = e.target.files[0].name
                  handleSave(selectedIssue.id, 'attachments', [...selectedIssue.attachments, newAttachment])
                }
              }}
            />
          </div>
          <IssueComments 
            comments={selectedIssue.comments} 
            onAddComment={(content) => handleAddComment(selectedIssue.id, content)} 
          />
          <div className="flex justify-end space-x-2 mt-4">
            <Button onClick={() => {
              if (selectedIssue) {
                handleSave(selectedIssue.id, 'id', selectedIssue.id.toString())
              }
              setSelectedIssue(null)
            }}>Save</Button>
            <Button variant="outline" onClick={() => setSelectedIssue(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => {
              if (selectedIssue) {
                handleDelete(selectedIssue.id)
              }
              setSelectedIssue(null)
            }}>Delete</Button>
          </div>
        </DialogContent>
      </Dialog>
    )}
    </>
  )
}

