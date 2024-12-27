/* eslint-disable @typescript-eslint/no-unused-vars */
import { supabase } from '@/utils/supabase-utils'

export async function initializeStorage() {
    try {
        // Check if bucket exists
        const { data: buckets } = await supabase.storage.listBuckets()
        const projectsBucket = buckets?.find(b => b.name === 'projects')

        if (!projectsBucket) {
            // Create the bucket if it doesn't exist
            const { data, error } = await supabase.storage.createBucket('projects', {
                public: true,
                fileSizeLimit: 5242880, // 5MB
            })

            if (error) {
                throw error
            }

            // Set up bucket policies
            const { error: policyError } = await supabase.rpc('create_storage_policy', {
                bucket_name: 'projects'
            })

            if (policyError) {
                console.error('Error setting up bucket policies:', policyError)
            }
        }

        return true
    } catch (error) {
        console.error('Error initializing storage:', error)
        return false
    }
}


