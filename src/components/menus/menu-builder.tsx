"use client"

import { useState, useEffect } from "react"
// Removed useRouter
import { Plus, Trash2, Edit2 } from "lucide-react"
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
// Removed missing useToast import

import { menuService, MenuItem } from "@/services/menu-service"
import { postService } from "@/services/post-service"
import { languageService, Language } from "@/services/language-service"
import { Category } from "@/services/post-service"
import { pageService, PageData } from "@/services/page-service"

export function MenuBuilder({ menuId }: { menuId: string }) {
    // Removed missing useToast hook usage
    
    // Core Data States
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    
    // Setup States
    const [languages, setLanguages] = useState<Language[]>([]);
    const [selectedLanguage, setSelectedLanguage] = useState<string>("");
    
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
    
    const [pages, setPages] = useState<PageData[]>([]);
    const [selectedPageIds, setSelectedPageIds] = useState<string[]>([]);

    const [linkText, setLinkText] = useState("");
    const [linkUrl, setLinkUrl] = useState("");
    
    // Loading States
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // DnD Sensors
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        let isMounted = true;
        
        const fetchInitialData = async () => {
            setIsLoading(true);
            try {
                const [menuData, fallbackItems, langsData, catsData, pagesData] = await Promise.all([
                    menuService.getMenuById(menuId),
                    menuService.getMenuItems(menuId),
                    languageService.getLanguages(),
                    postService.getCategories(),
                    pageService.getPages()
                ]);

                // Use items from menu details if present, otherwise fallback to separate items call
                const items = menuData?.items && menuData.items.length > 0 
                    ? menuData.items 
                    : (fallbackItems || []);

                setMenuItems(items);
                
                // Parse Languages cleanly, fallback format handlers included in languageService usually
                let actualLangs: Language[] = [];
                if (Array.isArray(langsData)) actualLangs = langsData;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                else if (langsData && Array.isArray((langsData as any).data)) actualLangs = (langsData as any).data;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                else if (langsData && Array.isArray((langsData as any).languages)) actualLangs = (langsData as any).languages;
                
                setLanguages(actualLangs);

                if (actualLangs.length > 0) {
                     setSelectedLanguage(actualLangs[0]._id || "");
                }

                setCategories(catsData || []);

                let actualPages: PageData[] = [];
                if (Array.isArray(pagesData)) actualPages = pagesData;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                else if (pagesData && Array.isArray((pagesData as any).data)) actualPages = (pagesData as any).data;
                setPages(actualPages);

            } catch (error) {
                console.error("Failed to load menu builder initial data:", error);
                alert("Failed to load builder data.");
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        fetchInitialData();

        return () => {
            isMounted = false;
        };
    }, [menuId]);

    const handleLanguageChange = (val: string) => {
        setSelectedLanguage(val);
        // Deselect when swapping languages
        setSelectedCategoryIds([]);
        setSelectedPageIds([]);
    }

    // Filter categories by language
    const filteredCategories = categories.filter(c => {
        if (!selectedLanguage) return true;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rawLang = (c as any).language;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const catLangId = typeof rawLang === 'object' ? (rawLang as any)?._id : rawLang;
        
        // RELAXED FILTER: Show if it matches OR if it has NO language (global)
        return !catLangId || catLangId === selectedLanguage;
    });

    useEffect(() => {
        console.log("MenuBuilder - Selected Language:", selectedLanguage);
        console.log("MenuBuilder - Total Categories:", categories.length);
        console.log("MenuBuilder - Filtered Categories:", filteredCategories.length);
        if (categories.length > 0 && filteredCategories.length === 0) {
            console.log("MenuBuilder - Categories sample:", categories.slice(0, 2));
        }
    }, [selectedLanguage, categories, filteredCategories]);

    const toggleCategorySelection = (categoryId: string) => {
        setSelectedCategoryIds(prev => 
            prev.includes(categoryId) 
                ? prev.filter(id => id !== categoryId)
                : [...prev, categoryId]
        );
    };

    const addCategoriesToMenu = async () => {
        if (selectedCategoryIds.length === 0) return;

        try {
            const newItems: MenuItem[] = await Promise.all(selectedCategoryIds.map(async (id, index) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const cat = categories.find(c => c._id === id || (c as any).id === id);
                const payload: Partial<MenuItem> = {
                    menu: menuId,
                    title: cat?.name || "Unknown Category",
                    type: 'category',
                    referenceId: id,
                    order: menuItems.length + index + 1
                };
                
                const created = await menuService.createMenuItem(payload);
                return {
                    ...created,
                    id: created._id || `item-${Date.now()}-${id}`, // fallback to local id for DnD
                    originalId: id
                };
            }));

            setMenuItems(prev => [...prev, ...newItems]);
            setSelectedCategoryIds([]);
            alert("Categories added to menu successfully.");
        } catch (error) {
            console.error("Failed to add categories to menu:", error);
            alert("Failed to add categories. Please try again.");
        }
    };

    // Filter pages by language
    const filteredPages = pages.filter(p => {
        if (!selectedLanguage) return true;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rawLang = (p as any).language;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pageLangId = typeof rawLang === 'object' ? (rawLang as any)?._id : rawLang;
        return pageLangId === selectedLanguage;
    });

    const togglePageSelection = (pageId: string) => {
        setSelectedPageIds(prev => 
            prev.includes(pageId) 
                ? prev.filter(id => id !== pageId)
                : [...prev, pageId]
        );
    };

    const addPagesToMenu = async () => {
        if (selectedPageIds.length === 0) return;

        try {
            const newItems: MenuItem[] = await Promise.all(selectedPageIds.map(async (id, index) => {
                const p = pages.find(page => page._id === id || page.id === id);
                const payload: Partial<MenuItem> = {
                    menu: menuId,
                    title: p?.title || "Unknown Page",
                    type: 'page',
                    referenceId: id,
                    order: menuItems.length + index + 1
                };

                const created = await menuService.createMenuItem(payload);
                return {
                    ...created,
                    id: created._id || `item-${Date.now()}-${id}`,
                    originalId: id
                };
            }));

            setMenuItems(prev => [...prev, ...newItems]);
            setSelectedPageIds([]);
            alert("Pages added to menu successfully.");
        } catch (error) {
            console.error("Failed to add pages to menu:", error);
            alert("Failed to add pages. Please try again.");
        }
    };

    const addLinkToMenu = async () => {
        if (!linkText.trim() || !linkUrl.trim()) {
            alert("Please enter both Link Text and URL");
            return;
        }

        try {
            const payload: Partial<MenuItem> = {
                menu: menuId,
                title: linkText.trim(),
                type: 'link',
                url: linkUrl.trim(),
                order: menuItems.length + 1
            };

            const created = await menuService.createMenuItem(payload);
            const newItem: MenuItem = {
                ...created,
                id: created._id || `item-link-${Date.now()}`
            };

            setMenuItems(prev => [...prev, newItem]);
            setLinkText("");
            setLinkUrl("");
            alert("Link added to menu successfully.");
        } catch (error) {
            console.error("Failed to add link to menu:", error);
            alert("Failed to add link. Please try again.");
        }
    };

    const removeMenuItem = (itemId: string) => {
        setMenuItems(prev => prev.filter(i => i.id !== itemId));
    };


    const handleUpdateMenuItem = (updatedItem: MenuItem) => {
        setMenuItems(prev => prev.map(i => i.id === updatedItem.id ? updatedItem : i));
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        
        if (over && active.id !== over.id) {
            setMenuItems((items) => {
                const oldIndex = items.findIndex(i => i.id === active.id);
                const newIndex = items.findIndex(i => i.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const saveMenuConfiguration = async () => {
        setIsSaving(true);
        try {
            await menuService.saveMenuItems(menuId, menuItems);
            alert("Menu configuration saved successfully.");
        } catch {
            alert("Failed to save menu configuration");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8 w-full max-w-[1200px]">
            {/* Top Panel: Setup Menu */}
            <div className="bg-white border border-gray-200 rounded-sm shadow-sm flex flex-col w-full">
                <div className="px-6 py-4 border-b">
                     <h3 className="text-gray-800">Setup menu</h3>
                </div>
                
                <div className="p-6">
                    <div className="flex flex-col md:flex-row justify-between items-start mb-6">
                        <div className="order-2 md:order-1 mt-6 md:mt-0 flex-1 w-full max-w-4xl">
                            <Tabs defaultValue="category" className="w-full">
                                <TabsList className="bg-transparent h-auto p-0 gap-2 flex flex-wrap justify-start">
                                    <TabsTrigger value="category" className="rounded-[3px] px-6 py-2 border-none data-[state=active]:bg-[#198754] data-[state=active]:text-white bg-gray-100 text-gray-700 data-[state=active]:shadow-none">Category</TabsTrigger>
                                    <TabsTrigger value="page" className="rounded-[3px] px-6 py-2 border-none data-[state=active]:bg-[#198754] data-[state=active]:text-white bg-gray-100 text-gray-700 data-[state=active]:shadow-none">Page</TabsTrigger>
                                    <TabsTrigger value="link" className="rounded-[3px] px-6 py-2 border-none data-[state=active]:bg-[#198754] data-[state=active]:text-white bg-gray-100 text-gray-700 data-[state=active]:shadow-none">Link</TabsTrigger>
                                    <TabsTrigger value="archive" disabled className="rounded-[3px] px-6 py-2 border-none bg-gray-100 text-gray-700 opacity-50 cursor-not-allowed">Archive</TabsTrigger>
                                </TabsList>
                                <TabsContent value="category" className="pt-6 m-0 border-none">
                                    <button className="text-[#198754] text-sm hover:underline mb-4 flex items-center font-medium">
                                        <Plus className="h-4 w-4 mr-1 text-white bg-[#198754] rounded-full p-[2px]" /> Add new category
                                    </button>
                                    <h2 className="text-[28px] text-gray-800 mb-6 font-normal">Category</h2>
                                    
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-6 gap-y-4 mb-8">
                                        {filteredCategories.length === 0 ? (
                                            <p className="text-sm text-gray-500 col-span-full">No categories found for this language.</p>
                                        ) : (
                                            filteredCategories.map(cat => (
                                                <div key={cat._id} className="flex items-center space-x-2">
                                                    <Checkbox 
                                                        id={`cat-${cat._id}`} 
                                                        checked={selectedCategoryIds.includes(cat._id)}
                                                        onCheckedChange={() => toggleCategorySelection(cat._id)}
                                                        className="h-[15px] w-[15px] border-gray-300 rounded-[3px] data-[state=checked]:bg-[#198754] data-[state=checked]:border-[#198754]"
                                                    />
                                                    <Label 
                                                        htmlFor={`cat-${cat._id}`}
                                                        className="text-[14px] font-normal text-gray-700 cursor-pointer select-none leading-none"
                                                    >
                                                        {cat.name}
                                                    </Label>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    <Button 
                                        size="sm" 
                                        onClick={addCategoriesToMenu}
                                        disabled={selectedCategoryIds.length === 0}
                                        className="bg-[#198754] hover:bg-[#157347] text-white px-8 h-9 rounded-[3px] font-normal"
                                    >
                                        Save
                                    </Button>
                                </TabsContent>
                                
                                <TabsContent value="page" className="pt-6 m-0 border-none">
                                    <h2 className="text-[28px] text-gray-800 mb-4 font-normal">Page</h2>
                                    
                                    <div className="flex flex-wrap gap-x-6 gap-y-3 mb-6 max-h-[300px] overflow-y-auto">
                                        {filteredPages.length === 0 ? (
                                            <p className="text-sm text-gray-500 w-full">No pages found for this language.</p>
                                        ) : (
                                            filteredPages.map(page => (
                                                <div key={page._id || page.id} className="flex items-center space-x-2">
                                                    <Checkbox 
                                                        id={`page-${page._id || page.id}`} 
                                                        checked={selectedPageIds.includes(page._id || page.id as string)}
                                                        onCheckedChange={() => togglePageSelection(page._id || page.id as string)}
                                                        className="border-gray-300 rounded-[3px] data-[state=checked]:bg-[#198754] data-[state=checked]:border-[#198754]"
                                                    />
                                                    <Label 
                                                        htmlFor={`page-${page._id || page.id}`}
                                                        className="text-sm font-normal text-gray-700 cursor-pointer select-none"
                                                    >
                                                        {page.title}
                                                    </Label>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    <Button 
                                        size="sm" 
                                        onClick={addPagesToMenu}
                                        disabled={selectedPageIds.length === 0}
                                        className="bg-[#198754] hover:bg-[#157347] text-white px-6 rounded-[3px]"
                                    >
                                        Save
                                    </Button>
                                </TabsContent>

                                <TabsContent value="link" className="pt-6 m-0 border-none">
                                    <h2 className="text-[28px] text-gray-800 mb-4 font-normal">Custom Link</h2>
                                    <div className="space-y-4 max-w-sm mb-6">
                                        <div>
                                            <Label htmlFor="linkText" className="text-sm text-gray-700">Link Text</Label>
                                            <Input 
                                                id="linkText"
                                                placeholder="e.g. Google"
                                                value={linkText}
                                                onChange={e => setLinkText(e.target.value)}
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="linkUrl" className="text-sm text-gray-700">URL</Label>
                                            <Input 
                                                id="linkUrl"
                                                type="url"
                                                placeholder="https://google.com"
                                                value={linkUrl}
                                                onChange={e => setLinkUrl(e.target.value)}
                                                className="mt-1"
                                            />
                                        </div>
                                    </div>
                                    <Button 
                                        size="sm" 
                                        onClick={addLinkToMenu}
                                        disabled={!linkText.trim() || !linkUrl.trim()}
                                        className="bg-[#198754] hover:bg-[#157347] text-white px-6 rounded-[3px]"
                                    >
                                        Save
                                    </Button>
                                </TabsContent>
                            </Tabs>
                        </div>

                        <div className="order-1 md:order-2 w-full md:w-64 space-y-1 mb-4 md:mb-0">
                            <Label htmlFor="language" className="text-sm font-bold text-gray-800">Language <span className="text-red-500">*</span></Label>
                            <Select 
                                value={selectedLanguage} 
                                onValueChange={handleLanguageChange}
                            >
                                <SelectTrigger className="w-full bg-white border-gray-200">
                                    <SelectValue placeholder="Select Language" />
                                </SelectTrigger>
                                <SelectContent>
                                    {languages.map(lang => (
                                        <SelectItem key={lang._id} value={lang._id}>
                                            {lang.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Panel: Update Menu */}
            <div className="bg-white border rounded-sm shadow-sm flex flex-col w-full mb-8">
                <div className="px-6 py-4 border-b">
                     <h3 className="text-gray-800">Update menu</h3>
                </div>
                
                <div className="p-6">
                     <div className="flex flex-col mb-4 bg-gray-100 p-2 rounded-sm border border-gray-100">
                        {menuItems.length === 0 ? (
                            <div className="text-gray-400 text-sm py-12 text-center bg-white border border-dashed border-gray-300">
                                No items added to this menu yet. Add items from the top panel.
                            </div>
                        ) : (
                            <DndContext 
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext 
                                    items={menuItems.map(i => i.id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    <div className="flex flex-col">
                                        {menuItems.map((item) => (
                                            <SortableMenuItem 
                                                key={item.id} 
                                                item={item} 
                                                onRemove={() => removeMenuItem(item.id)}
                                                onUpdate={handleUpdateMenuItem}
                                            />
                                        ))}
                                    </div>
                                </SortableContext>
                            </DndContext>
                        )}
                     </div>

                     <div className="mt-4">
                         <Button 
                            onClick={saveMenuConfiguration} 
                            disabled={isSaving}
                            className="bg-[#198754] hover:bg-[#157347] text-white px-6 rounded-[3px]"
                         >
                            {isSaving ? "Updating..." : "Update"}
                         </Button>
                     </div>
                </div>
            </div>
        </div>
    );
}

// Sub-component for individual sortable menu item
function SortableMenuItem({ 
    item, 
    onRemove, 
    onUpdate 
}: { 
    item: MenuItem; 
    onRemove: () => void;
    onUpdate: (item: MenuItem) => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: item.id });

    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 2 : 1,
    };

    return (
        <>
            <div 
                ref={setNodeRef} 
                style={style} 
                className={`flex items-center justify-between px-4 py-3 bg-[#e2e3e5] mb-[2px] group ${isDragging ? 'opacity-50 ring-2 ring-[#0d6efd] ring-inset z-10 shadow-lg' : ''}`}
            >
                <div 
                    className="flex items-center gap-3 overflow-hidden flex-1 cursor-move"
                    {...attributes} 
                    {...listeners}
                >
                    <span className="text-[15px] font-normal text-gray-800">{item.title}</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-0 ml-4">
                    <Button 
                        variant="default" 
                        size="icon" 
                        className="h-8 w-8 bg-[#0d6efd] hover:bg-[#0b5ed7] text-white rounded-none shadow-none"
                        onClick={() => setIsEditDialogOpen(true)}
                        onPointerDown={e => e.stopPropagation()}
                        title="Edit Item"
                    >
                        <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button 
                        variant="destructive" 
                        size="icon" 
                        className="h-8 w-8 bg-[#dc3545] hover:bg-[#bb2d3b] text-white rounded-none shadow-none"
                        onClick={onRemove}
                        onPointerDown={e => e.stopPropagation()}
                        title="Remove Item"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <MenuItemEditDialog 
                isOpen={isEditDialogOpen} 
                onClose={() => setIsEditDialogOpen(false)} 
                item={item}
                onSuccess={(updated) => {
                    onUpdate(updated);
                    setIsEditDialogOpen(false);
                }}
            />
        </>
    );
}

function MenuItemEditDialog({ 
    isOpen, 
    onClose, 
    item, 
    onSuccess 
}: { 
    isOpen: boolean; 
    onClose: () => void; 
    item: MenuItem;
    onSuccess: (updated: MenuItem) => void;
}) {
    const [formData, setFormData] = useState<Partial<MenuItem>>({
        title: item.title,
        type: item.type,
        url: item.url || "",
        order: item.order || 0,
        parentId: item.parentId || "",
        referenceId: item.referenceId || "",
        menu: item.menu
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setFormData({
                title: item.title,
                type: item.type,
                url: item.url || "",
                order: item.order || 0,
                parentId: item.parentId || "",
                referenceId: item.referenceId || "",
                menu: item.menu
            });
        }
    }, [isOpen, item]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const updated = await menuService.updateMenuItem(item._id || item.id, formData);
            alert("Menu item updated successfully.");
            onSuccess({
                ...item,
                ...updated,
                id: item.id // preserve local id for DnD
            });
        } catch (error) {
            console.error("Failed to update menu item:", error);
            alert("Failed to update menu item.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Edit Menu Item</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="title" className="text-right text-sm">Title</Label>
                        <Input 
                            id="title" 
                            className="col-span-3 h-9" 
                            value={formData.title} 
                            onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="type" className="text-right text-sm">Type</Label>
                        <Select 
                            value={formData.type} 
                            onValueChange={val => setFormData(prev => ({ ...prev, type: val as MenuItem['type'] }))}
                        >
                            <SelectTrigger className="col-span-3 h-9 bg-white">
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="category">Category</SelectItem>
                                <SelectItem value="page">Page</SelectItem>
                                <SelectItem value="link">Link</SelectItem>
                                <SelectItem value="archive">Archive</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    {formData.type === 'link' && (
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="url" className="text-right text-sm">URL</Label>
                            <Input 
                                id="url" 
                                className="col-span-3 h-9" 
                                value={formData.url} 
                                onChange={e => setFormData(prev => ({ ...prev, url: e.target.value }))}
                            />
                        </div>
                    )}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="order" className="text-right text-sm">Order</Label>
                        <Input 
                            id="order" 
                            type="number"
                            className="col-span-3 h-9" 
                            value={formData.order} 
                            onChange={e => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="parentId" className="text-right text-sm">Parent ID</Label>
                        <Input 
                            id="parentId" 
                            className="col-span-3 h-9" 
                            value={formData.parentId} 
                            onChange={e => setFormData(prev => ({ ...prev, parentId: e.target.value }))}
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="referenceId" className="text-right text-sm">Reference ID</Label>
                        <Input 
                            id="referenceId" 
                            className="col-span-3 h-9" 
                            value={formData.referenceId} 
                            onChange={e => setFormData(prev => ({ ...prev, referenceId: e.target.value }))}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isSaving}>Cancel</Button>
                    <Button 
                        onClick={handleSave} 
                        disabled={isSaving}
                        className="bg-[#198754] hover:bg-[#157347] text-white"
                    >
                        {isSaving ? "Saving..." : "Save changes"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

