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
import { Eye, GitBranch, Clock } from "lucide-react";
import { Project } from "@/types/project";
import { motion } from "framer-motion";

interface ProjectCardProps {
  project: Project;
  view: "grid" | "list";
}

export function ProjectCard({ project, view }: ProjectCardProps) {
  const router = useRouter();

  if (view === "list") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="hover:shadow-md transition-all duration-300">
          <CardContent className="flex items-center p-4">
            <div className="flex-grow flex items-center gap-4">
              {project.image_url ? (
                <div className="relative w-12 h-12 rounded-md overflow-hidden flex-shrink-0">
                  <Image
                    src={project.image_url}
                    alt={project.title}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <GitBranch className="h-6 w-6 text-primary" />
                </div>
              )}
              <div className="min-w-0 flex-grow">
                <h3 className="font-semibold text-lg truncate">
                  {project.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {project.description}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-1" />
                    {new Date(project.created_at).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    {project.technologies.slice(0, 3).map((tech) => (
                      <Badge key={tech} variant="secondary" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                    {project.technologies.length > 3 && (
                      <span className="text-xs text-muted-foreground">
                        +{project.technologies.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/projects/${project.id}`)}
              >
                <Eye className="h-4 w-4 mr-2" />
                View
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

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
            {project.technologies.map((tech) => (
              <Badge key={tech} variant="secondary" className="text-xs">
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
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
