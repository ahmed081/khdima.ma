import { getUserFromAuth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { AdminProviderActions } from "./AdminProviderActions"

interface Props {
  searchParams: Promise<{ status?: string }>
}

export default async function AdminProvidersPage({ searchParams }: Props) {
  const user = await getUserFromAuth()
  if (!user || user.role !== 'ADMIN') redirect('/')

  const sp = await searchParams
  const statusFilter = sp.status as any

  const providers = await prisma.provider.findMany({
    where: statusFilter ? { status: statusFilter } : undefined,
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { name: true, email: true } },
      city: { select: { name: true } },
      category: { select: { name: true } }
    }
  })

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-2xl font-bold mb-6 text-gray-900">Manage Providers</h1>

        {/* Status filter */}
        <div className="flex gap-2 mb-6">
          {['', 'PENDING', 'ACTIVE', 'SUSPENDED'].map(s => (
            <a
              key={s}
              href={s ? `?status=${s}` : '?'}
              className={`px-3 py-1.5 rounded text-sm font-medium border ${statusFilter === s || (!statusFilter && !s) ? 'bg-red-700 text-white border-red-700' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}`}
            >
              {s || 'All'}
            </a>
          ))}
        </div>

        <div className="space-y-3">
          {providers.map(provider => (
            <div key={provider.id} className="bg-white rounded-lg border p-4 flex items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-900">{provider.businessName}</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    provider.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                    provider.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
                  }`}>{provider.status}</span>
                </div>
                <p className="text-sm text-gray-500">{provider.user.name} · {provider.user.email}</p>
                <p className="text-xs text-gray-400">{provider.category.name} · {provider.city.name}</p>
              </div>
              <AdminProviderActions providerId={provider.id} currentStatus={provider.status} />
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
