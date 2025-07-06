"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { getSuggestedResponses } from "@/ai/flows/automated-response-suggestions";
import { summarizeAppointment } from "@/ai/flows/appointment-summarization";
import { Bot, Sparkles, Send, Loader2 } from "lucide-react";

type Message = {
  id: number;
  sender: "user" | "patient";
  text: string;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, sender: "patient", text: "Hi, I'd like to book an appointment for a cleaning." },
  ]);
  const [input, setInput] = useState("");
  const [suggestedResponses, setSuggestedResponses] = useState<string[]>([]);
  const [summary, setSummary] = useState("");
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const { toast } = useToast();

  const handleSend = () => {
    if (input.trim()) {
      setMessages([...messages, { id: Date.now(), sender: "user", text: input }]);
      setInput("");
    }
  };

  const handleGetSuggestions = async () => {
    const lastPatientMessage = messages.filter((m) => m.sender === "patient").pop();
    if (!lastPatientMessage) {
      toast({
        variant: "destructive",
        title: "No patient message found",
        description: "Cannot generate suggestions without a patient inquiry.",
      });
      return;
    }

    setIsSuggesting(true);
    setSuggestedResponses([]);
    try {
      const result = await getSuggestedResponses({ patientInquiry: lastPatientMessage.text });
      setSuggestedResponses(result.suggestedResponses);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to get suggestions",
        description: "An error occurred while communicating with the AI.",
      });
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleSummarize = async () => {
    const conversation = messages.map(m => `${m.sender === 'user' ? 'Staff' : 'Patient'}: ${m.text}`).join('\n');
    setIsSummarizing(true);
    setSummary("");
    try {
      const result = await summarizeAppointment({ appointmentDetails: conversation });
      setSummary(result.summary);
    } catch (error) {
       toast({
        variant: "destructive",
        title: "Failed to get summary",
        description: "An error occurred while communicating with the AI.",
      });
    } finally {
      setIsSummarizing(false);
    }
  };

  return (
    <div className="grid md:grid-cols-3 gap-6 h-[calc(100vh-100px)]">
      <div className="md:col-span-2 flex flex-col">
        <Card className="flex-grow flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="font-headline">Olivia Martin</CardTitle>
              <CardDescription>Online</CardDescription>
            </div>
            <Avatar>
              <AvatarImage src="https://placehold.co/40x40.png?text=OM" alt="Olivia Martin" data-ai-hint="person portrait" />
              <AvatarFallback>OM</AvatarFallback>
            </Avatar>
          </CardHeader>
          <ScrollArea className="flex-grow p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex items-end gap-2 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {message.sender === 'patient' && <Avatar className="h-8 w-8"><AvatarFallback>OM</AvatarFallback></Avatar>}
                  <div className={`rounded-lg px-4 py-2 max-w-[70%] ${message.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    {message.text}
                  </div>
                  {message.sender === 'user' && <Avatar className="h-8 w-8"><AvatarFallback>DA</AvatarFallback></Avatar>}
                </div>
              ))}
            </div>
          </ScrollArea>
          <CardFooter className="p-4 border-t">
            <div className="flex w-full items-center space-x-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type your message..."
              />
              <Button onClick={handleSend}><Send className="h-4 w-4" /></Button>
            </div>
          </CardFooter>
        </Card>
      </div>
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <Sparkles className="text-accent" /> AI Tools
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full" onClick={handleGetSuggestions} disabled={isSuggesting}>
              {isSuggesting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bot className="mr-2 h-4 w-4" />}
              Suggest Responses
            </Button>
            {suggestedResponses.length > 0 && (
              <div className="space-y-2 pt-4">
                 <h4 className="font-semibold text-sm">Suggested Responses:</h4>
                {suggestedResponses.map((resp, i) => (
                  <div key={i} className="text-sm p-3 bg-muted rounded-md cursor-pointer hover:bg-accent/20" onClick={() => setInput(resp)}>
                    {resp}
                  </div>
                ))}
              </div>
            )}
            <Separator />
            <Button className="w-full" variant="outline" onClick={handleSummarize} disabled={isSummarizing}>
              {isSummarizing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Summarize Conversation
            </Button>
             {summary && (
              <div className="space-y-2 pt-4">
                 <h4 className="font-semibold text-sm">Summary:</h4>
                 <Textarea readOnly value={summary} rows={6} className="bg-muted" />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
