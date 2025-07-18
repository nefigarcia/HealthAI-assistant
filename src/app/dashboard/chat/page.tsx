"use client";

import { useState, useEffect,useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Bot, Sparkles, Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";

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

function ChatSkeleton() {
    return (
        <div className="flex flex-col h-full">
            <Card className="flex flex-col">
                <CardHeader>
                    <Skeleton className="h-6 w-32" />
                </CardHeader>
                <div className="p-2 space-y-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                         <div key={i} className="flex items-center space-x-3 p-3">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-3 w-40" />
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
            <Card className="flex-grow mt-6 items-center justify-center hidden md:flex">
                 <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </Card>
            <Card className="flex-grow mt-6 items-center justify-center hidden lg:flex">
                 <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </Card>
        </div>
    )
}

export default function ChatPage() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const selectedChat = chats.find((chat) => chat.id === selectedChatId);
  const ws = useRef<WebSocket | null>(null);
  const [patientInput, setPatientInput] = useState("");

  const [adminMessages, setAdminMessages] = useState<Message[]>([
    { id: 1, sender: "assistant", text: "Hello! How can I assist you today, Dr. Admin?" },
  ]);
  const [adminInput, setAdminInput] = useState("");
  const [isAssistantLoading, setIsAssistantLoading] = useState(false);
  
  const { toast } = useToast();

  const fetchConversations = async () => {
    setIsLoading(true);
    try {
        const data = await apiFetch('/ai/conversations');
        setChats(data || []);
        // Automatically select the first chat if available
        if (data && data.length > 0) {
            setSelectedChatId(data[0].id);
        }
    } catch(error: any) {
        toast({
          variant: "destructive",
          title: "Error fetching conversations",
          description: error.message || "Could not load chat history.",
        });
    } finally {
        setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchConversations();
     // Establish WebSocket connection
    // Note: In a real production app, the WebSocket URL should come from an environment variable.
    const wsUrl = process.env.NODE_ENV === 'production' 
      ? `wss://${window.location.host}` 
      : `ws://${window.location.hostname}:3001`; // Assumes backend runs on 3001 in dev

    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
        console.log("WebSocket connected");
        // Identify this client as the admin
        ws.current?.send(JSON.stringify({ type: 'identify', role: 'admin' }));
    };

    ws.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'incoming_message') {
            const { patientId, message } = data.payload;
            
            // Update the chat state with the new message
            setChats(prevChats => {
                return prevChats.map(chat => {
                    if (chat.id === patientId) {
                        return {
                            ...chat,
                            messages: [...chat.messages, message],
                            lastMessage: message.text,
                            lastMessageTime: new Date().toISOString()
                        };
                    }
                    return chat;
                });
            });
        }
    };
    
    ws.current.onclose = () => {
        console.log("WebSocket disconnected");
    };

    ws.current.onerror = (error) => {
        console.error("WebSocket error:", error);
        toast({
            variant: "destructive",
            title: "Chat connection error",
            description: "Could not establish a real-time connection to the chat server.",
        });
    };

    // Cleanup on component unmount
    return () => {
        ws.current?.close();
    };
  }, []);

  const handleSendToPatient = () => {
    if (patientInput.trim() && selectedChat && ws.current?.readyState === WebSocket.OPEN) {
        setIsSending(true);
    const newMessage: Message = { id: Date.now(), sender: "user", text: patientInput };
       
       const payload = {
            patientId: selectedChat.id,
            message: newMessage,
       };

       // Send message via WebSocket
       ws.current.send(JSON.stringify({
           type: 'chat_message',
           sender: 'admin',
           recipientId: selectedChat.id,
           payload: payload,
       }));
       
       // Update local state immediately for instant feedback
       const updatedChats = chats.map(chat => 
            chat.id === selectedChatId 
            ? { ...chat, messages: [...chat.messages, newMessage], lastMessage: newMessage.text } 
            : chat
       );
       setChats(updatedChats);
        setPatientInput("");
       setIsSending(false);
        } else {
        toast({
            variant: "destructive",
            title: "Cannot send message",
            description: "Chat is not connected. Please refresh the page.",
        });
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
        const result = await apiFetch('/api/assistant', {
          method: 'POST',
          body: JSON.stringify({ query: currentInput }),
        });
        const newAssistantMessage: Message = { id: Date.now() + 1, sender: "assistant", text: result.response };
        setAdminMessages(prev => [...prev, newAssistantMessage]);
      } catch (error: any) {
        console.error("AI Assistant Error:", error);
        toast({
          variant: "destructive",
          title: "AI Assistant Error",
          description: error.message || "An error occurred while communicating with the AI.",
        });
        const errorMessage: Message = { id: Date.now() + 1, sender: "assistant", text: "Sorry, I ran into an unexpected error." };
        setAdminMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsAssistantLoading(false);
      }
    }
  };

  if (isLoading) {
        return (
          <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] lg:grid-cols-[300px_1fr_400px] gap-6 h-[calc(100vh-100px)]">
              <ChatSkeleton />
          </div>
        )
    }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] lg:grid-cols-[300px_1fr_400px] gap-6 h-[calc(100vh-100px)]">
      {/* Patient List */}
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle className="font-headline">Conversations</CardTitle>
        </CardHeader>
        <ScrollArea className="flex-grow p-2">
            <div className="space-y-1">
                {chats.length > 0 ? (
                    chats.map(chat => (
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
                             <div className="flex-grow overflow-hidden">
                                <div className="flex justify-between items-baseline">
                                     <p className="font-semibold truncate">{chat.patientName}</p>
                                     <p className="text-xs text-muted-foreground whitespace-nowrap">
                                        {formatDistanceToNow(new Date(chat.lastMessageTime), { addSuffix: true })}
                                     </p>
                                </div>
                                <p className="text-sm text-muted-foreground truncate max-w-[180px]">{chat.lastMessage}</p>
                            </div>
                        </Button>
                    ))
                ) : (
                    <div className="text-center text-sm text-muted-foreground p-8">
                        No patient conversations found.
                    </div>
                )}
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
                  <div key={message.id} className={cn("flex items-end gap-2", message.sender === 'user' || message.sender === 'patient' ? 'justify-end' : 'justify-start')}>
                    {message.sender === 'assistant' && <Avatar className="h-8 w-8 bg-accent text-accent-foreground"><Bot className="h-5 w-5 m-auto" /></Avatar>}
                    <div className={cn("rounded-lg px-4 py-2 max-w-[70%]", message.sender === 'user' || message.sender === 'patient' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                        {message.text}
                    </div>
                    {(message.sender === 'user' || message.sender === 'patient') && <Avatar className="h-8 w-8"><AvatarFallback>{selectedChat.patientAvatar}</AvatarFallback></Avatar>}
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
                    // This functionality would need a live connection (e.g. WebSockets)
                    // For now, we disable sending messages from the admin dashboard to the patient.
                    disabled={true} 
                />
                <Button onClick={handleSendToPatient} disabled={true}><Send className="h-4 w-4" /></Button>
                </div>
            </CardFooter>
        </Card>
      ) : (
         <Card className="flex items-center justify-center text-muted-foreground">
            {chats.length > 0 ? <p>Select a conversation to view</p> : <p>No conversations to display</p>}
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
