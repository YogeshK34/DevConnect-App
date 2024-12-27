/* eslint-disable @typescript-eslint/no-unused-vars */
import { supabase } from '@/utils/supabase-utils'

export async function uploadProfileImage(file: File, type: 'avatar' | 'background') {
    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('User not authenticated')

        const fileExt = file.name.split('.').pop()
        const fileName = `${type}_${Math.random()}.${fileExt}`
        // Store profile images in a profiles/ subdirectory within project-images bucket
        const filePath = `profiles/${user.id}/${fileName}`

        const { error: uploadError, data } = await supabase.storage
            .from('project-images')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: true // Allow overwriting existing files
            })

        if (uploadError) {
            throw uploadError
        }

        const { data: { publicUrl } } = supabase.storage
            .from('project-images')
            .getPublicUrl(filePath)

        return publicUrl
    } catch (error) {
        console.error('Error uploading image:', error)
        throw error
    }
}

