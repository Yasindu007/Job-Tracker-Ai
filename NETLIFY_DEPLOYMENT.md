# Deploying to Netlify with Gemini Pro

This guide explains how to configure your Gemini Pro API keys in Netlify for production deployment.

## Step-by-Step Instructions

### 1. Access Your Netlify Dashboard

1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Sign in to your account
3. Select your site (or create a new one)

### 2. Navigate to Environment Variables

1. In your site dashboard, go to **Site settings** (top menu)
2. Click on **Environment variables** in the left sidebar
3. You'll see a section for both **Build settings** and **Deploy settings**

### 3. Add Gemini Pro Environment Variables

Click **Add a variable** and add these three variables:

#### Required Variables for Gemini Pro:

**Variable 1:**
- **Key:** `GEMINI_API_KEY`
- **Value:** Your Gemini API key (starts with `AIza...`)
- **Scopes:** Select both "Builds" and "Deploys" (or just "All scopes")

**Variable 2:**
- **Key:** `AI_PROVIDER`
- **Value:** `gemini`
- **Scopes:** Select both "Builds" and "Deploys"

**Variable 3:**
- **Key:** `AI_MODEL`
- **Value:** `gemini-pro` (or `gemini-1.5-flash` for free tier)
- **Scopes:** Select both "Builds" and "Deploys"

### 4. Visual Guide

```
┌─────────────────────────────────────────┐
│ Environment variables                   │
├─────────────────────────────────────────┤
│                                         │
│  Key                Value               │
│  ────────────────────────────────────── │
│  GEMINI_API_KEY     AIzaSy...          │
│  AI_PROVIDER        gemini              │
│  AI_MODEL           gemini-pro          │
│                                         │
│  [Add a variable]                      │
└─────────────────────────────────────────┘
```

### 5. Other Required Environment Variables

Make sure you also have these set (if not already):

#### Database:
- `DATABASE_URL` - Your PostgreSQL connection string

#### Authentication (Stack Auth):
- `NEXT_PUBLIC_STACK_PROJECT_ID`
- `NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY`
- `STACK_SECRET_SERVER_KEY`

#### Application URL:
- `NEXTAUTH_URL` - Your Netlify site URL (e.g., `https://your-site.netlify.app`)

### 6. Save and Redeploy

1. Click **Save** after adding all variables
2. Go to **Deploys** tab
3. Click **Trigger deploy** → **Deploy site** (or push to your connected Git repository)

### 7. Verify Setup

After deployment, verify Gemini is working:

1. Visit your deployed site
2. Go to the Resume Assistant page
3. Upload a resume and try to analyze it
4. Check the browser console for any errors (F12 → Console)

## Quick Copy-Paste for Netlify UI

When adding variables in Netlify, you can copy these directly:

```
GEMINI_API_KEY = AIzaSy...your-key-here
AI_PROVIDER = gemini
AI_MODEL = gemini-pro
```

## Environment Variable Scope

- **All scopes**: Variable available in both builds and runtime
- **Builds only**: Only during build time (not recommended for API keys)
- **Deploys only**: Only at runtime (recommended for sensitive keys like API keys)

**Recommendation:** Use "All scopes" for `GEMINI_API_KEY`, `AI_PROVIDER`, and `AI_MODEL`

## Getting Your Gemini API Key

If you don't have a Gemini API key yet:

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy the key (it starts with `AIza...`)
5. Paste it as the value for `GEMINI_API_KEY` in Netlify

## Troubleshooting

### Issue: "Missing GEMINI_API_KEY" error

**Solution:**
- Make sure the variable name is exactly `GEMINI_API_KEY` (case-sensitive)
- Check that it's set for the correct scope (should be "All scopes" or "Deploys")
- Redeploy your site after adding the variable

### Issue: Gemini API errors in production

**Solution:**
- Verify your API key is valid and has Pro access (if using Pro)
- Check that `AI_MODEL` matches your account tier:
  - `gemini-pro` for Pro accounts
  - `gemini-1.5-flash` for free tier
- Verify your API key hasn't exceeded rate limits

### Issue: Variables not available after deploy

**Solution:**
- Environment variables are set during deploy
- You must trigger a new deploy after adding variables
- Check the deploy logs to confirm variables are loaded

## Security Best Practices

1. **Never commit API keys** to Git
2. **Use Netlify's environment variables** for all secrets
3. **Restrict API key permissions** in Google AI Studio if possible
4. **Rotate keys periodically** if compromised
5. **Use different keys** for development and production

## Netlify Build Settings

Make sure your Netlify build settings are configured:

**Build command:**
```bash
npm run build
```

**Publish directory:**
```
.next
```

**Node version:**
```
18.x or 20.x
```

## Additional Notes

- Environment variables are encrypted at rest in Netlify
- Variables can be different per branch (production, preview, etc.)
- You can update variables without redeploying (for some variables)
- Changes to environment variables require a new deploy to take effect

