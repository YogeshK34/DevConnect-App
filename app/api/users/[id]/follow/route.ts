import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const supabase = createRouteHandlerClient({ cookies })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const followingId = params.id

    if (user.id === followingId) {
        return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 })
    }

    try {
        const { data, error } = await supabase
            .from('user_follows')
            .insert({ follower_id: user.id, following_id: followingId })
            .select()

        if (error) throw error

        return NextResponse.json({ message: "Successfully followed user", data })
    } catch (error) {
        console.error('Error following user:', error)
        return NextResponse.json({ error: "Failed to follow user" }, { status: 500 })
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const supabase = createRouteHandlerClient({ cookies })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const followingId = params.id

    try {
        const { error } = await supabase
            .from('user_follows')
            .delete()
            .match({ follower_id: user.id, following_id: followingId })

        if (error) throw error

        return NextResponse.json({ message: "Successfully unfollowed user" })
    } catch (error) {
        console.error('Error unfollowing user:', error)
        return NextResponse.json({ error: "Failed to unfollow user" }, { status: 500 })
    }
}

