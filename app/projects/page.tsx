/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Rocket, Search, Plus, Loader2 } from "lucide-react";
import { supabase } from "@/utils/supabase-utils";
import type { Project } from "@/types/project";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      if (!user) {
        router.push("/auth/sign-in");
      } else {
        fetchProjects();
      }
    };

    checkUser();
  }, [router]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setProjects(data || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(
    (project) =>
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.technologies.some((tech) =>
        tech.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  const isValidImageUrl = (url: string | null) => {
    if (!url) return false;
    return url.startsWith("http://") || url.startsWith("https://");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-primary mb-4 md:mb-0">
          <Rocket className="inline-block mr-2 h-8 w-8" />
          Explore Projects
        </h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search projects or technologies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full md:w-64"
            />
          </div>
          <Link href="/projects/new" passHref>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> New Project
            </Button>
          </Link>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <Card
            key={project.id}
            className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow duration-300"
          >
            {project.image_url && isValidImageUrl(project.image_url) && (
              <div className="relative w-full h-48">
                <Image
                  src={project.image_url}
                  alt={project.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-xl font-semibold">
                {project.title}
              </CardTitle>
              <CardDescription className="flex flex-wrap gap-2">
                {project.technologies.map((tech) => (
                  <Badge key={tech} variant="secondary">
                    {tech}
                  </Badge>
                ))}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-muted-foreground mb-4 line-clamp-3">
                {project.description}
              </p>
              <div className="flex justify-between items-center mt-auto">
                <Button
                  variant="outline"
                  onClick={() => router.push(`/projects/${project.id}`)}
                >
                  View Details
                </Button>
                <span className="text-sm text-muted-foreground">
                  {new Date(project.created_at).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <p className="text-xl text-muted-foreground">
            No projects found. Try a different search or create a new project!
          </p>
        </div>
      )}
    </div>
  );
}
