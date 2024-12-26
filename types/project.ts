import { ObjectId } from 'mongodb'

export interface Project {
    _id: string | ObjectId
    title: string
    description: string
    technologies: string[]
    userId: string
    imageUrl?: string
    createdAt: Date
    updatedAt: Date
}

