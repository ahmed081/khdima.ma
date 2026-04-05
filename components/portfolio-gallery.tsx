"use client"

import { useState, useEffect, useCallback } from "react"
import { X, ChevronLeft, ChevronRight, Camera } from "lucide-react"

interface Photo { id: number; url: string; caption: string | null }

export function PortfolioGallery({ photos, label }: { photos: Photo[]; label: string }) {
  const [open, setOpen]   = useState(false)
  const [index, setIndex] = useState(0)

  const prev = useCallback(() => setIndex(i => (i - 1 + photos.length) % photos.length), [photos.length])
  const next = useCallback(() => setIndex(i => (i + 1) % photos.length), [photos.length])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape")     setOpen(false)
      if (e.key === "ArrowLeft")  prev()
      if (e.key === "ArrowRight") next()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, prev, next])

  // lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [open])

  return (
    <>
      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {photos.map((img, i) => (
          <button
            key={img.id}
            type="button"
            onClick={() => { setIndex(i); setOpen(true) }}
            className="aspect-square rounded-xl overflow-hidden bg-gray-100 relative group shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <img
              src={img.url}
              alt={img.caption ?? ""}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            {img.caption && (
              <p className="absolute inset-x-0 bottom-0 p-2.5 text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity truncate text-start">
                {img.caption}
              </p>
            )}
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {open && (
        <div
          className="fixed inset-0 z-[999] bg-black/95 flex flex-col"
          onClick={() => setOpen(false)}
        >
          {/* Top bar */}
          <div className="flex items-center justify-between px-4 py-3 flex-shrink-0" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-2 text-white/70 text-sm">
              <Camera className="h-4 w-4" />
              <span>{label}</span>
              <span className="text-white/40">·</span>
              <span>{index + 1} / {photos.length}</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Image area */}
          <div className="flex-1 flex items-center justify-center relative min-h-0 px-14" onClick={e => e.stopPropagation()}>
            <img
              src={photos[index].url}
              alt={photos[index].caption ?? ""}
              className="max-w-full max-h-full object-contain rounded-lg select-none"
              draggable={false}
            />

            {/* Prev */}
            {photos.length > 1 && (
              <button
                onClick={prev}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}

            {/* Next */}
            {photos.length > 1 && (
              <button
                onClick={next}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            )}
          </div>

          {/* Caption */}
          {photos[index].caption && (
            <div className="flex-shrink-0 text-center text-white/70 text-sm px-8 py-3" onClick={e => e.stopPropagation()}>
              {photos[index].caption}
            </div>
          )}

          {/* Thumbnails */}
          {photos.length > 1 && (
            <div className="flex-shrink-0 flex gap-2 justify-center px-4 pb-4 overflow-x-auto" onClick={e => e.stopPropagation()}>
              {photos.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setIndex(i)}
                  className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition ${i === index ? "border-white" : "border-transparent opacity-50 hover:opacity-75"}`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  )
}
