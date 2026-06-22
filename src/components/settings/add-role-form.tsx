"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { roleService } from "@/services/role-service";
import { MODULE_PERMISSIONS } from "@/config/permissions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

type ActionType = "create" | "read" | "update" | "delete";

// Initialize empty state for all possible submodules
const getInitialPermissions = () => {
  const state: Record<string, Record<ActionType, boolean>> = {};
  MODULE_PERMISSIONS.forEach((module) => {
    module.subModules.forEach((sub) => {
      state[sub.id] = {
        create: false,
        read: false,
        update: false,
        delete: false,
      };
    });
  });
  return state;
};

export function AddRoleForm({ roleId }: { roleId?: string }) {
  const router = useRouter();
  const [roleName, setRoleName] = useState("");
  const [permissions, setPermissions] = useState(getInitialPermissions());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(!!roleId);

  useEffect(() => {
    if (roleId) {
      const fetchRole = async () => {
        try {
          const role = await roleService.getRoleById(roleId);
          setRoleName(role.name);
          
          if (role.permissions) {
            const newPermissions = getInitialPermissions();
            // role.permissions is exactly like { advertisement: ["read", "create", "update", "delete"] }
            Object.entries(role.permissions).forEach(([moduleId, actions]) => {
              const moduleDef = MODULE_PERMISSIONS.find(m => m.id === moduleId || m.name.toLowerCase() === moduleId.toLowerCase());
              if (moduleDef) {
                // Apply these root-level actions to all submodules inside this module so the UI reflects it
                moduleDef.subModules.forEach(sub => {
                  actions.forEach((action) => {
                    if (action === 'create' || action === 'read' || action === 'update' || action === 'delete') {
                      newPermissions[sub.id][action as ActionType] = true;
                    }
                  });
                });
              } else {
                // Fallback if the backend sends exactly the subId
                if (newPermissions[moduleId]) {
                  actions.forEach((action) => {
                    if (action === 'create' || action === 'read' || action === 'update' || action === 'delete') {
                      newPermissions[moduleId][action as ActionType] = true;
                    }
                  });
                }
              }
            });
            setPermissions(newPermissions);
          }
        } catch {
           setError("Failed to fetch role details. It may have been deleted.");
        } finally {
          setIsFetching(false);
        }
      };
      fetchRole();
    }
  }, [roleId]);

  // Check if everything is selected globally
  const isAllGlobalSelected = Object.values(permissions).every((sub) =>
    sub.create && sub.read && sub.update && sub.delete
  );

  const handleGlobalSelectAll = (checked: boolean) => {
    const newState = { ...permissions };
    Object.keys(newState).forEach((key) => {
      newState[key] = {
        create: checked,
        read: checked,
        update: checked,
        delete: checked,
      };
    });
    setPermissions(newState);
  };



  const isRowAllSelected = (subId: string) => {
    const p = permissions[subId];
    return p.create && p.read && p.update && p.delete;
  };

  const handleRowSelectAll = (subId: string, checked: boolean) => {
    setPermissions((prev) => ({
      ...prev,
      [subId]: {
        create: checked,
        read: checked,
        update: checked,
        delete: checked,
      },
    }));
  };

  const handlePermissionChange = (subId: string, action: ActionType, checked: boolean) => {
    setPermissions((prev) => ({
      ...prev,
      [subId]: {
        ...prev[subId],
        [action]: checked,
      },
    }));
  };

  const onSubmit = async () => {
    setError(null);
    setSuccess(null);

    if (!roleName.trim()) {
      setError("Role name is required.");
      return;
    }

    setIsLoading(true);

    try {
      // Map the complex UI permissions structure down to the backend's expected object format
      // e.g. { advertisement: ["read", "create"], dashboard: ["read"] }
      const mappedPermissions: Record<string, string[]> = {};
      
      MODULE_PERMISSIONS.forEach(module => {
        const actionSet = new Set<string>();
        
        module.subModules.forEach(sub => {
          const acts = permissions[sub.id];
          if (acts.create) actionSet.add("create");
          if (acts.read) actionSet.add("read");
          if (acts.update) actionSet.add("update");
          if (acts.delete) actionSet.add("delete");
        });
        
        if (actionSet.size > 0) {
          // Send back using the exact module.id (e.g. "advertisement", "analytics")
          mappedPermissions[module.id] = Array.from(actionSet);
        }
      });

      if (roleId) {
        await roleService.updateRole(roleId, {
          name: roleName,
          permissions: mappedPermissions,
        });
        setSuccess("Role updated successfully! Redirecting...");
      } else {
        await roleService.createRole({
          name: roleName,
          permissions: mappedPermissions,
        });
        setSuccess("Role created successfully! Redirecting...");
      }

      setTimeout(() => {
         router.push("/settings/roles");
      }, 1000);
    } catch (err: unknown) {
      setError(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (err as any)?.customMessage || (err as any)?.message || `Failed to ${roleId ? 'update' : 'create'} role. Please try again.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen p-6 md:p-8 space-y-6 rounded-lg border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b">
        <h2 className="text-xl font-bold text-gray-800">{roleId ? "Edit role" : "Add role"}</h2>
        <Button asChild variant="default" className="bg-green-600 hover:bg-green-700 h-9 px-4 font-medium tracking-wide rounded-sm shadow-none">
          <Link href="/settings/roles">Role list</Link>
        </Button>
      </div>

      <div className="space-y-8">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert className="bg-green-50 text-green-800 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {isFetching ? (
           <div className="flex justify-center items-center h-40">
             <Loader2 className="h-8 w-8 animate-spin text-green-600" />
           </div>
        ) : (
          <>
            {/* Top Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Label htmlFor="roleName" className="whitespace-nowrap font-bold text-sm text-gray-800">
                  Role name<span className="text-red-500">*</span>
                </Label>
                <Input
                  id="roleName"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  className="w-[300px] h-9 rounded-[3px] border-gray-200 focus-visible:ring-1 focus-visible:ring-green-500"
                />
              </div>
          <div className="flex items-center gap-2 pr-2">
            <Checkbox
              id="selectAllGlobal"
              checked={isAllGlobalSelected}
              onCheckedChange={(checked) => handleGlobalSelectAll(checked as boolean)}
              className="border-gray-300 rounded-[2px] shadow-none data-[state=checked]:bg-white data-[state=checked]:text-black"
            />
            <Label htmlFor="selectAllGlobal" className="font-semibold text-sm cursor-pointer text-gray-800">
              Select all
            </Label>
          </div>
        </div>

        {/* Modules Iteration */}
        <div className="space-y-6 pt-2">
          {MODULE_PERMISSIONS.map((module) => (
            <div key={module.id} className="space-y-2">
              <h3 className="text-lg font-bold text-gray-800 tracking-tight">{module.name}</h3>
              <div className="border border-gray-200 overflow-hidden rounded-none shadow-sm">
                <table className="w-full text-[13px] text-left divide-y divide-gray-200">
                  <thead className="bg-[#fcfcfc] border-b border-gray-200">
                    <tr className="divide-x divide-gray-200">
                      <th className="px-3 py-3 font-bold text-gray-800 w-16 text-center">Sl</th>
                      <th className="px-4 py-3 font-bold text-gray-800">Module menu</th>
                      <th className="px-3 py-3 font-bold text-gray-800 text-center w-28">Select all</th>
                      <th className="px-3 py-3 font-bold text-gray-800 text-center w-24">Create</th>
                      <th className="px-3 py-3 font-bold text-gray-800 text-center w-24">Read</th>
                      <th className="px-3 py-3 font-bold text-gray-800 text-center w-24">Update</th>
                      <th className="px-3 py-3 font-bold text-gray-800 text-center w-24">Delete</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {module.subModules.map((sub, idx) => (
                      <tr key={sub.id} className="hover:bg-gray-50/50 transition-colors divide-x divide-gray-200 group">
                        <td className="px-3 py-3 text-center text-gray-600 font-medium">{idx + 1}</td>
                        <td className="px-4 py-3 text-gray-600 font-medium">{sub.name}</td>
                        <td className="px-3 py-3 text-center align-middle">
                          <Checkbox
                            checked={isRowAllSelected(sub.id)}
                            onCheckedChange={(c) => handleRowSelectAll(sub.id, c as boolean)}
                            className="border-gray-300 rounded-[2px] shadow-none data-[state=checked]:bg-white data-[state=checked]:text-black"
                          />
                        </td>
                        <td className="px-3 py-3 text-center align-middle">
                          <Checkbox
                            checked={permissions[sub.id].create}
                            onCheckedChange={(c) => handlePermissionChange(sub.id, "create", c as boolean)}
                            className="border-gray-300 rounded-[2px] shadow-none data-[state=checked]:bg-white data-[state=checked]:text-black"
                          />
                        </td>
                        <td className="px-3 py-3 text-center align-middle">
                          <Checkbox
                            checked={permissions[sub.id].read}
                            onCheckedChange={(c) => handlePermissionChange(sub.id, "read", c as boolean)}
                            className="border-gray-300 rounded-[2px] shadow-none data-[state=checked]:bg-white data-[state=checked]:text-black"
                          />
                        </td>
                        <td className="px-3 py-3 text-center align-middle">
                          <Checkbox
                            checked={permissions[sub.id].update}
                            onCheckedChange={(c) => handlePermissionChange(sub.id, "update", c as boolean)}
                            className="border-gray-300 rounded-[2px] shadow-none data-[state=checked]:bg-white data-[state=checked]:text-black"
                          />
                        </td>
                        <td className="px-3 py-3 text-center align-middle">
                          <Checkbox
                            checked={permissions[sub.id].delete}
                            onCheckedChange={(c) => handlePermissionChange(sub.id, "delete", c as boolean)}
                            className="border-gray-300 rounded-[2px] shadow-none data-[state=checked]:bg-white data-[state=checked]:text-black"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>

            {/* Form Actions */}
            <div className="flex justify-end pt-6 space-x-4 border-t border-gray-200">
              <Button variant="outline" asChild className="rounded-sm shadow-none">
                <Link href="/settings/roles">Cancel</Link>
              </Button>
              <Button onClick={onSubmit} disabled={isLoading || !roleName.trim()} className="bg-green-600 hover:bg-green-700 rounded-sm shadow-none">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {roleId ? "Update Role" : "Save Role"}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
