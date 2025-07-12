"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/icons";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';

export default function PatientLoginPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [name, setName] = useState('Sarah Lee');
    const [dob, setDob] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleValidation = async () => {
        setIsLoading(true);
        try {
            const result = await apiFetch('/patients/validate', {
                method: 'POST',
                body: JSON.stringify({ name, dob }),
            });
            
            if (result) {
                toast({ title: "Success", description: "Redirecting to your dashboard..." });
                router.push('/patient/dashboard');
            } else {
                 toast({ variant: "destructive", title: "Validation Failed", description: 'Invalid name or date of birth. Please try again.' });
            }
        } catch(error: any) {
            toast({ variant: "destructive", title: "Validation Failed", description: error.message });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <div className="w-full max-w-md mx-auto p-4">
                <div className="flex justify-center mb-6">
                    <Link href="/" className="flex items-center gap-2 text-primary">
                        <Icons.logo className="h-8 w-8" />
                        <span className="text-2xl font-bold font-headline">HealthAI Assist</span>
                    </Link>
                </div>
                <Card>
                    <CardHeader className="text-center">
                        <CardTitle className="font-headline text-2xl">Patient Portal</CardTitle>
                        <CardDescription>Please verify your date of birth to continue.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Sarah Lee" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="dob">Date of Birth</Label>
                                <Input id="dob" type="date" value={dob} onChange={(e) => setDob(e.target.value)} required />
                            </div>
                            <Button onClick={handleValidation} disabled={isLoading} className="w-full">
                                {isLoading ? <Loader2 className="animate-spin" /> : "Access My Dashboard"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
