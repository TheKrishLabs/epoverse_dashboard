import { AddRoleForm } from "@/components/settings/add-role-form";
import { use } from "react";

export default function EditRolePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  return <AddRoleForm roleId={resolvedParams.id} />;
}
