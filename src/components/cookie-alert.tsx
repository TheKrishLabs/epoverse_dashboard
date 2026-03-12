"use client";

import { useEffect, useState } from "react";
import { cookieSettingService, CookieSettings } from "@/services/cookie-setting-service";
import { Button } from "@/components/ui/button";

// A constant key to track if the user has accepted cookies *locally*
const COOKIE_CONSENT_KEY = "epoverse_cookie_consent";

export const CookieAlert = () => {
  const [settings, setSettings] = useState<CookieSettings | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if the user has already consented
    const hasConsented = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (hasConsented) {
      return; 
    }

    const fetchSettings = async () => {
      try {
        const data = await cookieSettingService.getSettings();
        setSettings(data);
        if (data.showCookieAlert) {
          setIsVisible(true);
        }
      } catch (error) {
        console.error("Failed to load cookie alert settings", error);
      }
    };

    fetchSettings();

    // Listen for real-time updates from the dashboard settings page
    const handleSettingsUpdate = () => {
       // Reset consent purely for testing purposes when settings change
       localStorage.removeItem(COOKIE_CONSENT_KEY);
       fetchSettings();
    };

    window.addEventListener("cookieSettingsUpdated", handleSettingsUpdate);
    return () => window.removeEventListener("cookieSettingsUpdated", handleSettingsUpdate);
  }, []);

  const handleAccept = () => {
    if (!settings) return;

    // Set a physical cookie if needed
    const expirationDate = new Date();
    expirationDate.setTime(expirationDate.getTime() + (settings.cookieDurationDays * 24 * 60 * 60 * 1000));
    document.cookie = `epoverse_consent=accepted; expires=${expirationDate.toUTCString()}; path=/`;

    // Also set a local storage flag for immediate UI checks
    localStorage.setItem(COOKIE_CONSENT_KEY, "true");
    
    setIsVisible(false);
  };

  if (!isVisible || !settings) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] bg-background border-t border-border p-4 shadow-lg animate-in slide-in-from-bottom-5">
      <div className="container mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex-1 space-y-1">
          <h3 className="text-lg font-semibold">{settings.cookieAlertTitle}</h3>
          <p className="text-sm text-muted-foreground">
            {settings.cookieAlertContent}
            {settings.pageUrl && settings.pageTitle && (
              <a 
                href={settings.pageUrl} 
                className="text-blue-600 hover:underline inline-block ml-1"
                target="_blank" 
                rel="noopener noreferrer"
              >
                {settings.pageTitle}
              </a>
            )}
          </p>
        </div>
        <div className="flex shrink-0">
          <Button onClick={handleAccept} className="bg-blue-600 hover:bg-blue-700 text-white w-full md:w-auto px-8">
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
};
