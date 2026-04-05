import { NextRequest, NextResponse } from "next/server"
import { readFile } from "fs/promises"
import { existsSync } from "fs"
import path from "path"

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads")

const MIME: Record<string, string> = {
  jpg:  "image/jpeg",
  jpeg: "image/jpeg",
  png:  "image/png",
  webp: "image/webp",
  gif:  "image/gif",
  heic: "image/heic",
  heif: "image/heif",
  avif: "image/avif",
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params
  // Only allow a single filename — no directory traversal
  if (segments.length !== 1 || segments[0].includes("..") || segments[0].includes("/")) {
    return new NextResponse("Not found", { status: 404 })
  }

  const filename = segments[0]
  const filepath = path.join(UPLOAD_DIR, filename)

  if (!existsSync(filepath)) {
    return new NextResponse("Not found", { status: 404 })
  }

  const ext         = filename.split(".").pop()?.toLowerCase() ?? "jpg"
  const contentType = MIME[ext] ?? "application/octet-stream"
  const buffer      = await readFile(filepath)

  return new NextResponse(buffer, {
    headers: {
      "Content-Type":  contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  })
}
