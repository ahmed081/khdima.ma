import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { Users, Briefcase, BarChart3, Languages, Tag, Clock, Flag } from "lucide-react"

// Middleware at middleware.ts already enforces ADMIN-only access to /admin/*
export default async function AdminDashboardPage() {
  const [pendingCount, totalProviders, totalUsers, totalContacts, openReports, recentContacts] = await Promise.all([
    prisma.provider.count({ where: { status: 'PENDING' } }),
    prisma.provider.count({ where: { status: 'ACTIVE' } }),
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.contactLog.count(),
    prisma.report.count({ where: { status: 'OPEN' } }),
    prisma.contactLog.findMany({
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: {
        provider: { select: { businessName: true } },
        user:     { select: { name: true } }
      }
    })
  ])

  const navItems = [
    { href: '/admin/providers',    icon: Briefcase,  label: 'Providers',     desc: 'Approve & manage providers' },
    { href: '/admin/categories',   icon: Tag,        label: 'Categories',    desc: 'Manage service categories' },
    { href: '/admin/translations', icon: Languages,  label: 'Translations',  desc: 'Manage i18n translations' },
    { href: '/admin/analytics',    icon: BarChart3,  label: 'Analytics',     desc: 'Platform statistics' },
    { href: '/admin/reports',      icon: Flag,       label: `Reports${openReports > 0 ? ` (${openReports})` : ''}`, desc: 'Handle reported profiles' },
  ]

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-2xl font-bold mb-8 text-gray-900">Admin Dashboard</h1>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-5 text-center">
              <p className="text-4xl font-bold text-amber-600">{pendingCount}</p>
              <p className="text-sm text-gray-500 mt-1">Pending</p>
              <Button size="sm" className="mt-3 bg-amber-600 hover:bg-amber-500" asChild>
                <Link href="/admin/providers?status=PENDING">Review</Link>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 text-center">
              <Briefcase className="h-6 w-6 text-blue-500 mx-auto mb-1" />
              <p className="text-4xl font-bold text-blue-600">{totalProviders}</p>
              <p className="text-sm text-gray-500 mt-1">Active Providers</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 text-center">
              <Users className="h-6 w-6 text-green-500 mx-auto mb-1" />
              <p className="text-4xl font-bold text-green-600">{totalUsers}</p>
              <p className="text-sm text-gray-500 mt-1">Customers</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 text-center">
              <Clock className="h-6 w-6 text-purple-500 mx-auto mb-1" />
              <p className="text-4xl font-bold text-purple-600">{totalContacts}</p>
              <p className="text-sm text-gray-500 mt-1">Total Contacts</p>
            </CardContent>
          </Card>
        </div>

        {/* Nav cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {navItems.map(item => (
            <Link key={item.href} href={item.href}>
              <Card className="hover:shadow-md hover:border-green-300 transition-all cursor-pointer h-full">
                <CardContent className="p-5 flex flex-col items-center text-center">
                  <item.icon className="h-8 w-8 text-green-700 mb-2" />
                  <p className="font-semibold text-gray-800">{item.label}</p>
                  <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Recent contacts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4" /> Recent Contact Logs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-gray-500 text-xs uppercase">
                    <th className="text-left py-2 pr-4">Provider</th>
                    <th className="text-left py-2 pr-4">User</th>
                    <th className="text-left py-2 pr-4">Type</th>
                    <th className="text-left py-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentContacts.map(log => (
                    <tr key={log.id} className="border-b last:border-0">
                      <td className="py-2 pr-4 font-medium">{log.provider.businessName}</td>
                      <td className="py-2 pr-4 text-gray-500">{log.user?.name ?? 'Anonymous'}</td>
                      <td className="py-2 pr-4">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          log.type === 'WHATSAPP'     ? 'bg-green-100 text-green-700' :
                          log.type === 'CALL'         ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-600'}`}>
                          {log.type}
                        </span>
                      </td>
                      <td className="py-2 text-gray-400">{new Date(log.createdAt).toLocaleDateString()}</td>
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
