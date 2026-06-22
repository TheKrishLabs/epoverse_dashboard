import { AccessLogList } from "@/components/settings/access-log-list"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Access Log - Settings",
  description: "View user access logs and login history.",
}

export default function AccessLogPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Access Log</h2>
      </div>
      <div className="flex-1 space-y-4">
        <AccessLogList />
      </div>
    </div>
  )
}
