import { Metadata } from "next";
import { AddRoleForm } from "@/components/settings/add-role-form";

export const metadata: Metadata = {
  title: "Add Role | EPOS Verse Dashboard",
  description: "Create a new role with specific permissions.",
};

export default function AddRolePage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <AddRoleForm />
    </div>
  );
}
