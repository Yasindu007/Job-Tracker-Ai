# Quick Start Guide

Get your Job Tracker AI application up and running in 5 minutes with Google Gemini and proper dark mode!

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database (or use a free cloud database)
- Google account for Gemini API

## Step 1: Clone and Install (2 minutes)

```bash
# Clone the repository
git clone <your-repo-url>
cd job-tracker-ai-assistant

# Install dependencies
npm install
```

## Step 2: Get Your Free Gemini API Key (1 minute)

1. Open [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy the key (starts with `AIza...`)

**That's it! No credit card required.**

## Step 3: Set Up Environment Variables (2 minutes)

```bash
# Copy the example env file
cp .env.example .env.local
```

Edit `.env.local` and add your keys:

```env
# Database (Required)
DATABASE_URL="postgresql://user:password@host:port/db"

# Stack Auth (Required for authentication)
# Get free keys from https://app.stack-auth.com/
NEXT_PUBLIC_STACK_PROJECT_ID="your-project-id"
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY="your-publishable-key"
STACK_SECRET_SERVER_KEY="your-secret-key"

# Google Gemini (Required for AI features)
GEMINI_API_KEY="your-gemini-api-key-here"
AI_PROVIDER="gemini"
AI_MODEL="gemini-pro"
```

### Quick Database Setup Options

**Option A: Free Cloud Database (Recommended)**

1. **Supabase** (Free tier):
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Get connection string from Settings > Database
   - Add `?sslmode=require` to the URL

2. **Neon** (Free tier):
   - Go to [neon.tech](https://neon.tech)
   - Create project
   - Copy connection string

**Option B: Local PostgreSQL**
```bash
# Install PostgreSQL locally
# Then use:
DATABASE_URL="postgresql://postgres:password@localhost:5432/jobtracker"
```

### Stack Auth Setup (Free)

1. Go to [stack-auth.com](https://app.stack-auth.com/)
2. Create new project
3. Copy the three keys to `.env.local`
4. Enable desired auth methods (Email, Google, GitHub, etc.)

## Step 4: Initialize Database (30 seconds)

```bash
npm run db:push
npm run db:generate
```

## Step 5: Start the App (10 seconds)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Step 6: Test Dark Mode

1. Sign up for an account
2. Click the moon/sun icon in the sidebar
3. Watch everything smoothly switch to dark mode!

## Step 7: Test Gemini AI

Try these features:

1. **Resume Analysis:**
   - Go to "Resume Assistant"
   - Upload a PDF/DOCX resume
   - Get AI-powered ATS score

2. **Job Fit Score:**
   - Add a job in Dashboard
   - Paste job description
   - Get instant fit score

3. **Interview Prep:**
   - Go to "Job Prep"
   - Paste a job posting
   - Get tailored interview questions

## Troubleshooting

### "Missing GEMINI_API_KEY" Error

**Solution:**
```bash
# 1. Check .env.local exists
ls -la .env.local

# 2. Verify the key is set
cat .env.local | grep GEMINI_API_KEY

# 3. Restart dev server
# Press Ctrl+C, then run:
npm run dev
```

### "Database connection failed"

**Solution:**
```bash
# Test your database connection
# Make sure DATABASE_URL is correct
# For cloud databases, ensure ?sslmode=require is added
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
```

### "Cannot find module" errors

**Solution:**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

### Dark mode not working

**Solution:**
1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard refresh (Ctrl+Shift+R)
3. Check browser console for errors

### Rate limit errors

**Solution:**
```
Gemini free tier limits:
- 60 requests per minute
- 1500 requests per day

If you hit the limit, wait or upgrade to paid tier.
```

## Environment Variables Cheat Sheet

### Required

| Variable | Where to Get | Notes |
|----------|-------------|-------|
| `DATABASE_URL` | Supabase/Neon/Local | Add `?sslmode=require` for cloud |
| `GEMINI_API_KEY` | [AI Studio](https://makersuite.google.com/app/apikey) | Free, no credit card |
| `NEXT_PUBLIC_STACK_PROJECT_ID` | [Stack Auth](https://app.stack-auth.com/) | Free auth service |
| `NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY` | Stack Auth | Same project |
| `STACK_SECRET_SERVER_KEY` | Stack Auth | Keep secret! |

### Optional

| Variable | Purpose | Default |
|----------|---------|---------|
| `AI_PROVIDER` | AI service to use | `gemini` |
| `AI_MODEL` | Model name | `gemini-pro` |
| `GOOGLE_CALENDAR_CLIENT_ID` | Calendar sync | Not set |
| `GOOGLE_CALENDAR_CLIENT_SECRET` | Calendar sync | Not set |

## Next Steps

1. **Customize Your Profile:**
   - Set your target job role
   - Add your skills
   - Complete profile setup

2. **Start Tracking Jobs:**
   - Add your first job application
   - Set interview dates
   - Enable calendar sync

3. **Optimize Your Resume:**
   - Upload current resume
   - Get ATS analysis
   - Download enhanced version

4. **Prepare for Interviews:**
   - Analyze job postings
   - Review interview questions
   - Identify skill gaps

## Pro Tips

### Dark Mode

- Toggle anytime with the moon/sun icon
- Preference is saved automatically
- Works across all pages

### Gemini AI

- More detailed prompts = better results
- Free tier is generous for personal use
- Responses typically in 1-2 seconds

### Calendar Sync

- Set up Google Calendar for auto-scheduling
- Interview reminders sent automatically
- One-click sync for interview status jobs

## Need Help?

1. **Documentation:**
   - Read `DARK_MODE_GEMINI_SETUP.md` for detailed guides
   - Check `README.md` for full feature list

2. **Common Issues:**
   - Most problems are environment variable related
   - Check `.env.local` syntax (no spaces around `=`)
   - Restart server after changing env vars

3. **Still Stuck?**
   - Check browser console for errors
   - Verify all API keys are valid
   - Make sure ports 3000 and 5432 are available

## Free Tier Limits

### Gemini API
- ✅ 60 requests/minute
- ✅ 1500 requests/day
- ✅ No credit card required
- ✅ Suitable for personal use

### Stack Auth
- ✅ 1,000 Monthly Active Users
- ✅ All features included
- ✅ Multiple OAuth providers

### Supabase Database
- ✅ 500 MB database
- ✅ 1 GB file storage
- ✅ 50,000 Monthly Active Users

## Success Checklist

- [ ] Node.js 18+ installed
- [ ] Repository cloned
- [ ] Dependencies installed (`npm install`)
- [ ] Database URL configured
- [ ] Stack Auth keys added
- [ ] Gemini API key added
- [ ] Database initialized (`npm run db:push`)
- [ ] Dev server running (`npm run dev`)
- [ ] Can access http://localhost:3000
- [ ] Can sign up/sign in
- [ ] Dark mode toggles correctly
- [ ] AI features work (upload resume test)

---

**Estimated Total Time:** 5-10 minutes
**Cost:** $0 (all free tiers)
**Difficulty:** Easy

Happy job hunting! 🎯
