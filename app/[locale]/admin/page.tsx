import { getUserFromAuth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"

export default async function AdminDashboardPage() {
  const user = await getUserFromAuth()
  if (!user || user.role !== 'ADMIN') redirect('/')

  const [pendingCount, totalProviders, totalUsers, recentContacts] = await Promise.all([
    prisma.provider.count({ where: { status: 'PENDING' } }),
    prisma.provider.count(),
    prisma.user.count(),
    prisma.contactLog.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        provider: { select: { businessName: true } },
        user: { select: { name: true } }
      }
    })
  ])

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto px-4 max-w-5xl">
        <h1 className="text-2xl font-bold mb-8 text-gray-900">Admin Dashboard</h1>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-4xl font-bold text-amber-600">{pendingCount}</p>
              <p className="text-sm text-gray-500 mt-1">Pending Providers</p>
              <Button size="sm" className="mt-3" asChild>
                <Link href="/admin/providers?status=PENDING">Review</Link>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-4xl font-bold text-blue-600">{totalProviders}</p>
              <p className="text-sm text-gray-500 mt-1">Total Providers</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-4xl font-bold text-green-600">{totalUsers}</p>
              <p className="text-sm text-gray-500 mt-1">Total Users</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Contact Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-gray-500">
                    <th className="text-left py-2">Provider</th>
                    <th className="text-left py-2">User</th>
                    <th className="text-left py-2">Type</th>
                    <th className="text-left py-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentContacts.map(log => (
                    <tr key={log.id} className="border-b last:border-0">
                      <td className="py-2">{log.provider.businessName}</td>
                      <td className="py-2">{log.user?.name ?? 'Anonymous'}</td>
                      <td className="py-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${log.type === 'WHATSAPP' ? 'bg-green-100 text-green-700' : log.type === 'CALL' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                          {log.type}
                        </span>
                      </td>
                      <td className="py-2 text-gray-500">{new Date(log.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
