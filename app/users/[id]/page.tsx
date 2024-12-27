/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Loader2,
  MapPin,
  Globe,
  Github,
  Twitter,
  Edit,
  Upload,
  Calendar,
  User,
  Rocket,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/utils/supabase-utils";
import { uploadProfileImage } from "@/utils/profile-upload";
import type { Profile } from "@/types/profile";
import type { Project } from "@/types/project";

export default function UserProfilePage() {
  const params = useParams();
  const userId = params.id as string;
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    fetchProfileAndProjects();
    checkCurrentUser();
  }, [userId]);

  const checkCurrentUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setCurrentUser(user);
  };

  const fetchProfileAndProjects = async () => {
    try {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (profileError) throw profileError;
      setProfile(profile);

      const { data: projects, error: projectsError } = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (projectsError) throw projectsError;
      setProjects(projects || []);
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

    setUploading(true);
    try {
      const imageUrl = await uploadProfileImage(file, type);

      const { error } = await supabase
        .from("profiles")
        .update({
          [type === "avatar" ? "avatar_url" : "background_url"]: imageUrl,
        })
        .eq("id", userId);

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
        description: "Profile image updated successfully",
      });
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to update profile image",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return <div className="text-center mt-8">User not found</div>;
  }

  const isOwnProfile = currentUser?.id === userId;

  return (
    <div className="min-h-screen bg-background">
      {/* Background Image */}
      <div className="relative h-40 sm:h-48 md:h-64 w-full bg-muted">
        {profile.background_url ? (
          <Image
            src={profile.background_url}
            alt="Profile background"
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10" />
        )}
        {isOwnProfile && (
          <div className="absolute bottom-4 right-4 z-10">
            <input
              type="file"
              id="background-upload"
              className="hidden"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, "background")}
              disabled={uploading}
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                document.getElementById("background-upload")?.click()
              }
              disabled={uploading}
              className="shadow-lg"
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? "Uploading..." : "Update Cover"}
            </Button>
          </div>
        )}
      </div>

      {/* Profile Content */}
      <div className="container mx-auto px-4">
        <div className="relative -mt-16 sm:-mt-20 mb-8">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar */}
            <div className="relative z-20">
              <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-full border-4 border-background overflow-hidden bg-muted shadow-lg">
                {profile.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt={profile.username || "Profile"}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-primary/10">
                    <User className="h-12 w-12 text-primary" />
                  </div>
                )}
              </div>
              {isOwnProfile && (
                <div className="absolute bottom-0 right-0">
                  <input
                    type="file"
                    id="avatar-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, "avatar")}
                    disabled={uploading}
                  />
                  <Button
                    variant="secondary"
                    size="icon"
                    className="rounded-full shadow-lg"
                    onClick={() =>
                      document.getElementById("avatar-upload")?.click()
                    }
                    disabled={uploading}
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold">
                    {profile.full_name || profile.username}
                  </h1>
                  {profile.username && (
                    <p className="text-muted-foreground">@{profile.username}</p>
                  )}
                </div>
                {isOwnProfile && (
                  <Button
                    variant="outline"
                    onClick={() => router.push("/profile")}
                    className="w-full sm:w-auto"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                )}
              </div>

              {/* Bio and Links */}
              <div className="space-y-4">
                {profile.bio && (
                  <p className="text-muted-foreground max-w-2xl">
                    {profile.bio}
                  </p>
                )}
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {profile.location && (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {profile.location}
                    </div>
                  )}
                  {profile.website && (
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center hover:text-primary transition-colors"
                    >
                      <Globe className="h-4 w-4 mr-1" />
                      Website
                    </a>
                  )}
                  {profile.github_url && (
                    <a
                      href={profile.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center hover:text-primary transition-colors"
                    >
                      <Github className="h-4 w-4 mr-1" />
                      GitHub
                    </a>
                  )}
                  {profile.twitter_url && (
                    <a
                      href={profile.twitter_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center hover:text-primary transition-colors"
                    >
                      <Twitter className="h-4 w-4 mr-1" />
                      Twitter
                    </a>
                  )}
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Joined {new Date(profile.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Projects Tab */}
        <Tabs defaultValue="projects" className="mb-8">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="projects" className="flex-1 sm:flex-none">
              Projects ({projects.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="projects" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Card
                  key={project.id}
                  className="flex flex-col overflow-hidden hover:shadow-lg transition-all duration-300 group"
                >
                  {project.image_url && (
                    <div className="relative h-48 w-full">
                      <Image
                        src={project.image_url}
                        alt={project.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  )}
                  <CardContent className="flex-1 p-4">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold line-clamp-1">
                          {project.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {project.description}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {project.technologies.map((tech) => (
                          <Badge
                            key={tech}
                            variant="secondary"
                            className="px-2 py-0.5"
                          >
                            {tech}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center justify-between pt-4">
                        <Button
                          variant="outline"
                          onClick={() => router.push(`/projects/${project.id}`)}
                          className="w-full"
                        >
                          View Project
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {projects.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                  <div className="rounded-full bg-muted p-4 mb-4">
                    <Rocket className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-lg font-medium">No projects yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Projects created by this user will appear here
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
