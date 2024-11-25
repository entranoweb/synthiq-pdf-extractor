"use client"

import { useState } from "react"
import { FileUpload } from "@/components/file-upload-component"
import { SchemaBuilder, type SchemaField } from "@/components/schema-builder-component"
import { Button } from "@/components/ui/button"
import { PreviewDialog } from "@/components/preview-dialog-component"
import { DownloadExcelButton } from "@/components/download-excel-component"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/components/ui/use-toast"
import { FileText, Eye, PlayCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Select } from "@/components/ui/select"

interface FileWithText extends File {
  extractedText?: string
}

const defaultSchema: SchemaField[] = [
  {
    name: "company",
    type: "string",
  },
  {
    name: "address",
    type: "string",
  },
  {
    name: "total_sum",
    type: "number",
  },
  {
    name: "items",
    type: "array",
    fields: [
      {
        name: "item",
        type: "string",
      },
      {
        name: "unit_price",
        type: "number",
      },
      {
        name: "quantity",
        type: "number",
      },
      {
        name: "sum",
        type: "number",
      },
    ],
  },
]

export default function Home() {
  const [files, setFiles] = useState<FileWithText[]>([])
  const [schema, setSchema] = useState<SchemaField[]>(defaultSchema)
  const [previewFile, setPreviewFile] = useState<FileWithText | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [processingFiles, setProcessingFiles] = useState<Set<string>>(new Set())
  const [isExtracting, setIsExtracting] = useState(false)
  const [extractedData, setExtractedData] = useState<any[]>([])
  const { toast } = useToast()

  const handleExtractText = async (file: File): Promise<string> => {
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/extract-text", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to extract text from PDF")
      }

      const data = await response.json()
      return data.text
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to extract text from ${file.name}`,
        variant: "destructive",
      })
      throw error
    }
  }

  const handleExtractData = async (text: string, schema: SchemaField[]) => {
    try {
      const response = await fetch("/api/extract-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text, schema }),
      })

      if (!response.ok) {
        throw new Error("Failed to extract structured data")
      }

      const data = await response.json()
      return data
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to extract structured data",
        variant: "destructive",
      })
      throw error
    }
  }

  const handleDownloadExcel = async () => {
    try {
      const response = await fetch("/api/generate-excel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: extractedData }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to generate Excel file")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `extracted_data_${Date.now()}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast({
        title: "Success",
        description: "Excel file downloaded successfully",
      })
    } catch (error: unknown) {
      console.error("Excel download error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate Excel file",
        variant: "destructive",
      })
    }
  }

  const handleFilesSelected = async (newFiles: File[]) => {
    setFiles(prevFiles => [...newFiles, ...prevFiles])
    
    // Process text extraction for each file
    for (const file of newFiles) {
      try {
        setProcessingFiles(prev => new Set(prev).add(file.name))
        const text = await handleExtractText(file)
        setFiles(prevFiles => 
          prevFiles.map(f => 
            f.name === file.name ? Object.assign(f, { extractedText: text }) : f
          )
        )
      } catch (error) {
        console.error(`Error extracting text from ${file.name}:`, error)
        toast({
          title: "Error",
          description: `Failed to extract text from ${file.name}`,
          variant: "destructive",
        })
      } finally {
        setProcessingFiles(prev => {
          const newSet = new Set(prev)
          newSet.delete(file.name)
          return newSet
        })
      }
    }
  }

  const handleStartExtraction = async () => {
    if (files.length === 0) {
      toast({
        title: "Error",
        description: "Please upload at least one PDF file",
        variant: "destructive",
      })
      return
    }

    setIsExtracting(true)
    try {
      const processedData = []
      
      for (const file of files) {
        try {
          setProcessingFiles(prev => new Set(prev).add(file.name))
          const text = await handleExtractText(file)
          setFiles(prevFiles => 
            prevFiles.map(f => 
              f.name === file.name ? Object.assign(f, { extractedText: text }) : f
            )
          )
        } catch (error) {
          console.error(`Error extracting text from ${file.name}:`, error)
          continue
        } finally {
          setProcessingFiles(prev => {
            const newSet = new Set(prev)
            newSet.delete(file.name)
            return newSet
          })
        }
      }
      
      for (const file of files) {
        if (!file.extractedText) {
          toast({
            title: "Error",
            description: `Text extraction failed for ${file.name}`,
            variant: "destructive",
          })
          continue
        }
        
        try {
          const data = await handleExtractData(file.extractedText, schema)
          processedData.push({
            fileName: file.name,
            data,
          })
        } catch (error) {
          console.error(`Error processing ${file.name}:`, error)
        }
      }
      
      setExtractedData(processedData)
      
      if (processedData.length > 0) {
        toast({
          title: "Success",
          description: `Successfully processed ${processedData.length} files`,
        })
      }
    } finally {
      setIsExtracting(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header Section with Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <h1 className="text-2xl font-bold text-primary">Synthiq PDF Data Extractor</h1>
        </div>
      </nav>

      <div className="container py-8 space-y-8">
        {/* Main Content Grid */}
        <div className="grid grid-cols-12 gap-8">
          {/* Left Sidebar - File Upload */}
          <div className="col-span-4 space-y-4">
            {/* Upload Card */}
            <Card>
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl">Upload Files</CardTitle>
                <CardDescription>
                  Upload your PDF invoices for data extraction
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FileUpload onFilesSelected={handleFilesSelected} maxFiles={10} />
              </CardContent>
            </Card>

            {/* Files List Card */}
            {files.length > 0 && (
              <Card>
                <CardHeader className="space-y-1">
                  <CardTitle className="text-lg">Uploaded Files</CardTitle>
                  <CardDescription>
                    {files.length} file(s) ready for processing
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {files.map((file, index) => (
                      <li
                        key={index}
                        className="flex items-center justify-between p-3 bg-muted/30 rounded-lg text-sm hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="truncate">{file.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {processingFiles.has(file.name) ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : file.extractedText ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setPreviewFile(file)
                                setIsPreviewOpen(true)
                              }}
                              className="flex items-center gap-1"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              <span>Preview</span>
                            </Button>
                          ) : (
                            <Badge variant="secondary">Ready</Badge>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons Card */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <Button
                    onClick={handleStartExtraction}
                    disabled={files.length === 0 || isExtracting}
                    className="w-full"
                    size="lg"
                  >
                    {isExtracting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <PlayCircle className="mr-2 h-4 w-4" />
                        Start Extraction
                      </>
                    )}
                  </Button>
                  {extractedData.length > 0 && (
                    <DownloadExcelButton
                      onDownload={handleDownloadExcel}
                      disabled={isExtracting}
                      className="w-full"
                      size="lg"
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Content - Schema Builder */}
          <div className="col-span-8">
            <Card className="h-full">
              <CardHeader className="space-y-1">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">Extraction Schema</CardTitle>
                    <CardDescription>
                      Define the structure of data you want to extract
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Quick Guide */}
                <div className="bg-muted/30 p-4 rounded-lg border">
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <span>Quick Guide</span>
                  </h3>
                  <ul className="text-sm text-muted-foreground space-y-1.5">
                    <li className="flex items-center gap-2">
                      <span>•</span>
                      <span>Add single fields for individual values (e.g., company name, total amount)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span>•</span>
                      <span>Add groups for repeated data (e.g., list of items)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span>•</span>
                      <span>Choose appropriate data types (string, number)</span>
                    </li>
                  </ul>
                </div>

                {/* Schema Builder Component */}
                <SchemaBuilder
                  onSchemaChange={setSchema}
                  defaultSchema={defaultSchema}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <PreviewDialog
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        file={previewFile}
      />
      <Toaster />
    </main>
  )
}
