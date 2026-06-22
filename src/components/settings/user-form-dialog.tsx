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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { User } from "@/services/user-service"
import { Role } from "@/services/role-service"

const userSchema = z.object({
  fullName: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email" }),
  phoneNumber: z.string().optional(),
  role: z.string().min(1, { message: "Role is required" }),
  status: z.enum(["active", "inActive"]),
  password: z.string().optional(),
  image: z.any().optional(), // Handle File/FileList in component
})

type UserFormValues = z.infer<typeof userSchema>

interface UserFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user?: User | null
  roles: Role[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSubmit: (payload: any) => Promise<void>
}

export function UserFormDialog({
  open,
  onOpenChange,
  user,
  roles,
  onSubmit,
}: UserFormDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phoneNumber: "",
      role: "",
      status: "active",
      password: "",
    },
  })

  // Reset form when dialog opens
  React.useEffect(() => {
    if (open) {
      setImageFile(null)
      const roleValue = typeof user?.role === 'string' ? user.role : (user?.role?._id || "")
      
      form.reset({
        fullName: user?.fullName || "",
        email: user?.email || "",
        phoneNumber: user?.phoneNumber || (user as User & { mobile?: string })?.mobile || "",
        role: roleValue,
        status: user?.status === "Active" || user?.status === "active" ? "active" : "inActive",
        password: "", // Always empty when editing
      })
    }
  }, [open, user, form])

  const handleSubmit = async (data: UserFormValues) => {
    setIsLoading(true)
    try {
      const payload: Record<string, unknown> = {
        fullName: data.fullName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        role: data.role,
        status: data.status,
      }
      
      // Always append userType as admin for this specific dashboard portal
      payload.userType = "admin"
      
      if (data.password) {
        payload.password = data.password
      } else if (!user) {
        form.setError("password", { message: "Password is required for new users" })
        setIsLoading(false)
        return
      }

      await onSubmit(payload)
      onOpenChange(false)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error(error)
      form.setError("root", { message: error?.customMessage || error?.message || "An unexpected error occurred." })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{user ? "Edit User" : "Add User"}</DialogTitle>
          <DialogDescription>
            {user
              ? "Make changes to the user profile here."
              : "Enter the details to create a new user."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pt-4">
            {form.formState.errors.root && (
               <div className="p-3 bg-red-50 text-red-600 font-medium rounded-md text-sm border border-red-200">
                  {form.formState.errors.root.message}
               </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
               <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="john@example.com" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="1234567890" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role <span className="text-red-500">*</span></FormLabel>
                      <Select disabled={isLoading} onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent side="top">
                          {roles.map(r => (
                              <SelectItem key={r._id} value={r._id}>{r.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password {user ? "" : <span className="text-red-500">*</span>}</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder={user ? "Leave blank to keep current" : "*****"} {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status <span className="text-red-500">*</span></FormLabel>
                      <Select disabled={isLoading} onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent side="top">
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inActive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>

            <FormItem>
                <FormLabel>Profile Image</FormLabel>
                <FormControl>
                     <Input 
                        type="file" 
                        accept="image/*"
                        disabled={isLoading} 
                        onChange={(e) => {
                            if (e.target.files && e.target.files.length > 0) {
                                setImageFile(e.target.files[0])
                            }
                        }}
                     />
                </FormControl>
                {user?.image && !imageFile && (
                    <div className="text-xs text-muted-foreground mt-1">Current image exists. Upload new to replace.</div>
                )}
            </FormItem>

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
                {user ? "Update User" : "Add User"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
