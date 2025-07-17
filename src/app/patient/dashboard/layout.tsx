"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';import { Icons } from "@/components/icons";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import Link from "next/link";

import { Loader2 } from 'lucide-react';
import type { Patient } from '@/services/patients';

// 1. Create PatientAuthContext
interface PatientAuthContextType {
    patient: Patient | null;
    isLoading: boolean;
}

const PatientAuthContext = createContext<PatientAuthContextType | undefined>(undefined);

// 2. Create a Provider component
export function PatientAuthProvider({ children }: { children: React.ReactNode }) {
    const [patient, setPatient] = useState<Patient | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        try {
            const patientDataString = sessionStorage.getItem('currentPatient');
            if (patientDataString) {
                setPatient(JSON.parse(patientDataString));
            } else {
                // If no patient data, redirect to login
                router.replace('/patient/login');
            }
        } catch (error) {
            console.error("Failed to parse patient data from session storage", error);
            router.replace('/patient/login');
        } finally {
            setIsLoading(false);
        }
    }, [router]);

    const value = { patient, isLoading };

    return (
        <PatientAuthContext.Provider value={value}>
            {children}
        </PatientAuthContext.Provider>
    );
}

// 3. Create the custom hook
export const usePatientAuth = () => {
    const context = useContext(PatientAuthContext);
    if (context === undefined) {
        throw new Error('usePatientAuth must be used within a PatientAuthProvider');
    }
    return context;
};

// 4. Main Layout component using the hook
function PatientDashboardView({ children }: { children: React.ReactNode }) {
  const { patient, isLoading } = usePatientAuth();
  const router = useRouter();

  const handleLogout = () => {
    sessionStorage.removeItem('currentPatient');
    router.push('/patient/login');
  };
  
  const initials = patient?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'P';

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
            <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              Logout
            </Button>
            <Avatar className="h-9 w-9">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </div>          
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        {isLoading ? (
             <div className="flex flex-1 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
             </div>
        ) : (
            children
        )}
      </main>
      <Toaster />
    </div>
  );
}

// 5. Wrap the export with the provider
export default function PatientDashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <PatientAuthProvider>
            <PatientDashboardView>{children}</PatientDashboardView>
        </PatientAuthProvider>
    );
}