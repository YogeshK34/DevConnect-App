"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
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
  const { user } = useUser();

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        if (data.imageUrl) {
          setUploadedImage(data.imageUrl);
          setImageError(null);
        } else {
          throw new Error("No image URL returned from server");
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to upload image");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      setImageError(
        error instanceof Error
          ? error.message
          : "Failed to upload image. Please try again."
      );
    }
  };

  const validateImageUrl = useCallback((url: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = document.createElement("img");
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });
  }, []);

  const handleImageUrlChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const url = e.target.value;
    setImageUrl(url);
    if (url) {
      try {
        const isValid = await validateImageUrl(url);
        if (isValid) {
          setUploadedImage(url);
          setImageError(null);
        } else {
          setUploadedImage(null);
          setImageError("Invalid image URL. Please enter a valid image URL.");
        }
      } catch (error) {
        console.error("Error validating image URL:", error);
        setUploadedImage(null);
        setImageError("Error validating image URL. Please try again.");
      }
    } else {
      setUploadedImage(null);
      setImageError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("You must be logged in to create a project");
      return;
    }

    if (!uploadedImage) {
      setImageError("Please upload an image or provide a valid image URL");
      return;
    }

    setIsSubmitting(true);

    try {
      const projectData: Partial<Project> = {
        title,
        description,
        technologies: technologies.split(",").map((tech) => tech.trim()),
        userId: user.id,
        imageUrl: uploadedImage,
      };

      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(projectData),
      });

      if (response.ok) {
        router.push("/projects");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create project");
      }
    } catch (error) {
      console.error("Error creating project:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to create project. Please try again."
      );
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
            placeholder="React, Node.js, MongoDB"
            required
          />
        </div>

        <Card>
          <CardContent className="p-6">
            <Label>Project Image</Label>
            <Tabs defaultValue="upload" className="mt-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload">Upload Image</TabsTrigger>
                <TabsTrigger value="url">Image URL</TabsTrigger>
              </TabsList>
              <TabsContent value="upload" className="space-y-4">
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                  />
                </div>
              </TabsContent>
              <TabsContent value="url" className="space-y-4">
                <Input
                  type="url"
                  placeholder="Enter image URL"
                  value={imageUrl}
                  onChange={handleImageUrlChange}
                />
              </TabsContent>
            </Tabs>
            {imageError && <p className="text-red-500 mt-2">{imageError}</p>}
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
          </CardContent>
        </Card>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Project"}
        </Button>
      </form>
    </div>
  );
}
