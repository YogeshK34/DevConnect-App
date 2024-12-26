import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import clientPromise from '@/lib/mongodb'

export async function GET() {
    try {
        const { userId } = await auth()
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const client = await clientPromise
        const db = client.db("devconnect")

        const user = await db.collection('users').findOne({ id: userId })

        if (!user) {
            return new NextResponse("User not found", { status: 404 })
        }

        return NextResponse.json({ likedProjects: user.likedProjects || [] })
    } catch (error) {
        console.error('Error fetching liked projects:', error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}


