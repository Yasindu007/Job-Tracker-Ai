# Dark Mode & Google Gemini Setup Guide

This guide explains the changes made to implement proper dark mode support and replace OpenAI with Google Gemini.

## Dark Mode Implementation

### CSS Variables Updated

The dark mode colors have been updated in `app/globals.css` to provide better visibility and contrast:

**Before (too dark):**
```css
.dark {
  --background: 222.2 84% 4.9%;  /* Almost black */
  --card: 222.2 84% 4.9%;         /* Almost black */
  /* Other variables... */
}
```

**After (improved visibility):**
```css
.dark {
  --background: 222.2 47% 11%;   /* Dark gray-blue */
  --card: 222.2 47% 15%;          /* Slightly lighter for cards */
  --muted: 217.2 32.6% 20%;      /* Visible muted elements */
  --border: 217.2 32.6% 25%;      /* Clear borders */
  /* Other variables... */
}
```

### Components Updated for Dark Mode

The following components now fully support dark mode:

1. **Navigation** (`components/navigation.tsx`)
   - Sidebar backgrounds
   - Text colors
   - Hover states
   - Border colors
   - User profile section

2. **Dashboard** (`components/dashboard.tsx`)
   - Page background
   - Header
   - Stats cards
   - Job list

3. **Landing Page** (`components/landing-page.tsx`)
   - Hero section
   - Features
   - Benefits
   - Footer

4. **Job Card** (`components/job-card.tsx`)
   - Card background
   - Text colors
   - Icons and buttons

5. **Job Form** (`components/job-form.tsx`)
   - Modal background
   - Form labels
   - Input fields
   - Borders

6. **Toast Notifications** (`app/layout.tsx`)
   - Now use CSS variables for theming
   - Automatically adapt to dark/light mode

### Testing Dark Mode

1. Open the application
2. Click the sun/moon icon in the navigation sidebar
3. Verify all elements are visible and have proper contrast
4. Test on different pages: Dashboard, Resume, Job Prep, Analytics

## Google Gemini Integration

### Why Replace OpenAI?

- Google Gemini offers a generous free tier
- Competitive performance
- Easy API access
- No credit card required for getting started

### Changes Made

#### 1. AI Service Layer (`lib/ai-service.ts`)

