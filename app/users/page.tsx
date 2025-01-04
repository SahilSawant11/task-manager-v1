import Layout from '../components/layout'
import UserTable from '../components/user-table'

const initialUsers = [
  { id: 1, name: 'sahil.s', email: 'test@example.com', role: 'Admin' },
  { id: 2, name: 'test.w', email: 'scipl@example.com', role: 'User' },
  { id: 3, name: 'sahil.test', email: 'dummy@example.com', role: 'Manager' },
]

export default function UserManagement() {
  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-6">User Management</h1>
      <UserTable initialUsers={initialUsers} />
    </Layout>
  )
}

