"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

interface FileWithText extends File {
  extractedText?: string
}

interface PreviewDialogProps {
  isOpen: boolean
  onClose: () => void
  file: FileWithText | null
}

export function PreviewDialog({
  isOpen,
  onClose,
  file,
}: PreviewDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[800px] h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {file?.name || "Preview"}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-1 mt-4">
          <div className="p-4 text-sm font-mono whitespace-pre-wrap bg-muted/30 rounded-md">
            {file?.extractedText || "No text extracted"}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