**New Gemini Implementation:**
```typescript
private async callGemini(prompt: string): Promise<string> {
  if (!this.config.apiKey) {
    throw new Error('Missing GEMINI_API_KEY. Set it in your environment variables.')
  }

  const model = this.config.model || 'gemini-pro'
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.config.apiKey}`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000,
      }
    }),
  })

  const data = await response.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text || ''
}
```

**Updated Factory Function:**
```typescript
export function createAIService(): AIService {
  const envProvider = process.env.AI_PROVIDER || 'gemini'  // Default to Gemini
  
  switch (envProvider.toLowerCase()) {
    case 'gemini':
    case 'google':
      apiKey = process.env.GEMINI_API_KEY
      model = process.env.AI_MODEL || 'gemini-pro'
      break
    // ... other providers
  }
}
```

#### 2. Type Definitions (`types/index.ts`)

Updated to include Gemini:
```typescript
export interface AIServiceConfig {
  provider: 'huggingface' | 'together' | 'gemini' | 'ollama';
  apiKey?: string;
  model?: string;
  baseUrl?: string;
}
```

#### 3. Package Dependencies (`package.json`)

Added Google Generative AI SDK:
```json
"dependencies": {
  "@google/generative-ai": "^0.1.3",
  // ... other dependencies
}
```

### Setting Up Google Gemini

#### Step 1: Get Your API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

#### Step 2: Configure Environment Variables

Add to your `.env.local` file:
```env
# AI Configuration
GEMINI_API_KEY="your-api-key-here"
AI_PROVIDER="gemini"
AI_MODEL="gemini-pro"
```

#### Step 3: Install Dependencies

```bash
npm install
```

#### Step 4: Test the Integration

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Try these features to test Gemini:
   - Upload a resume and request analysis
   - Add a job and calculate fit score
   - Analyze a job posting for interview prep

### Gemini API Features

**Available Models:**
- `gemini-pro` - Optimized for text generation (recommended)
- `gemini-pro-vision` - Supports image inputs

**Rate Limits (Free Tier):**
- 60 requests per minute
- 1500 requests per day
- Suitable for development and testing

**API Response Format:**
```json
{
  "candidates": [
    {
      "content": {
        "parts": [
          {
            "text": "AI-generated response here..."
          }
        ]
      }
    }
  ]
}
```

### Fallback to Other Providers

The application still supports other AI providers. To switch:

**Hugging Face:**
```env
AI_PROVIDER="huggingface"
HUGGINGFACE_API_KEY="your-key"
```

**Together AI:**
```env
AI_PROVIDER="together"
TOGETHER_API_KEY="your-key"
```

**Ollama (Local):**
```env
AI_PROVIDER="ollama"
AI_BASE_URL="http://localhost:11434"
AI_MODEL="llama3:8b"
```

## Troubleshooting

### Dark Mode Issues

**Problem:** Some elements still appear too dark
**Solution:** Check that the component uses semantic color classes:
- Use `bg-background` instead of `bg-gray-50`
- Use `text-foreground` instead of `text-gray-900`
- Use `text-muted-foreground` instead of `text-gray-600`

**Problem:** Dark mode not persisting
**Solution:** Clear browser cache and localStorage

### Gemini API Issues

**Problem:** "Missing GEMINI_API_KEY" error
**Solution:** 
1. Verify `.env.local` has the correct key
2. Restart the development server
3. Check the key is valid in Google AI Studio

**Problem:** Rate limit errors
**Solution:**
1. You're hitting the free tier limits
2. Wait for the rate limit to reset (1 minute or 24 hours)
3. Consider implementing request caching
4. Switch to a different AI provider temporarily

**Problem:** API returns empty responses
**Solution:**
1. Check your prompt is well-formatted
2. Ensure `maxOutputTokens` is sufficient
3. Try a different model (gemini-pro vs gemini-pro-vision)

## Best Practices

### Dark Mode

1. **Always use CSS variables for colors:**
   ```tsx
   // Good
   <div className="bg-background text-foreground">
   
   // Avoid
   <div className="bg-white text-black dark:bg-gray-900 dark:text-white">
   ```

2. **Test in both modes:**
   - Switch between light and dark mode frequently during development
   - Check contrast ratios for accessibility

3. **Use semantic colors:**
   - `primary` for main actions
   - `secondary` for supporting elements
   - `muted` for less important information
   - `destructive` for dangerous actions

### Google Gemini

1. **Handle errors gracefully:**
   ```typescript
   try {
     const response = await callGemini(prompt)
     return response
   } catch (error) {
     console.error('Gemini API error:', error)
     return fallbackResponse
   }
   ```

2. **Optimize prompts:**
   - Be specific and clear
   - Include format instructions
   - Limit response length when possible

3. **Cache responses:**
   - For repeated analyses
   - Use database to store AI results
   - Reduce API calls and improve performance

## Migration Checklist

- [x] Update CSS variables for better dark mode visibility
- [x] Add dark mode classes to all components
- [x] Replace OpenAI integration with Google Gemini
- [x] Update type definitions
- [x] Add Gemini SDK to dependencies
- [x] Update documentation and README
- [x] Create .env.example with Gemini configuration
- [x] Test all AI features with Gemini
- [x] Test dark mode on all pages

## Additional Resources

- [Google AI Studio](https://makersuite.google.com/)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [Tailwind Dark Mode Guide](https://tailwindcss.com/docs/dark-mode)
- [Next.js Dark Mode with next-themes](https://github.com/pacocoursey/next-themes)
