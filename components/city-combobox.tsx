"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useLocale } from "next-intl"
import { useQuery } from "@tanstack/react-query"
import { Search, ChevronDown, MapPin, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface City {
  id: number
  code: string
  name: string
}

interface Props {
  value?: string          // city id as string
  onChange: (value: string) => void
  required?: boolean
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function CityCombobox({ value, onChange, required, placeholder, className, disabled }: Props) {
  const locale       = useLocale()
  const [open,       setOpen]       = useState(false)
  const [query,      setQuery]      = useState("")
  const inputRef     = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const { data: cities = [], isLoading } = useQuery<City[]>({
    queryKey: ["cities", locale],
    queryFn:  () => fetch(`/api/cities?locale=${locale}`).then(r => r.json()),
    staleTime: 5 * 60 * 1000,
  })

  const selected = cities.find(c => String(c.id) === value)

  const filtered = query.trim()
    ? cities.filter(c => c.name.toLowerCase().includes(query.toLowerCase()))
    : cities

  const ph = placeholder ?? (locale === "ar" ? "اختر مدينة" : locale === "fr" ? "Choisir une ville" : "Select a city")

  // Close on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery("")
      }
    }
    document.addEventListener("mousedown", handle)
    return () => document.removeEventListener("mousedown", handle)
  }, [])

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape") { setOpen(false); setQuery("") }
  }, [])

  const select = (city: City) => {
    onChange(String(city.id))
    setOpen(false)
    setQuery("")
  }

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange("")
    setQuery("")
  }

  return (
    <div ref={containerRef} className={cn("relative", className)} onKeyDown={handleKeyDown}>
      {/* Hidden native input for form validation */}
      {required && <input type="hidden" value={value ?? ""} required />}

      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => { setOpen(v => !v); setTimeout(() => inputRef.current?.focus(), 50) }}
        className={cn(
          "w-full h-11 flex items-center gap-2 px-3 border rounded-xl text-sm bg-white transition-all",
          "focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500",
          open ? "border-green-500 ring-1 ring-green-500" : "border-gray-200 hover:border-gray-300",
          disabled && "opacity-50 cursor-not-allowed",
          !selected && "text-gray-400",
          selected && "text-gray-800",
        )}
      >
        <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
        <span className="flex-1 text-start truncate">
          {selected ? selected.name : ph}
        </span>
        {selected && !disabled ? (
          <X className="h-3.5 w-3.5 text-gray-400 hover:text-gray-600 flex-shrink-0" onClick={clear} />
        ) : (
          <ChevronDown className={cn("h-4 w-4 text-gray-400 flex-shrink-0 transition-transform", open && "rotate-180")} />
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 top-full mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          {/* Search input */}
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute start-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={locale === "ar" ? "ابحث..." : locale === "fr" ? "Rechercher..." : "Search..."}
                className="w-full ps-8 pe-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-green-500"
              />
            </div>
          </div>

          {/* List */}
          <div className="max-h-52 overflow-y-auto">
            {isLoading ? (
              <div className="p-3 text-center text-sm text-gray-400">
                {locale === "ar" ? "جارٍ التحميل..." : locale === "fr" ? "Chargement..." : "Loading..."}
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-3 text-center text-sm text-gray-400">
                {locale === "ar" ? "لا توجد نتائج" : locale === "fr" ? "Aucun résultat" : "No results"}
              </div>
            ) : (
              filtered.map(city => (
                <button
                  key={city.id}
                  type="button"
                  onClick={() => select(city)}
                  className={cn(
                    "w-full text-start px-3 py-2 text-sm hover:bg-green-50 hover:text-green-700 transition-colors flex items-center gap-2",
                    String(city.id) === value && "bg-green-50 text-green-700 font-medium",
                  )}
                >
                  <MapPin className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                  {city.name}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
