# TODO: Integrate Login/Register with Supabase Database

## Steps to Complete

- [x] Install Supabase Dependency: Add @supabase/supabase-js to package.json and install it using pnpm.
- [x] Create Supabase Client: Create lib/supabase.ts to initialize the Supabase client with project URL and anon key.
- [x] Create Database Tables: Provide SQL script for creating 'users' and 'transactions' tables in Supabase (user runs this in Supabase dashboard).
- [x] Update Auth Logic: Refactor lib/auth.ts to use Supabase Auth and database instead of localStorage.
- [x] Update Login Page: Modify app/login/page.tsx to handle async login and Supabase errors.
- [x] Update Register Page: Modify app/register/page.tsx to handle async register and Supabase errors.
- [x] Testing: Run the app, test login/register, and verify data persists in Supabase.
