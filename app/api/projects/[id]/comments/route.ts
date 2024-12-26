import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import clientPromise from '@/lib/mongodb'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ObjectId } from 'mongodb'

export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const client = await clientPromise
        const db = client.db("devconnect")

        const comments = await db.collection('comments')
            .find({ projectId: params.id })
            .sort({ createdAt: -1 })
            .toArray()

        return NextResponse.json(comments)
    } catch (error) {
        console.error('Error fetching comments:', error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const data = await request.json()
        const client = await clientPromise
        const db = client.db("devconnect")

        const newComment = {
            projectId: params.id,
            userId: data.userId,
            username: data.username,
            content: data.content,
            createdAt: new Date()
        }

        const result = await db.collection('comments').insertOne(newComment)
        const insertedComment = await db.collection('comments').findOne({ _id: result.insertedId })

        return NextResponse.json(insertedComment)
    } catch (error) {
        console.error('Error creating comment:', error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}


