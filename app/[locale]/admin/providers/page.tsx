import { getUserFromAuth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { AdminProviderActions } from "./AdminProviderActions"
import { tMany } from "@/lib/translations"
import { Link } from "@/i18n/navigation"

interface Props {
  searchParams: Promise<{ status?: string }>
}

export default async function AdminProvidersPage({ searchParams }: Props) {
  const user = await getUserFromAuth()
  if (!user || user.role !== 'ADMIN') redirect('/')

  const sp           = await searchParams
  const statusFilter = sp.status as any

  const providers = await prisma.provider.findMany({
    where:   statusFilter ? { status: statusFilter } : undefined,
    orderBy: { createdAt: 'desc' },
    include: {
      user:     { select: { name: true, email: true } },
      city:     { select: { code: true, nameFr: true } },
      category: { select: { code: true, slug: true } },
    }
  })

  // Translate category names
  const catCodes = [...new Set(providers.map(p => `CAT_${p.category.code}`))]
  const translations = catCodes.length ? await tMany(catCodes, 'fr') : {}

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin" className="text-gray-500 hover:text-gray-700 text-sm">← Dashboard</Link>
          <h1 className="text-2xl font-bold text-gray-900">Manage Providers</h1>
        </div>

        {/* Status tabs */}
        <div className="flex gap-2 mb-6">
          {['', 'PENDING', 'ACTIVE', 'SUSPENDED'].map(s => (
            <a
              key={s}
              href={s ? `?status=${s}` : '?'}
              className={`px-3 py-1.5 rounded text-sm font-medium border transition-colors ${
                (statusFilter === s || (!statusFilter && !s))
                  ? 'bg-green-700 text-white border-green-700'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
              }`}
            >
              {s || 'All'}
            </a>
          ))}
        </div>

        <div className="space-y-3">
          {providers.map(provider => (
            <div key={provider.id} className="bg-white rounded-lg border p-4 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-semibold text-gray-900">{provider.businessName}</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    provider.status === 'ACTIVE'    ? 'bg-green-100 text-green-700' :
                    provider.status === 'PENDING'   ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
                  }`}>{provider.status}</span>
                  {provider.isVerified && <span className="px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-700">✓ Verified</span>}
                </div>
                <p className="text-sm text-gray-500 truncate">{provider.user.name} · {provider.user.email}</p>
                <p className="text-xs text-gray-400">
                  {translations[`CAT_${provider.category.code}`] ?? provider.category.code} · {provider.city.nameFr}
                </p>
              </div>
              <AdminProviderActions providerId={provider.id} currentStatus={provider.status} isVerified={provider.isVerified} />
            </div>
          ))}
          {providers.length === 0 && (
            <p className="text-center text-gray-500 py-10">No providers found</p>
          )}
        </div>
      </div>
    </main>
  )
}
