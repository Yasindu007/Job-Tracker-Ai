# Fixing Stack Auth Configuration Error

## Error Message
```
KnownError<INVALID_PUBLISHABLE_CLIENT_KEY>: The publishable key is not valid for the project "a81352d3-d3d8-4941-bc48-6573db6993a6"
```

## What This Means
Your `NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY` doesn't match your `NEXT_PUBLIC_STACK_PROJECT_ID`. They must belong to the same Stack Auth project.

## Solution Steps

### Option 1: Verify and Update Keys (Recommended)

1. **Go to Stack Auth Dashboard**
   - Visit https://app.stack-auth.com/
   - Sign in to your account
   - Select the project with ID: `a81352d3-d3d8-4941-bc48-6573db6993a6`

2. **Copy the Correct Keys**
   - In your project dashboard, go to **Settings** or **API Keys**
   - You should see:
     - **Project ID** (should match: `a81352d3-d3d8-4941-bc48-6573db6993a6`)
     - **Publishable Client Key** (starts with something like `pk_...`)
     - **Secret Server Key** (starts with `sk_...`)

3. **Update Your Environment Variables**

   **Local Development (`.env.local`):**
   ```env
   NEXT_PUBLIC_STACK_PROJECT_ID=a81352d3-d3d8-4941-bc48-6573db6993a6
   NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=pk_...your-correct-key
   STACK_SECRET_SERVER_KEY=sk_...your-secret-key
   ```

   **Netlify (if deployed):**
   - Go to Site Settings → Environment Variables
   - Update:
     - `NEXT_PUBLIC_STACK_PROJECT_ID` = `a81352d3-d3d8-4941-bc48-6573db6993a6`
     - `NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY` = Your correct publishable key
     - `STACK_SECRET_SERVER_KEY` = Your secret key

4. **Restart Your Dev Server**
   ```bash
   # Stop the server (Ctrl+C)
   # Then restart
   npm run dev
   ```

### Option 2: Create a New Stack Auth Project

If you don't have access to the project or want to start fresh:

1. **Create New Project**
   - Go to https://app.stack-auth.com/
   - Click **"Create New Project"**
   - Give it a name (e.g., "Job Tracker AI")

2. **Copy New Keys**
   - After creating, copy all three keys:
     - Project ID
     - Publishable Client Key
     - Secret Server Key

3. **Update Environment Variables**
   - Replace all three Stack Auth variables in `.env.local` with the new keys

4. **Restart Dev Server**

### Option 3: Use Development Keys (Quick Test)

If you just need to test locally, Stack Auth provides test keys:

1. Check the Stack Auth documentation for test/development keys
2. Or create a new project specifically for development

## Verification Checklist

After updating, verify:

- [ ] `NEXT_PUBLIC_STACK_PROJECT_ID` matches the project ID in Stack Auth dashboard
- [ ] `NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY` is from the same project
- [ ] `STACK_SECRET_SERVER_KEY` is from the same project
- [ ] All keys are copied correctly (no extra spaces, quotes removed if needed)
- [ ] `.env.local` file exists in project root
- [ ] Dev server has been restarted after changes

## Common Mistakes

1. **Extra Quotes**: Don't include quotes in `.env.local`:
   ```env
   # ❌ Wrong
   NEXT_PUBLIC_STACK_PROJECT_ID="a81352d3-d3d8-4941-bc48-6573db6993a6"
   
   # ✅ Correct
   NEXT_PUBLIC_STACK_PROJECT_ID=a81352d3-d3d8-4941-bc48-6573db6993a6
   ```

2. **Wrong Project**: Using keys from different Stack Auth projects

3. **Expired Keys**: Keys might have been regenerated or revoked

4. **Missing Keys**: Not all three keys are set

## Testing the Fix

1. Clear browser cache and cookies
2. Restart your dev server
3. Try accessing the app again
4. Check browser console (F12) for any remaining errors

## Still Having Issues?

1. **Double-check Stack Auth Dashboard**
   - Make sure you're logged into the correct account
   - Verify the project exists and is active

2. **Check Environment Variables**
   ```bash
   # In your project root, verify .env.local exists:
   cat .env.local
   
   # Or on Windows:
   type .env.local
   ```

3. **Restart Everything**
   - Stop dev server completely
   - Clear Next.js cache: `rm -rf .next` (or delete `.next` folder)
   - Restart: `npm run dev`

4. **Check Stack Auth Status**
   - Visit https://status.stack-auth.com/ to ensure service is up

