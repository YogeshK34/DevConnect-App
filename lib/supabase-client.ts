import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/supabase'

// Create a single Supabase client for client-side operations
export const supabase = createClientComponentClient<Database>()

