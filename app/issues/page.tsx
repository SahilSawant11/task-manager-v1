'use client'

import { useState, useEffect } from 'react'
import Layout from '../components/layout'
import IssueTable from '../components/issue-table'
import { Issue } from '../types/issue'

export default function IssueManagement() {
  const [issues, setIssues] = useState<Issue[]>([])

  useEffect(() => {
    const storedIssues = localStorage.getItem('issues')
    if (storedIssues) {
      setIssues(JSON.parse(storedIssues))
    }

    const handleIssuesUpdated = () => {
      const updatedIssues = JSON.parse(localStorage.getItem('issues') || '[]')
      setIssues(updatedIssues)
    }

    window.addEventListener('storage', handleIssuesUpdated)
    window.addEventListener('issuesUpdated', handleIssuesUpdated)

    return () => {
      window.removeEventListener('storage', handleIssuesUpdated)
      window.removeEventListener('issuesUpdated', handleIssuesUpdated)
    }
  }, [])

  const updateIssues = (newIssues: Issue[]) => {
    setIssues(newIssues)
    localStorage.setItem('issues', JSON.stringify(newIssues))
    window.dispatchEvent(new Event('issuesUpdated'))
  }

  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-6">Issue Management</h1>
      <IssueTable onIssuesUpdate={updateIssues} />
    </Layout>
  )
}

