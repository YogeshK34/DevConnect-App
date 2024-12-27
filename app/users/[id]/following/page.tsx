/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, User } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/utils/supabase-utils";
import type { Profile } from "@/types/profile";

export default function FollowingPage() {
  const params = useParams();
  const userId = params.id as string;
  const router = useRouter();
  const [following, setFollowing] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFollowing();
  }, [userId]);

  const fetchFollowing = async () => {
    try {
      const { data, error } = await supabase
        .from("user_follows")
        .select("following_id")
        .eq("follower_id", userId);

      if (error) throw error;

      const followingIds = data.map((item) => item.following_id);

      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .in("id", followingIds);

      if (profilesError) throw profilesError;

      setFollowing(profiles);
    } catch (error) {
      console.error("Error fetching following:", error);
      toast({
        title: "Error",
        description: "Failed to load following users",
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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Following</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {following.map((profile) => (
          <Card
            key={profile.id}
            className="flex items-center p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex-shrink-0 mr-4">
              {profile.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt={profile.username || "User"}
                  width={48}
                  height={48}
                  className="rounded-full"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-6 w-6 text-primary" />
                </div>
              )}
            </div>
            <div className="flex-grow">
              <h2 className="font-semibold">
                {profile.full_name || profile.username}
              </h2>
              {profile.username && (
                <p className="text-sm text-muted-foreground">
                  @{profile.username}
                </p>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/users/${profile.id}`)}
            >
              View Profile
            </Button>
          </Card>
        ))}
      </div>
      {following.length === 0 && (
        <p className="text-center text-muted-foreground">
          This user is not following anyone yet.
        </p>
      )}
    </div>
  );
}
