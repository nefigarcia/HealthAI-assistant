"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api";

const formSchema = z.object({
  patientName: z.string().min(2, { message: "Patient name is required." }),
  appointmentDateTime: z.string().min(1, { message: "Appointment date and time is required." }),
  preferredCommunicationMethod: z.enum(["SMS", "Email"], { required_error: "You need to select a communication method." }),
  clinicName: z.string().min(2, { message: "Clinic name is required." }),
  doctorName: z.string().min(2, { message: "Doctor name is required." }),
  appointmentType: z.string().min(2, { message: "Appointment type is required." }),
});

export default function RemindersPage() {
  const [generatedMessage, setGeneratedMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientName: "John Doe",
      appointmentDateTime: "2024-08-15 at 3:00 PM",
      preferredCommunicationMethod: "SMS",
      clinicName: "HealthAI Clinic",
      doctorName: "Dr. Smith",
      appointmentType: "Annual Check-up",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setGeneratedMessage("");
    try {
      const result = await apiFetch('/api/personalize-reminder', {
          method: 'POST',
          body: JSON.stringify(values),
      });
      setGeneratedMessage(result.message);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to generate message",
        description: error.message || "An error occurred while communicating with the AI.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline text-primary">Automated Reminders</h1>
        <p className="text-muted-foreground">Generate personalized appointment reminders for your patients.</p>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Patient Information</CardTitle>
            <CardDescription>Fill in the details to generate a reminder message.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="patientName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Patient Name</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="appointmentDateTime" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Appointment Date & Time</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="appointmentType" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Appointment Type</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="doctorName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Doctor Name</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="clinicName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Clinic Name</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="preferredCommunicationMethod" render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Communication Method</FormLabel>
                    <FormControl>
                      <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4">
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl><RadioGroupItem value="SMS" /></FormControl>
                          <FormLabel className="font-normal">SMS</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl><RadioGroupItem value="Email" /></FormControl>
                          <FormLabel className="font-normal">Email</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  Generate Message
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Generated Message</CardTitle>
            <CardDescription>This is the personalized message generated by AI.</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              readOnly
              value={generatedMessage}
              placeholder="AI-generated message will appear here..."
              className="min-h-[300px] bg-muted"
            />
            {generatedMessage && <Button className="w-full mt-4">Send Reminder</Button>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
