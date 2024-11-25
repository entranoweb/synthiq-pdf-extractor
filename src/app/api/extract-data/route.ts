import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import { z } from "zod"

const openai = new OpenAI()

export async function POST(req: NextRequest) {
  try {
    console.log("[Data Extraction] Starting data extraction process...")
    
    const body = await req.json()
    console.log("[Data Extraction] Request body:", JSON.stringify(body, null, 2))
    
    const { text, schema } = body

    // Convert schema to OpenAI function parameters
    const schemaProperties: Record<string, any> = {}
    const required: string[] = []

    schema.forEach((field: any) => {
      if (field.type === "array") {
        schemaProperties[field.name] = {
          type: "array",
          items: {
            type: "object",
            properties: {},
            required: []
          },
          description: `Array of ${field.name}`
        }
        
        field.fields.forEach((subField: any) => {
          schemaProperties[field.name].items.properties[subField.name] = {
            type: subField.type,
            description: `${subField.name} of the item`
          }
          schemaProperties[field.name].items.required.push(subField.name)
        })
      } else {
        schemaProperties[field.name] = {
          type: field.type,
          description: `${field.name} from the document`
        }
      }
      required.push(field.name)
    })

    console.log("[Data Extraction] Processing text with OpenAI:", text.substring(0, 100) + "...")
    console.log("[Data Extraction] OpenAI API Key present:", !!process.env.OPENAI_API_KEY)

    const completion = await openai.chat.completions.create({
      model: "gpt-4-1106-preview",
      messages: [
        {
          role: "system",
          content: "You are an expert at extracting structured data from invoice documents. Extract the requested information accurately."
        },
        {
          role: "user",
          content: text
        }
      ],
      functions: [
        {
          name: "invoice_data_extraction",
          description: "Extract structured data from invoice text",
          parameters: {
            type: "object",
            properties: schemaProperties,
            required: required
          }
        }
      ],
      function_call: { name: "invoice_data_extraction" }
    })

    const result = completion.choices[0].message.function_call?.arguments
    if (!result) {
      throw new Error("No data extracted")
    }

    const parsedData = JSON.parse(result)
    
    // Create dynamic Zod schema based on the input schema
    const createZodSchema = (schema: any[]): z.ZodObject<any> => {
      const schemaMap: Record<string, any> = {}
      
      schema.forEach((field) => {
        if (field.type === "array") {
          schemaMap[field.name] = z.array(
            z.object(
              field.fields.reduce((acc: any, subField: any) => {
                acc[subField.name] = subField.type === "string" 
                  ? z.string()
                  : z.number()
                return acc
              }, {})
            )
          )
        } else {
          schemaMap[field.name] = field.type === "string" 
            ? z.string()
            : z.number()
        }
      })
      
      return z.object(schemaMap)
    }

    const dynamicSchema = createZodSchema(schema)
    const validatedData = dynamicSchema.parse(parsedData)

    return NextResponse.json(validatedData)
  } catch (error) {
    console.error("[Data Extraction] OpenAI API Error:", error)
    return NextResponse.json(
      { error: "Failed to extract data" },
      { status: 400 }
    )
  }
}
