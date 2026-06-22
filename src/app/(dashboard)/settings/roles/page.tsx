import { RoleList } from "@/components/settings/role-list"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Role List | Settings",
  description: "Manage system roles",
}

export default function RolesPage() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <RoleList />
    </div>
  )
}
