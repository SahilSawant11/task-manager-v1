'use client'

import { useState, useEffect } from 'react'
import Layout from './components/layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Issue } from './types/issue'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

const teamLeadProjects = {
  'Pravin Chavan': ['Panvel Tax'],
  'Abhilash Mahamuni': ['Trade', 'Water'],
  'Shubham.P': ['Baramati Tax']
}

export default function Dashboard() {
  const [issues, setIssues] = useState<Issue[]>([])

  useEffect(() => {
    const fetchIssues = () => {
      const storedIssues = localStorage.getItem('issues')
      if (storedIssues) {
        setIssues(JSON.parse(storedIssues))
      }
    }

    fetchIssues()

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'issues') {
        fetchIssues()
      }
    }

    const handleIssuesUpdated = () => {
      fetchIssues()
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('issuesUpdated', handleIssuesUpdated)

    const intervalId = setInterval(fetchIssues, 1000)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('issuesUpdated', handleIssuesUpdated)
      clearInterval(intervalId)
    }
  }, [])

  const projectCounts = issues.reduce((acc, issue) => {
    if (!acc[issue.project]) {
      acc[issue.project] = { name: issue.project, total: 0, pending: 0, closed: 0 }
    }
    acc[issue.project].total += 1
    if (issue.status.toLowerCase() === 'closed') {
      acc[issue.project].closed += 1
    } else {
      acc[issue.project].pending += 1
    }
    return acc
  }, {} as Record<string, { name: string; total: number; pending: number; closed: number }>)

  const teamLeadStats = Object.entries(teamLeadProjects).map(([teamLead, projects]) => {
    const stats = {
      teamLead,
      projects,
      pending: 0,
      closed: 0,
      total: 0
    }

    projects.forEach(project => {
      if (projectCounts[project]) {
        stats.pending += projectCounts[project].pending
        stats.closed += projectCounts[project].closed
        stats.total += projectCounts[project].total
      }
    })

    return stats
  })

  const totals = teamLeadStats.reduce(
    (acc, curr) => ({
      pending: acc.pending + curr.pending,
      closed: acc.closed + curr.closed,
      total: acc.total + curr.total
    }),
    { pending: 0, closed: 0, total: 0 }
  )

  const chartData = Object.values(projectCounts)

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardHeader className="p-4">
                  <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totals.total}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="p-4">
                  <CardTitle className="text-sm font-medium">Pending Issues</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totals.pending}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="p-4">
                  <CardTitle className="text-sm font-medium">Closed Issues</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totals.closed}</div>
                </CardContent>
              </Card>
            </div>

            {/* Project Chart */}
            <Card>
              <CardHeader className="p-4">
                <CardTitle>Project-wise Issue Count</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="pending" name="Pending" fill="#8884d8" />
                      <Bar dataKey="closed" name="Closed" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Team Lead Statistics Table */}
          <Card>
            <CardHeader className="p-4">
              <CardTitle>Team Lead Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-medium">Team Lead</TableHead>
                      <TableHead className="font-medium">Project</TableHead>
                      <TableHead className="font-medium text-right">Pending</TableHead>
                      <TableHead className="font-medium text-right">Closed</TableHead>
                      <TableHead className="font-medium text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teamLeadStats.map((stat) => (
                      stat.projects.map((project, projectIndex) => (
                        <TableRow key={`${stat.teamLead}-${project}`}>
                          {projectIndex === 0 && (
                            <TableCell rowSpan={stat.projects.length} className="font-medium">
                              {stat.teamLead}
                            </TableCell>
                          )}
                          <TableCell>{project}</TableCell>
                          <TableCell className="text-right">{projectCounts[project]?.pending || 0}</TableCell>
                          <TableCell className="text-right">{projectCounts[project]?.closed || 0}</TableCell>
                          <TableCell className="text-right">{projectCounts[project]?.total || 0}</TableCell>
                        </TableRow>
                      ))
                    ))}
                    <TableRow>
                      <TableCell colSpan={2} className="font-bold">Total</TableCell>
                      <TableCell className="text-right font-bold">{totals.pending}</TableCell>
                      <TableCell className="text-right font-bold">{totals.closed}</TableCell>
                      <TableCell className="text-right font-bold">{totals.total}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  )
}

