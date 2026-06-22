"use client"

import { useState, useEffect } from "react"
import { Loader2, ArrowLeft, Plus, X } from "lucide-react"
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
import { pollService, PollData, PollOption } from "@/services/poll-service"
import { languageService, Language } from "@/services/language-service"

interface PollFormProps {
    initialData?: PollData
    isEditing?: boolean
}

export function PollForm({ initialData, isEditing = false }: PollFormProps) {
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
    // The language API might expect the ID instead of the name. If the previous implementation used the name,
    // we should make sure we bind the language ID since the requirement is `"language": "699eb8049469ff1d556ebecd"`
    const [language, setLanguage] = useState(initialData?.language || "")
    const [question, setQuestion] = useState(initialData?.question || "")
    const [votePermission, setVotePermission] = useState<'all' | 'registered'>(initialData?.votePermission || 'all')
    const [status, setStatus] = useState<'Active' | 'Inactive'>(initialData?.status || "Active")
    const [options, setOptions] = useState<PollOption[]>(
        initialData?.options?.length ? initialData.options : [{ text: '', votes: 0 }, { text: '', votes: 0 }]
    )

    const [errors, setErrors] = useState<Record<string, boolean | string>>({})
    const [isSaving, setIsSaving] = useState(false)

    const handleAddOption = () => {
        setOptions([...options, { text: '', votes: 0 }]);
    }

    const handleRemoveOption = (index: number) => {
        if (options.length <= 2) return; // Prevent removing below minimum
        const newOptions = [...options];
        newOptions.splice(index, 1);
        setOptions(newOptions);
    }

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...options];
        newOptions[index].text = value;
        setOptions(newOptions);
        
        // Clear option specific error if any
        if (errors[`option_${index}`]) {
             const newErrors = { ...errors };
             delete newErrors[`option_${index}`];
             setErrors(newErrors);
        }
    }

    const validateForm = () => {
        const newErrors: Record<string, boolean | string> = {}
        if (!language) newErrors.language = true
        if (!question.trim()) newErrors.question = true
        if (!votePermission) newErrors.votePermission = true
        
        // Validate options
        let hasEmptyOptions = false;
        options.forEach((opt, idx) => {
            if (!opt.text.trim()) {
                newErrors[`option_${idx}`] = true;
                hasEmptyOptions = true;
            }
        });

        if (options.length < 2) {
             newErrors.optionsCount = "At least 2 options are required";
        } else if (hasEmptyOptions) {
             newErrors.optionsCount = "All option fields must be filled out";
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async () => {
        if (!validateForm()) {
            alert("Please check all required fields and try again.")
            return
        }

        setIsSaving(true)

        try {
            // The API expects mapped options
            const serviceData: Partial<PollData> = {
                language,
                question,
                votePermission,
                status,
                options: options.map(opt => ({ text: opt.text.trim() })) // Just send text for payload
            }

            if (isEditing && initialData && (initialData.id || initialData._id)) {
                await pollService.updatePoll((initialData.id || initialData._id) as string, serviceData)
                alert("Poll updated successfully!")
            } else {
                await pollService.createPoll(serviceData)
                alert("Poll created successfully!")
            }
            router.push("/polls")
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            console.error("Failed to save poll", error)
            const backendMessage = error.response?.data?.message || "Failed to save poll. Please try again."
            alert(backendMessage)
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="space-y-6 bg-white dark:bg-sidebar p-6 rounded-md shadow-sm border border-gray-100 dark:border-border max-w-4xl mx-auto">
            <div className="flex items-center justify-between pb-4 border-b">
                 <div className="flex items-center gap-3">
                     <Button variant="outline" size="icon" asChild className="h-8 w-8">
                         <Link href="/polls">
                             <ArrowLeft className="h-4 w-4" />
                         </Link>
                     </Button>
                    <h2 className="text-xl font-bold text-gray-800">{isEditing ? "Edit Poll" : "Add Poll"}</h2>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                    <Label className={cn(errors.language && "text-red-500")}>Language <span className="text-red-500">*</span></Label>
                    <Select onValueChange={setLanguage} value={language}>
                        <SelectTrigger className={cn("h-10", errors.language && "border-red-500 focus:ring-red-500")}>
                            <SelectValue placeholder="Select Language" />
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
                    <Label className={cn(errors.votePermission && "text-red-500")}>Vote Permission <span className="text-red-500">*</span></Label>
                    <Select onValueChange={(val: 'all'|'registered') => setVotePermission(val)} value={votePermission}>
                        <SelectTrigger className={cn("h-10", errors.votePermission && "border-red-500 focus:ring-red-500")}>
                            <SelectValue placeholder="Select Permission" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All users can vote</SelectItem>
                            <SelectItem value="registered">Only registered users can vote</SelectItem>
                        </SelectContent>
                    </Select>
                    {errors.votePermission && <p className="text-xs text-red-500">Vote permission is required.</p>}
                </div>

                <div className="space-y-2 md:col-span-2">
                    <Label className={cn(errors.question && "text-red-500")}>Question <span className="text-red-500">*</span></Label>
                    <Input 
                        placeholder="Enter poll question" 
                        value={question} 
                        onChange={(e) => {
                            setQuestion(e.target.value);
                             if (errors.question) {
                                 const newErrors = { ...errors };
                                 delete newErrors.question;
                                 setErrors(newErrors);
                             }
                        }}
                        className={cn("h-10 font-medium", errors.question && "border-red-500 focus-visible:ring-red-500")}
                    />
                    {errors.question && <p className="text-xs text-red-500">Question is required.</p>}
                </div>

                <div className="space-y-2">
                    <Label>Status</Label>
                    <Select onValueChange={(val: 'Active'|'Inactive') => setStatus(val)} value={status}>
                        <SelectTrigger className="h-10">
                            <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="Inactive">Inactive</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="pt-6 border-t mt-4 space-y-4">
                 <div className="flex items-center justify-between">
                     <div>
                         <h3 className="text-lg font-semibold text-gray-800">Poll Options <span className="text-red-500">*</span></h3>
                         <p className="text-sm text-muted-foreground">Add at least two options for your poll.</p>
                     </div>
                     <Button 
                        onClick={handleAddOption}
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 text-[#198754] border-[#198754] hover:bg-[#198754]/10"
                     >
                        <Plus className="mr-1 h-3.5 w-3.5" />
                        Add Option
                     </Button>
                 </div>
                 
                 {errors.optionsCount && <p className="text-sm text-red-500 font-medium">{errors.optionsCount}</p>}

                 <div className="space-y-3">
                     {options.map((option, index) => (
                         <div key={index} className="flex flex-col space-y-1">
                             <div className="flex items-center gap-2">
                                <Label className="text-gray-500 min-w-20">Option {index + 1}</Label>
                                <div className="flex-1 flex gap-2">
                                    <Input
                                        placeholder={`Enter option ${index + 1}`}
                                        value={option.text}
                                        onChange={(e) => handleOptionChange(index, e.target.value)}
                                        className={cn("h-10", errors[`option_${index}`] && "border-red-500 focus-visible:ring-red-500")}
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        className="h-10 w-10 shrink-0 text-red-500 hover:bg-red-50 disabled:opacity-50"
                                        onClick={() => handleRemoveOption(index)}
                                        disabled={options.length <= 2}
                                        title={options.length <= 2 ? "Minimum 2 options required" : "Remove option"}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                             </div>
                             {errors[`option_${index}`] && <p className="text-xs text-red-500 ml-22">Option text cannot be empty.</p>}
                         </div>
                     ))}
                 </div>
            </div>

            <div className="pt-6 border-t flex justify-end">
                <Button 
                    size="lg" 
                    className="bg-[#198754] hover:bg-[#157347] text-white px-8 h-11 font-medium tracking-wide shadow-none w-full sm:w-auto mt-2" 
                    onClick={handleSubmit} 
                    disabled={isSaving}
                >
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {isEditing ? "Update Poll" : "Save Poll"}
                </Button>
            </div>
        </div>
    )
}
