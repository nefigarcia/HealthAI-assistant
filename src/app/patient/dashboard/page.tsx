"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { askPatientAssistant } from "@/ai/flows/patient-assistant";
import { Bot, Sparkles, Send, Loader2, Calendar, User, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Patient } from "@/services/patients";
import type { Appointment } from "@/services/calendar";
import { getPatientDetailsAction, getPatientAppointmentsAction } from "./actions";
import { format } from 'date-fns';

type Message = {
  id: number;
  sender: "user" | "assistant";
  text: string;
};

const PATIENT_NAME = "Sarah Lee";

export default function PatientDashboardPage() {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, sender: "assistant", text: `Hello ${PATIENT_NAME}! How can I help you with your appointments today?` },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    async function fetchData() {
      try {
        const patientDetails = await getPatientDetailsAction(PATIENT_NAME);
        setPatient(patientDetails);
        const patientAppointments = await getPatientAppointmentsAction(PATIENT_NAME);
        setAppointments(patientAppointments);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not fetch patient details.",
        });
      }
    }
    fetchData();
  }, []);

  const handleSendMessage = async () => {
    if (input.trim()) {
      const newUserMessage: Message = { id: Date.now(), sender: "user", text: input };
      setMessages(prev => [...prev, newUserMessage]);
      const currentInput = input;
      setInput("");
      setIsLoading(true);

      try {
        const result = await askPatientAssistant({ query: currentInput, patientName: PATIENT_NAME });
        const newAssistantMessage: Message = { id: Date.now() + 1, sender: "assistant", text: result.response };
        setMessages(prev => [...prev, newAssistantMessage]);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "AI Assistant Error",
          description: "An error occurred while communicating with the AI.",
        });
      } finally {
        setIsLoading(false);
        // Refresh appointments after AI interaction
        getPatientAppointmentsAction(PATIENT_NAME).then(setAppointments);
      }
    }
  };

  return (
    <div className="grid gap-8 md:grid-cols-3">
      <div className="md:col-span-1 space-y-8">
        <Card>
          <CardHeader className="flex flex-col items-center text-center">
            <Avatar className="h-24 w-24 mb-4">
              <AvatarImage src="https://placehold.co/400x400.png" alt={patient?.name} data-ai-hint="person portrait" />
              <AvatarFallback>{patient?.avatar}</AvatarFallback>
            </Avatar>
            <CardTitle className="font-headline text-2xl">{patient?.name}</CardTitle>
            <CardDescription>{patient?.email}</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2"><Calendar className="h-5 w-5"/> Upcoming Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
                <div className="space-y-4">
                {appointments.length > 0 ? (
                    appointments.map((app, index) => (
                        <div key={index} className="flex items-center p-2 rounded-md bg-muted/50">
                            <div className="flex-grow">
                                <p className="font-semibold">{app.type}</p>
                                <p className="text-sm text-muted-foreground">
                                    {format(new Date(app.date), 'EEEE, MMMM d, yyyy')} at {app.time}
                                </p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">You have no upcoming appointments.</p>
                )}
                </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
      <div className="md:col-span-2">
        <Card className="flex flex-col h-[calc(100vh-160px)]">
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                <Sparkles className="text-accent" /> AI Assistant
                </CardTitle>
                <CardDescription>Ask me to see your appointments or request a reschedule.</CardDescription>
            </CardHeader>
            <ScrollArea className="flex-grow p-4">
                <div className="space-y-4">
                {messages.map((message) => (
                    <div key={message.id} className={cn("flex items-start gap-3", message.sender === 'user' ? 'justify-end' : '')}>
                    {message.sender === 'assistant' && <Avatar className="h-8 w-8 bg-accent text-accent-foreground"><Bot className="h-5 w-5 m-auto" /></Avatar>}
                    <div className={cn("rounded-lg px-4 py-2 max-w-[80%]", message.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                        {message.text}
                    </div>
                    {message.sender === 'user' && <Avatar className="h-8 w-8"><AvatarFallback>{patient?.avatar}</AvatarFallback></Avatar>}
                    </div>
                ))}
                {isLoading && (
                    <div className="flex items-start gap-3">
                        <Avatar className="h-8 w-8 bg-accent text-accent-foreground"><Bot className="h-5 w-5 m-auto" /></Avatar>
                        <div className="rounded-lg px-4 py-2 bg-muted flex items-center">
                            <Loader2 className="h-4 w-4 animate-spin"/>
                        </div>
                    </div>
                )}
                </div>
            </ScrollArea>
            <CardFooter className="p-4 border-t">
                <div className="flex w-full items-center space-x-2">
                <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask about your appointments..."
                    disabled={isLoading}
                />
                <Button onClick={handleSendMessage} disabled={isLoading}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
                </div>
            </CardFooter>
        </Card>
      </div>
    </div>
  );
}