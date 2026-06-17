import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import { Sparkles, Users, ShieldCheck } from 'lucide-react'

export default async function AdminPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'admin') {
    redirect('/')
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      tailorCount: true,
      createdAt: true,
    },
  })

  const totalTailors = users.reduce((sum: number, u: { tailorCount: number }) => sum + u.tailorCount, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
            <Sparkles size={14} className="text-white" />
          </div>
          <span className="font-bold text-gray-900">Resume Tailor</span>
          <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
            <ShieldCheck size={11} /> Admin
          </span>
        </div>
        <a href="/" className="text-xs text-blue-600 hover:underline">← Back to app</a>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="text-2xl font-bold text-gray-900">{users.length}</div>
            <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
              <Users size={11} /> Total users
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="text-2xl font-bold text-gray-900">{totalTailors}</div>
            <div className="text-xs text-gray-400 mt-0.5">Total tailorings</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="text-2xl font-bold text-gray-900">
              {users.filter((u: { createdAt: Date }) => u.createdAt > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
            </div>
            <div className="text-xs text-gray-400 mt-0.5">New this week</div>
          </div>
        </div>

        {/* Users table */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 text-sm">All Users</h2>
            <span className="text-xs text-gray-400">{users.length} accounts</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">Name</th>
                  <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">Email</th>
                  <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">Role</th>
                  <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">Tailorings</th>
                  <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 font-medium text-gray-900">
                      {user.name ?? <span className="text-gray-300 font-normal">—</span>}
                    </td>
                    <td className="px-5 py-3 text-gray-600">{user.email}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        user.role === 'admin'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-600">{user.tailorCount}</td>
                    <td className="px-5 py-3 text-gray-400 text-xs">
                      {new Date(user.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-gray-400 text-sm">
                      No users yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
