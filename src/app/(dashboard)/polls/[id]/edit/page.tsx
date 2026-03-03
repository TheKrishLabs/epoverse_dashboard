"use client"

import { useEffect, useState } from "react"
import { PollForm } from "@/components/polls/poll-form"
import { pollService, PollData } from "@/services/poll-service"
import { Loader2 } from "lucide-react"

export default function EditPollPage({ params }: { params: { id: string } }) {
  const [poll, setPoll] = useState<PollData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchPoll = async () => {
      try {
        const data = await pollService.getPollById(params.id)
        if (data) {
          setPoll(data)
        }
      } catch (error) {
        console.error("Failed to fetch poll:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      fetchPoll()
    }
  }, [params.id])

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <PollForm initialData={poll || undefined} isEditing={true} />
    </div>
  )
}
