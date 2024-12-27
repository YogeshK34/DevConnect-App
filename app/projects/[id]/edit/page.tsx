/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Loader2, Upload } from "lucide-react";
import { supabase } from "@/utils/supabase-utils";
import { uploadProjectImage } from "@/utils/upload";
import type { Project } from "@/types/project";

export default function EditProjectPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/sign-in");
        return;
      }

      const { data: project, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .single();

      if (error) throw error;

      if (project.user_id !== user.id) {
        toast({
          title: "Unauthorized",
          description: "You can only edit your own projects",
          variant: "destructive",
        });
        router.push("/projects");
        return;
      }

      setProject(project);
      setPreviewUrl(project.image_url);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to load project",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!project) return;

    setUpdating(true);
    try {
      let imageUrl = project.image_url;

      if (imageFile) {
        // Upload new image if selected
        imageUrl = await uploadProjectImage(imageFile);
      }

      const { error } = await supabase
        .from("projects")
        .update({
          title: project.title,
          description: project.description,
          technologies: project.technologies,
          image_url: imageUrl,
        })
        .eq("id", projectId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Project updated successfully",
      });
      router.push(`/projects/${projectId}`);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to update project",
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

  if (!project) {
    return <div className="text-center mt-8">Project not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Edit Project</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Project Title</Label>
              <Input
                id="title"
                value={project.title}
                onChange={(e) =>
                  setProject((prev) =>
                    prev ? { ...prev, title: e.target.value } : null
                  )
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={project.description}
                onChange={(e) =>
                  setProject((prev) =>
                    prev ? { ...prev, description: e.target.value } : null
                  )
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="technologies">
                Technologies (comma-separated)
              </Label>
              <Input
                id="technologies"
                value={project.technologies.join(", ")}
                onChange={(e) =>
                  setProject((prev) =>
                    prev
                      ? {
                          ...prev,
                          technologies: e.target.value
                            .split(",")
                            .map((tech) => tech.trim()),
                        }
                      : null
                  )
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image">Project Image</Label>
              <div className="flex flex-col gap-4">
                {previewUrl && (
                  <div className="relative w-full h-48">
                    <Image
                      src={previewUrl}
                      alt="Project preview"
                      fill
                      className="object-cover rounded-md"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                )}
                <div className="flex items-center gap-4">
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("image")?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Choose Image
                  </Button>
                  {imageFile && (
                    <span className="text-sm text-muted-foreground">
                      Selected: {imageFile.name}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-4">
              <Button type="submit" disabled={updating}>
                {updating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Project"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/projects/${projectId}`)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
