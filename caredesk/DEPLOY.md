# CareDesk — Deploy to Vercel

## Step 1 — Push to GitHub
```bash
git init
git config user.name "Your Name"
git config user.email "your@email.com"
git add .
git commit -m "CareDesk v1.0 — full clinic management system"
git remote add origin https://github.com/Sathwik-0/caredesk.git
git push --force origin master
```

## Step 2 — Deploy on Vercel
1. Go to vercel.com → Import your caredesk GitHub repo
2. Add these Environment Variables:

| Key | Value |
|-----|-------|
| NEXT_PUBLIC_SUPABASE_URL | https://zsksljimorfezsnlklqs.supabase.co |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | eyJhbGci... (from .env.local) |
| SUPABASE_SERVICE_ROLE_KEY | eyJhbGci... (from .env.local) |
| RESEND_API_KEY | re_i5Lx7Tse... |
| RESEND_FROM_EMAIL | onboarding@resend.dev |
| NEXT_PUBLIC_APP_URL | https://caredesk-ten.vercel.app |

3. Click Deploy

## First Login
1. Visit /auth/signup
2. Create account with role: Admin
3. Go to /admin → Add doctors → Patients can register & book
