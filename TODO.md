# Integrate Supabase Authentication

## Tasks
- [x] Consolidate Supabase client files (remove duplicates lib/supabase.ts and lib/supabaseClient.ts, use app/config/supabaseClient.ts)
- [x] Update lib/auth.ts to use Supabase auth:
  - Replace localStorage user functions with Supabase equivalents
  - Implement signUp with profile insertion
  - Implement signIn
  - Implement getCurrentUser using session and users table
  - Implement logout
  - Handle admin role based on email
- [x] Update app/login/page.tsx to use new login function
- [x] Update app/register/page.tsx to use new register function
- [ ] Add auth context or hook for session management in layout.tsx
- [ ] Test login and register functionality
