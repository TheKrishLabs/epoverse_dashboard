"use client"

import { useEffect, useState, use } from "react"

import { opinionService, OpinionData } from "@/services/opinion-service"
import { Loader2 } from "lucide-react"
import { OpinionForm } from "@/components/opinions/opinion-form"

export default function EditOpinionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [opinion, setOpinion] = useState<OpinionData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchOpinion = async () => {
      try {
        const data = await opinionService.getOpinionById(id)
        if (data) {
          setOpinion(data)
        }
      } catch (error) {
        console.error("Failed to fetch opinion:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      fetchOpinion()
    }
  }, [id])

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <OpinionForm initialData={opinion || undefined} isEditing={true} />
    </div>
  )
}
