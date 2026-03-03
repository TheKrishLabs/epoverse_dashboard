import { OpinionForm } from "@/components/opinions/opinion-form";


export const metadata = {
  title: "Add Opinion | Dashboard",
  description: "Create a new opinion",
};

export default function AddOpinionPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <OpinionForm />
    </div>
  );
}
