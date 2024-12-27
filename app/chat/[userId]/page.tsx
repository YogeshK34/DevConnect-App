/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/utils/supabase-utils";
import { ChatInterface } from "@/components/chat-interface";
import type { Profile } from "@/types/profile";

export default function ChatPage() {
  const params = useParams();
  const otherUserId = params.userId as string;
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [otherUser, setOtherUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, [otherUserId]);

  const fetchUsers = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: currentUserProfile, error: currentUserError } =
        await supabase.from("profiles").select("*").eq("id", user.id).single();

      if (currentUserError) throw currentUserError;

      const { data: otherUserProfile, error: otherUserError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", otherUserId)
        .single();

      if (otherUserError) throw otherUserError;

      setCurrentUser(currentUserProfile);
      setOtherUser(otherUserProfile);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to load user profiles",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!currentUser || !otherUser) {
    return <div className="text-center mt-8">User not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ChatInterface currentUser={currentUser} otherUser={otherUser} />
    </div>
  );
}
