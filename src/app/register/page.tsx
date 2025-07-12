"use client";

import { Suspense } from 'react';
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Icons } from "@/components/icons";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { apiFetch } from '@/lib/api';

const formSchema = z.object({
  fullName: z.string().min(2, { message: "Full name is required." }),
  clinicName: z.string().min(2, { message: "Clinic name is required." }),
  phone: z.string().min(10, { message: "A valid phone number is required." }),
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  plan: z.string(),
});

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const plan = searchParams.get('plan');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      clinicName: "",
      phone: "",
      email: "",
      password: "",
      plan: plan || "",
    },
  });

  useEffect(() => {
    if (plan) {
      form.setValue('plan', plan);
    }
  }, [plan, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    const nameParts = values.fullName.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ');

    const apiPayload = {
        clinic: {
            name: values.clinicName,
            subscription_plan: values.plan,
        },
        account: {
            NOMBRE: firstName,
            APELLIDOS: lastName || '',
            EMAIL: values.email,
            CONTRASENA: values.password,
            TELEFONO: values.phone,
            ID_ESCUELA: 0,
            TALLER_ID: 0,
            ROLES_ID: 1,
            APP: 'HealthAI Assist',
        },
        subscription: {
            plan_type: values.plan,
            status: 'trial',
        }
    };

    try {
        const result = await apiFetch('/register-clinic', {
            method: 'POST',
            body: JSON.stringify(apiPayload),
        });

        if (result.success) {
            toast({ title: "Account Created", description: "Redirecting to your dashboard..." });
            router.push('/dashboard');
        } else {
            toast({ variant: "destructive", title: "Registration Failed", description: result.message });
        }
    } catch (error: any) {
         toast({ variant: "destructive", title: "Registration Failed", description: error.message });
    } finally {
        setIsLoading(false);
    }
  }

  if (!plan) {
      return (
        <div className="text-center">
            <p className="mb-4">Please select a subscription plan first.</p>
            <Button asChild>
                <Link href="/subscribe">Choose a Plan</Link>
            </Button>
        </div>
      )
  }

  return (
    <>
      <CardHeader className="text-center">
        <CardTitle className="font-headline text-2xl">Create an account</CardTitle>
        <CardDescription>
          You've selected the <span className="font-bold capitalize text-primary">{plan}</span> plan.
          Enter your information to create an account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
             <FormField control={form.control} name="fullName" render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
               <FormField control={form.control} name="clinicName" render={({ field }) => (
                <FormItem>
                  <FormLabel>Clinic Name</FormLabel>
                  <FormControl><Input placeholder="HealthAI Clinic" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
               <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl><Input placeholder="(123) 456-7890" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl><Input placeholder="m@example.com" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="password" render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl><Input type="password" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin" /> : 'Create Account'}
            </Button>
          </form>
        </Form>
        <div className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Login
          </Link>
        </div>
      </CardContent>
    </>
  );
}

export default function RegisterPage() {
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
            <Suspense fallback={<div className="p-6 text-center"><Loader2 className="animate-spin mx-auto" /></div>}>
                <RegisterForm />
            </Suspense>
        </Card>
      </div>
    </div>
    )
}
