/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, Edit, Trash2, User } from "lucide-react";
import { supabase } from "@/utils/supabase-utils";
import { toast } from "@/hooks/use-toast";
import type { Project } from "@/types/project";
import type { Profile } from "@/types/profile";

export default function ProjectDetailsPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [project, setProject] = useState<Project | null>(null);
  const [creator, setCreator] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchProjectAndCreator();
  }, [projectId]);

  const fetchProjectAndCreator = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      const { data: project, error: projectError } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .single();

      if (projectError) throw projectError;

      setProject(project);

      // Fetch creator's profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", project.user_id)
        .single();

      if (profileError && profileError.code !== "PGRST116") {
        throw profileError;
      }

      setCreator(profile);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to load project details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    router.push(`/projects/${projectId}/edit`);
  };

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", projectId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Project deleted successfully",
      });
      router.push("/projects");
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to delete project",
        variant: "destructive",
      });
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
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-3xl font-bold">
                {project.title}
              </CardTitle>
              <CardDescription className="mt-2">
                {project.technologies.map((tech) => (
                  <Badge key={tech} variant="secondary" className="mr-2 mb-2">
                    {tech}
                  </Badge>
                ))}
              </CardDescription>
            </div>
            {user && user.id === project.user_id && (
              <div className="flex space-x-2">
                <Button variant="outline" size="icon" onClick={handleEdit}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {project.image_url && (
            <div className="relative w-full h-64 mb-6">
              <Image
                src={project.image_url}
                alt={project.title}
                fill
                className="object-cover rounded-md"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          )}
          <p className="text-lg mb-6">{project.description}</p>
          <div className="flex items-center justify-between text-sm text-muted-foreground border-t pt-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-4 w-4" />
              </div>
              <span>
                Created by{" "}
                {creator?.username || creator?.full_name || "Anonymous"}
              </span>
            </div>
            <span>{new Date(project.created_at).toLocaleDateString()}</span>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              project.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
