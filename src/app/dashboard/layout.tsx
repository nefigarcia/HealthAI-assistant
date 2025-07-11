"use client"

import { createContext, useContext, useState, useEffect } from 'react';
import { Icons } from "@/components/icons";
import { SidebarNav } from "@/components/shared/sidebar-nav";
import { UserNav } from "@/components/shared/user-nav";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { getCurrentUser, type CurrentUser } from "@/services/user";
import { Menu, Loader2 } from "lucide-react";
import Link from "next/link";

import { Skeleton } from '@/components/ui/skeleton';
interface AuthContextType {
    user: CurrentUser | null;
    isLoading: boolean;
    error: Error | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<CurrentUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        async function loadUser() {
            try {
                const currentUser = await getCurrentUser();
                console.log("Fetched current user:", currentUser); // Debugging line
                setUser(currentUser);
            } catch (err: any) {
                setError(err);
                // Handle redirect or error display if needed, e.g., redirect to /login
            } finally {
                setIsLoading(false);
            }
        }
        loadUser();
    }, []);

    return (
        <AuthContext.Provider value={{ user, isLoading, error }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};


function DashboardView({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth();
    const clinicName = user?.clinic?.name || "HealthAI Assist";
    console.log("DashboardView user:", user); // Debugging line
    if (isLoading) {
        return (
            <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
                <div className="hidden border-r bg-card md:block p-4 space-y-4">
                    <Skeleton className="h-14" />
                    <Skeleton className="h-10" />
                    <Skeleton className="h-10" />
                    <Skeleton className="h-10" />
                </div>
                <div className="flex flex-col">
                     <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6">
                        <div className="w-full flex-1"></div>
                        <Skeleton className="h-8 w-8 rounded-full" />
                    </header>
                    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
                         <Loader2 className="h-8 w-8 animate-spin text-primary" />
                         <p className="text-muted-foreground">Loading Dashboard...</p>
                    </main>
                </div>
            </div>
        )
    }

   return (
        <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
            <div className="hidden border-r bg-card md:block">
                <div className="flex h-full max-h-screen flex-col gap-2">
                    <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                        <Link href="/" className="flex items-center gap-2 font-semibold text-primary">
                            <Icons.logo className="h-6 w-6" />
                            <span className="font-headline">{clinicName}</span>
                        </Link>
                    </div>
                    <div className="flex-1">
                        <SidebarNav />
                    </div>
                </div>
            </div>
            <div className="flex flex-col">
                <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle navigation menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="flex flex-col p-0">
                            <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                                <Link href="/" className="flex items-center gap-2 font-semibold text-primary">
                                    <Icons.logo className="h-6 w-6" />
                                    <span className="font-headline">{clinicName}</span>
                                </Link>
                            </div>
                            <SidebarNav />
                        </SheetContent>
                    </Sheet>
                    <div className="w-full flex-1"></div>
                    <UserNav />
                </header>
                <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
                    {children}
                </main>
            </div>
        </div>
    );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <DashboardView>{children}</DashboardView>
        </AuthProvider>
    );
}

