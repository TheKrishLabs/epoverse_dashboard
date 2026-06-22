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
import { Role } from "@/services/role-service"

const roleSchema = z.object({
  name: z.string().min(2, { message: "Role name must be at least 2 characters" }),
})

type RoleFormValues = z.infer<typeof roleSchema>

interface RoleFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  role?: Role | null
  onSubmit: (data: { name: string }) => Promise<void>
}

export function RoleFormDialog({
  open,
  onOpenChange,
  role,
  onSubmit,
}: RoleFormDialogProps) {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: role?.name || "",
    },
  })

  // Reset form when dialog opens with a new role
  React.useEffect(() => {
    if (open) {
      form.reset({ name: role?.name || "" })
    }
  }, [open, role, form])

  const handleSubmit = async (data: RoleFormValues) => {
    setIsLoading(true)
    try {
      await onSubmit(data)
      onOpenChange(false)
    } catch (error) {
      // Error is handled in the parent, or you can display a local alert here
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{role ? "Edit Role" : "Add Role"}</DialogTitle>
          <DialogDescription>
            {role
              ? "Make changes to the role here. Click save when you're done."
              : "Enter the details for the new role."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role Name <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Moderator" {...field} disabled={isLoading} />
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
              <Button type="submit" disabled={isLoading} className="bg-green-600 hover:bg-green-700">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {role ? "Update Role" : "Add Role"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
