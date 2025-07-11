"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { askAssistantAction } from "./actions"; // Updated import
import { Bot, Sparkles, Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Message = {
  id: number;
  sender: "user" | "patient" | "assistant";
  text: string;
};

type Chat = {
  id: string;
  patientName: string;
  patientAvatar: string;
  lastMessage: string;
  lastMessageTime: string;
  messages: Message[];
};

const mockChats: Chat[] = [
  {
    id: "1",
    patientName: "Olivia Martin",
    patientAvatar: "OM",
    lastMessage: "Hi, I'd like to book an appointment for a cleaning.",
    lastMessageTime: "10m ago",
    messages: [
      { id: 1, sender: "patient", text: "Hi, I'd like to book an appointment for a cleaning." },
      { id: 2, sender: "user", text: "Of course, we have an opening tomorrow at 2 PM. Does that work for you?" },
      { id: 3, sender: "patient", text: "Yes, that's perfect!" },
    ],
  },
  {
    id: "2",
    patientName: "John Doe",
    patientAvatar: "JD",
    lastMessage: "I need to reschedule my appointment.",
    lastMessageTime: "1h ago",
    messages: [
      { id: 1, sender: "patient", text: "I need to reschedule my appointment for next week." },
    ],
  },
    {
    id: "3",
    patientName: "Jane Smith",
    patientAvatar: "JS",
    lastMessage: "What are your hours on Saturday?",
    lastMessageTime: "3h ago",
    messages: [
      { id: 1, sender: "patient", text: "What are your hours on Saturday?" },
      { id: 2, sender: "user", text: "We are open from 9 AM to 1 PM on Saturdays." },
    ],
  },
];


export default function ChatPage() {
  const [chats, setChats] = useState<Chat[]>(mockChats);
  const [selectedChatId, setSelectedChatId] = useState<string>("1");
  const selectedChat = chats.find((chat) => chat.id === selectedChatId)!;
  
  const [patientInput, setPatientInput] = useState("");

  const [adminMessages, setAdminMessages] = useState<Message[]>([
    { id: 1, sender: "assistant", text: "Hello! How can I assist you today, Dr. Admin?" },
  ]);
  const [adminInput, setAdminInput] = useState("");
  const [isAssistantLoading, setIsAssistantLoading] = useState(false);
  
  const { toast } = useToast();

  const handleSendToPatient = () => {
    if (patientInput.trim() && selectedChat) {
       const newMessage: Message = { id: Date.now(), sender: "user", text: patientInput };
       const updatedChats = chats.map(chat => 
         chat.id === selectedChatId 
           ? { ...chat, messages: [...chat.messages, newMessage], lastMessage: patientInput } 
           : chat
       );
       setChats(updatedChats);
       setPatientInput("");
    }
  };

  const handleSendToAssistant = async () => {
    if (adminInput.trim()) {
      const newUserMessage: Message = { id: Date.now(), sender: "user", text: adminInput };
      setAdminMessages(prev => [...prev, newUserMessage]);
      const currentInput = adminInput;
      setAdminInput("");
      setIsAssistantLoading(true);

      try {
        const result = await askAssistantAction(currentInput);
        const newAssistantMessage: Message = { id: Date.now() + 1, sender: "assistant", text: result.response };
        setAdminMessages(prev => [...prev, newAssistantMessage]);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "AI Assistant Error",
          description: "An error occurred while communicating with the AI.",
        });
         const errorMessage: Message = { id: Date.now() + 1, sender: "assistant", text: "Sorry, I ran into an unexpected error." };
        setAdminMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsAssistantLoading(false);
      }
    }
  };


  return (
    <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] lg:grid-cols-[300px_1fr_400px] gap-6 h-[calc(100vh-100px)]">
      {/* Patient List */}
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle className="font-headline">Conversations</CardTitle>
        </CardHeader>
        <ScrollArea className="flex-grow p-2">
            <div className="space-y-1">
                {chats.map(chat => (
                    <Button 
                        key={chat.id} 
                        variant={selectedChatId === chat.id ? "secondary" : "ghost"}
                        className="w-full h-auto justify-start p-3 text-left"
                        onClick={() => setSelectedChatId(chat.id)}
                    >
                        <Avatar className="h-10 w-10 mr-4">
                            <AvatarImage src={`https://placehold.co/40x40.png?text=${chat.patientAvatar}`} alt={chat.patientName} data-ai-hint="person portrait" />
                            <AvatarFallback>{chat.patientAvatar}</AvatarFallback>
                        </Avatar>
                         <div>
                            <p className="font-semibold">{chat.patientName}</p>
                            <p className="text-sm text-muted-foreground truncate max-w-[150px]">{chat.lastMessage}</p>
                        </div>
                    </Button>
                ))}
            </div>
        </ScrollArea>
      </Card>

      {/* Patient Chat Window */}
      {selectedChat ? (
        <Card className="flex-grow flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                <CardTitle className="font-headline">{selectedChat.patientName}</CardTitle>
                <CardDescription>Online</CardDescription>
                </div>
                <Avatar>
                <AvatarImage src={`https://placehold.co/40x40.png?text=${selectedChat.patientAvatar}`} alt={selectedChat.patientName} data-ai-hint="person portrait" />
                <AvatarFallback>{selectedChat.patientAvatar}</AvatarFallback>
                </Avatar>
            </CardHeader>
            <ScrollArea className="flex-grow p-4">
                <div className="space-y-4">
                {selectedChat.messages.map((message) => (
                    <div key={message.id} className={cn("flex items-end gap-2", message.sender === 'user' ? 'justify-end' : 'justify-start')}>
                    {message.sender === 'patient' && <Avatar className="h-8 w-8"><AvatarImage src={`https://placehold.co/40x40.png?text=${selectedChat.patientAvatar}`} data-ai-hint="person" /><AvatarFallback>{selectedChat.patientAvatar}</AvatarFallback></Avatar>}
                    <div className={cn("rounded-lg px-4 py-2 max-w-[70%]", message.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
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
                    value={patientInput}
                    onChange={(e) => setPatientInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendToPatient()}
                    placeholder={`Message ${selectedChat.patientName}...`}
                />
                <Button onClick={handleSendToPatient}><Send className="h-4 w-4" /></Button>
                </div>
            </CardFooter>
        </Card>
      ) : (
        <Card className="flex items-center justify-center">
            <p>Select a conversation</p>
        </Card>
      )}
      
      {/* Admin AI Assistant */}
       <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <Sparkles className="text-accent" /> AI Assistant
            </CardTitle>
            <CardDescription>Your personal AI helper for administrative tasks.</CardDescription>
          </CardHeader>
           <ScrollArea className="flex-grow p-4">
            <div className="space-y-4">
              {adminMessages.map((message) => (
                <div key={message.id} className={cn("flex items-start gap-3", message.sender === 'user' ? 'justify-end' : '')}>
                  {message.sender === 'assistant' && <Avatar className="h-8 w-8 bg-accent text-accent-foreground"><Bot className="h-5 w-5 m-auto" /></Avatar>}
                   <div className={cn("rounded-lg px-4 py-2 max-w-[80%]", message.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                    {message.text}
                  </div>
                  {message.sender === 'user' && <Avatar className="h-8 w-8"><AvatarFallback>DA</AvatarFallback></Avatar>}
                </div>
              ))}
              {isAssistantLoading && (
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
                value={adminInput}
                onChange={(e) => setAdminInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendToAssistant()}
                placeholder="Ask the assistant..."
                disabled={isAssistantLoading}
              />
              <Button onClick={handleSendToAssistant} disabled={isAssistantLoading}>
                {isAssistantLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </CardFooter>
      </Card>
    </div>
  );
}
