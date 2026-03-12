"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cookieSettingService, CookieSettings } from "@/services/cookie-setting-service";

import { Loader2 } from "lucide-react";

// Define the validation schema using Zod
const formSchema = z.object({
  cookieAlertTitle: z.string().min(1, { message: "Cookie alert title is required." }),
  cookieAlertContent: z.string().min(1, { message: "Cookie alert content is required." }),
  pageTitle: z.string().optional(),
  pageUrl: z.string().url({ message: "Must be a valid URL." }).optional().or(z.literal("")),
  cookieDurationDays: z.number().min(1, { message: "Duration must be at least 1 day." }),
  showCookieAlert: z.boolean(),
});

type CookieFormValues = z.infer<typeof formSchema>;

export default function CookieContentSettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [cookieId, setCookieId] = useState<string | null>(null);
  

  const form = useForm<CookieFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cookieAlertTitle: "",
      cookieAlertContent: "",
      pageTitle: "",
      pageUrl: "",
      cookieDurationDays: 30,
      showCookieAlert: true,
    },
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await cookieSettingService.getSettings();
        if (settings._id) {
          setCookieId(settings._id);
        }
        form.reset({
          cookieAlertTitle: settings.cookieAlertTitle,
          cookieAlertContent: settings.cookieAlertContent,
          pageTitle: settings.pageTitle || "",
          pageUrl: settings.pageUrl || "",
          cookieDurationDays: settings.cookieDurationDays,
          showCookieAlert: settings.showCookieAlert,
        });
      } catch (err) {
        console.error("Failed to load settings:", err);
        alert("Failed to load cookie settings.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [form]);

    const onSubmit = async (values: CookieFormValues) => {
    setIsSaving(true);
    try {
      const payload: CookieSettings = {
        ...values,
        ...(cookieId ? { _id: cookieId } : {}),
      };
      await cookieSettingService.updateSettings(payload);
      alert("Cookie settings saved successfully.");
      // Optionally trigger an event to update the frontend component
      if (typeof window !== "undefined") {
         window.dispatchEvent(new Event("cookieSettingsUpdated"));
      }
    } catch (err) {
       console.error("Failed to save settings:", err);
       alert("Failed to save cookie settings.");
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
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Cookie content</h2>
      </div>
      
      <Card className="border-0 shadow-sm ring-1 ring-black/5 dark:ring-white/10">
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>
            Configure the cookie consent alert shown to website visitors.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="cookieAlertTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cookie alert title<span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="E.g. We value your privacy!" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cookieAlertContent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cookie alert content<span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter the message describing cookie usage..." 
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pageTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Page title</FormLabel>
                    <FormControl>
                      <Input placeholder="E.g. Cookie Policy" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Page url</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cookieDurationDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cookie duration days</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1" 
                        {...field} 
                        onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="showCookieAlert"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Show cookie alert
                      </FormLabel>
                      <CardDescription>
                        Enable or disable the cookie consent banner on the frontend.
                      </CardDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white">
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
