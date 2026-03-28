import { prisma } from "@/lib/prisma"
import { Link } from "@/i18n/navigation"
import {
  Users, Briefcase, BarChart3, Languages, Tag,
  Clock, Flag, CheckCircle, AlertCircle, TrendingUp,
  Eye, Shield, ChevronRight, Activity, Phone, MapPin,
} from "lucide-react"
import { AdminCharts } from "@/components/admin/AdminCharts"

// Middleware enforces ADMIN-only access to /admin/*
export default async function AdminDashboardPage() {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const [
    pendingCount,
    activeProviders,
    suspendedProviders,
    totalUsers,
    totalContacts,
    openReports,
    recentContacts,
    whatsappCount,
    callCount,
    profileViewCount,
  ] = await Promise.all([
    prisma.provider.count({ where: { status: "PENDING" } }),
    prisma.provider.count({ where: { status: "ACTIVE" } }),
    prisma.provider.count({ where: { status: "SUSPENDED" } }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.contactLog.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.report.count({ where: { status: "OPEN" } }),
    prisma.contactLog.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: {
        provider: { select: { businessName: true } },
        user:     { select: { name: true } },
      },
    }),
    prisma.contactLog.count({ where: { type: "WHATSAPP", createdAt: { gte: thirtyDaysAgo } } }),
    prisma.contactLog.count({ where: { type: "CALL",     createdAt: { gte: thirtyDaysAgo } } }),
    prisma.contactLog.count({ where: { type: "PROFILE_VIEW", createdAt: { gte: thirtyDaysAgo } } }),
  ])

  // Chart data (serializable for client component)
  const contactStats = [
    { type: "WHATSAPP",     count: whatsappCount },
    { type: "CALL",         count: callCount },
    { type: "PROFILE_VIEW", count: profileViewCount },
  ]
  const statusStats = [
    { status: "ACTIVE",    count: activeProviders },
    { status: "PENDING",   count: pendingCount },
    { status: "SUSPENDED", count: suspendedProviders },
  ]

  const navItems = [
    {
      href: "/admin/providers",
      icon: Briefcase,
      label: "Providers",
      desc: "Approve & manage providers",
      badge: pendingCount > 0 ? pendingCount : null,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      href: "/admin/categories",
      icon: Tag,
      label: "Categories",
      desc: "Manage service categories",
      badge: null,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      href: "/admin/translations",
      icon: Languages,
      label: "Translations",
      desc: "Manage i18n strings",
      badge: null,
      color: "text-teal-600",
      bg: "bg-teal-50",
    },
    {
      href: "/admin/analytics",
      icon: BarChart3,
      label: "Analytics",
      desc: "Platform statistics",
      badge: null,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      href: "/admin/reports",
      icon: Flag,
      label: "Reports",
      desc: "Handle abuse reports",
      badge: openReports > 0 ? openReports : null,
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      href: "/admin/contact",
      icon: Phone,
      label: "Contact",
      desc: "Contact info & form submissions",
      badge: null,
      color: "text-cyan-600",
      bg: "bg-cyan-50",
    },
    {
      href: "/admin/cities",
      icon: MapPin,
      label: "Cities",
      desc: "Manage Moroccan cities",
      badge: null,
      color: "text-green-600",
      bg: "bg-green-50",
    },
  ]

  return (
    <main className="min-h-screen bg-slate-50 pb-16">

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900 overflow-hidden">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-blue-500/10" />
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-white/[0.02]" />

        <div className="relative container mx-auto px-4 max-w-6xl py-10">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <span className="text-xs font-semibold text-white/50 uppercase tracking-widest">
                  Admin Panel
                </span>
              </div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight mb-1">
                Dashboard
              </h1>
              <p className="text-white/50 text-sm">
                Platform overview and management tools
              </p>
            </div>

            {/* Live indicators */}
            <div className="flex flex-wrap gap-3">
              {pendingCount > 0 && (
                <div className="flex items-center gap-2 bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-semibold px-3 py-2 rounded-xl">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  {pendingCount} pending review
                </div>
              )}
              {openReports > 0 && (
                <div className="flex items-center gap-2 bg-red-500/20 border border-red-400/30 text-red-300 text-xs font-semibold px-3 py-2 rounded-xl">
                  <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                  {openReports} open report{openReports > 1 ? "s" : ""}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Wave */}
        <div className="h-8 bg-slate-50" style={{ clipPath: "ellipse(100% 100% at 50% 100%)" }} />
      </div>

      <div className="container mx-auto px-4 max-w-6xl -mt-4">

        {/* ── STATS CARDS ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">

          {/* Pending */}
          <div className="col-span-1 relative overflow-hidden rounded-2xl bg-white border border-amber-100 shadow-sm p-5 group hover:shadow-md transition-shadow">
            <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-amber-100 opacity-60" />
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center mb-3">
              <Clock className="h-4 w-4 text-amber-600" />
            </div>
            <p className="text-2xl font-extrabold text-amber-600">{pendingCount}</p>
            <p className="text-xs text-gray-500 mt-0.5">Pending</p>
            <Link
              href="/admin/providers?status=PENDING"
              className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-amber-600 hover:text-amber-700"
            >
              Review <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          {/* Active */}
          <div className="relative overflow-hidden rounded-2xl bg-white border border-green-100 shadow-sm p-5 hover:shadow-md transition-shadow">
            <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-green-100 opacity-60" />
            <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center mb-3">
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
            <p className="text-2xl font-extrabold text-green-600">{activeProviders}</p>
            <p className="text-xs text-gray-500 mt-0.5">Active providers</p>
          </div>

          {/* Customers */}
          <div className="relative overflow-hidden rounded-2xl bg-white border border-blue-100 shadow-sm p-5 hover:shadow-md transition-shadow">
            <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-blue-100 opacity-60" />
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
            <p className="text-2xl font-extrabold text-blue-600">{totalUsers}</p>
            <p className="text-xs text-gray-500 mt-0.5">Customers</p>
          </div>

          {/* Contacts */}
          <div className="relative overflow-hidden rounded-2xl bg-white border border-purple-100 shadow-sm p-5 hover:shadow-md transition-shadow">
            <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-purple-100 opacity-60" />
            <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center mb-3">
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </div>
            <p className="text-2xl font-extrabold text-purple-600">{totalContacts}</p>
            <p className="text-xs text-gray-500 mt-0.5">Contacts (30d)</p>
          </div>

          {/* Open reports */}
          <div className={`relative overflow-hidden rounded-2xl border shadow-sm p-5 hover:shadow-md transition-shadow ${openReports > 0 ? "bg-red-50 border-red-200" : "bg-white border-gray-100"}`}>
            <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-red-100 opacity-60" />
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${openReports > 0 ? "bg-red-100" : "bg-gray-50"}`}>
              <AlertCircle className={`h-4 w-4 ${openReports > 0 ? "text-red-600" : "text-gray-400"}`} />
            </div>
            <p className={`text-2xl font-extrabold ${openReports > 0 ? "text-red-600" : "text-gray-400"}`}>{openReports}</p>
            <p className="text-xs text-gray-500 mt-0.5">Open reports</p>
            {openReports > 0 && (
              <Link
                href="/admin/reports"
                className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700"
              >
                View <ChevronRight className="h-3 w-3" />
              </Link>
            )}
          </div>
        </div>

        {/* ── CHARTS ────────────────────────────────────────────────────── */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-4 w-4 text-gray-500" />
            <h2 className="font-bold text-gray-900">Activity Overview</h2>
            <span className="text-xs text-gray-400">· Last 30 days</span>
          </div>
          <AdminCharts contactStats={contactStats} statusStats={statusStats} />
        </div>

        {/* ── NAV CARDS ─────────────────────────────────────────────────── */}
        <div className="mb-8">
          <h2 className="font-bold text-gray-900 mb-4">Management Tools</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {navItems.map(item => (
              <Link key={item.href} href={item.href} className="group">
                <div className="relative bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col items-center text-center hover:shadow-md hover:border-gray-200 transition-all group-hover:-translate-y-0.5">
                  {item.badge !== null && (
                    <span className="absolute -top-2 -right-2 min-w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center px-1 shadow">
                      {item.badge}
                    </span>
                  )}
                  <div className={`w-11 h-11 rounded-xl ${item.bg} flex items-center justify-center mb-3 transition-transform group-hover:scale-110`}>
                    <item.icon className={`h-5 w-5 ${item.color}`} />
                  </div>
                  <p className="font-semibold text-gray-800 text-sm">{item.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5 leading-snug">{item.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ── RECENT CONTACTS ───────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <Activity className="h-4 w-4 text-gray-400" />
            <h2 className="font-bold text-gray-900 text-sm">Recent Contact Logs</h2>
          </div>

          {recentContacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <Eye className="h-10 w-10 mb-3 opacity-30" />
              <p className="text-sm">No contact logs yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-50">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Provider</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">User</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Type</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentContacts.map(log => (
                    <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-3.5 font-semibold text-gray-800">{log.provider.businessName}</td>
                      <td className="px-6 py-3.5 text-gray-500">{log.user?.name ?? "Anonymous"}</td>
                      <td className="px-6 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          log.type === "WHATSAPP"
                            ? "bg-green-100 text-green-700"
                            : log.type === "CALL"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-purple-100 text-purple-700"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            log.type === "WHATSAPP" ? "bg-green-500" :
                            log.type === "CALL"     ? "bg-blue-500"  : "bg-purple-500"
                          }`} />
                          {log.type}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-gray-400 text-xs">
                        {new Date(log.createdAt).toLocaleDateString("en-US", {
                          year: "numeric", month: "short", day: "numeric",
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {recentContacts.length > 0 && (
            <div className="px-6 py-3 border-t border-gray-50">
              <Link
                href="/admin/analytics"
                className="text-xs font-semibold text-green-700 hover:text-green-600 flex items-center gap-1"
              >
                View full analytics <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
