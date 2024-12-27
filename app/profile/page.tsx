/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";
import { Loader2, User, Upload } from "lucide-react";
import { supabase } from "@/utils/supabase-utils";
import { uploadProfileImage } from "@/utils/profile-upload";
import type { Profile } from "@/types/profile";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBackground, setUploadingBackground] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/sign-in");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      if (data) {
        setProfile(data);
      } else {
        // Create a new profile if it doesn't exist
        const newProfile = {
          id: user.id,
          username: user.email?.split("@")[0] || null,
          full_name: null,
          bio: null,
          avatar_url: null,
          background_url: null,
          website: null,
          location: null,
          github_url: null,
          twitter_url: null,
        };
        const { data: createdProfile, error: createError } = await supabase
          .from("profiles")
          .insert([newProfile])
          .select()
          .single();

        if (createError) throw createError;
        setProfile(createdProfile);
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    type: "avatar" | "background"
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      if (type === "avatar") {
        setUploadingAvatar(true);
      } else {
        setUploadingBackground(true);
      }

      const imageUrl = await uploadProfileImage(file, type);

      const { error } = await supabase
        .from("profiles")
        .update({
          [type === "avatar" ? "avatar_url" : "background_url"]: imageUrl,
        })
        .eq("id", profile?.id);

      if (error) throw error;

      setProfile((prev) =>
        prev
          ? {
              ...prev,
              [type === "avatar" ? "avatar_url" : "background_url"]: imageUrl,
            }
          : null
      );

      toast({
        title: "Success",
        description: `${
          type === "avatar" ? "Profile" : "Background"
        } image updated successfully`,
      });
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: `Failed to update ${type} image`,
        variant: "destructive",
      });
    } finally {
      if (type === "avatar") {
        setUploadingAvatar(false);
      } else {
        setUploadingBackground(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!profile) return;

    setUpdating(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          username: profile.username,
          full_name: profile.full_name,
          bio: profile.bio,
          website: profile.website,
          location: profile.location,
          github_url: profile.github_url,
          twitter_url: profile.twitter_url,
        })
        .eq("id", profile.id);

      if (error) throw error;

      // After successful update
      if (!error) {
        router.push(`/users/${profile.id}`);
      }

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
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
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Background Image Upload */}
            <div className="space-y-2">
              <Label>Background Image</Label>
              <div className="relative h-48 w-full bg-muted rounded-lg overflow-hidden">
                {profile?.background_url ? (
                  <Image
                    src={profile.background_url}
                    alt="Background"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10" />
                )}
                <div className="absolute bottom-4 right-4">
                  <input
                    type="file"
                    id="background-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, "background")}
                    disabled={uploadingBackground}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      document.getElementById("background-upload")?.click()
                    }
                    disabled={uploadingBackground}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {uploadingBackground ? "Uploading..." : "Change Background"}
                  </Button>
                </div>
              </div>
            </div>

            {/* Avatar Upload */}
            <div className="space-y-2">
              <Label>Profile Picture</Label>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={profile?.avatar_url || undefined} />
                    <AvatarFallback>
                      <User className="h-12 w-12" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-2 -right-2">
                    <input
                      type="file"
                      id="avatar-upload"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, "avatar")}
                      disabled={uploadingAvatar}
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="icon"
                      className="rounded-full h-8 w-8"
                      onClick={() =>
                        document.getElementById("avatar-upload")?.click()
                      }
                      disabled={uploadingAvatar}
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {uploadingAvatar && (
                  <span className="text-sm text-muted-foreground">
                    Uploading...
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={profile?.username || ""}
                onChange={(e) =>
                  setProfile((prev) =>
                    prev ? { ...prev, username: e.target.value } : null
                  )
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={profile?.full_name || ""}
                onChange={(e) =>
                  setProfile((prev) =>
                    prev ? { ...prev, full_name: e.target.value } : null
                  )
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={profile?.bio || ""}
                onChange={(e) =>
                  setProfile((prev) =>
                    prev ? { ...prev, bio: e.target.value } : null
                  )
                }
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={profile?.website || ""}
                onChange={(e) =>
                  setProfile((prev) =>
                    prev ? { ...prev, website: e.target.value } : null
                  )
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={profile?.location || ""}
                onChange={(e) =>
                  setProfile((prev) =>
                    prev ? { ...prev, location: e.target.value } : null
                  )
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="github_url">GitHub Profile</Label>
              <Input
                id="github_url"
                type="url"
                value={profile?.github_url || ""}
                onChange={(e) =>
                  setProfile((prev) =>
                    prev ? { ...prev, github_url: e.target.value } : null
                  )
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="twitter_url">Twitter Profile</Label>
              <Input
                id="twitter_url"
                type="url"
                value={profile?.twitter_url || ""}
                onChange={(e) =>
                  setProfile((prev) =>
                    prev ? { ...prev, twitter_url: e.target.value } : null
                  )
                }
              />
            </div>

            <Button type="submit" disabled={updating}>
              {updating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Profile"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
