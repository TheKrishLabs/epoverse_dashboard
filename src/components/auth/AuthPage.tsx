/* eslint-disable */
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, Loader2, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { authService } from "@/services/auth-service";
import Link from "next/link";

// Zod Schemas
const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

const signupSchema = z
  .object({
    fullName: z.string().min(2, { message: "Name must be at least 2 characters" }),
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(8, { message: "Password must be at least 8 characters" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type LoginFormValues = z.infer<typeof loginSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;

export function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") === "signup" ? "signup" : "login";
  const [activeTab, setActiveTab] = useState<"login" | "signup">(defaultTab);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Login Form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Signup Form
  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onLoginSubmit = async (data: LoginFormValues) => {
    setError(null);
    setIsLoading(true);
    try {
      await authService.login(data.email, data.password);
      router.push("/dashboard");
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    catch (err: any) {
      setError(err.message || "Login failed. Please check your credentials.");
      setIsLoading(false);
    }
  };

  const onSignupSubmit = async (data: SignupFormValues) => {
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);
    try {
      await authService.signup(data.fullName, data.email, data.password, data.confirmPassword);
      setSuccessMessage("Account created successfully! Switching to login...");
      setTimeout(() => {
        setActiveTab("login");
        setSuccessMessage(null);
        loginForm.setValue("email", data.email); // Pre-fill email
        setIsLoading(false);
      }, 2000);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    catch (err: any) {
      setError(err.message || "Signup failed. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#fcfcfc] dark:bg-black flex flex-col font-sans">
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="relative bg-white dark:bg-[#0f0f0f] w-full max-w-[800px] flex flex-col md:flex-row rounded-2xl overflow-hidden shadow-2xl z-10 border border-gray-100 dark:border-gray-800/50">
          
          {/* Left Side: Form */}
          <div className="w-full md:w-[55%] p-8 md:p-10 flex flex-col">
            <div className="flex flex-col h-full">
              {/* Header */}
              <h2 className="text-[26px] font-bold text-black dark:text-white mb-8">Log in</h2>

              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-500/10 flex items-center gap-2">
                  <p className="text-red-500 text-[13px] font-medium">{error}</p>
                </div>
              )}

              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="flex flex-col flex-1">
                  <div className="space-y-3 mb-6">
                    <FormField
                      control={loginForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <input
                              {...field}
                              placeholder="Email Address"
                              className="w-full border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1a1a] px-4 py-3.5 focus:outline-none focus:border-black dark:focus:border-white text-[14px] text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-lg"
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormMessage className="text-red-500 text-xs mt-1.5 ml-1 font-medium" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="relative">
                              <input
                                {...field}
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                className="w-full border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1a1a] px-4 py-3.5 focus:outline-none focus:border-black dark:focus:border-white text-[14px] text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-lg"
                                disabled={isLoading}
                              />
                              <button
                                type="button"
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage className="text-red-500 text-xs mt-1.5 ml-1 font-medium" />
                          <div className="flex justify-end mt-2">
                            <button type="button" className="text-[12px] font-semibold text-black dark:text-white hover:underline transition-all">
                              Forgot password?
                            </button>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Continue Button */}
                  <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full flex justify-center items-center bg-black hover:bg-gray-900 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-black font-semibold text-[15px] py-3.5 transition-colors disabled:opacity-70 disabled:cursor-not-allowed rounded-lg mb-auto"
                  >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Continue
                  </button>
                </form>
              </Form>

              {/* Bottom Section */}
              <div className="mt-auto pt-8">
                <div className="border-t border-gray-100 dark:border-gray-800 pt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex gap-2">
                    <button className="flex items-center justify-center gap-2 bg-black text-white px-3 py-1.5 rounded-lg hover:opacity-80 transition-opacity">
                      <svg viewBox="0 0 384 512" fill="currentColor" className="w-[14px] h-[14px]">
                        <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
                      </svg>
                      <div className="flex flex-col items-start leading-none text-left">
                        <span className="text-[7px] text-gray-300">Download on the</span>
                        <span className="text-[10px] font-medium">App Store</span>
                      </div>
                    </button>
                    <button className="flex items-center justify-center gap-2 bg-black text-white px-3 py-1.5 rounded-lg hover:opacity-80 transition-opacity">
                      <svg viewBox="0 0 512 512" fill="currentColor" className="w-[12px] h-[12px]">
                        <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z"/>
                      </svg>
                      <div className="flex flex-col items-start leading-none text-left">
                        <span className="text-[7px] text-gray-300">GET IT ON</span>
                        <span className="text-[10px] font-medium">Google Play</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: QR Code */}
          <div className="hidden md:flex w-full md:w-[45%] bg-[#fafafa] dark:bg-[#141414] border-l border-gray-200 dark:border-gray-800 p-8 flex-col items-center justify-center text-center">
            <div className="bg-white dark:bg-[#1a1a1a] p-5 rounded-2xl shadow-sm mb-6 flex items-center justify-center">
              <svg width="140" height="140" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-black dark:text-white">
                <rect width="5" height="5" x="3" y="3" rx="1"/>
                <rect width="5" height="5" x="16" y="3" rx="1"/>
                <rect width="5" height="5" x="3" y="16" rx="1"/>
                <path d="M21 16h-3a2 2 0 0 0-2 2v3"/>
                <path d="M21 21v.01"/>
                <path d="M12 7v3a2 2 0 0 1-2 2H7"/>
                <path d="M3 12h.01"/>
                <path d="M12 3h.01"/>
                <path d="M12 16v.01"/>
                <path d="M16 12h1"/>
                <path d="M21 12v.01"/>
                <path d="M12 21v-1"/>
              </svg>
            </div>
            <p className="text-[13px] text-gray-400 dark:text-gray-500 mb-1 font-medium">Scan QR to</p>
            <h3 className="text-lg font-bold text-black dark:text-white leading-tight">Download the<br/>Business app</h3>
          </div>
        </div>
      </main>
    </div>
  );
}

