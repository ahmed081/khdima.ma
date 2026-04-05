import { NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { existsSync } from "fs"
import path from "path"
import { getUserFromAuth } from "@/lib/auth"

const MAX_SIZE   = 5 * 1024 * 1024 // 5 MB
const ALLOWED    = new Set([
  "image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif",
  "image/heic", "image/heif",  // iOS camera formats
])
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads")

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromAuth()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const contentType = req.headers.get("content-type") ?? ""
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json({ error: "Must be multipart/form-data" }, { status: 400 })
    }

    const formData = await req.formData()
    const file     = formData.get("file") as File | null

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 })
    if (!ALLOWED.has(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Allowed: JPEG, PNG, WebP, GIF" }, { status: 400 })
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File too large (max 5 MB)" }, { status: 400 })
    }

    // Ensure upload directory exists
    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true })
    }

    // Generate unique filename
    const ext      = file.name.split(".").pop()?.toLowerCase() ?? "jpg"
    const filename = `${user.id}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`
    const filepath = path.join(UPLOAD_DIR, filename)

    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(filepath, buffer)

    const url = `/uploads/${filename}`
    return NextResponse.json({ url }, { status: 200 })

  } catch (err: any) {
    console.error("[UPLOAD]", err)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
