import { NextRequest, NextResponse } from 'next/server'

declare module 'next/server' {
    export interface RouteHandlerContext<Params extends Record<string, string | string[]> = Record<string, string | string[]>> {
        params: Params;
    }

    export type NextRouteHandler<
        TParams extends Record<string, string | string[]> = Record<string, string | string[]>
    > = (
        request: NextRequest,
        context: RouteHandlerContext<TParams>
    ) => Promise<NextResponse> | NextResponse;
}


