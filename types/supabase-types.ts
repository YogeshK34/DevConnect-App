export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    username: string | null
                    full_name: string | null
                    bio: string | null
                    avatar_url: string | null
                    background_url: string | null
                    website: string | null
                    created_at: string
                }
                Insert: {
                    id: string
                    username?: string | null
                    full_name?: string | null
                    bio?: string | null
                    avatar_url?: string | null
                    background_url?: string | null
                    website?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    username?: string | null
                    full_name?: string | null
                    bio?: string | null
                    avatar_url?: string | null
                    background_url?: string | null
                    website?: string | null
                    created_at?: string
                }
            }
            projects: {
                Row: {
                    id: string
                    created_at: string
                    title: string
                    description: string
                    technologies: string[]
                    user_id: string
                    image_url: string | null
                    likes: number
                }
                Insert: {
                    id?: string
                    created_at?: string
                    title: string
                    description: string
                    technologies: string[]
                    user_id: string
                    image_url?: string | null
                    likes?: number
                }
                Update: {
                    id?: string
                    created_at?: string
                    title?: string
                    description?: string
                    technologies?: string[]
                    user_id?: string
                    image_url?: string | null
                    likes?: number
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
    }
}

