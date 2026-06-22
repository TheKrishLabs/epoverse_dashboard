
"use client";

import { useState } from "react";
import { Upload, FileText, Share2, FileDown, AlertCircle, CheckCircle2, Loader2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { postService } from "@/services/post-service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function BulkUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setError(null);
    setSuccess(null);

    if (selectedFile) {
        if (!selectedFile.name.endsWith('.csv')) {
             setError("Please select a valid CSV file.");
             setFile(null);
             return;
        }
        if (selectedFile.size > 5 * 1024 * 1024) { // 5MB
             setError("File size exceeds 5MB limit.");
             setFile(null);
             return;
        }
        setFile(selectedFile);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setError(null);
    setSuccess(null);
    // Reset file input value if needed (requires ref, skipping for simplicity in this iteration)
    const fileInput = document.getElementById('csv-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
        const response = await postService.uploadBulkArticles(file);
        
        // Parse meaningful message natively out of the API if provided, or default it
        const successMsg = response.message || response.data?.message || `Successfully processed ${file.name}.`;
        
        setSuccess(successMsg);
        setFile(null);
        
        const fileInput = document.getElementById('csv-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
        // Attempt to parse validation errors directly pushed by the backend
        const errMsg = err.response?.data?.message || err.response?.data?.error || "Failed to process CSV file. Please check expected format.";
        setError(errMsg);
    } finally {
        setIsLoading(false);
    }
  };

  const handleDownloadTemplate = async () => {
      setIsDownloadingTemplate(true);
      setError(null);
      setSuccess(null);
      try {
          const blob = await postService.downloadBulkTemplate();
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', 'bulk_upload_template.csv');
          document.body.appendChild(link);
          link.click();
          link.parentNode?.removeChild(link);
          window.URL.revokeObjectURL(url);
      } catch (err) {
          console.error("Template download failed:", err);
          setError("Failed to download the template. Please try again.");
      } finally {
          setIsDownloadingTemplate(false);
      }
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Bulk Post Upload</h2>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Left Section - Upload Area */}
        <Card className="col-span-4 dark:bg-sidebar dark:border-border">
          <CardHeader>
            <CardTitle>Upload CSV File</CardTitle>
            <CardDescription>
              Select a .csv file to upload multiple posts at once.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="csv-upload">CSV File</Label>
                <div className="flex gap-2 items-center">
                    <Input id="csv-upload" type="file" accept=".csv" onChange={handleFileChange} className="cursor-pointer" disabled={isLoading} />
                </div>
             </div>

             {file && (
                 <div className="flex items-center justify-between p-3 border rounded-md bg-muted/50">
                     <div className="flex items-center gap-2 overflow-hidden">
                         <FileText className="h-5 w-5 text-blue-500 flex-shrink-0" />
                         <span className="text-sm font-medium truncate">{file.name}</span>
                         <span className="text-xs text-muted-foreground">({(file.size / 1024).toFixed(2)} KB)</span>
                     </div>
                     <Button variant="ghost" size="icon" onClick={handleRemoveFile} disabled={isLoading} className="h-8 w-8 hover:text-destructive">
                         <X className="h-4 w-4" />
                     </Button>
                 </div>
             )}

             {error && (
                 <Alert variant="destructive">
                     <AlertCircle className="h-4 w-4" />
                     <AlertTitle>Error</AlertTitle>
                     <AlertDescription>{error}</AlertDescription>
                 </Alert>
             )}

             {success && (
                 <Alert className="text-emerald-600 border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-900 dark:text-emerald-400">
                     <CheckCircle2 className="h-4 w-4" />
                     <AlertTitle>Success</AlertTitle>
                     <AlertDescription>{success}</AlertDescription>
                 </Alert>
             )}

             <Button 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-700 dark:hover:bg-blue-800" 
                onClick={handleUpload} 
                disabled={!file || isLoading}
             >
                {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                    </>
                ) : (
                    <>
                         <Upload className="mr-2 h-4 w-4" />
                         Upload CSV
                    </>
                )}
             </Button>
          </CardContent>
        </Card>

        {/* Right Section - Help Guide */}
        <Card className="col-span-3 dark:bg-sidebar dark:border-border">
          <CardHeader>
            <CardTitle>Help Guide</CardTitle>
            <CardDescription>
              These documents can assist you in generating your CSV file.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full justify-start h-auto py-4 border-dashed border-2 hover:border-solid hover:bg-accent/50 dark:hover:bg-accent/20">
                    <div className="flex items-center text-left">
                        <FileText className="h-8 w-8 mr-4 text-orange-500" />
                        <div>
                            <div className="font-semibold">Instructions</div>
                            <div className="text-xs text-muted-foreground">Read guidelines for proper formatting.</div>
                        </div>
                    </div>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>CSV Upload Instructions</DialogTitle>
                  <DialogDescription>
                    Follow these steps to create your CSV file.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-medium">Instructions</h3>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                      <li>Download the template CSV file provided below.</li>
                      <li>Fill in the required fields according to the instructions.</li>
                      <li>Ensure all mandatory fields are completed.</li>
                      <li>Save the file in CSV format.</li>
                      <li>Upload the completed CSV file using the form.</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-medium">Field Details</h3>
                    <div className="border rounded-md">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/50">
                          <tr className="border-b">
                            <th className="h-10 px-4 text-left font-medium">Field Name</th>
                            <th className="h-10 px-4 text-left font-medium">Requirement & Data Type</th>
                            <th className="h-10 px-4 text-left font-medium">Example</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          <tr className="bg-white dark:bg-transparent">
                            <td className="p-4 align-top font-medium">language_id</td>
                            <td className="p-4 align-top">
                              <span className="font-semibold text-red-500">Required</span><br />
                              Data Type: Integer
                            </td>
                            <td className="p-4 align-top text-muted-foreground">1</td>
                          </tr>
                          <tr className="bg-muted/50 dark:bg-muted/10">
                            <td className="p-4 align-top font-medium">category_id</td>
                            <td className="p-4 align-top">
                              <span className="font-semibold text-red-500">Required</span><br />
                              Data Type: Integer
                            </td>
                            <td className="p-4 align-top text-muted-foreground">1</td>
                          </tr>
                          <tr className="bg-white dark:bg-transparent">
                            <td className="p-4 align-top font-medium">sub_category_id</td>
                            <td className="p-4 align-top">
                              Optional (Must be provided when category_id is set and must belong to that category)<br />
                              Data Type: Integer
                            </td>
                            <td className="p-4 align-top text-muted-foreground">1</td>
                          </tr>
                          <tr className="bg-muted/50 dark:bg-muted/10">
                            <td className="p-4 align-top font-medium">category_position</td>
                            <td className="p-4 align-top">
                              Optional (Must be an integer between 1 and 16)<br />
                              Data Type: Integer
                            </td>
                            <td className="p-4 align-top text-muted-foreground">1</td>
                          </tr>
                          <tr className="bg-white dark:bg-transparent">
                            <td className="p-4 align-top font-medium">home_position</td>
                            <td className="p-4 align-top">
                              Optional (Must be an integer between 1 and 7)<br />
                              Data Type: Integer
                            </td>
                            <td className="p-4 align-top text-muted-foreground">1</td>
                          </tr>
                          <tr className="bg-muted/50 dark:bg-muted/10">
                            <td className="p-4 align-top font-medium">publish_date</td>
                            <td className="p-4 align-top">
                              <span className="font-semibold text-red-500">Required</span><br />
                              Data Type: Date (YYYY-MM-DD)
                            </td>
                            <td className="p-4 align-top text-muted-foreground">2025-07-24</td>
                          </tr>
                           <tr className="bg-white dark:bg-transparent">
                            <td className="p-4 align-top font-medium">head_line</td>
                            <td className="p-4 align-top">
                              <span className="font-semibold text-red-500">Required</span><br />
                              Data Type: String
                            </td>
                            <td className="p-4 align-top text-muted-foreground">This is post headline</td>
                          </tr>
                           <tr className="bg-muted/50 dark:bg-muted/10">
                            <td className="p-4 align-top font-medium">details_post</td>
                            <td className="p-4 align-top">
                              <span className="font-semibold text-red-500">Required</span><br />
                              Data Type: String
                            </td>
                            <td className="p-4 align-top text-muted-foreground">This is post details</td>
                          </tr>
                           <tr className="bg-white dark:bg-transparent">
                            <td className="p-4 align-top font-medium">reporter_id</td>
                            <td className="p-4 align-top">
                              <span className="font-semibold text-red-500">Required</span><br />
                              Data Type: Integer
                            </td>
                            <td className="p-4 align-top text-muted-foreground">1</td>
                          </tr>
                          {/* Add more rows as needed for other fields, kept brief for length but covering key ones mentioned */}
                           <tr className="bg-muted/50 dark:bg-muted/10">
                            <td className="p-4 align-top font-medium">image</td>
                            <td className="p-4 align-top">
                              Optional (Go to Media Library → Photo List, copy the image name)<br />
                              Data Type: String
                            </td>
                            <td className="p-4 align-top text-muted-foreground">filename.jpg</td>
                          </tr>
                          <tr className="bg-white dark:bg-transparent">
                            <td className="p-4 align-top font-medium">Booleans (latest_post, etc)</td>
                            <td className="p-4 align-top">
                              Optional<br />
                              Data Type: Boolean (0 or 1)
                            </td>
                            <td className="p-4 align-top text-muted-foreground">0 or 1</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Important Note</AlertTitle>
                    <AlertDescription>
                      Make sure to follow these instructions carefully to avoid errors during the upload process.
                    </AlertDescription>
                  </Alert>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full justify-start h-auto py-4 border-dashed border-2 hover:border-solid hover:bg-accent/50 dark:hover:bg-accent/20">
                    <div className="flex items-center text-left">
                        <Share2 className="h-8 w-8 mr-4 text-purple-500" />
                        <div>
                            <div className="font-semibold">Essential Identifier List</div>
                            <div className="text-xs text-muted-foreground">List of required IDs (Categories, etc).</div>
                        </div>
                    </div>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Essential Identifier List</DialogTitle>
                  <DialogDescription>
                    Use these IDs in your CSV file for the respective fields.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6">
                  
                  {/* Reporters Section */}
                  <div className="space-y-2">
                    <h3 className="font-medium flex items-center gap-2">
                        <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs dark:bg-blue-900/30 dark:text-blue-300">reporter_id</span>
                        Reporters
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-sm border p-4 rounded-md bg-slate-50 dark:bg-slate-950/30">
                        <div className="border-b pb-1"><span>Shaeed</span></div>
                        <div className="border-b pb-1"><span>Jamil Saxona</span></div>
                        <div className="border-b pb-1"><span>Montu Mian</span></div>
                        <div className="border-b pb-1"><span>Gulshan Patel</span></div>
                        <div className="border-b pb-1"><span>Aman Gupta</span></div>
                    </div>
                  </div>

                  {/* Languages Section */}
                  <div className="space-y-2">
                    <h3 className="font-medium flex items-center gap-2">
                         <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs dark:bg-green-900/30 dark:text-green-300">language_id</span>
                        Languages
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm border p-4 rounded-md bg-slate-50 dark:bg-slate-950/30">
                        <div className="border-b pb-1"><span>English</span></div>
                        <div className="border-b pb-1"><span>Tamil</span></div>
                        <div className="border-b pb-1"><span>Hindi</span></div>
                    </div>
                  </div>

                   {/* Categories Section */}
                   <div className="space-y-2">
                    <h3 className="font-medium flex items-center gap-2">
                        <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs dark:bg-purple-900/30 dark:text-purple-300">category_id</span>
                        Categories (English - ID: 1)
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-sm border p-4 rounded-md bg-slate-50 dark:bg-slate-950/30">
                        <div className="border-b pb-1"><span>Blockchain</span></div>
                        <div className="border-b pb-1"><span>News</span></div>
                        <div className="border-b pb-1"><span>Agriculture</span></div>
                        <div className="border-b pb-1"><span>Social Media</span></div>
                        <div className="border-b pb-1"><span>Food</span></div>
                        <div className="border-b pb-1"><span>Crime</span></div>
                        <div className="border-b pb-1"><span>Recipes</span></div>
                        <div className="border-b pb-1"><span>Design</span></div>
                        <div className="border-b pb-1"><span>Photography</span></div>
                        <div className="border-b pb-1"><span>Quizzes</span></div>
                        <div className="border-b pb-1"><span>Fashion</span></div>
                        <div className="border-b pb-1"><span>Travel</span></div>
                        <div className="border-b pb-1"><span>Lifestyle</span></div>
                        <div className="border-b pb-1"><span>Real Estate</span></div>
                        <div className="border-b pb-1"><span>Stock Market</span></div>
                        <div className="border-b pb-1"><span>Business</span></div>
                        <div className="border-b pb-1"><span>World Economy</span></div>
                        <div className="border-b pb-1"><span>Global Politics</span></div>
                        <div className="border-b pb-1"><span>International News</span></div>
                        <div className="border-b pb-1"><span>Social Issues</span></div>
                        <div className="border-b pb-1"><span>Government Policies</span></div>
                        <div className="border-b pb-1"><span>Politics</span></div>
                        <div className="border-b pb-1"><span>Weather</span></div>
                        <div className="border-b pb-1"><span>Football</span></div>
                        <div className="border-b pb-1"><span>Cricket</span></div>
                        <div className="border-b pb-1"><span>Topic</span></div>
                        <div className="border-b pb-1"><span>Health</span></div>
                        <div className="border-b pb-1"><span>Sports</span></div>
                    </div>
                  </div>

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Important</AlertTitle>
                    <AlertDescription>
                      Ensure that the <strong>category_id</strong> matches the content language. The categories listed above are for <strong>English (Language ID: 1)</strong>.
                    </AlertDescription>
                  </Alert>

                </div>
              </DialogContent>
            </Dialog>

             <div className="grid grid-cols-2 gap-4 pt-2">
                 <Button 
                    variant="outline" 
                    className="h-24 flex-col gap-2 border-green-200 bg-green-50 hover:bg-green-100 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-900/40"
                    onClick={handleDownloadTemplate}
                    disabled={isDownloadingTemplate}
                 >
                     {isDownloadingTemplate ? (
                         <Loader2 className="h-6 w-6 animate-spin" />
                     ) : (
                         <FileDown className="h-6 w-6" />
                     )}
                     Template CSV
                 </Button>
                 <Button variant="outline" className="h-24 flex-col gap-2 border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/40">
                     <FileDown className="h-6 w-6" />
                     Sample CSV
                 </Button>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
