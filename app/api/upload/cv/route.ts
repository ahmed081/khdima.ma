import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
// import OpenAI from "openai";

export const runtime = "nodejs";

// 🔥 AI client for skill extraction
// const openai = new OpenAI({
//     apiKey: process.env.OPENAI_API_KEY!,
// });

export async function POST(req: Request) {
    try {
        // Ensure multipart form-data
        const form = await req.formData();
        const file = form.get("file") as File;

        if (!file) {
            return NextResponse.json(
                { error: "Aucun fichier reçu" },
                { status: 400 }
            );
        }

        // PDF validation
        if (!file.type.includes("pdf")) {
            return NextResponse.json(
                { error: "Le CV doit être un PDF" },
                { status: 400 }
            );
        }

        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Create upload directory /uploads/cv
        const uploadsDir = path.join(process.cwd(), "uploads", "cv");
        await mkdir(uploadsDir, { recursive: true });

        // Generate filename
        const filename = `cv_${Date.now()}.pdf`;
        const filePath = path.join(uploadsDir, filename);

        // Save file
        await writeFile(filePath, buffer);

        const fileUrl = `/uploads/cv/${filename}`;

        // 🧠 Extract Skills using OpenAI
        // const skillExtraction = await openai.chat.completions.create({
        //     model: "gpt-4o-mini",
        //     messages: [
        //         {
        //             role: "system",
        //             content:
        //                 "You are a CV parser. Extract only SKILLS from the text. Return a JSON list of strings only.",
        //         },
        //         {
        //             role: "user",
        //             content: `Extract skills from this résumé (PDF raw text):\n\n`,
        //         },
        //     ],
        //     max_tokens: 200,
        // });

        // const skills =
        //     JSON.parse(skillExtraction.choices[0].message.content || "[]") || [];

        return NextResponse.json({
            url: fileUrl,
        });
    } catch (err: any) {
        console.error("UPLOAD ERROR:", err);

        return NextResponse.json(
            { error: "Erreur serveur lors de l'upload" },
            { status: 500 }
        );
    }
}
