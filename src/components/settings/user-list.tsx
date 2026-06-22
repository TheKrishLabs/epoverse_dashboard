"use client"

import { useState, useEffect, useMemo } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Plus, Edit, Trash2, ArrowUpDown, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { User, userService } from "@/services/user-service"
import { Role, roleService } from "@/services/role-service"
import { UserFormDialog } from "@/components/settings/user-form-dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function UserList() {
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isFetchingUser, setIsFetchingUser] = useState<string | null>(null)
  
  // Delete Dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)

  const fetchData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [usersData, rolesData] = await Promise.all([
         userService.getUsers(),
         roleService.getRoles()
      ])
      setUsers(usersData || [])
      setRoles(rolesData || [])
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError((err as { customMessage?: string }).customMessage || err.message)
      } else {
        setError("Failed to load data.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleAddClick = () => {
    setSelectedUser(null)
    setSuccess(null)
    setIsFormOpen(true)
  }

  const handleEditClick = async (user: User) => {
    setIsFetchingUser(user._id)
    setError(null)
    setSuccess(null)
    try {
      const fetchedUser = await userService.getUserById(user._id)
      setSelectedUser(fetchedUser)
      setIsFormOpen(true)
    } catch (err: unknown) {
      if (err instanceof Error) {
         setError((err as { customMessage?: string }).customMessage || err.message)
      } else {
         setError("Failed to fetch user details.")
      }
    } finally {
      setIsFetchingUser(null)
    }
  }

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user)
    setIsDeleteDialogOpen(true)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleFormSubmit = async (payload: any) => {
    try {
      if (selectedUser) {
        // Update
        await userService.updateUser(selectedUser._id, payload)
        setSuccess(`User "${payload.fullName}" updated successfully.`)
      } else {
        // Create
        await userService.createUser(payload)
        setSuccess(`User "${payload.fullName}" created successfully.`)
      }
      await fetchData() // Refresh list
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const msg = (err as any)?.customMessage || (err as any)?.message || "Failed to save user.";
      setError(msg);
      throw err; // Re-throw so the dialog knows it failed and doesn't close
    }
  }

  const confirmDelete = async () => {
    if (userToDelete) {
      try {
        await userService.deleteUser(userToDelete._id)
        await fetchData()
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError((err as { customMessage?: string }).customMessage || err.message)
        } else {
          setError("Failed to delete user.")
        }
      } finally {
        setIsDeleteDialogOpen(false)
        setUserToDelete(null)
      }
    }
  }

  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      {
        id: "serial",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="px-0 font-bold hover:bg-transparent text-gray-800"
            >
              Sl
              <ArrowUpDown className="ml-2 h-3.5 w-3.5 text-gray-400" />
            </Button>
          )
        },
        cell: ({ row }) => <div className="text-center w-8 text-gray-600">{row.index + 1}</div>,
        enableSorting: true,
        enableHiding: false,
      },
      {
        accessorKey: "fullName",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="px-0 font-bold hover:bg-transparent text-gray-800"
            >
              Name
              <ArrowUpDown className="ml-2 h-3.5 w-3.5 text-gray-400" />
            </Button>
          )
        },
        cell: ({ row }) => <div className="text-gray-800">{row.getValue("fullName")}</div>,
      },
      {
        accessorKey: "email",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="px-0 font-bold hover:bg-transparent text-gray-800"
            >
              Email
              <ArrowUpDown className="ml-2 h-3.5 w-3.5 text-gray-400" />
            </Button>
          )
        },
        cell: ({ row }) => <div className="text-gray-800">{row.getValue("email")}</div>,
      },
      {
         accessorKey: "mobile",
         header: ({ column }) => {
             return (
                 <Button
                 variant="ghost"
                 onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                 className="px-0 font-bold hover:bg-transparent text-gray-800"
                 >
                 Mobile
                 <ArrowUpDown className="ml-2 h-3.5 w-3.5 text-gray-400" />
                 </Button>
             )
         },
         cell: ({ row }) => <div className="text-gray-800">{row.getValue("mobile")}</div>,
      },
      {
        accessorKey: "role",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="px-0 font-bold hover:bg-transparent text-gray-800"
            >
              Role
              <ArrowUpDown className="ml-2 h-3.5 w-3.5 text-gray-400" />
            </Button>
          )
        },
        cell: ({ row }) => {
           const role = row.original.role
           let roleName = 'User';
           if (typeof role === 'string') {
               const foundRole = roles.find((r) => r._id === role);
               roleName = foundRole ? foundRole.name : role; // fallback to ID if not found
           } else {
               roleName = role?.name || 'User';
           }

           return <Badge className="bg-[#198754] flex w-fit justify-center mx-auto hover:bg-[#157347] font-semibold text-[11px] px-2.5 py-0.5 rounded-full">{roleName}</Badge>
        },
      },
      {
        accessorKey: "image",
        header: ({ column }) => {
            return (
              <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="px-0 font-bold hover:bg-transparent text-gray-800"
              >
                Image
                <ArrowUpDown className="ml-2 h-3.5 w-3.5 text-gray-400" />
              </Button>
            )
          },
        cell: ({ row }) => {
            const imageUrl = row.getValue("image") as string;
            return (
                <Avatar className="h-9 w-9 border border-gray-100 shadow-sm mx-auto">
                   <AvatarImage src={imageUrl || ""} className="object-cover" />
                   <AvatarFallback className="bg-muted text-xs font-medium">{row.original.fullName?.substring(0,2).toUpperCase() || 'US'}</AvatarFallback>
                </Avatar>
            )
        }
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="px-0 font-bold hover:bg-transparent text-gray-800 h-auto py-2 flex flex-col items-start gap-1"
            >
              <div className="flex items-center">
                <span>Created</span>
                <ArrowUpDown className="ml-2 h-3.5 w-3.5 text-gray-400" />
              </div>
              <span>date</span>
            </Button>
          )
        },
        cell: ({ row }) => {
            const dateStr = row.getValue("createdAt") as string;
            if(!dateStr) return null;
            const date = new Date(dateStr);
            const formattedDate = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
            const formattedTime = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
            return (
               <div className="text-[13px] text-gray-700 font-medium">
                  <div>{formattedDate}</div>
                  <div>{formattedTime}</div>
               </div>
            )
        }
      },
      {
        accessorKey: "status",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="px-0 font-bold hover:bg-transparent text-gray-800"
            >
              Status
              <ArrowUpDown className="ml-2 h-3.5 w-3.5 text-gray-400" />
            </Button>
          )
        },
        cell: ({ row }) => {
            const status = row.getValue("status") as string;
            return (
                <div className="flex items-center">
                  <Badge className={status === "Active" ? "bg-[#198754] hover:bg-[#157347] font-semibold flex items-center justify-center text-[11px] px-2.5 py-0.5 rounded-full" : "bg-red-500 hover:bg-red-600 font-semibold flex items-center justify-center text-[11px] px-2.5 py-0.5 rounded-full"}>
                    {status}
                  </Badge>
                </div>
            )
        }
      },
      {
        id: "actions",
        header: ({ column }) => {
            return (
              <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="px-0 font-bold hover:bg-transparent text-gray-800"
              >
                Action
                <ArrowUpDown className="ml-2 h-3.5 w-3.5 text-gray-400" />
              </Button>
            )
          },
        cell: ({ row }) => {
          const user = row.original
          return (
            <div className="flex flex-col items-center justify-center gap-1.5 min-w-[32px]">
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7 text-emerald-600 border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100 rounded-sm shadow-none p-1.5"
                onClick={() => handleEditClick(user)}
                disabled={isFetchingUser === user._id}
              >
                {isFetchingUser === user._id ? (
                  <Loader2 className="animate-spin h-full w-full" />
                ) : (
                  <Edit className="h-full w-full" />
                )}
              </Button>
              <Button
                 variant="outline"
                 size="icon"
                 className="h-7 w-7 text-red-500 border border-red-200 bg-red-50/50 hover:bg-red-100 rounded-sm shadow-none p-1.5"
                 onClick={() => handleDeleteClick(user)}
              >
                 <Trash2 className="h-full w-full" />
              </Button>
            </div>
          )
        },
      },
    ],
    [roles, isFetchingUser]
  )

  return (
    <div className="space-y-4 p-4 md:p-6 bg-white dark:bg-sidebar min-h-[calc(100vh-80px)]">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-4">
        <h2 className="text-xl font-bold text-gray-800">Employee list</h2>
        <Button 
          onClick={handleAddClick}
          className="bg-[#198754] hover:bg-[#157347] text-white rounded-[3px] h-9 px-4 font-medium tracking-wide shadow-none"
        >
          <Plus className="mr-1.5 h-4 w-4" /> Add user
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-50 text-green-800 border-green-200">
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="overflow-x-auto w-full">
            <DataTable columns={columns} data={users} />
        </div>
      )}

      {/* User Add/Edit Modal */}
      <UserFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        user={selectedUser}
        roles={roles}
        onSubmit={handleFormSubmit}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the associated user and remove their data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700"
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
