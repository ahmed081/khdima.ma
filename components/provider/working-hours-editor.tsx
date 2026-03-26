"use client"

import { Copy } from "lucide-react"

export type DayKey = "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN"
export type DaySchedule = { open: boolean; from: string; to: string }
export type WorkingHoursData = Partial<Record<DayKey, DaySchedule>>

const DAYS: DayKey[] = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]

const DEFAULT_SCHEDULE: DaySchedule = { open: false, from: "09:00", to: "18:00" }

const DAY_LABELS: Record<DayKey, { en: string; fr: string; ar: string }> = {
  MON: { en: "Monday",    fr: "Lundi",    ar: "الاثنين"  },
  TUE: { en: "Tuesday",   fr: "Mardi",    ar: "الثلاثاء" },
  WED: { en: "Wednesday", fr: "Mercredi", ar: "الأربعاء" },
  THU: { en: "Thursday",  fr: "Jeudi",    ar: "الخميس"   },
  FRI: { en: "Friday",    fr: "Vendredi", ar: "الجمعة"   },
  SAT: { en: "Saturday",  fr: "Samedi",   ar: "السبت"    },
  SUN: { en: "Sunday",    fr: "Dimanche", ar: "الأحد"    },
}

interface Props {
  value: WorkingHoursData
  onChange: (value: WorkingHoursData) => void
  locale?: string
}

export function WorkingHoursEditor({ value, onChange, locale = "fr" }: Props) {
  const isRTL = locale === "ar"

  const L = {
    open:      locale === "ar" ? "مفتوح"   : locale === "en" ? "Open"         : "Ouvert",
    closed:    locale === "ar" ? "مغلق"    : locale === "en" ? "Closed"       : "Fermé",
    from:      locale === "ar" ? "من"      : locale === "en" ? "From"         : "De",
    to:        locale === "ar" ? "إلى"     : locale === "en" ? "To"           : "À",
    copyAll:   locale === "ar" ? "تطبيق على جميع الأيام" : locale === "en" ? "Copy to all open days" : "Appliquer à tous les jours ouverts",
  }

  const getSchedule = (day: DayKey): DaySchedule => ({ ...DEFAULT_SCHEDULE, ...value[day] })

  const updateDay = (day: DayKey, patch: Partial<DaySchedule>) => {
    onChange({ ...value, [day]: { ...getSchedule(day), ...patch } })
  }

  const copyToAll = (day: DayKey) => {
    const source = getSchedule(day)
    const updated = { ...value }
    DAYS.forEach(d => {
      const current = getSchedule(d)
      if (current.open) {
        updated[d] = { ...current, from: source.from, to: source.to }
      }
    })
    onChange(updated)
  }

  const getDayLabel = (day: DayKey) => {
    const labels = DAY_LABELS[day]
    return locale === "ar" ? labels.ar : locale === "en" ? labels.en : labels.fr
  }

  return (
    <div className="space-y-2" dir={isRTL ? "rtl" : "ltr"}>
      {DAYS.map(day => {
        const schedule = getSchedule(day)
        return (
          <div
            key={day}
            className={`relative flex flex-wrap items-center gap-x-4 gap-y-2 p-3.5 rounded-xl border transition-all duration-200 ${
              schedule.open
                ? "bg-green-50/80 border-green-200 shadow-sm"
                : "bg-gray-50 border-gray-200"
            }`}
          >
            {/* Day name */}
            <span className="w-28 text-sm font-semibold text-gray-700 flex-shrink-0">
              {getDayLabel(day)}
            </span>

            {/* Toggle switch */}
            <button
              type="button"
              onClick={() => updateDay(day, { open: !schedule.open })}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-1 ${
                schedule.open ? "bg-green-600" : "bg-gray-300"
              }`}
              aria-label={schedule.open ? L.open : L.closed}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200 ${
                  schedule.open
                    ? isRTL ? "-translate-x-5" : "translate-x-5"
                    : "translate-x-1"
                }`}
              />
            </button>

            {/* Status badge */}
            <span
              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full flex-shrink-0 ${
                schedule.open
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {schedule.open ? L.open : L.closed}
            </span>

            {/* Time inputs — only when open */}
            {schedule.open && (
              <div className="flex items-center gap-2 flex-wrap flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-gray-500 font-medium">{L.from}</span>
                  <input
                    type="time"
                    value={schedule.from}
                    onChange={e => updateDay(day, { from: e.target.value })}
                    className="rounded-lg border border-gray-300 bg-white px-2 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-shadow"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-gray-500 font-medium">{L.to}</span>
                  <input
                    type="time"
                    value={schedule.to}
                    onChange={e => updateDay(day, { to: e.target.value })}
                    className="rounded-lg border border-gray-300 bg-white px-2 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-shadow"
                  />
                </div>

                {/* Copy to all open days */}
                <button
                  type="button"
                  onClick={() => copyToAll(day)}
                  title={L.copyAll}
                  className="ml-auto flex items-center gap-1 text-xs text-gray-400 hover:text-green-700 transition-colors px-2 py-1 rounded-lg hover:bg-green-50"
                >
                  <Copy className="h-3 w-3" />
                  <span className="hidden sm:inline">{L.copyAll}</span>
                </button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
