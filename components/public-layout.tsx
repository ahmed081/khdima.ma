import React from "react"
import { unstable_noStore as noStore } from "next/cache"
import { prisma } from "@/lib/prisma"

const AD_KEYS = [
  "AD_LEFT_ENABLED", "AD_LEFT_SIZE", "AD_LEFT_IMAGE_URL", "AD_LEFT_LINK_URL", "AD_LEFT_ALT",
  "AD_RIGHT_ENABLED", "AD_RIGHT_SIZE", "AD_RIGHT_IMAGE_URL", "AD_RIGHT_LINK_URL", "AD_RIGHT_ALT",
]

const HEIGHT: Record<string, string> = { sm: "120px", md: "220px", lg: "350px" }

function AdBox({ enabled, size, imageUrl, linkUrl, alt }: {
  enabled: boolean; size: string; imageUrl: string; linkUrl: string; alt: string
}) {
  if (!enabled) return null

  const height = HEIGHT[size] ?? HEIGHT.sm

  const inner = imageUrl ? (
    <img src={imageUrl} alt={alt || "advertisement"} className="w-full h-full object-cover" style={{ height }} />
  ) : (
    <div
      className="w-full flex items-center justify-center text-gray-300 text-[10px] select-none"
      style={{ height }}
    >
      ad
    </div>
  )

  return (
    <aside className="hidden xl:block w-[160px] flex-shrink-0 pt-6 self-start sticky top-24">
      <div className="w-full rounded-xl overflow-hidden border border-gray-100 bg-gray-50 shadow-sm">
        {linkUrl ? (
          <a href={linkUrl} target="_blank" rel="noopener noreferrer nofollow" className="block hover:opacity-90 transition-opacity">
            {inner}
          </a>
        ) : (
          inner
        )}
      </div>
    </aside>
  )
}

export async function PublicLayout({ children }: { children: React.ReactNode }) {
  noStore() // opt out of static caching so ad settings are always fresh
  let adParams: Record<string, string> = {}
  try {
    const rows = await prisma.param.findMany({ where: { key: { in: AD_KEYS } } })
    for (const r of rows) adParams[r.key] = r.value
  } catch {
    // silently skip if DB unavailable
  }

  const leftEnabled  = adParams["AD_LEFT_ENABLED"]  === "true"
  const rightEnabled = adParams["AD_RIGHT_ENABLED"] === "true"
  const showSidebars = leftEnabled || rightEnabled

  return (
    <div className={`flex justify-center gap-4 px-4 py-0 w-full ${showSidebars ? "" : ""}`}>
      {showSidebars && (
        <AdBox
          enabled={leftEnabled}
          size={adParams["AD_LEFT_SIZE"] || "sm"}
          imageUrl={adParams["AD_LEFT_IMAGE_URL"] || ""}
          linkUrl={adParams["AD_LEFT_LINK_URL"] || ""}
          alt={adParams["AD_LEFT_ALT"] || ""}
        />
      )}

      <div className="w-full max-w-[1200px] min-w-0">
        {children}
      </div>

      {showSidebars && (
        <AdBox
          enabled={rightEnabled}
          size={adParams["AD_RIGHT_SIZE"] || "sm"}
          imageUrl={adParams["AD_RIGHT_IMAGE_URL"] || ""}
          linkUrl={adParams["AD_RIGHT_LINK_URL"] || ""}
          alt={adParams["AD_RIGHT_ALT"] || ""}
        />
      )}
    </div>
  )
}
