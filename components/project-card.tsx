import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart } from "lucide-react";
import { Project } from "@/types/project";

interface ProjectCardProps {
  project: Project;
  isLiked: boolean;
  onLike: (projectId: string) => void;
}

export function ProjectCard({ project, isLiked, onLike }: ProjectCardProps) {
  const [liked, setLiked] = useState(isLiked);
  const router = useRouter();

  const handleLike = async () => {
    try {
      const response = await fetch(`/api/projects/${project._id}/like`, {
        method: "POST",
      });
      if (response.ok) {
        setLiked(!liked);
        onLike(project._id);
      }
    } catch (error) {
      console.error("Error liking project:", error);
    }
  };

  return (
    <Card className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {project.imageUrl && (
        <div className="relative w-full h-48">
          <Image
            src={project.imageUrl}
            alt={project.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      )}
      <CardHeader>
        <CardTitle className="text-xl font-semibold">{project.title}</CardTitle>
        <CardDescription className="text-sm text-gray-500 dark:text-gray-400">
          {project.technologies.map((tech, index) => (
            <Badge key={index} variant="secondary" className="mr-1 mb-1">
              {tech}
            </Badge>
          ))}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
          {project.description}
        </p>
        <div className="flex justify-between items-center mt-auto">
          <Button
            variant="outline"
            onClick={() => router.push(`/projects/${project._id}`)}
          >
            View Details
          </Button>
          <Button variant="ghost" onClick={handleLike}>
            <Heart
              className={`h-5 w-5 ${
                liked ? "fill-red-500 text-red-500" : "text-gray-500"
              }`}
            />
          </Button>
          <span className="text-sm text-gray-400 dark:text-gray-500">
            {new Date(project.createdAt).toLocaleDateString()}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
