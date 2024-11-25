"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { ButtonProps } from "@/components/ui/button"

interface DownloadExcelButtonProps extends ButtonProps {
  onDownload: () => void
}

export function DownloadExcelButton({
  onDownload,
  disabled,
  className,
  size,
  ...props
}: DownloadExcelButtonProps) {
  return (
    <Button
      onClick={onDownload}
      disabled={disabled}
      className={className}
      size={size}
      {...props}
    >
      <Download className="h-4 w-4 mr-2" />
      Download Excel
    </Button>
  )
}
