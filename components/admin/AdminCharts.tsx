"use client"

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts"

interface ContactStat { type: string; count: number }
interface StatusStat  { status: string; count: number }

interface Props {
  contactStats: ContactStat[]
  statusStats:  StatusStat[]
}

const STATUS_COLORS: Record<string, string> = {
  ACTIVE:    "#22c55e",
  PENDING:   "#f59e0b",
  SUSPENDED: "#ef4444",
}

const CONTACT_COLORS: Record<string, string> = {
  WHATSAPP:     "#22c55e",
  CALL:         "#3b82f6",
  PROFILE_VIEW: "#8b5cf6",
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-3 py-2 text-xs">
      <p className="font-semibold text-gray-600 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey ?? p.name} style={{ color: p.fill ?? p.color }} className="font-bold">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  )
}

export function AdminCharts({ contactStats, statusStats }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

      {/* Contact types bar chart */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-bold text-gray-800 text-sm mb-1">Contact Types (30 days)</h3>
        <p className="text-xs text-gray-400 mb-5">Breakdown by interaction type</p>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={contactStats} margin={{ top: 5, right: 5, bottom: 0, left: -15 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="type" tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" name="Count" radius={[6, 6, 0, 0]}>
              {contactStats.map((entry) => (
                <Cell key={entry.type} fill={CONTACT_COLORS[entry.type] ?? "#6b7280"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Provider status pie chart */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-bold text-gray-800 text-sm mb-1">Provider Status</h3>
        <p className="text-xs text-gray-400 mb-5">Distribution across all providers</p>
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie
              data={statusStats}
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={70}
              dataKey="count"
              nameKey="status"
              paddingAngle={3}
            >
              {statusStats.map((entry) => (
                <Cell key={entry.status} fill={STATUS_COLORS[entry.status] ?? "#9ca3af"} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: "11px" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
