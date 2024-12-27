/* eslint-disable @typescript-eslint/no-unused-vars */
import { supabase } from '@/utils/supabase-utils'

export async function uploadProjectImage(file: File) {
    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('User not authenticated')

        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        // Include user ID in the path for RLS
        const filePath = `${user.id}/${fileName}`

        const { error: uploadError, data } = await supabase.storage
            .from('projects')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            })

        if (uploadError) {
            throw uploadError
        }

        const { data: { publicUrl } } = supabase.storage
            .from('projects')
            .getPublicUrl(filePath)

        return publicUrl
    } catch (error) {
        console.error('Error uploading image:', error)
        throw new Error(error instanceof Error ? error.message : 'Failed to upload image')
    }
}

