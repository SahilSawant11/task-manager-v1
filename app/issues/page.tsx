"use client"

import { useState } from "react"
import Layout from "../components/layout"
import IssueTable from "../components/issue-table"
import type { Issue } from "../types/issue"

export default function IssueManagement() {
  const [issues, setIssues] = useState<Issue[]>([])

  const handleIssuesUpdate = (updatedIssues: Issue[]) => {
    setIssues(updatedIssues)
  }

  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-6">All Issues</h1>
      <IssueTable onIssuesUpdate={handleIssuesUpdate} />
    </Layout>
  )
}

