import { UserList } from "@/components/settings/user-list"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "User List | Settings",
  description: "Manage system users",
}

export default function UsersPage() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <UserList />
    </div>
  )
}
