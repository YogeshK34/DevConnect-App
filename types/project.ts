export interface Project {
    id: string;
    title: string;
    description: string;
    technologies: string[];
    user_id: string;
    image_url?: string;
    created_at: string;
    updated_at: string;
    likes?: number;
}

