"use client"

import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

const languageSchema = z.object({
  name: z.string().min(2, { message: "Language name must be at least 2 characters string" }),
  description: z.string().optional(),
})

type LanguageFormValues = z.infer<typeof languageSchema>

interface LanguageFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: LanguageFormValues) => Promise<void>
}

export function LanguageFormDialog({
  open,
  onOpenChange,
  onSubmit,
}: LanguageFormDialogProps) {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<LanguageFormValues>({
    resolver: zodResolver(languageSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  })

  // Reset form when dialog opens
  React.useEffect(() => {
    if (open) {
      form.reset({ name: "", description: "" })
    }
  }, [open, form])

  const handleSubmit = async (data: LanguageFormValues) => {
    setIsLoading(true)
    try {
      await onSubmit(data)
      onOpenChange(false)
    } catch (error) {
      // Parent catches and alerts
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Language</DialogTitle>
          <DialogDescription>
             Enter the new language details to make it available for content creators.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. English, Spanish..." {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                         placeholder="Optional context about this language setting..." 
                         {...field} 
                         disabled={isLoading} 
                         className="resize-none h-20"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="bg-green-600 hover:bg-green-700 text-white">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Language
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
