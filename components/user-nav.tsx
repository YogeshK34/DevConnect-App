"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/utils/supabase-utils";
import type { User } from "@supabase/supabase-js";

export function UserNav() {
  const [user, setUser] = useState<User | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        fetchUnreadCount(user.id);
        subscribeToMessages(user.id);
      }
    };
    fetchUser();

    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUnreadCount = async (userId: string) => {
    try {
      const { count, error } = await supabase
        .from("chat_messages")
        .select("*", { count: "exact", head: true })
        .eq("receiver_id", userId)
        .eq("read", false);

      if (error) throw error;
      setUnreadCount(count || 0);
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  const subscribeToMessages = (userId: string) => {
    const subscription = supabase
      .channel("chat_notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `receiver_id=eq.${userId}`,
        },
        (payload) => {
          if (!payload.new.read) {
            setUnreadCount((prev) => prev + 1);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "chat_messages",
          filter: `receiver_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.new.read && !payload.old.read) {
            setUnreadCount((prev) => Math.max(0, prev - 1));
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/auth/sign-in");
  };

  if (!user) {
    return (
      <Button variant="ghost" asChild>
        <Link href="/auth/sign-in">Sign In</Link>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={user.user_metadata?.avatar_url}
              alt={user.email || ""}
            />
            <AvatarFallback>
              {user.email?.[0].toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user.user_metadata?.full_name || user.email}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={`/users/${user.id}`}>Profile</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/projects/new">New Project</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/profile">Settings</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>Log out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
