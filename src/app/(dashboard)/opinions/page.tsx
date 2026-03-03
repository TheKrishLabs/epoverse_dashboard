import { OpinionList } from "@/components/opinions/opinion-list";

export const metadata = {
  title: "Opinions | Dashboard",
  description: "Manage Opinions in the admin dashboard",
};

export default function OpinionsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Opinions</h2>
      </div>
      <OpinionList />
    </div>
  );
}
