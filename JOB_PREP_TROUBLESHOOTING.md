# Job Prep Assistant - Troubleshooting Internal Server Error

## Common Causes and Solutions

### 1. Missing Gemini API Key (Most Common)

**Symptoms:**
- Internal server error when analyzing job posting
- Error message: "Missing GEMINI_API_KEY"

**Solution:**
```env
# Check your .env.local file has:
GEMINI_API_KEY=your-api-key-here
AI_PROVIDER=gemini
AI_MODEL=gemini-pro
```

**Steps:**
1. Verify `.env.local` exists in project root
2. Check the keys are correct (no quotes, no spaces)
3. Restart your dev server after adding keys

### 2. Invalid Gemini API Key

**Symptoms:**
- Error message mentions "API error" or "invalid key"
- Status code 401 or 403 from Gemini API

**Solution:**
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Verify your API key is active
3. Generate a new key if needed
4. Update `.env.local` with the new key

### 3. Database Connection Issue

**Symptoms:**
- Error mentions "prisma" or "database"
- User profile lookup fails

**Solution:**
1. Check your `DATABASE_URL` in `.env.local`
2. Verify database is running and accessible
3. Run migrations: `npm run db:push`
4. Test connection: `npm run db:studio`

### 4. User Not Found in Database

**Symptoms:**
- Error when fetching user profile
- User exists in Stack Auth but not in database

**Solution:**
1. Make sure user completed profile setup
2. Check database has user record
3. Try signing out and back in
4. Complete profile setup if prompted

### 5. Gemini API Rate Limits

**Symptoms:**
- Works sometimes, fails other times
- Error mentions "quota" or "rate limit"

**Solution:**
1. Wait a few minutes and try again
2. Check your Gemini API quota limits
3. For free tier: 60 requests/minute
4. Consider upgrading to Pro for higher limits

## How to Debug

### Check Server Logs

1. Look at your terminal where `npm run dev` is running
2. Check for detailed error messages
3. Look for stack traces that show where it failed

### Check Browser Console

1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for error messages
4. Check Network tab for failed API calls

### Test API Directly

You can test the API endpoint directly:

```bash
# Using curl (replace with your actual values)
curl -X POST http://localhost:3000/api/job-prep/analyze \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{"jobPostingText":"Software Engineer position..."}'
```

### Verify Environment Variables

Create a test script or check in your code:

```typescript
// Add temporarily to see if keys are loaded
console.log('Gemini Key exists:', !!process.env.GEMINI_API_KEY)
console.log('AI Provider:', process.env.AI_PROVIDER)
console.log('AI Model:', process.env.AI_MODEL)
```

## Step-by-Step Fix

1. **Check Gemini API Key:**
   ```bash
   # In your project root
   cat .env.local | grep GEMINI
   # Should show:
   # GEMINI_API_KEY=AIza...
   ```

2. **Verify API Key Works:**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Test the key in their playground

3. **Restart Dev Server:**
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

4. **Clear Browser Cache:**
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   - Or clear browser cache completely

5. **Check Database:**
   ```bash
   npm run db:studio
   # Verify user exists and has skills/job role set
   ```

## Updated Error Messages

The code now provides more specific error messages:
- "Gemini API key is missing" - Check your `.env.local`
- "Gemini API error" - Check your API key validity
- "Database error" - Check your database connection
- Generic errors will show the actual error message

## Still Not Working?

1. **Share the exact error message** from:
   - Browser console (F12 → Console)
   - Server terminal logs
   - Network tab (F12 → Network → Failed request)

2. **Verify all environment variables:**
   - Stack Auth keys (for authentication)
   - Database URL (for data storage)
   - Gemini API key (for AI features)

3. **Try a minimal test:**
   - Use a very short job posting text
   - Check if it's a length/encoding issue

