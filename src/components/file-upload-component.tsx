"use client"

import { useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Card, CardContent } from "@/components/ui/card"
import { Upload } from "lucide-react"

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void
  maxFiles?: number
}

export function FileUpload({
  onFilesSelected,
  maxFiles = 10,
}: FileUploadProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > maxFiles) {
        alert(`Maximum ${maxFiles} files allowed`)
        return
      }
      onFilesSelected(acceptedFiles)
    },
    [maxFiles, onFilesSelected]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    maxFiles,
  })

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isDragActive
              ? "border-primary bg-primary/10"
              : "border-gray-300 hover:border-primary"
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">
            {isDragActive
              ? "Drop the PDF files here..."
              : "Drag & drop PDF files here, or click to select"}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Maximum {maxFiles} PDF files
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
