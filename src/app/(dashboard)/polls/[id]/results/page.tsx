"use client"

import { useEffect, useState } from "react"
import { Loader2, ArrowLeft, BarChart } from "lucide-react"
import Link from "next/link"

import { pollService, PollData } from "@/services/poll-service"
import { Button } from "@/components/ui/button"

export default function PollResultsPage({ params }: { params: { id: string } }) {
  const [poll, setPoll] = useState<PollData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchPoll = async () => {
      try {
        const data = await pollService.getPollById(params.id)
        if (data) {
          setPoll(data)
        } else {
            // Mock data fallback if actual backend isn't returning data since we implemented mock data in poll list too
            if (params.id === 'mock1' || params.id === 'mock2') {
                 setPoll({
                     language: "English",
                     question: "What is your favorite color?",
                     options: [
                         { text: "Red", votes: 45 }, 
                         { text: "Blue", votes: 85 },
                         { text: "Green", votes: 20 },
                         { text: "Yellow", votes: 12 }
                     ],
                     votePermission: "all" as const,
                     status: "Active" as const,
                 })
            }
        }
      } catch (error) {
        console.error("Failed to fetch poll for results:", error)
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
        <Loader2 className="h-8 w-8 animate-spin text-[#198754]" />
      </div>
    )
  }

  if (!poll) {
      return (
          <div className="flex flex-col h-[400px] items-center justify-center space-y-4">
              <h2 className="text-xl font-bold text-gray-800">Poll not found</h2>
              <Button asChild variant="outline">
                  <Link href="/polls">Back to Polls</Link>
              </Button>
          </div>
      )
  }

  // Calculate totals
  const totalVotes = poll.options?.reduce((sum, option) => sum + (option.votes || 0), 0) || 0;

  // Find max votes for dynamic scaling of progress bars (optional, typically it uses 100%)
  const maxVotes = Math.max(...poll.options.map(o => o.votes || 0), 1); // Avoid division by zero

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
        <div className="flex items-center gap-3 pb-4 border-b">
            <Button variant="outline" size="icon" asChild className="h-8 w-8">
                <Link href="/polls">
                    <ArrowLeft className="h-4 w-4" />
                </Link>
            </Button>
            <div className="flex items-center gap-2">
                <BarChart className="h-5 w-5 text-gray-500" />
                <h2 className="text-2xl font-bold text-gray-800">Poll Results</h2>
            </div>
        </div>

        <div className="bg-white dark:bg-sidebar p-6 rounded-md shadow-sm border border-gray-100 dark:border-border max-w-4xl mx-auto space-y-8">
            <div className="space-y-2">
                <h3 className="text-sm font-medium text-[#198754] uppercase tracking-wider">Question</h3>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                    {poll.question}
                </h1>
                <div className="flex items-center gap-3 text-sm text-gray-500 pt-2">
                    <span className="bg-gray-100 px-2 py-1 rounded-md">{poll.votePermission === 'all' ? 'All Users' : 'Registered Only'}</span>
                    <span className="bg-gray-100 px-2 py-1 rounded-md">{poll.language}</span>
                    <span className="font-semibold">{totalVotes} Total Votes</span>
                </div>
            </div>

            <div className="space-y-6 pt-4">
                {poll.options.map((option, index) => {
                    const votes = option.votes || 0;
                    const percentage = totalVotes > 0 ? ((votes / totalVotes) * 100).toFixed(1) : "0.0";
                    // For progress bar width visualization compared to total (100% full width)
                    const progressWidth = `${percentage}%`;
                    
                    // Assign colors sequentially 
                    const colors = [
                        'bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 
                        'bg-purple-500', 'bg-pink-500', 'bg-cyan-500'
                    ];
                    const barColorClass = colors[index % colors.length];

                    return (
                        <div key={index} className="space-y-2">
                            <div className="flex items-center justify-between text-sm font-medium">
                                <span className="text-gray-800 text-base">{option.text}</span>
                                <div className="flex items-center gap-3">
                                     <span className="text-gray-500">{votes} votes</span>
                                     <span className="font-bold text-gray-900 w-12 text-right">{percentage}%</span>
                                </div>
                            </div>
                            <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                                <div 
                                    className={cn("h-full rounded-full transition-all duration-1000 ease-out", barColorClass)}
                                    style={{ width: progressWidth }}
                                />
                            </div>
                        </div>
                    )
                })}
            </div>

            {totalVotes === 0 && (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-md border border-dashed">
                    No votes have been cast on this poll yet.
                </div>
            )}
        </div>
    </div>
  )
}
