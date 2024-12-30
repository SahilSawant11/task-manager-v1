import Layout from '../components/layout'
import UserTable from '../components/user-table'

const initialUsers = [
  { id: 1, name: 'sahil.s', email: 'test@gmail.com', role: 'Admin' },
  { id: 2, name: 'shritej.m', email: 'sample@gmail.com', role: 'User' },
  { id: 3, name: 'test.w', email: 'test@mail.com', role: 'Manager' },
]

export default function UserManagement() {
  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-6">User Management</h1>
      <UserTable initialUsers={initialUsers} />
    </Layout>
  )
}

