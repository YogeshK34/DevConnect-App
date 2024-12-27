"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/utils/supabase-utils";

export function NotificationIndicator() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { count, error } = await supabase
          .from("chat_messages")
          .select("*", { count: "exact", head: true })
          .eq("receiver_id", user.id)
          .eq("read", false);

        if (error) {
          console.error("Error fetching unread count:", error);
        } else {
          setUnreadCount(count || 0);
        }
      }
    };

    fetchUnreadCount();

    const setupSubscription = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const subscription = supabase
          .channel("chat_notifications")
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "chat_messages",
              filter: `receiver_id=eq.${user.id}`,
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
              filter: `receiver_id=eq.${user.id}`,
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
      }
    };

    setupSubscription();
  }, []);

  if (unreadCount === 0) return null;

  return (
    <Badge variant="destructive" className="ml-2">
      {unreadCount}
    </Badge>
  );
}
