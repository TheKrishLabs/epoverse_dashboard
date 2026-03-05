"use client"

import { useState, useEffect } from "react"
import { Loader2, ArrowLeft, X, UploadCloud } from "lucide-react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { opinionService, OpinionData } from "@/services/opinion-service"
import { languageService, Language } from "@/services/language-service"

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false })
import "react-quill-new/dist/quill.snow.css"

interface OpinionFormProps {
    initialData?: OpinionData
    isEditing?: boolean
}

export function OpinionForm({ initialData, isEditing = false }: OpinionFormProps) {
    const router = useRouter()

    const [languages, setLanguages] = useState<Language[]>([])
    const [isLoadingLanguages, setIsLoadingLanguages] = useState(true)

    useEffect(() => {
        const fetchLanguages = async () => {
            try {
                const langData = await languageService.getLanguages()
                setLanguages(langData || [])
            } catch (error) {
                console.error("Failed to load languages", error)
            } finally {
                setIsLoadingLanguages(false)
            }
        }
        fetchLanguages()
    }, [])

    // Form State
    const [language, setLanguage] = useState(() => {
        const langData = initialData?.language;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return typeof langData === 'object' && langData ? (langData as any)._id : (langData || "");
    })
    const [name, setName] = useState(initialData?.name || "")
    const [designation, setDesignation] = useState(initialData?.designation || "")
    const [headline, setHeadline] = useState(initialData?.headline || "")
    const [slug, setSlug] = useState(initialData?.slug || "")
    const [details, setDetails] = useState(initialData?.details || "")
    const [status, setStatus] = useState<string>(initialData?.status as string || "Active")
    const [isLatest, setIsLatest] = useState<boolean>(initialData?.isLatest || false)
    
    // Images
    const [photo1Preview, setPhoto1Preview] = useState<string | null>(initialData?.photo1 || null)
    const [photo1Error, setPhoto1Error] = useState<string>("")
    
    const [photo2Preview, setPhoto2Preview] = useState<string | null>(initialData?.photo2 || null)
    const [photo2Error, setPhoto2Error] = useState<string>("")

    // SEO
    const [imageAlt, setImageAlt] = useState(initialData?.imageAlt || "")
    const [imageTitle, setImageTitle] = useState(initialData?.imageTitle || "")
    // Initial data might have array for metaKeywords, falling back to empty string
    const [metaKeyword, setMetaKeyword] = useState<string>(
        Array.isArray(initialData?.metaKeywords) ? initialData.metaKeywords.join(", ") : ""
    )
    const [metaDescription, setMetaDescription] = useState(initialData?.metaDescription || "")

    const [errors, setErrors] = useState<Record<string, boolean>>({})
    const [isSaving, setIsSaving] = useState(false)

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>, photoIndex: 1 | 2) => {
        const file = e.target.files?.[0]
        const setError = photoIndex === 1 ? setPhoto1Error : setPhoto2Error
        const setPreview = photoIndex === 1 ? setPhoto1Preview : setPhoto2Preview

        setError("")
        if (file) {
            // Validation: Max size 500KB (500 * 1024 bytes) = 512000 bytes
            if (file.size > 512000) {
                setError("Max size is 500 KB")
                e.target.value = ""
                return
            }
            
            const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"]
            if (!validTypes.includes(file.type)) {
                setError("Only JPG, PNG, GIF allowed")
                e.target.value = ""
                return
            }

            const img = new Image()
            const objectUrl = URL.createObjectURL(file)
            img.onload = () => {
                if (img.width !== 150 || img.height !== 150) {
                    setError(`Dimension must be exactly 150x150. Your image is ${img.width}x${img.height}`)
                    URL.revokeObjectURL(objectUrl)
                    e.target.value = ""
                    return
                 }
                 setPreview(objectUrl)
                 // NOTE: in a real application, we would upload the file to a server or convert it to base64. 
                 // We will convert to base64 here to be sent correctly, just like page-form does.
                 const reader = new FileReader()
                 reader.onloadend = () => {
                     setPreview(reader.result as string)
                 }
                 reader.readAsDataURL(file)
            }
            img.src = objectUrl
        }
    }

    const removePhoto = (photoIndex: 1 | 2) => {
        if (photoIndex === 1) setPhoto1Preview(null)
        else setPhoto2Preview(null)
    }

    const validateForm = () => {
        const newErrors: Record<string, boolean> = {}
        if (!language) newErrors.language = true
        if (!name) newErrors.name = true
        if (!headline) newErrors.headline = true
        if (!slug) newErrors.slug = true
        if (!details || details === '<p><br></p>') newErrors.details = true
        
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0 && !photo1Error && !photo2Error
    }

    const handleSubmit = async () => {
        if (!validateForm()) {
            alert("Please fill in all required fields.")
            return
        }

        setIsSaving(true)

        try {
            const keywordsArray = metaKeyword.split(',').map(k => k.trim()).filter(k => k !== "")

            const serviceData: Partial<OpinionData> = {
                language,
                name,
                designation,
                headline,
                slug,
                details,
                photo1: photo1Preview || null,
                photo2: photo2Preview || null,
                imageAlt,
                imageTitle,
                metaKeywords: keywordsArray,
                metaDescription,
                isLatest,
                status
            }

            if (isEditing && initialData && (initialData.id || initialData._id)) {
                await opinionService.updateOpinion((initialData.id || initialData._id) as string, serviceData)
                alert("Opinion updated successfully!")
            } else {
                await opinionService.createOpinion(serviceData)
                alert("Opinion created successfully!")
            }
            router.push("/opinions")
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            console.error("Failed to save opinion", error)
            const backendMessage = error.response?.data?.message || "Failed to save opinion. Please try again."
            alert(backendMessage)
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="space-y-6 bg-white dark:bg-sidebar p-6 rounded-md shadow-sm border border-gray-100 dark:border-border">
            <div className="flex items-center justify-between pb-4 border-b">
                 <div className="flex items-center gap-3">
                     <Button variant="outline" size="icon" asChild className="h-8 w-8">
                         <Link href="/opinions">
                             <ArrowLeft className="h-4 w-4" />
                         </Link>
                     </Button>
                    <h2 className="text-xl font-bold text-gray-800">{isEditing ? "Edit Opinion" : "Add Opinion"}</h2>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                    <Label className={cn(errors.language && "text-red-500")}>Language <span className="text-red-500">*</span></Label>
                    <Select onValueChange={setLanguage} value={language}>
                        <SelectTrigger className={cn("h-10", errors.language && "border-red-500 focus:ring-red-500")}>
                            <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                            {isLoadingLanguages ? (
                                <SelectItem value="loading" disabled>Loading...</SelectItem>
                            ) : languages.length > 0 ? (
                                languages.map((lang) => (
                                    <SelectItem key={lang._id} value={lang._id as string}>
                                        {lang.name}
                                    </SelectItem>
                                ))
                            ) : (
                                <SelectItem value="empty" disabled>No languages found</SelectItem>
                            )}
                        </SelectContent>
                    </Select>
                    {errors.language && <p className="text-xs text-red-500">Language is required.</p>}
                </div>

                <div className="space-y-2">
                    <Label className={cn(errors.name && "text-red-500")}>Name <span className="text-red-500">*</span></Label>
                    <Input 
                        placeholder="Enter name" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)}
                        className={cn("h-10", errors.name && "border-red-500 focus-visible:ring-red-500")}
                    />
                    {errors.name && <p className="text-xs text-red-500">Name is required.</p>}
                </div>

                <div className="space-y-2">
                    <Label>Designation</Label>
                    <Input 
                        placeholder="Enter designation" 
                        value={designation} 
                        onChange={(e) => setDesignation(e.target.value)}
                        className="h-10"
                    />
                </div>

                <div className="space-y-2 lg:col-span-2">
                    <Label className={cn(errors.headline && "text-red-500")}>Headline <span className="text-red-500">*</span></Label>
                    <Input 
                        placeholder="Enter headline" 
                        value={headline} 
                        onChange={(e) => {
                             const newHeadline = e.target.value;
                             setHeadline(newHeadline);
                             // Auto generate slug if not explicitly edited before or if creating new
                             if (!isEditing || slug === "") {
                                 const generatedSlug = newHeadline.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                                 setSlug(generatedSlug);
                             }
                        }}
                        className={cn("h-10", errors.headline && "border-red-500 focus-visible:ring-red-500")}
                    />
                    {errors.headline && <p className="text-xs text-red-500">Headline is required.</p>}
                </div>

                <div className="space-y-2">
                    <Label className={cn(errors.slug && "text-red-500")}>Slug <span className="text-red-500">*</span></Label>
                    <Input 
                        placeholder="e.g. opinion-topic-name" 
                        value={slug} 
                        onChange={(e) => setSlug(e.target.value)}
                        className={cn("h-10", errors.slug && "border-red-500 focus-visible:ring-red-500")}
                    />
                    {errors.slug && <p className="text-xs text-red-500">Slug is required.</p>}
                </div>
            </div>

            <div className="space-y-2">
                <Label className={cn(errors.details && "text-red-500")}>Details <span className="text-red-500">*</span></Label>
                <div className={cn("h-[300px] pb-12 rounded-md border", errors.details && "border-red-500")}>
                    <ReactQuill theme="snow" value={details} onChange={setDetails} className="h-full" />
                </div>
                {errors.details && <p className="text-xs text-red-500">Details content is required.</p>}
            </div>

            <div className="grid gap-6 md:grid-cols-2 pt-4 border-t mt-8">
                {/* Image 1 */}
                <div className="space-y-3 p-4 border rounded-md bg-gray-50/50">
                    <Label className="text-base font-semibold text-gray-800">Image 1</Label>
                    <div className="space-y-2">
                        <Input 
                            type="file" 
                            id="photo1"
                            className="hidden"
                            onChange={(e) => handlePhotoChange(e, 1)} 
                            accept="image/jpeg, image/jpg, image/png, image/gif" 
                        />
                        <div className="flex items-center gap-4">
                            <Label 
                                htmlFor="photo1" 
                                className="flex items-center gap-2 cursor-pointer bg-white border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                            >
                                <UploadCloud className="h-4 w-4 text-gray-500" />
                                Choose Image
                            </Label>
                            {photo1Preview && (
                                <div className="relative w-20 h-20 rounded-md overflow-hidden border bg-white">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={photo1Preview} alt="Preview 1" className="w-full h-full object-cover" />
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        className="absolute top-1 right-1 h-5 w-5 rounded-full z-10 p-0"
                                        onClick={(e) => { e.preventDefault(); removePhoto(1); }}
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </div>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 text-gray-500">Validation: 150x150 px, Max size 500 KB</p>
                        {photo1Error && <p className="text-xs text-red-500 font-medium">{photo1Error}</p>}
                    </div>
                </div>

                {/* Image 2 */}
                <div className="space-y-3 p-4 border rounded-md bg-gray-50/50">
                    <Label className="text-base font-semibold text-gray-800">Image 2</Label>
                    <div className="space-y-2">
                        <Input 
                            type="file" 
                            id="photo2"
                            className="hidden"
                            onChange={(e) => handlePhotoChange(e, 2)} 
                            accept="image/jpeg, image/jpg, image/png, image/gif" 
                        />
                         <div className="flex items-center gap-4">
                            <Label 
                                htmlFor="photo2" 
                                className="flex items-center gap-2 cursor-pointer bg-white border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                            >
                                <UploadCloud className="h-4 w-4 text-gray-500" />
                                Choose Image
                            </Label>
                            {photo2Preview && (
                                <div className="relative w-20 h-20 rounded-md overflow-hidden border bg-white">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={photo2Preview} alt="Preview 2" className="w-full h-full object-cover" />
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        className="absolute top-1 right-1 h-5 w-5 rounded-full z-10 p-0"
                                        onClick={(e) => { e.preventDefault(); removePhoto(2); }}
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </div>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 text-gray-500">Validation: 150x150 px, Max size 500 KB</p>
                        {photo2Error && <p className="text-xs text-red-500 font-medium">{photo2Error}</p>}
                    </div>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 pt-4 border-t mt-4">
                <div className="space-y-4">
                     <h3 className="font-semibold text-gray-800">SEO Information</h3>
                     <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Image Alt</Label>
                            <Input placeholder="Enter image alt text" value={imageAlt} onChange={(e) => setImageAlt(e.target.value)} className="h-10" />
                        </div>
                        <div className="space-y-2">
                            <Label>Image Title</Label>
                            <Input placeholder="Enter image title" value={imageTitle} onChange={(e) => setImageTitle(e.target.value)} className="h-10" />
                        </div>
                        <div className="space-y-2">
                            <Label>Meta Keywords</Label>
                            <Input placeholder="keyword1, keyword2, keyword3" value={metaKeyword} onChange={(e) => setMetaKeyword(e.target.value)} className="h-10" />
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                     <h3 className="font-semibold text-gray-800 opacity-0 hidden md:block">Settings</h3>
                     <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Meta Description</Label>
                            <Textarea 
                                placeholder="Enter meta description" 
                                value={metaDescription} 
                                onChange={(e) => setMetaDescription(e.target.value)}
                                className="min-h-[110px] resize-none"
                            />
                        </div>
                        <div className="space-y-2 mt-4 pt-4 border-t">
                            <Label>Status</Label>
                            <Select onValueChange={setStatus} value={status}>
                                <SelectTrigger className="h-10">
                                    <SelectValue placeholder="Select Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Active">Active</SelectItem>
                                    <SelectItem value="Inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center space-x-2 pt-2">
                            <input 
                                type="checkbox" 
                                id="isLatest" 
                                checked={isLatest} 
                                onChange={(e) => setIsLatest(e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <Label htmlFor="isLatest" className="cursor-pointer">Mark as Latest Opinion</Label>
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-6 border-t flex justify-end">
                <Button 
                    size="lg" 
                    className="bg-[#198754] hover:bg-[#157347] text-white px-8 h-11 font-medium tracking-wide shadow-none w-full sm:w-auto" 
                    onClick={handleSubmit} 
                    disabled={isSaving}
                >
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Save Opinion
                </Button>
            </div>
        </div>
    )
}
