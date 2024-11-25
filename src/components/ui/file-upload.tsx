import * as React from "react"
import { useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Upload } from "lucide-react"
import { cn } from "@/lib/utils"

interface FileUploadProps extends React.HTMLAttributes<HTMLDivElement> {
  onFilesSelected: (files: File[]) => void
  maxFiles?: number
  className?: string
}

export function FileUpload({
  onFilesSelected,
  maxFiles = 10,
  className,
  ...props
}: FileUploadProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const pdfFiles = acceptedFiles.filter(
        (file) => file.type === "application/pdf"
      )
      if (pdfFiles.length > 0) {
        onFilesSelected(pdfFiles)
      }
    },
    [onFilesSelected]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    maxFiles,
  })

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
        isDragActive
          ? "border-primary bg-primary/10"
          : "border-muted-foreground/25 hover:border-primary/50",
        className
      )}
      {...props}
    >
      <input {...getInputProps()} />
      <Upload className="w-10 h-10 mx-auto mb-4 text-muted-foreground" />
      <p className="text-sm text-muted-foreground mb-2">
        {isDragActive ? (
          "Drop your PDF files here"
        ) : (
          <>
            Drag & drop PDF files here, or click to select
            <br />
            <span className="text-xs">
              (Maximum {maxFiles} files)
            </span>
          </>
        )}
      </p>
    </div>
  )
}
