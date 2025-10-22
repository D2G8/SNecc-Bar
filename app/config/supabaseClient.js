import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_APP_SUPABASE_URL
const supabaseKey = process.env.

const supabase = createClient(supabaseUrl, supabaseKey)

export default supabase