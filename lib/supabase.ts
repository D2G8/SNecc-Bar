import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://pzhlayhkmqsfewgwynir.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6aGxheWhrbXFzZmV3Z3d5bmlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2NTI5MTAsImV4cCI6MjA3NjIyODkxMH0.E9BF5yz48Kh3FLIn6nvSNzWL23Mh6hR7hX6Rz21lxiA'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
