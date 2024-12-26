import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { PullOperator } from 'mongodb' // Import PullOperator

interface Document {
    likedProjects: string[];
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 })
        }


        const client = await clientPromise
        const db = client.db("devconnect")

        const projectId = new ObjectId(params.id)

        const user = await db.collection('users').findOne({ id: userId })

        if (!user) {
            return new NextResponse("User not found", { status: 404 })
        }

        const likedProjects = user.likedProjects || []

        if (likedProjects.includes(projectId.toString())) {
            // Unlike the project
            await db.collection('users').updateOne(
                { id: userId },
                { $pull: { likedProjects: projectId.toString() } as PullOperator<Document> } // Updated line
            )
            await db.collection('projects').updateOne(
                { _id: projectId },
                { $inc: { likes: -1 } }
            )
        } else {
            // Like the project
            await db.collection('users').updateOne(
                { id: userId },
                { $addToSet: { likedProjects: projectId.toString() } }
            )
            await db.collection('projects').updateOne(
                { _id: projectId },
                { $inc: { likes: 1 } }
            )
        }

        return new NextResponse("Success", { status: 200 })
    } catch (error) {
        console.error('Error liking/unliking project:', error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}

