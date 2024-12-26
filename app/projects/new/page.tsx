/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
// import { useUser } from '@clerk/nextjs'
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import type { Project } from "@/types/project";

export default function NewProjectPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [technologies, setTechnologies] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  // const { user } = useUser()

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Create a unique filename
      const fileExt = file.name.split(".").pop();
      const uniqueId = Math.random().toString(36).substring(2);
      const fileName = `${uniqueId}-${Date.now()}.${fileExt}`;

      // Upload directly to Supabase storage
      const { error: uploadError, data } = await supabase.storage
        .from("project-images")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw new Error("Failed to upload image");
      }

      if (data) {
        // Get the public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from("project-images").getPublicUrl(data.path);

        setUploadedImage(publicUrl);
        setImageError(null);
        toast({
          title: "Success",
          description: "Image uploaded successfully!",
        });
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      setImageError("Failed to upload image. Please try again.");
      toast({
        title: "Error",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to create a project",
        variant: "destructive",
      });
      return;
    }

    if (!uploadedImage) {
      setImageError("Please upload an image for your project");
      return;
    }

    setIsSubmitting(true);

    try {
      const projectData: Partial<Project> = {
        title,
        description,
        technologies: technologies.split(",").map((tech) => tech.trim()),
        user_id: user.id, // Using Supabase user.id instead of Clerk's
        image_url: uploadedImage,
      };

      const { data, error } = await supabase
        .from("projects")
        .insert([projectData])
        .select()
        .single();

      if (error) {
        console.error("Project creation error:", error);
        throw new Error("Failed to create project");
      }

      toast({
        title: "Success",
        description: "Project created successfully!",
      });

      router.push("/projects");
    } catch (error) {
      console.error("Error creating project:", error);
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Create New Project</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
        <div>
          <Label htmlFor="title">Project Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="description">Project Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="technologies">Technologies (comma-separated)</Label>
          <Input
            id="technologies"
            value={technologies}
            onChange={(e) => setTechnologies(e.target.value)}
            placeholder="React, Node.js, PostgreSQL"
            required
          />
        </div>

        <Card>
          <CardContent className="p-6">
            <Label>Project Image</Label>
            <div className="mt-4">
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                required
              />
              {imageError && (
                <p className="text-red-500 mt-2 text-sm">{imageError}</p>
              )}
              {uploadedImage && (
                <div className="mt-4 relative w-full h-48">
                  <Image
                    src={uploadedImage}
                    alt="Project preview"
                    fill
                    className="object-cover rounded-md"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Project"}
        </Button>
      </form>
    </div>
  );
}
