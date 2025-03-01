"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableRow, TableHeader } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { IssueFilter } from "./issue-filter"
import { IssueComments } from "./issue-comments"
import type { Issue } from "../types/issue"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import * as XLSX from "xlsx"

type SortConfig = {
  key: keyof Issue
  direction: "asc" | "desc"
}

type IssueTableProps = {
  onIssuesUpdate: (issues: Issue[]) => void
}

const projectOptions = ["Panvel Tax", "Trade", "Water", "Baramati Tax"]
const teamLeads = ["Pravin Chavan", "Abhilash Mahamuni", "Shubham.P"]
const assignedToOptions = ["Pratiksha", "Shivani", "Shubham", "Pravin.C"]
const categoryOptions = ["Bug", "Task", "Enhancement"]
const reportedByOptions = ["rohan.y", "mrunal.w", "tejas.r", "anurag.g", "rushikesh.p", "milind"]

export default function IssueTable({ onIssuesUpdate }: IssueTableProps) {
  const [issues, setIssues] = useState<Issue[]>([])
  const [filteredIssues, setFilteredIssues] = useState<Issue[]>([])
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: "id", direction: "asc" })
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchIssues()
  }, [])

  const fetchIssues = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch("http://localhost:8080/api/issues")
      if (!response.ok) {
        throw new Error("Failed to fetch issues")
      }
      const data = await response.json()
      setIssues(data)
      setFilteredIssues(data)
    } catch (error) {
      console.error("Error fetching issues:", error)
      setError("Failed to fetch issues. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (id: number) => {
    setSelectedIssue(issues.find((issue) => issue.id === id) || null)
  }

  const handleSave = async (id: number, field: keyof Issue, value: string | string[]) => {
    try {
      const updatedIssue = { ...issues.find((issue) => issue.id === id), [field]: value }
      const response = await fetch(`http://localhost:8080/api/issues/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedIssue),
      })
      if (!response.ok) {
        throw new Error("Failed to update issue")
      }
      const updatedIssueData = await response.json()
      const updatedIssues = issues.map((issue) => (issue.id === id ? updatedIssueData : issue))
      setIssues(updatedIssues)
      setFilteredIssues(updatedIssues)
      onIssuesUpdate(updatedIssues)
      setSelectedIssue(updatedIssueData)
    } catch (error) {
      console.error("Error updating issue:", error)
      setError("Failed to update issue. Please try again.")
    }
  }

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:8080/api/issues/${id}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        throw new Error("Failed to delete issue")
      }
      const updatedIssues = issues.filter((issue) => issue.id !== id)
      setIssues(updatedIssues)
      setFilteredIssues(updatedIssues)
      onIssuesUpdate(updatedIssues)
      setSelectedIssue(null)
    } catch (error) {
      console.error("Error deleting issue:", error)
      setError("Failed to delete issue. Please try again.")
    }
  }

  const handleSort = (key: keyof Issue) => {
    setSortConfig((prevConfig) => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === "asc" ? "desc" : "asc",
    }))
  }

  const handleFilterChange = (filters: any) => {
    const filtered = issues.filter(
      (issue) =>
        (filters.search === "" || issue.description.toLowerCase().includes(filters.search.toLowerCase())) &&
        (filters.status === "all" || issue.status.toLowerCase() === filters.status.toLowerCase()) &&
        (filters.priority === "all" || issue.priority.toLowerCase() === filters.priority.toLowerCase()) &&
        (filters.category === "all" || issue.category === filters.category) &&
        (filters.teamLead === "all" || issue.teamLead === filters.teamLead) &&
        (filters.project === "all" || issue.project === filters.project) &&
        (filters.assignedTo === "all" || issue.assignedTo === filters.assignedTo) &&
        (filters.reportedBy === "all" || issue.reportedBy === filters.reportedBy) &&
        (!filters.fromDate || new Date(issue.date) >= new Date(filters.fromDate)) &&
        (!filters.toDate || new Date(issue.date) <= new Date(filters.toDate)),
    )
    setFilteredIssues(filtered)
  }

  const handleAddComment = async (issueId: number, content: string) => {
    try {
      const response = await fetch(`http://localhost:8080/api/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ issueId, content }),
      })
      if (!response.ok) {
        throw new Error("Failed to add comment")
      }
      const newComment = await response.json()
      const updatedIssues = issues.map((issue) => {
        if (issue.id === issueId) {
          return { ...issue, comments: [...issue.comments, newComment] }
        }
        return issue
      })
      setIssues(updatedIssues)
      setFilteredIssues(updatedIssues)
      onIssuesUpdate(updatedIssues)
      if (selectedIssue && selectedIssue.id === issueId) {
        setSelectedIssue({ ...selectedIssue, comments: [...selectedIssue.comments, newComment] })
      }
    } catch (error) {
      console.error("Error adding comment:", error)
      setError("Failed to add comment. Please try again.")
    }
  }

  const sortedIssues = [...filteredIssues].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === "asc" ? -1 : 1
    if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === "asc" ? 1 : -1
    return 0
  })

  const [newIssue, setNewIssue] = useState<Omit<Issue, "id">>({
    description: "",
    status: "",
    priority: "",
    assignedTo: "",
    devNote: "",
    category: "",
    teamLead: "",
    date: new Date().toISOString().split("T")[0],
    attachments: [],
    comments: [],
    project: "",
    example: "",
    reportedBy: "",
    resolutionDate: "",
  })

  const handleNewIssueChange = (field: keyof Omit<Issue, "id">, value: string | string[]) => {
    setNewIssue((prev) => ({ ...prev, [field]: value }))
  }

  const handleNewIssueSubmit = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/issues", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newIssue),
      })
      if (!response.ok) {
        throw new Error("Failed to create issue")
      }
      const createdIssue = await response.json()
      const updatedIssues = [...issues, createdIssue]
      setIssues(updatedIssues)
      setFilteredIssues(updatedIssues)
      onIssuesUpdate(updatedIssues)
      setNewIssue({
        description: "",
        status: "",
        priority: "",
        assignedTo: "",
        devNote: "",
        category: "",
        teamLead: "",
        date: new Date().toISOString().split("T")[0],
        attachments: [],
        comments: [],
        project: "",
        example: "",
        reportedBy: "",
        resolutionDate: "",
      })
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error creating issue:", error)
      setError("Failed to create issue. Please try again.")
    }
  }

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(issues)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Issues")
    XLSX.writeFile(workbook, "issues.xlsx")
  }

  if (isLoading) {
    return <div>Loading issues...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    <>
      <div className="mb-4 overflow-x-auto">
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
                onChange={(e) => handleNewIssueChange("description", e.target.value)}
              />
              <Input
                placeholder="Example"
                value={newIssue.example}
                onChange={(e) => handleNewIssueChange("example", e.target.value)}
              />
              <Select onValueChange={(value) => handleNewIssueChange("reportedBy", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Reported By" />
                </SelectTrigger>
                <SelectContent>
                  {reportedByOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select onValueChange={(value) => handleNewIssueChange("status", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              <Select onValueChange={(value) => handleNewIssueChange("priority", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
              <Select onValueChange={(value) => handleNewIssueChange("assignedTo", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Assigned To" />
                </SelectTrigger>
                <SelectContent>
                  {assignedToOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select onValueChange={(value) => handleNewIssueChange("category", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select onValueChange={(value) => handleNewIssueChange("teamLead", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Team Lead" />
                </SelectTrigger>
                <SelectContent>
                  {teamLeads.map((lead) => (
                    <SelectItem key={lead} value={lead}>
                      {lead}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input type="date" value={newIssue.date} onChange={(e) => handleNewIssueChange("date", e.target.value)} />
              <Select onValueChange={(value) => handleNewIssueChange("project", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Project" />
                </SelectTrigger>
                <SelectContent>
                  {projectOptions.map((project) => (
                    <SelectItem key={project} value={project}>
                      {project}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="date"
                value={newIssue.resolutionDate}
                onChange={(e) => handleNewIssueChange("resolutionDate", e.target.value)}
              />
              <Input
                placeholder="Notes"
                value={newIssue.devNote}
                onChange={(e) => handleNewIssueChange("devNote", e.target.value)}
              />
              <Button onClick={handleNewIssueSubmit}>Add Issue</Button>
            </div>
          </DialogContent>
        </Dialog>
        <Button className="mb-4 ml-2" onClick={exportToExcel}>
          Export to Excel
        </Button>
        <IssueFilter
          onFilterChange={handleFilterChange}
          categories={categoryOptions}
          teamLeads={teamLeads}
          projects={projectOptions}
          assignedToOptions={assignedToOptions}
          reportedByOptions={reportedByOptions}
        />
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {[
                "id",
                "date",
                "project",
                "teamLead",
                "status",
                "description",
                "example",
                "reportedBy",
                "priority",
                "assignedTo",
                "category",
              ].map((key) => (
                <TableHead key={key} onClick={() => handleSort(key as keyof Issue)} className="cursor-pointer max-w-md">
                  {key === "id"
                    ? "ID"
                    : key === "date"
                      ? "Date"
                      : key === "teamLead"
                        ? "Lead"
                        : key === "description"
                          ? "Description"
                          : key === "priority"
                            ? "Priority"
                            : key === "reportedBy"
                              ? "Reported By"
                              : key === "example"
                                ? "Example"
                                : key.charAt(0).toUpperCase() + key.slice(1)}
                  {sortConfig.key === key && (sortConfig.direction === "asc" ? " ▲" : " ▼")}
                </TableHead>
              ))}
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedIssues.map((issue) => (
              <TableRow key={issue.id}>
                <TableCell>{issue.id}</TableCell>
                <TableCell>{issue.date}</TableCell>
                <TableCell>{issue.project}</TableCell>
                <TableCell>{issue.teamLead}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      issue.status.toLowerCase() === "open"
                        ? "default"
                        : issue.status.toLowerCase() === "in progress"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {issue.status}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-md whitespace-normal break-words">{issue.description}</TableCell>
                <TableCell className="max-w-md whitespace-normal break-words">{issue.example}</TableCell>
                <TableCell>{issue.reportedBy}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      issue.priority.toLowerCase() === "high"
                        ? "destructive"
                        : issue.priority.toLowerCase() === "medium"
                          ? "warning"
                          : "success"
                    }
                  >
                    {issue.priority}
                  </Badge>
                </TableCell>
                <TableCell>{issue.assignedTo}</TableCell>
                <TableCell>{issue.category}</TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" onClick={() => handleEdit(issue.id)}>
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {selectedIssue && (
        <Dialog
          open={!!selectedIssue}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedIssue(null)
            }
          }}
        >
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
                  onValueChange={(value) => handleSave(selectedIssue.id, "status", value)}
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
                  onValueChange={(value) => handleSave(selectedIssue.id, "priority", value)}
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
                  onChange={(e) => handleSave(selectedIssue.id, "description", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="example">Example</Label>
                <Input
                  id="example"
                  value={selectedIssue.example}
                  onChange={(e) => handleSave(selectedIssue.id, "example", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="reportedBy">Reported By</Label>
                <Select
                  id="reportedBy"
                  value={selectedIssue.reportedBy}
                  onValueChange={(value) => handleSave(selectedIssue.id, "reportedBy", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Reported By" />
                  </SelectTrigger>
                  <SelectContent>
                    {reportedByOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="assignedTo">Assigned To</Label>
                <Select
                  id="assignedTo"
                  value={selectedIssue.assignedTo}
                  onValueChange={(value) => handleSave(selectedIssue.id, "assignedTo", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Assigned To" />
                  </SelectTrigger>
                  <SelectContent>
                    {assignedToOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  id="category"
                  value={selectedIssue.category}
                  onValueChange={(value) => handleSave(selectedIssue.id, "category", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="teamLead">Team Lead</Label>
                <Select
                  id="teamLead"
                  value={selectedIssue.teamLead}
                  onValueChange={(value) => handleSave(selectedIssue.id, "teamLead", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Team Lead" />
                  </SelectTrigger>
                  <SelectContent>
                    {teamLeads.map((lead) => (
                      <SelectItem key={lead} value={lead}>
                        {lead}
                      </SelectItem>
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
                  onChange={(e) => handleSave(selectedIssue.id, "date", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="project">Project</Label>
                <Select
                  id="project"
                  value={selectedIssue.project}
                  onValueChange={(value) => handleSave(selectedIssue.id, "project", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projectOptions.map((project) => (
                      <SelectItem key={project} value={project}>
                        {project}
                      </SelectItem>
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
                  onChange={(e) => handleSave(selectedIssue.id, "resolutionDate", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="devNote">Notes</Label>
                <Input
                  id="devNote"
                  value={selectedIssue.devNote}
                  onChange={(e) => handleSave(selectedIssue.id, "devNote", e.target.value)}
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
                    handleSave(selectedIssue.id, "attachments", [...selectedIssue.attachments, newAttachment])
                  }
                }}
              />
            </div>
            <IssueComments
              comments={selectedIssue.comments}
              onAddComment={(content) => handleAddComment(selectedIssue.id, content)}
            />
            <div className="flex justify-end space-x-2 mt-4">
              <Button
                onClick={() => {
                  if (selectedIssue) {
                    handleSave(selectedIssue.id, "id", selectedIssue.id.toString())
                  }
                  setSelectedIssue(null)
                }}
              >
                Save
              </Button>
              <Button variant="outline" onClick={() => setSelectedIssue(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (selectedIssue) {
                    handleDelete(selectedIssue.id)
                  }
                  setSelectedIssue(null)
                }}
              >
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}

