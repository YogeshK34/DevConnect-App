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
            // Add other tables here as needed
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


