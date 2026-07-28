"use client"

import { useState, useEffect, useMemo } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, Mail, Phone, CalendarDays, Eye, Edit, Trash2, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { User, userService } from "@/services/user-service"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { UserFormDialog } from "@/components/settings/user-form-dialog"
import { UserProfileDialog } from "@/components/settings/user-profile-dialog"
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

export function SubscriberList() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Profile Modal State
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [selectedProfileUser, setSelectedProfileUser] = useState<User | null>(null)

  // Edit Modal State
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  // Global state for operations
  const [isFetchingForView, setIsFetchingForView] = useState<string | null>(null)
  const [isFetchingForEdit, setIsFetchingForEdit] = useState<string | null>(null)
  const [isFetchingForStatus, setIsFetchingForStatus] = useState<string | null>(null)
  const [isFetchingForDelete, setIsFetchingForDelete] = useState<string | null>(null)
  
  // Dialog states
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)
  const [userToChangeStatus, setUserToChangeStatus] = useState<User | null>(null)

  const handleViewProfile = async (user: User) => {
    setIsFetchingForView(user._id)
    setError(null)
    setSuccess(null)
    try {
      const fetchedUser = await userService.getUserById(user._id)
      setSelectedProfileUser(fetchedUser)
      setIsProfileOpen(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to fetch user details")
    } finally {
      setIsFetchingForView(null)
    }
  }

  const handleEditClick = async (user: User) => {
    setIsFetchingForEdit(user._id)
    setError(null)
    setSuccess(null)
    try {
      const fetchedUser = await userService.getUserById(user._id)
      setSelectedUser(fetchedUser)
      setIsFormOpen(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to fetch user details")
    } finally {
      setIsFetchingForEdit(null)
    }
  }

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (userToDelete) {
      setIsFetchingForDelete(userToDelete._id)
      setError(null)
      setSuccess(null)
      try {
        await userService.deleteUser(userToDelete._id)
        setSuccess("User deleted successfully")
        fetchData()
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to delete user")
      } finally {
        setIsFetchingForDelete(null)
        setIsDeleteDialogOpen(false)
        setUserToDelete(null)
      }
    }
  }

  const handleToggleStatusClick = (user: User) => {
    setUserToChangeStatus(user)
    setIsStatusDialogOpen(true)
  }

  const confirmStatusChange = async () => {
    if (!userToChangeStatus) return;
    setIsFetchingForStatus(userToChangeStatus._id)
    setError(null)
    setSuccess(null)
    try {
      const newStatus = (userToChangeStatus.status === "Active" || userToChangeStatus.status === "active") ? "Inactive" : "Active"
      await userService.updateStatus(userToChangeStatus._id, newStatus)
      setSuccess(`User status updated to ${newStatus}`)
      await fetchData()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update status")
    } finally {
      setIsFetchingForStatus(null)
      setIsStatusDialogOpen(false)
      setUserToChangeStatus(null)
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleFormSubmit = async (payload: any) => {
    try {
      if (selectedUser) {
        // Update user
        await userService.updateUser(selectedUser._id, payload)
        setSuccess("User updated successfully")
      }
      setIsFormOpen(false)
      fetchData()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save user")
    }
  }

  const fetchData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const usersData = await userService.getUsers()
      setUsers(usersData || [])
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError((err as { customMessage?: string }).customMessage || err.message)
      } else {
        setError("Failed to load users.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

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
              User Info
              <ArrowUpDown className="ml-2 h-3.5 w-3.5 text-gray-400" />
            </Button>
          )
        },
        cell: ({ row }) => {
          const user = row.original;
          return (
             <div className="flex items-center gap-3">
                 <Avatar className="h-10 w-10 border border-gray-100 shadow-sm">
                    <AvatarImage src={user.image || ""} className="object-cover" />
                    <AvatarFallback className="bg-muted text-sm font-medium">{user.fullName?.substring(0,2).toUpperCase() || 'US'}</AvatarFallback>
                 </Avatar>
                 <div className="flex flex-col">
                    <span className="font-semibold text-gray-900">{user.fullName}</span>
                    <span className="text-xs text-gray-500 uppercase tracking-wider">{typeof user.role === 'object' ? user.role?.name : user.role || 'Subscriber'}</span>
                 </div>
             </div>
          )
        },
      },
      {
        accessorKey: "contact",
        header: "Contact Details",
        cell: ({ row }) => {
           const user = row.original;
           return (
              <div className="flex flex-col gap-1 text-sm text-gray-700">
                 {user.email && (
                    <div className="flex items-center gap-2">
                       <Mail className="h-3.5 w-3.5 text-gray-400" />
                       <span>{user.email}</span>
                    </div>
                 )}
                 {user.phoneNumber && (
                    <div className="flex items-center gap-2">
                       <Phone className="h-3.5 w-3.5 text-gray-400" />
                       <span>{user.phoneNumber}</span>
                    </div>
                 )}
              </div>
           )
        },
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
                <span>Joined Date</span>
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
               <div className="flex items-center gap-2 text-[14px] text-gray-700 font-medium">
                  <CalendarDays className="h-4 w-4 text-gray-400" />
                  <span>{formattedDate}</span>
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
            const isActive = status?.toLowerCase() === 'active';
            
            return (
                <div className="flex items-center">
                  <Badge 
                     className={isActive ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-200 font-semibold flex items-center justify-center text-[12px] px-3 py-1 rounded-full shadow-none cursor-pointer" : "bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-200 font-semibold flex items-center justify-center text-[12px] px-3 py-1 rounded-full shadow-none cursor-pointer"}
                     onClick={() => handleToggleStatusClick(row.original)}
                  >
                     {isActive ? (
                        <>
                           <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-2"></span>
                           {status}
                        </>
                     ) : (
                        <>
                           <span className="h-1.5 w-1.5 rounded-full bg-gray-400 mr-2"></span>
                           {status}
                        </>
                     )}
                  </Badge>
                </div>
            )
        }
      },
      {
        id: "actions",
        header: "Action",
        cell: ({ row }) => {
          const user = row.original;
          return (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 rounded-md dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/40"
                title="View"
                onClick={() => handleViewProfile(user)}
                disabled={isFetchingForView === user._id}
              >
                {isFetchingForView === user._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 rounded-md dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40"
                title="Edit"
                onClick={() => handleEditClick(user)}
                disabled={isFetchingForEdit === user._id}
              >
                {isFetchingForEdit === user._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Edit className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 rounded-md dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40"
                title="Delete"
                onClick={() => handleDeleteClick(user)}
                disabled={false}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )
        },
      },
    ],
    [isFetchingForView, isFetchingForEdit]
  )

  return (
    <div className="space-y-4 bg-white dark:bg-sidebar min-h-[calc(100vh-80px)] rounded-md border border-gray-100">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 p-6 pb-4">
        <div>
           <h2 className="text-xl font-bold text-gray-900">User List</h2>
           <p className="text-sm text-gray-500 mt-1">Manage and view all registered users and their login status.</p>
        </div>
      </div>

      <div className="p-6 pt-2">
         {error && (
            <Alert variant="destructive" className="mb-6">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
            </Alert>
         )}

         {success && (
            <Alert className="mb-6 bg-emerald-50 text-emerald-800 border-emerald-200">
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
      </div>

      <UserProfileDialog
        user={selectedProfileUser}
        open={isProfileOpen}
        onOpenChange={setIsProfileOpen}
        roles={[]}
      />
      <UserFormDialog
        user={selectedUser}
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleFormSubmit}
        roles={[]}
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
            <AlertDialogCancel disabled={isFetchingForDelete === userToDelete?._id}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
                onClick={confirmDelete}
                disabled={isFetchingForDelete === userToDelete?._id}
                className="bg-red-600 hover:bg-red-700"
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Status Confirmation Dialog */}
      <AlertDialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change Status</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to change this user&apos;s status to {userToChangeStatus?.status === 'Active' || userToChangeStatus?.status === 'active' ? '"Inactive"' : '"Active"'}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isFetchingForStatus === userToChangeStatus?._id}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
                onClick={confirmStatusChange}
                disabled={isFetchingForStatus === userToChangeStatus?._id}
                className="bg-blue-600 hover:bg-blue-700"
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
