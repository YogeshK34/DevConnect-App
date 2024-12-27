"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";
import { supabase } from "@/utils/supabase-utils";
import type { Profile } from "@/types/profile";

interface RecentChat {
  user: Profile;
  lastMessage: string;
  timestamp: string;
}

export function RecentChats() {
  const [recentChats, setRecentChats] = useState<RecentChat[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchRecentChats();
  }, []);

  const fetchRecentChats = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("chat_messages")
        .select("*, profiles!chat_messages_sender_id_fkey(*)")
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;

      const processedChats = data.reduce((acc: RecentChat[], message) => {
        const otherUser =
          message.sender_id === user.id ? message.profiles : message.profiles;
        const existingChat = acc.find((chat) => chat.user.id === otherUser.id);
        if (!existingChat) {
          acc.push({
            user: otherUser,
            lastMessage: message.message,
            timestamp: message.created_at,
          });
        }
        return acc;
      }, []);

      setRecentChats(processedChats);
    } catch (error) {
      console.error("Error fetching recent chats:", error);
    } finally {
      setLoading(false);
    }
  };

  const goToChat = (userId: string) => {
    router.push(`/chat/${userId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Chats</CardTitle>
      </CardHeader>
      <CardContent>
        {recentChats.length > 0 ? (
          <ul className="space-y-4">
            {recentChats.map((chat) => (
              <li
                key={chat.user.id}
                className="flex items-center space-x-4 cursor-pointer hover:bg-accent rounded-md p-2"
                onClick={() => goToChat(chat.user.id)}
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={chat.user.avatar_url || undefined}
                    alt={chat.user.username || "User"}
                  />
                  <AvatarFallback>
                    {chat.user.username?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {chat.user.full_name || chat.user.username}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    {chat.lastMessage}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(chat.timestamp).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-muted-foreground">No recent chats</p>
        )}
      </CardContent>
    </Card>
  );
}
