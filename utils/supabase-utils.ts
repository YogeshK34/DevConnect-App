'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/supabase-types'

export const supabase = createClientComponentClient<Database>()


