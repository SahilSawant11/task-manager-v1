import Layout from '../components/layout'
import IssueTable from '../components/issue-table'

const initialIssues = [
  { id: 1, title: 'Bug in login form', status: 'Open', priority: 'High' },
  { id: 2, title: 'Update documentation', status: 'In Progress', priority: 'Medium' },
  { id: 3, title: 'Implement new feature', status: 'Open', priority: 'Low' },
]

export default function IssueManagement() {
  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-6">Issue Management</h1>
      <IssueTable initialIssues={initialIssues} />
    </Layout>
  )
}

