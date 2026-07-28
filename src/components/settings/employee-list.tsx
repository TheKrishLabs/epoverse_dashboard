"use client"

import { useState, useEffect, useMemo } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Plus, Edit, Trash2, ArrowUpDown, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { User } from "@/services/user-service"
import { employeeService } from "@/services/employee-service"
import { Role, roleService } from "@/services/role-service"
import { EmployeeProfileDialog } from "@/components/settings/employee-profile-dialog"
import { EmployeeFormDialog } from "@/components/settings/employee-form-dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Eye } from "lucide-react"
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

export function EmployeeList() {
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isFetchingForEdit, setIsFetchingForEdit] = useState<string | null>(null)
  const [isFetchingForAdd, setIsFetchingForAdd] = useState<boolean>(false)

  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [selectedProfileUser, setSelectedProfileUser] = useState<User | null>(null)
  const [isFetchingForView, setIsFetchingForView] = useState<string | null>(null)
  
  // Delete Dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)


  const fetchData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const usersData = await employeeService.getEmployees()
      setUsers(usersData || [])
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

  const fetchRolesIfNeeded = async () => {
    if (roles.length === 0) {
      try {
        const rolesData = await roleService.getRoles()
        setRoles(rolesData || [])
      } catch (err) {
        console.error("Failed to fetch roles", err)
      }
    }
  }

  const handleAddClick = async () => {
    setIsFetchingForAdd(true)
    setSelectedUser(null)
    setSuccess(null)
    await fetchRolesIfNeeded()
    setIsFormOpen(true)
    setIsFetchingForAdd(false)
  }

  const handleEditClick = async (user: User) => {
    setIsFetchingForEdit(user._id)
    setError(null)
    setSuccess(null)
    try {
      await fetchRolesIfNeeded()
      const fetchedUser = await employeeService.getEmployeeById(user._id)
      setSelectedUser(fetchedUser)
      setIsFormOpen(true)
    } catch (err: unknown) {
      if (err instanceof Error) {
         setError((err as { customMessage?: string }).customMessage || err.message)
      } else {
         setError("Failed to fetch user details.")
      }
    } finally {
      setIsFetchingForEdit(null)
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleFormSubmit = async (payload: any) => {
    try {
      if (selectedUser) {
        // Update
        await employeeService.updateEmployee(selectedUser._id, payload)
        setSuccess(`Employee "${payload.fullName}" updated successfully.`)
      } else {
        // Create
        await employeeService.createEmployee(payload)
        setSuccess(`Employee "${payload.fullName}" created successfully.`)
      }
      await fetchData() // Refresh list
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const msg = (err as any)?.customMessage || (err as any)?.message || "Failed to save user.";
      setError(msg);
      throw err; // Re-throw so the dialog knows it failed and doesn't close
    }
  }

  const handleViewProfile = async (user: User) => {
    setIsFetchingForView(user._id)
    setError(null)
    try {
      const fetchedUser = await employeeService.getEmployeeById(user._id)
      setSelectedProfileUser(fetchedUser)
      setIsProfileOpen(true)
    } catch (err: unknown) {
      if (err instanceof Error) {
         setError((err as { customMessage?: string }).customMessage || err.message)
      } else {
         setError("Failed to fetch user details.")
      }
    } finally {
      setIsFetchingForView(null)
    }
  }

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!userToDelete) return;
    setIsDeleting(userToDelete._id)
    setError(null)
    setSuccess(null)
    try {
      await employeeService.deleteEmployee(userToDelete._id)
      setSuccess(`Employee "${userToDelete.fullName}" deleted successfully.`)
      await fetchData()
    } catch (err: unknown) {
      if (err instanceof Error) {
         setError((err as { customMessage?: string }).customMessage || err.message)
      } else {
         setError("Failed to delete user.")
      }
    } finally {
      setIsDeleting(null)
      setIsDeleteDialogOpen(false)
      setUserToDelete(null)
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
         accessorKey: "phoneNumber",
         header: ({ column }) => {
             return (
                 <Button
                 variant="ghost"
                 onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                 className="px-0 font-bold hover:bg-transparent text-gray-800"
                 >
                 Mobile Number
                 <ArrowUpDown className="ml-2 h-3.5 w-3.5 text-gray-400" />
                 </Button>
             )
         },
         cell: ({ row }) => <div className="text-gray-800">{row.getValue("phoneNumber") || "N/A"}</div>,
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
            </Button>
          )
        },
        cell: ({ row }) => {
            const dateStr = row.getValue("createdAt") as string;
            if(!dateStr) return null;
            const date = new Date(dateStr);
            const formattedDate = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
            return (
               <div className="text-[13px] text-gray-700 font-medium">
                  <div>{formattedDate}</div>
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
            <div className="flex items-center justify-center gap-2">
              {/* View */}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 rounded-md dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/40"
                title="View"
                onClick={() => handleViewProfile(user)}
                disabled={isFetchingForView === user._id}
              >
                {isFetchingForView === user._id ? (
                  <Loader2 className="animate-spin h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>

              {/* Edit */}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700 rounded-md dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/40"
                title="Edit"
                onClick={() => handleEditClick(user)}
                disabled={isFetchingForEdit === user._id}
              >
                {isFetchingForEdit === user._id ? (
                  <Loader2 className="animate-spin h-4 w-4" />
                ) : (
                  <Edit className="h-4 w-4" />
                )}
              </Button>

              {/* Delete */}
              <Button
                 variant="ghost"
                 size="icon"
                 className="h-8 w-8 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 rounded-md dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40"
                 title="Delete"
                 onClick={() => handleDeleteClick(user)}
                 disabled={isFetchingForView === user._id || isFetchingForEdit === user._id || isDeleting === user._id}
              >
                 <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )
        },
      },
    ],
    [roles, isFetchingForView, isFetchingForEdit, isDeleting]
  )

  return (
    <div className="space-y-4 p-4 md:p-6 bg-white dark:bg-sidebar min-h-[calc(100vh-80px)]">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-4">
        <h2 className="text-xl font-bold text-gray-800">Employee list</h2>
        <Button 
          onClick={handleAddClick}
          disabled={isFetchingForAdd}
          className="bg-[#198754] hover:bg-[#157347] text-white rounded-[3px] h-9 px-4 font-medium tracking-wide shadow-none"
        >
          {isFetchingForAdd ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Plus className="mr-1.5 h-4 w-4" />} Add user
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

      {/* Employee Add/Edit Modal */}
      <EmployeeFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        user={selectedUser}
        roles={roles}
        onSubmit={handleFormSubmit}
      />

      {/* User Profile Modal */}
      <EmployeeProfileDialog
        open={isProfileOpen}
        onOpenChange={setIsProfileOpen}
        user={selectedProfileUser}
        roles={roles}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
                onClick={confirmDelete}
                disabled={!!isDeleting}
                className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  )
}
