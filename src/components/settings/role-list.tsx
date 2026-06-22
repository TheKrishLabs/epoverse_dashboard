"use client"

import { useState, useEffect, useMemo } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { useRouter } from "next/navigation"
import { Plus, Edit, Trash2, ArrowUpDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { Role, roleService } from "@/services/role-service"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
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

export function RoleList() {
  const router = useRouter()
  const [roles, setRoles] = useState<Role[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isToggling, setIsToggling] = useState<string | null>(null)
  
  // Delete Dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null)

  const fetchRoles = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await roleService.getRoles()
      // Adapt based on API response structure if needed
      setRoles(data || [])
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError((err as { customMessage?: string }).customMessage || err.message)
      } else {
        setError("Failed to load roles.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchRoles()
  }, [])

  const handleAddRoleClick = () => {
    router.push('/settings/roles/create')
  }

  const handleEditRoleClick = (role: Role) => {
    router.push(`/settings/roles/edit/${role._id}`)
  }

  const handleDeleteRoleClick = (role: Role) => {
    setRoleToDelete(role)
    setIsDeleteDialogOpen(true)
  }
  const handleToggleStatus = async (role: Role) => {
    setIsToggling(role._id)
    setError(null)
    setSuccess(null)
    try {
      await roleService.toggleSoftDeleteRole(role._id)
      setRoles(prev => prev.map(r => r._id === role._id ? { ...r, isDeleted: !r.isDeleted } : r))
      setSuccess(`Role "${role.name}" status updated successfully.`)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError((err as { customMessage?: string }).customMessage || err.message)
      } else {
        setError("Failed to update role status.")
      }
    } finally {
      setIsToggling(null)
    }
  }


  const confirmDelete = async () => {
    if (roleToDelete) {
      try {
        await roleService.deleteRole(roleToDelete._id)
        await fetchRoles()
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError((err as { customMessage?: string }).customMessage || err.message)
        } else {
          setError("Failed to delete role.")
        }
      } finally {
        setIsDeleteDialogOpen(false)
        setRoleToDelete(null)
      }
    }
  }

  const columns = useMemo<ColumnDef<Role>[]>(
    () => [
      {
        id: "serial",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="px-0 font-semibold"
            >
              Sl
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
        cell: ({ row }) => <div className="text-center w-8">{row.index + 1}</div>,
        enableSorting: true,
        enableHiding: false,
      },
      {
        accessorKey: "name",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="px-0 font-semibold"
            >
              Name
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
        cell: ({ row }) => <div>{row.getValue("name")}</div>,
      },
      {
        accessorKey: "isDeleted",
        header: "Status",
        cell: ({ row }) => {
          const isDeleted = row.getValue("isDeleted") as boolean;
          return (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${isDeleted ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {isDeleted ? "Inactive" : "Active"}
            </span>
          )
        }
      },
      {
        id: "actions",
        header: () => <div className="text-right font-semibold">Action</div>,
        cell: ({ row }) => {
          const role = row.original
          return (
            <div className="flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                className={`h-8 px-2 text-xs ${role.isDeleted ? 'text-green-600 border-green-200 hover:bg-green-50' : 'text-orange-600 border-orange-200 hover:bg-orange-50'}`}
                onClick={() => handleToggleStatus(role)}
                disabled={isToggling === role._id}
              >
                {isToggling === role._id ? "..." : role.isDeleted ? "Activate" : "Deactivate"}
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 text-blue-500 border-blue-200 bg-blue-50 hover:bg-blue-100"
                onClick={() => handleEditRoleClick(role)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                 variant="outline"
                 size="icon"
                 className="h-8 w-8 text-red-500 border-red-200 bg-red-50 hover:bg-red-100"
                 onClick={() => handleDeleteRoleClick(role)}
              >
                 <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  return (
    <div className="space-y-4 p-4 md:p-6 bg-white dark:bg-sidebar rounded-lg shadow-sm border border-border">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-foreground">Role list</h2>
        <Button 
          onClick={handleAddRoleClick}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Plus className="mr-2 h-4 w-4" /> Add role
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
        <DataTable columns={columns} data={roles} />
      )}



      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the associated role.
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
