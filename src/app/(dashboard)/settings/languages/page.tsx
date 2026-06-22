"use client"

import React, { useState, useEffect, useCallback } from "react"
import { Loader2, Plus, RefreshCw, Trash2 } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { languageService, Language } from "@/services/language-service"
import { LanguageFormDialog } from "@/components/settings/language-form-dialog"

export default function LanguageListPage() {
  const [languages, setLanguages] = useState<Language[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const fetchLanguages = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await languageService.getLanguages()
      setLanguages(data || [])
    } catch (err) {
      console.error(err)
      setError("Failed to load languages.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLanguages()
  }, [fetchLanguages])

  const handleAddLanguage = async (data: { name: string; description?: string }) => {
    try {
        await languageService.createLanguage(data)
        alert("Language added successfully!")
        fetchLanguages() // Auto refresh Data Table
    } catch (err) {
        console.error("Failed to add Language", err)
        alert("Failed to add Language. Please try again.")
        throw err; // Re-throw to keep Dialog loading state open if needed, or handle inside Dialog
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete the language "${name}"?`)) return;
    try {
      await languageService.deleteLanguage(id);
      fetchLanguages();
    } catch (err) {
      console.error("Failed to delete language", err);
      alert("Failed to delete language. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Language Management</h2>
        <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={fetchLanguages} disabled={isLoading}>
                <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
            </Button>
            <Button onClick={() => setIsDialogOpen(true)} className="bg-green-600 hover:bg-green-700">
            <Plus className="mr-2 h-4 w-4" /> Add Language
            </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Languages</CardTitle>
          <CardDescription>
            Manage the list of available languages for posts and articles.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="text-center text-red-500 p-8">{error}</div>
          ) : languages.length === 0 ? (
            <div className="text-center text-muted-foreground p-8">
              No languages found. Click &quot;Add Language&quot; to create one.
            </div>
          ) : (
             <div className="rounded-md border">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Language Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {languages.map((language) => (
                    <TableRow key={language._id}>
                      <TableCell className="font-medium">{language.name}</TableCell>
                      <TableCell className="text-muted-foreground">{language.description || "-"}</TableCell>
                      <TableCell>
                        {language.createdAt ? format(new Date(language.createdAt), "MMM dd, yyyy") : "N/A"}
                      </TableCell>
                      <TableCell>
                          <Badge variant={language.isDeleted ? "destructive" : "default"} className={!language.isDeleted ? "bg-emerald-500 hover:bg-emerald-600" : ""}>
                              {language.isDeleted ? "Deleted" : "Active"}
                          </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                          <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDelete(language._id, language.name)}
                              title="Delete"
                          >
                              <Trash2 className="h-4 w-4" />
                          </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <LanguageFormDialog
         open={isDialogOpen}
         onOpenChange={setIsDialogOpen}
         onSubmit={handleAddLanguage}
      />
    </div>
  )
}
