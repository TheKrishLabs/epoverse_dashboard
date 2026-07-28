"use client"

import React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { User } from "@/services/user-service"
import { Role } from "@/services/role-service"

import { Badge } from "@/components/ui/badge"

interface UserProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User | null
  roles: Role[]
}

export function EmployeeProfileDialog({
  open,
  onOpenChange,
  user,
  roles
}: UserProfileDialogProps) {
  if (!user) return null;

  const roleValue = typeof user.role === 'string' ? user.role : (user.role?._id || "");
  const foundRole = roles.find((r) => r._id === roleValue);
  const roleName = foundRole ? foundRole.name : (user.role && typeof user.role !== 'string' ? user.role.name : 'User');
  
  const status = user.status === "Active" || user.status === "active" ? "Active" : "Inactive";
  const dateStr = user.createdAt;
  const formattedDate = dateStr ? new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : "Unknown";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>User Profile</DialogTitle>
          <DialogDescription>
            Details for {user.fullName}
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-4 gap-4 py-4">
          <div className="col-span-1 font-semibold text-sm text-right">Full Name:</div>
          <div className="col-span-3 text-sm">{user.fullName}</div>
          
          <div className="col-span-1 font-semibold text-sm text-right">Email:</div>
          <div className="col-span-3 text-sm">{user.email || "N/A"}</div>
          
          <div className="col-span-1 font-semibold text-sm text-right">Phone:</div>
          <div className="col-span-3 text-sm">{user.phoneNumber || "N/A"}</div>


          <div className="col-span-1 font-semibold text-sm text-right">Role:</div>
          <div className="col-span-3 text-sm">
            <Badge className="bg-[#198754] hover:bg-[#157347] font-semibold text-[11px] px-2.5 py-0.5 rounded-full">
              {roleName}
            </Badge>
          </div>
          
          <div className="col-span-1 font-semibold text-sm text-right">Status:</div>
          <div className="col-span-3 text-sm">
            <Badge className={status === "Active" ? "bg-[#198754] hover:bg-[#157347] font-semibold text-[11px] px-2.5 py-0.5 rounded-full" : "bg-red-500 hover:bg-red-600 font-semibold text-[11px] px-2.5 py-0.5 rounded-full"}>
              {status}
            </Badge>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  )
}
