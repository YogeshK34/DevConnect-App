import { supabase } from '@/utils/supabase-utils'

export async function deleteProjectImage(imageUrl: string) {
    try {
        // Extract the path from the URL
        const url = new URL(imageUrl)
        const pathMatch = url.pathname.match(/projects\/([^?]+)/)
        if (!pathMatch) throw new Error('Invalid image URL')

        const filePath = pathMatch[1]
        const { error } = await supabase.storage
            .from('projects')
            .remove([filePath])

        if (error) throw error

        return true
    } catch (error) {
        console.error('Error deleting image:', error)
        return false
    }
}


