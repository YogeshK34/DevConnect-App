import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const next = requestUrl.searchParams.get('next') || '/projects'

    if (code) {
        const supabase = createRouteHandlerClient({ cookies })
        await supabase.auth.exchangeCodeForSession(code)
    }

    // Redirect to the specified next URL or default to /projects
    return NextResponse.redirect(new URL(next, requestUrl.origin))
}

