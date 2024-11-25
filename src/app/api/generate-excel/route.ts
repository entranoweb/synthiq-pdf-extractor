import { NextRequest, NextResponse } from "next/server"
import * as XLSX from 'xlsx'
import { z } from "zod"

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Define the schema for the data structure that's actually being sent
const ItemSchema = z.object({
  item: z.string(),
  unit_price: z.number(),
  quantity: z.number(),
  sum: z.number()
})

const DataSchema = z.object({
  company: z.string(),
  address: z.string(),
  total_sum: z.number(),
  items: z.array(ItemSchema)
})

const RequestSchema = z.object({
  data: z.array(z.object({
    fileName: z.string(),
    data: DataSchema
  }))
})

// Add proper types for the data structure
interface FileData {
  fileName: string;
  data: {
    company: string;
    address: string;
    total_sum: number;
    items: Array<{
      item: string;
      unit_price: number;
      quantity: number;
      sum: number;
    }>;
  };
}

export async function POST(req: NextRequest) {
  try {
    console.log("[Excel Generation] Starting excel generation process...")
    
    const body = await req.json()
    console.log("[Excel Generation] Request body:", JSON.stringify(body, null, 2))

    // Create flattened data with all fields from the first item
    const flattenedData = body.data.flatMap((fileData: FileData) => {
      const baseData = {
        'File Name': fileData.fileName,
      } as Record<string, any>;  // Use Record type for dynamic keys

      // Add all non-array fields
      Object.entries(fileData.data).forEach(([key, value]) => {
        if (!Array.isArray(value)) {
          baseData[key] = value;
        }
      });

      // Handle array fields
      return fileData.data.items.map((item) => ({
        ...baseData,
        ...item
      }));
    });

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.json_to_sheet(flattenedData)
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Extracted Data')
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

    console.log("[Excel Generation] Successfully generated Excel file")

    return new NextResponse(excelBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="extracted_data_${Date.now()}.xlsx"`
      }
    })
  } catch (error: any) {
    console.error("[Excel Generation] Error:", error)
    return NextResponse.json(
      { 
        error: "Error generating Excel file",
        details: error.message,
        status: error.status || 500
      },
      { status: error.status || 500 }
    )
  }
}
