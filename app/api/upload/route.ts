import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import cloudinary from '@/lib/cloudinary'

export async function POST(request: Request) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const formData = await request.formData()
        const file = formData.get('file') as File

        if (!file) {
            return new NextResponse("No file provided", { status: 400 })
        }

        // Convert File to Buffer
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Upload to Cloudinary
        const uploadPromise = new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: "devconnect",
                    resource_type: "auto",
                },
                (error, result) => {
                    if (error) reject(error)
                    else resolve(result)
                }
            )

            // Write buffer to stream
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const bufferStream = require('stream').Readable.from(buffer)
            bufferStream.pipe(uploadStream)
        })

        const result = await uploadPromise as { secure_url: string }

        return NextResponse.json({
            imageUrl: result.secure_url,
            success: true
        })

    } catch (error) {
        console.error('Error uploading file:', error)
        return NextResponse.json({
            error: 'Failed to upload image',
            success: false
        }, { status: 500 })
    }
}

