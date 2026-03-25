"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Link } from "@/i18n/navigation"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts"
import { TrendingUp, Users, Briefcase, MessageCircle } from "lucide-react"

const COLORS = ['#b91c1c', '#d97706', '#059669', '#2563eb', '#7c3aed', '#db2777', '#0891b2', '#65a30d']

export default function AdminAnalyticsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => fetch('/api/admin/analytics').then(r => r.json()),
  })

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50 py-10">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-28 bg-gray-100 rounded-lg animate-pulse" />)}
          </div>
        </div>
      </main>
    )
  }

  if (!data || data.error) {
    return <main className="min-h-screen flex items-center justify-center text-red-600">{data?.error ?? 'Failed to load'}</main>
  }

  const { overview, contactsByType, providersByCategory, providersByCity, topProviders, dailyContacts } = data

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin" className="text-gray-500 hover:text-gray-700 text-sm">← Dashboard</Link>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        </div>

        {/* KPI Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Active Providers', value: overview.activeProviders,    icon: Briefcase,    color: 'text-blue-600'   },
            { label: 'Pending Review',   value: overview.pendingProviders,   icon: TrendingUp,   color: 'text-amber-600'  },
            { label: 'Customers',        value: overview.totalUsers,         icon: Users,        color: 'text-green-600'  },
            { label: '30-Day Contacts',  value: overview.recentContacts,     icon: MessageCircle, color: 'text-purple-600' },
            { label: 'Total Reviews',    value: overview.totalReviews,       icon: TrendingUp,   color: 'text-pink-600'   },
            { label: 'Total Contacts',   value: overview.totalContacts,      icon: MessageCircle, color: 'text-green-600' },
            { label: 'Suspended',        value: overview.suspendedProviders, icon: Briefcase,    color: 'text-gray-500'   },
            { label: 'All Providers',    value: overview.totalProviders,     icon: Briefcase,    color: 'text-indigo-600' },
          ].map(item => (
            <Card key={item.label}>
              <CardContent className="p-5">
                <item.icon className={`h-5 w-5 ${item.color} mb-2`} />
                <p className={`text-3xl font-bold ${item.color}`}>{item.value}</p>
                <p className="text-xs text-gray-500 mt-1">{item.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Daily contacts (7 days) */}
          <Card>
            <CardHeader><CardTitle className="text-base">Daily Contacts (7 days)</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={dailyContacts}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#b91c1c" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Contacts by type */}
          <Card>
            <CardHeader><CardTitle className="text-base">Contact Types (30 days)</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={contactsByType} dataKey="count" nameKey="type" cx="50%" cy="50%" outerRadius={80} label>
                    {contactsByType.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Providers by category */}
          <Card>
            <CardHeader><CardTitle className="text-base">Providers by Category</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={providersByCategory} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis dataKey="category.code" type="category" width={90} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#d97706" radius={[0,4,4,0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Providers by city */}
          <Card>
            <CardHeader><CardTitle className="text-base">Providers by City</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={providersByCity} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis dataKey="city.code" type="category" width={90} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#059669" radius={[0,4,4,0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Top providers */}
        <Card>
          <CardHeader><CardTitle className="text-base">Top Rated Providers</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-xs uppercase text-gray-500">
                    <th className="text-left py-2 pr-4">#</th>
                    <th className="text-left py-2 pr-4">Provider</th>
                    <th className="text-left py-2 pr-4">Category</th>
                    <th className="text-left py-2 pr-4">City</th>
                    <th className="text-right py-2 pr-4">Rating</th>
                    <th className="text-right py-2 pr-4">Reviews</th>
                    <th className="text-right py-2">Views</th>
                  </tr>
                </thead>
                <tbody>
                  {topProviders.map((p: any, i: number) => (
                    <tr key={p.id} className="border-b last:border-0">
                      <td className="py-2 pr-4 text-gray-400">{i + 1}</td>
                      <td className="py-2 pr-4 font-medium">
                        <Link href={`/services/${p.category.slug}/${p.id}`} className="hover:text-green-700">
                          {p.businessName}
                        </Link>
                      </td>
                      <td className="py-2 pr-4 text-gray-500">{p.category.code}</td>
                      <td className="py-2 pr-4 text-gray-500">{p.city.nameFr}</td>
                      <td className="py-2 pr-4 text-right">⭐ {p.rating.toFixed(1)}</td>
                      <td className="py-2 pr-4 text-right">{p.reviewCount}</td>
                      <td className="py-2 text-right text-gray-500">{p.profileViews}</td>
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
