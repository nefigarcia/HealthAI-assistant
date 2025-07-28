"use client";

import { useState, useEffect, useRef } from "react";
import { usePatientAuth } from './layout'; // Import the hook from the layout
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Bot, Sparkles, Send, Loader2, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Appointment } from "@/services/calendar";
import { format } from 'date-fns';
import { apiFetch } from "@/lib/api";

type Message = {
  id: number;
  sender: "user" | "assistant";
  text: string;
};

export default function PatientDashboardPage() {
  const { patient } = usePatientAuth(); // Use the hook to get patient data
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);  
  const { toast } = useToast();
  const ws = useRef<WebSocket | null>(null);

 const fetchPatientAppointments = async () => {
  if (!patient) return;
        try {
            const encodedPatientName = encodeURIComponent(patient.name);
            const patientAppointments = await apiFetch(`/calendar/appointments/patient/${encodedPatientName}`);
            setAppointments(patientAppointments || []);
        } catch(error) {
             toast({
              variant: "destructive",
              title: "Error",
              description: "Could not fetch patient appointments.",
            });
        }
      };

  useEffect(() => {
    if (patient && patient.id) {
      // Set initial message once patient data is available
      setMessages([
        { id: 1, sender: "assistant", text: `Hello ${patient.name}! How can I help you with your appointments today?` }
      ]);
      
     
      fetchPatientAppointments();
      // --- WebSocket Connection ---
      const connectWebSocket = () => {
        try {
          const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
          const ws_url = `${wsProtocol}//${wsProtocol === 'ws:' ? window.location.host.replace(/:\d+$/, ':3001') : 'shielded-brushlands-89617.herokuapp.com'}`;
          ws.current = new WebSocket(ws_url);
          console.log("Connecting to WebSocket at", ws_url);
          ws.current.onopen = () => {
            console.log(`Patient ${patient.id} WebSocket connected`);
            ws.current?.send(JSON.stringify({ type: 'identify', role: 'patient', patientId: patient.id }));
          };

          ws.current.onmessage = (event) => {
            const incoming = JSON.parse(event.data);
            if (incoming.type === 'incoming_message') {
              setMessages(prev => [...prev, incoming.payload.message]);
            }
          };

          ws.current.onclose = () => {
            console.log("Patient WebSocket disconnected. Reconnecting...");
            setTimeout(connectWebSocket, 5000);
          };

          ws.current.onerror = (error) => {
            console.error("Patient WebSocket error:", error);
            toast({
              variant: "destructive",
              title: "Chat Connection Error",
              description: "Could not establish a real-time connection.",
            });
          };
        } catch (error) {
           console.error("Failed to initialize patient WebSocket:", error);
        }
      };
      
      connectWebSocket();
    }

    return () => {
      ws.current?.close();
    };
  }, [patient]);

  const handleSendMessage = async () => {
    if (!input.trim() || !patient) return;
      const newUserMessage: Message = { id: Date.now(), sender: "user", text: input };
       setMessages(prev => [...prev, newUserMessage]);
    
    // Check if it's a message for the admin or a command for the AI
    if (input.toLowerCase().startsWith("message clinic:")) {
      // Real-time message to admin
       if (ws.current?.readyState === WebSocket.OPEN) {
         const payload = { patientId: patient.id, message: newUserMessage };
         ws.current.send(JSON.stringify({ type: 'chat_message', sender: 'patient', payload }));
       }
    } else {
      // It's a query for the AI assistant
      const currentMessages = [...messages, newUserMessage];
      const currentInput = input;
      setIsAiLoading(true);
      try {
          const result = await apiFetch('/api/patient-assistant', {
              method: 'POST',
              body: JSON.stringify({
                  patientName: patient.name,
                  query: currentInput,
                  messages: currentMessages, 
              }),
          });
          const newAssistantMessage: Message = { id: Date.now() + 1, sender: "assistant", text: result.response };
          setMessages(prev => [...prev, newAssistantMessage]);
          // Refresh appointments if AI might have changed them
          fetchPatientAppointments(); 
      } catch (error: any) {
          toast({ variant: "destructive", title: "AI Assistant Error", description: error.message });
      } finally {
          setIsAiLoading(false);
      }
      }
     setInput("");
  };
  const initials = patient?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'P';
  const isLoading = isAiLoading || isSending;

  return (
    <div className="grid gap-8 md:grid-cols-3">
      <div className="md:col-span-1 space-y-8">
        <Card>
          <CardHeader className="flex flex-col items-center text-center">
            <Avatar className="h-24 w-24 mb-4">
              <AvatarImage src="https://placehold.co/400x400.png" alt={patient?.name} data-ai-hint="person portrait" />
              <AvatarFallback>{initials}</AvatarFallback>
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
                                    {format(new Date(app.datetime), "EEEE, MMMM d, yyyy 'at' h:mm a")}
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
                <Sparkles className="text-accent" /> AI Assistant & Chat
                </CardTitle>
                <CardDescription>Ask the AI for help or start your message with "message clinic:" to chat with staff.</CardDescription>
            </CardHeader>
            <ScrollArea className="flex-grow p-4">
                <div className="space-y-4">
                {messages.map((message) => (
                    <div key={message.id} className={cn("flex items-start gap-3", message.sender === 'user' ? 'justify-end' : '')}>
                    {message.sender === 'assistant' && <Avatar className="h-8 w-8 bg-accent text-accent-foreground"><Bot className="h-5 w-5 m-auto" /></Avatar>}
                    <div className={cn("rounded-lg px-4 py-2 max-w-[80%]", message.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                        {message.text}
                    </div>
                    {message.sender === 'user' && <Avatar className="h-8 w-8"><AvatarFallback>{initials}</AvatarFallback></Avatar>}
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
                    placeholder="Ask AI or start with 'message clinic:' to chat"
                    disabled={isLoading || !patient}
                />
                <Button onClick={handleSendMessage} disabled={isLoading || !patient}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
                </div>
            </CardFooter>
        </Card>
      </div>
    </div>
  );
}
