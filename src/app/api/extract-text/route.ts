import { NextRequest, NextResponse } from "next/server"
import { LlamaParseReader } from "llamaindex"
import { writeFile, unlink } from "fs/promises"
import { join } from "path"
import { existsSync, mkdirSync } from "fs"

const UPLOAD_DIR = join(process.cwd(), "tmp/uploads")

// Ensure upload directory exists
if (!existsSync(UPLOAD_DIR)) {
  mkdirSync(UPLOAD_DIR, { recursive: true })
}

// Route segment configuration
export const dynamic = 'force-dynamic' // Always run on the server
export const runtime = 'nodejs' // Use Node.js runtime

export async function POST(req: NextRequest) {
  let filePath: string | null = null

  try {
    console.log("[Text Extraction] Starting text extraction process...")
    
    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      console.error("[Text Extraction] Error: No file provided")
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      )
    }

    console.log("[Text Extraction] Processing file:", file.name)

    // Save the file temporarily
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    filePath = join(UPLOAD_DIR, `${Date.now()}-${file.name}`)
    await writeFile(filePath, buffer)

    console.log("[Text Extraction] File saved temporarily at:", filePath)
    console.log("[Text Extraction] LlamaParser API Key present:", !!process.env.LLAMA_CLOUD_API_KEY)

    try {
      // Extract text using LlamaParser with explicit API key
      const reader = new LlamaParseReader({
        resultType: "markdown",
        apiKey: process.env.LLAMA_CLOUD_API_KEY,
      })
      const documents = await reader.loadData(filePath)

      // Combine all document chunks for complete text
      const fullText = documents.map(doc => doc.text).join('\n\n')

      console.log("[Text Extraction] Successfully extracted text from:", file.name)

      // Return the extracted text
      return NextResponse.json({
        fileName: file.name,
        text: fullText,
      })
    } catch (extractionError: any) {
      console.error("[Text Extraction] LlamaParser Error:", extractionError)
      throw extractionError
    }
  } catch (error: any) {
    console.error("[Text Extraction] Error processing file:", error)
    return NextResponse.json(
      { error: "Error processing file: " + (error as Error).message },
      { status: 500 }
    )
  } finally {
    // Clean up temporary files
    if (existsSync(filePath)) {
      await unlink(filePath);
      console.log("[Text Extraction] Cleaned up temporary file:", filePath);
    }
  }
}
