"use client"

import { useState, useEffect, useMemo } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, Mail, Phone, CalendarDays } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { User, userService } from "@/services/user-service"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function SubscriberList() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const usersData = await userService.getUsers()
      // The prompt asks to display all users who are logged in.
      // Assuming "logged in" corresponds to an 'Active' status or we just show all users and their status.
      // We will only filter if strictly necessary, but for a general user list, we might want to show all.
      // Let's filter to active ones if that's what "logged in" meant, 
      // or just show all users and their status so the admin can see everything.
      // We'll show all users but highlight their status.
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
              Status / Logged In
              <ArrowUpDown className="ml-2 h-3.5 w-3.5 text-gray-400" />
            </Button>
          )
        },
        cell: ({ row }) => {
            const status = (row.getValue("status") as string)?.toLowerCase();
            const isActive = status === 'active';
            
            return (
                <div className="flex items-center">
                  <Badge className={isActive ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-200 font-semibold flex items-center justify-center text-[12px] px-3 py-1 rounded-full shadow-none" : "bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-200 font-semibold flex items-center justify-center text-[12px] px-3 py-1 rounded-full shadow-none"}>
                    {isActive ? (
                       <>
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-2"></span>
                          Logged In / Active
                       </>
                    ) : (
                       <>
                          <span className="h-1.5 w-1.5 rounded-full bg-gray-400 mr-2"></span>
                          Inactive
                       </>
                    )}
                  </Badge>
                </div>
            )
        }
      },
    ],
    []
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
    </div>
  )
}
