/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, User, Search } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/utils/supabase-utils";
import type { Profile } from "@/types/profile";

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);

  useEffect(() => {
    fetchCurrentUserAndUsers();
  }, []);

  const fetchCurrentUserAndUsers = async () => {
    try {
      setLoading(true);

      // Fetch current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: currentUserProfile, error: currentUserError } =
          await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

        if (currentUserError) throw currentUserError;
        setCurrentUser(currentUserProfile);
      }

      // Fetch all users
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("username");

      if (error) throw error;

      // Filter out the current user
      const filteredUsers = data.filter((profile) => profile.id !== user?.id);
      setUsers(filteredUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">DevConnect Users</h1>
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user) => (
          <Card
            key={user.id}
            className="flex items-center p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex-shrink-0 mr-4">
              {user.avatar_url ? (
                <Image
                  src={user.avatar_url}
                  alt={user.username || "User"}
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
                {user.full_name || user.username}
              </h2>
              {user.username && (
                <p className="text-sm text-muted-foreground">
                  @{user.username}
                </p>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/users/${user.id}`)}
            >
              View Profile
            </Button>
          </Card>
        ))}
      </div>
      {filteredUsers.length === 0 && (
        <p className="text-center text-muted-foreground mt-8">
          No users found matching your search.
        </p>
      )}
    </div>
  );
}
