import { Icons } from "@/components/icons";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import Link from "next/link";

export default function PatientDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-background">
      <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-card px-4 md:px-6 z-50">
        <nav className="flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-semibold md:text-base text-primary"
          >
            <Icons.logo className="h-6 w-6" />
            <span className="font-headline">HealthAI Assist</span>
          </Link>
          <span className="text-muted-foreground">Patient Portal</span>
        </nav>
        <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
            <div className="ml-auto flex-1 sm:flex-initial">
                {/* Optional search or actions can go here */}
            </div>
             <Button variant="ghost" className="relative h-8 w-8 rounded-full" asChild>
                <Link href="/login">
                    <Avatar className="h-9 w-9">
                        <AvatarFallback>DA</AvatarFallback>
                    </Avatar>
                </Link>
            </Button>
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        {children}
      </main>
      <Toaster />
    </div>
  );
}