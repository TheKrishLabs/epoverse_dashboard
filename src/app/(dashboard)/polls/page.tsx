import { PollList } from "@/components/polls/poll-list";

export const metadata = {
  title: "Polls | Dashboard",
  description: "Manage Polls in the admin dashboard",
};

export default function PollsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <PollList />
    </div>
  );
}
