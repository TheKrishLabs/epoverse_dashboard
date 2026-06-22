"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { aiWriterService, AiWriterSettings } from "@/services/ai-writer-service";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  apiKey: z.string().min(1, { message: "API key is required" }),
  model: z.string().min(1, { message: "Model is required" }),
  temperature: z.number().min(0).max(2, { message: "Temperature must be between 0 and 2" }),
  maxTokens: z.number().min(1, { message: "Max tokens must be at least 1" }),
  promptTemplate: z.string().min(1, { message: "Prompt template is required" }),
});

type AiWriterFormValues = z.infer<typeof formSchema>;

export default function AiWriterPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settingsId, setSettingsId] = useState<string | null>(null);

  const form = useForm<AiWriterFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      apiKey: "",
      model: "gemini-2.5-flash",
      temperature: 0.4,
      maxTokens: 1000,
      promptTemplate: "You are a professional english news writer and write a comprehensive article in english. Include a catchy headline, and the full article content in 300 words. add these article in inline html and css format. Ensure the tone is neutral and journalistic. Write the news article based on the following headline:",
    },
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await aiWriterService.getSettings();
        if (settings._id) {
          setSettingsId(settings._id);
        }
        form.reset({
          apiKey: settings.apiKey,
          model: settings.model,
          temperature: settings.temperature,
          maxTokens: settings.maxTokens,
          promptTemplate: settings.promptTemplate,
        });
      } catch (err) {
        console.error("Failed to load settings:", err);
        alert("Failed to load AI Writer settings.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [form]);

  const onSubmit = async (values: AiWriterFormValues) => {
    setIsSaving(true);
    try {
      const payload: AiWriterSettings = {
        ...values,
        ...(settingsId ? { _id: settingsId } : {}),
      };
      await aiWriterService.updateSettings(payload);
      alert("AI Writer settings saved successfully.");
    } catch (err) {
      console.error("Failed to save settings:", err);
      alert("Failed to save AI Writer settings.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <Card className="border-0 shadow-sm ring-1 ring-black/5 dark:ring-white/10">
        <CardHeader className="bg-muted/30 border-b pb-4 mb-4">
          <CardTitle className="text-xl">AI Writer Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="apiKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>API Key</FormLabel>
                    <FormControl>
                      <Input placeholder="sk-proj-XXXXXXXXXXXXXXXXXXXXXXXXX" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Model</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a model" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="gemini-2.5-flash">Gemini 2.5 Flash</SelectItem>
                        <SelectItem value="gemini-2.5-pro">Gemini 2.5 Pro</SelectItem>
                        <SelectItem value="gemini-2.0-flash">Gemini 2.0 Flash</SelectItem>
                        <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="temperature"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Temperature</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.1"
                        min="0"
                        max="2"
                        {...field} 
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maxTokens"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Tokens</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1" 
                        {...field} 
                        onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="promptTemplate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prompt Template</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="add article from url" 
                        className="min-h-[150px] resize-y"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="pt-2">
                <Button type="submit" disabled={isSaving} className="bg-[#108954] hover:bg-[#108954]/90 text-white rounded px-6 py-2">
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Settings
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
