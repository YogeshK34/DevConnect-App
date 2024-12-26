/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import clientPromise from '@/lib/mongodb'
import type { Project } from '@/types/project'
import { ObjectId } from 'mongodb'

export async function POST(request: Request) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const data = await request.json()
        console.log('Creating project with data:', data) // Debug log

        const client = await clientPromise
        const db = client.db("devconnect")

        const newProject: Omit<Project, '_id'> = {
            ...data,
            userId,
            imageUrl: data.imageUrl, // Explicitly include imageUrl
            createdAt: new Date(),
            updatedAt: new Date()
        }

        const result = await db.collection('projects').insertOne(newProject)
        const insertedProject = await db.collection('projects').findOne({ _id: result.insertedId })

        console.log('Created project:', insertedProject) // Debug log
        return NextResponse.json(insertedProject)
    } catch (error) {
        console.error('Error creating project:', error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}

export async function GET(request: Request) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const client = await clientPromise
        const db = client.db("devconnect")

        const projects = await db.collection('projects')
            .find({})
            .sort({ createdAt: -1 })
            .toArray()

        return NextResponse.json(projects)
    } catch (error) {
        console.error('Error fetching projects:', error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}

