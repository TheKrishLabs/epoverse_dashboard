import { MenuBuilder } from "@/components/menus/menu-builder"

export default async function MenuBuilderPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
      </div>
      <MenuBuilder menuId={id} />
    </div>
  )
}
