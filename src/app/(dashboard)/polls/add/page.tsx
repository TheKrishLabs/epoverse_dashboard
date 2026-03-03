import { PollForm } from "@/components/polls/poll-form";

export const metadata = {
  title: "Add Poll | Dashboard",
  description: "Create a new poll",
};

export default function AddPollPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <PollForm />
    </div>
  );
}
