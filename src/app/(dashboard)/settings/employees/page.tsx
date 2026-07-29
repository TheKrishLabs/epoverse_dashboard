import { EmployeeList } from "@/components/settings/employee-list"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Employee List | Settings",
  description: "Manage system employees",
}

export default function EmployeesPage() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <EmployeeList />
    </div>
  )
}
