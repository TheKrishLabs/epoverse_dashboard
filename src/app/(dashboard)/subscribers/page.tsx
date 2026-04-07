import { SubscriberList } from "@/components/subscribers/subscriber-list"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "User List | Subscriptions",
  description: "View and manage registered users",
}

export default function SubscribersPage() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <SubscriberList />
    </div>
  )
}
