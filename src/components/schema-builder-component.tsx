"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  PlusCircle,
  Trash2,
  Type,
  Hash,
  ListTree,
  GripVertical,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export interface SchemaField {
  name: string
  type: "string" | "number" | "array"
  fields?: SchemaField[]
}

interface SchemaBuilderProps {
  onSchemaChange: (schema: SchemaField[]) => void
  defaultSchema?: SchemaField[]
}

export function SchemaBuilder({ onSchemaChange, defaultSchema = [] }: SchemaBuilderProps) {
  const [fields, setFields] = useState<SchemaField[]>(defaultSchema)

  const handleAddField = () => {
    const newField = { name: "", type: "string" as const }
    setFields([...fields, newField])
    onSchemaChange([...fields, newField])
  }

  const handleAddArrayField = () => {
    const newField = {
      name: "",
      type: "array" as const,
      fields: [{ name: "", type: "string" as const }],
    }
    setFields([...fields, newField])
    onSchemaChange([...fields, newField])
  }

  const handleRemoveField = (index: number) => {
    const newFields = fields.filter((_, i) => i !== index)
    setFields(newFields)
    onSchemaChange(newFields)
  }

  const handleFieldChange = (index: number, updatedField: SchemaField) => {
    const newFields = fields.map((field, i) => (i === index ? updatedField : field))
    setFields(newFields)
    onSchemaChange(newFields)
  }

  const handleMoveField = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === fields.length - 1)
    ) {
      return
    }

    const newFields = [...fields]
    const newIndex = direction === "up" ? index - 1 : index + 1
    ;[newFields[index], newFields[newIndex]] = [newFields[newIndex], newFields[index]]
    setFields(newFields)
    onSchemaChange(newFields)
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <Button
          onClick={handleAddField}
          variant="outline"
          className="w-full flex items-center gap-2 border-dashed"
        >
          <PlusCircle className="h-4 w-4" />
          Add Single Field
        </Button>
        <Button
          onClick={handleAddArrayField}
          variant="outline"
          className="w-full flex items-center gap-2 border-dashed"
        >
          <ListTree className="h-4 w-4" />
          Add Group Field
        </Button>
      </div>

      <AnimatePresence>
        {fields.map((field, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="relative group hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="absolute left-2 top-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => handleMoveField(index, "up")}
                    disabled={index === 0}
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => handleMoveField(index, "down")}
                    disabled={index === fields.length - 1}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-start gap-4 pl-8">
                  <div className="flex-1 space-y-4">
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <Label className="text-muted-foreground text-xs mb-2">Field Name</Label>
                        <div className="relative">
                          <Input
                            value={field.name}
                            onChange={(e) =>
                              handleFieldChange(index, { ...field, name: e.target.value })
                            }
                            placeholder="Enter field name..."
                            className="pl-8"
                          />
                          {field.type === "string" ? (
                            <Type className="h-4 w-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          ) : field.type === "number" ? (
                            <Hash className="h-4 w-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          ) : (
                            <ListTree className="h-4 w-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                      <div className="w-32">
                        <Label className="text-muted-foreground text-xs mb-2">Type</Label>
                        <Select
                          value={field.type}
                          onValueChange={(value: "string" | "number" | "array") =>
                            handleFieldChange(index, {
                              ...field,
                              type: value,
                              ...(value === "array" && { fields: [{ name: "", type: "string" }] }),
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="string">Text</SelectItem>
                            <SelectItem value="number">Number</SelectItem>
                            <SelectItem value="array">Group</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => handleRemoveField(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {field.type === "array" && field.fields && (
                      <div className="pl-6 border-l-2 border-muted mt-4">
                        <Label className="text-sm mb-2 text-muted-foreground">Group Fields</Label>
                        <SchemaBuilder
                          onSchemaChange={(fields) =>
                            handleFieldChange(index, { ...field, fields })
                          }
                          defaultSchema={field.fields}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
