/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Send } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/utils/supabase-utils";
import type { Profile } from "@/types/profile";

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  created_at: string;
  read?: boolean; // Make read optional since it might not exist yet
}

interface ChatInterfaceProps {
  currentUser: Profile;
  otherUser: Profile;
}

export function ChatInterface({ currentUser, otherUser }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    fetchMessages();
    const subscription = supabase
      .channel("chat_messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `sender_id=eq.${currentUser.id},receiver_id=eq.${otherUser.id}`,
        },
        handleNewMessage
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `sender_id=eq.${otherUser.id},receiver_id=eq.${currentUser.id}`,
        },
        handleNewMessage
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [currentUser.id, otherUser.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Mark messages as read when the chat is opened
    markMessagesAsRead();
  }, []);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .or(`sender_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id}`)
        .or(`sender_id.eq.${otherUser.id},receiver_id.eq.${otherUser.id}`)
        .order("created_at", { ascending: true });

      if (error) throw error;

      setMessages(data);
      // Mark messages as read after fetching
      if (data.some((msg) => msg.receiver_id === currentUser.id && !msg.read)) {
        markMessagesAsRead();
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const markMessagesAsRead = async () => {
    try {
      const { error } = await supabase
        .from("chat_messages")
        .update({ read: true })
        .eq("receiver_id", currentUser.id)
        .eq("sender_id", otherUser.id)
        .eq("read", false);

      if (error) throw error;
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  const handleNewMessage = (payload: any) => {
    const newMessage = payload.new as Message;
    setMessages((prevMessages) => [...prevMessages, newMessage]);

    if (newMessage.receiver_id === currentUser.id) {
      markMessagesAsRead();
    }

    // Scroll to bottom when new message arrives
    setTimeout(scrollToBottom, 100);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const messageData = {
        sender_id: currentUser.id,
        receiver_id: otherUser.id,
        message: newMessage.trim(),
      };

      setNewMessage(""); // Clear input immediately for better UX

      const { error } = await supabase
        .from("chat_messages")
        .insert(messageData);

      if (error) throw error;
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[600px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={otherUser.avatar_url || undefined}
              alt={otherUser.username || "User"}
            />
            <AvatarFallback>{otherUser.username?.[0] || "U"}</AvatarFallback>
          </Avatar>
          <span>{otherUser.username || "User"}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message) => {
              const isSentByMe = message.sender_id === currentUser.id;
              return (
                <div
                  key={message.id}
                  className={`flex ${
                    isSentByMe ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      isSentByMe
                        ? "bg-primary text-primary-foreground rounded-br-none"
                        : "bg-muted rounded-bl-none"
                    }`}
                  >
                    <p>{message.message}</p>
                    <div className="flex items-center justify-between gap-2 mt-1">
                      <span className="text-xs opacity-70">
                        {new Date(message.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
        <form onSubmit={sendMessage} className="mt-4 flex gap-2">
          <Input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-grow"
          />
          <Button type="submit" size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
