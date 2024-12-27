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
import { Heart, Eye } from "lucide-react";
import { Project } from "@/types/project";
import { motion } from "framer-motion";

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
      const response = await fetch(`/api/projects/${project.id}/like`, {
        method: "POST",
      });
      if (response.ok) {
        setLiked(!liked);
        onLike(project.id);
      }
    } catch (error) {
      console.error("Error liking project:", error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
        {project.image_url && (
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
          <CardTitle className="text-xl font-semibold line-clamp-1">
            {project.title}
          </CardTitle>
          <CardDescription className="flex flex-wrap gap-2 mt-2">
            {project.technologies.map((tech, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tech}
              </Badge>
            ))}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {project.description}
          </p>
          <div className="flex justify-between items-center mt-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/projects/${project.id}`)}
            >
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Button>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" onClick={handleLike}>
                <Heart
                  className={`h-4 w-4 ${
                    liked
                      ? "fill-red-500 text-red-500"
                      : "text-muted-foreground"
                  }`}
                />
              </Button>
              <span className="text-sm text-muted-foreground">
                {project.likes || 0}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
