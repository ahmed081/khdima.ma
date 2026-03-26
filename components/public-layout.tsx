/**
 * PublicLayout — wraps public-facing pages with a centered 1200px content area
 * and 300px ad sidebar placeholders on each side.
 *
 * Usage:  <PublicLayout>{children}</PublicLayout>
 *
 * Layout (≥ 1800px wide screens):
 *   [Ad 300px] [Content max-1200px] [Ad 300px]
 *
 * On narrower screens the sidebars collapse gracefully:
 *   ≥1600px  → both sidebars visible
 *   ≥1300px  → right sidebar only
 *   <1300px  → content full width (no sidebars)
 */

import React from "react"

function AdBox({ label }: { label: string }) {
  return (
    <aside
      aria-label={label}
      className="hidden xl:flex flex-col gap-4 w-[300px] flex-shrink-0 pt-6"
    >
      {/* Primary ad slot */}
      <div className="w-full h-[600px] rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center text-gray-400 text-xs select-none">
        <div className="w-12 h-12 rounded-lg bg-gray-200 mb-3 flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M3 9h18M9 21V9" />
          </svg>
        </div>
        <p className="font-medium">300 × 600</p>
        <p className="text-gray-300 mt-1">Espace publicitaire</p>
      </div>

      {/* Secondary ad slot */}
      <div className="w-full h-[250px] rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center text-gray-400 text-xs select-none">
        <p className="font-medium">300 × 250</p>
        <p className="text-gray-300 mt-1">Espace publicitaire</p>
      </div>
    </aside>
  )
}

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-center gap-6 px-4 py-0 w-full">
      {/* Left ad sidebar */}
      <AdBox label="Left advertisement" />

      {/* Main content — max 1200px */}
      <div className="w-full max-w-[1200px] min-w-0">
        {children}
      </div>

      {/* Right ad sidebar */}
      <AdBox label="Right advertisement" />
    </div>
  )
}
