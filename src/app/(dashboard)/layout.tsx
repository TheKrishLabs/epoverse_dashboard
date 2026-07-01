import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
        <div className="h-screen flex flex-col overflow-hidden bg-background">
            <Header />
            <div className="flex flex-1 overflow-hidden">
                <Sidebar className="hidden md:block w-64 shrink-0 bg-white dark:bg-background" />
                <main className="flex-1 overflow-y-auto bg-[#f4f7f6] dark:bg-black/20 p-6">
                    <div className="mx-auto max-w-7xl">
                        {children}
                    </div>
                </main>
            </div>
        </div>
  );
}
