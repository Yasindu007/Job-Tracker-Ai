# Job Tracker & AI Resume Assistant

A comprehensive full-stack platform that helps job seekers track applications, enhance resumes with AI, and prepare for interviews. Features AI-powered insights, multi-provider authentication, and calendar integration.

## Features

### 🔐 Authentication & User Profiles
- Email signup with verification codes
- OAuth login (Google, GitHub, Facebook, Twitter)
- Profile setup with job role and skills selection
- Editable user profiles

### 📋 Job Management
- CRUD operations for job applications
- Job fit scoring (0-100) based on skills vs requirements
- Search with predictive autocomplete
- Filter by status and sort by date
- Interview scheduling with calendar integration

### 📄 Resume Assistant
- Upload resumes (PDF/DOCX)
- AI-powered ATS scoring and analysis
- Resume enhancement suggestions
- Enhanced resume download
- Personalized tips and skill-building recommendations

### 🎯 Job Posting Prep
- Analyze job postings for tailored preparation
- Resume customization suggestions
- Likely interview questions with strategies
- Skill gap analysis with learning resources

### 📅 Calendar Integration
- Google Calendar sync for interview scheduling
- Automatic event creation with job details
- Email and popup reminders
- One-click sync/unsync functionality

### 🤖 AI Integration
- Modular AI service supporting multiple providers:
  - Hugging Face (Llama-3-8B-Instruct) - Default
  - Together AI (Mixtral 8x7B)
  - OpenAI (GPT-3.5-turbo)
  - Ollama (Local Llama 3)

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js
- **AI Services**: Hugging Face, Together AI, OpenAI, Ollama
- **File Processing**: PDF-parse, Mammoth (DOCX)
- **UI Components**: Headless UI, Heroicons, Framer Motion

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- AI service API keys (optional, defaults to Hugging Face)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd job-tracker-ai-assistant
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Fill in your environment variables:
   ```env
   # Database
   DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
   # For cloud databases (Supabase, Neon, etc.), you often need to add ?sslmode=require
   # DATABASE_URL="postgresql://user:password@host:port/db?sslmode=require"
   
   # NextAuth.js (Authentication)
   # Generate a secret: `openssl rand -base64 32`
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret"
   
   # OAuth Providers (add credentials for providers you want to enable)
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   GITHUB_CLIENT_ID="your-github-client-id"
   GITHUB_CLIENT_SECRET="your-github-client-secret"
   
   # Email Configuration (for email/password sign-in verification)
   # For Gmail, you must generate an "App Password"
   EMAIL_SERVER_HOST="your-smtp-host"
   EMAIL_SERVER_PORT=587
   EMAIL_SERVER_USER="your-email@example.com"
   EMAIL_SERVER_PASSWORD="your-email-password"
   EMAIL_FROM="noreply@example.com"
   
   # AI Services (at least one required)
   HUGGINGFACE_API_KEY="your-huggingface-api-key"
   TOGETHER_API_KEY="your-together-api-key"
   OPENAI_API_KEY="your-openai-api-key"
   
   # AI Configuration
   AI_PROVIDER="huggingface" # huggingface, together, openai, ollama
   AI_MODEL="meta-llama/Llama-3-8B-Instruct"
   AI_BASE_URL="http://localhost:11434" # for Ollama
   ```

4. **Set up the database**
   ```bash
   npm run db:push
   npm run db:generate
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## AI Service Setup

### Hugging Face (Recommended - Free tier available)
1. Sign up at [huggingface.co](https://huggingface.co)
2. Create an API token
3. Add to `.env.local`:
   ```env
   HUGGINGFACE_API_KEY="your-token"
   AI_PROVIDER="huggingface"
   ```

### Together AI
1. Sign up at [together.ai](https://together.ai)
2. Get your API key
3. Add to `.env.local`:
   ```env
   TOGETHER_API_KEY="your-key"
   AI_PROVIDER="together"
   ```

### OpenAI
1. Sign up at [openai.com](https://openai.com)
2. Get your API key
3. Add to `.env.local`:
   ```env
   OPENAI_API_KEY="your-key"
   AI_PROVIDER="openai"
   ```

### Ollama (Local - Free)
1. Install [Ollama](https://ollama.ai)
2. Pull a model: `ollama pull llama3:8b`
3. Start Ollama: `ollama serve`
4. Add to `.env.local`:
   ```env
   AI_PROVIDER="ollama"
   AI_MODEL="llama3:8b"
   AI_BASE_URL="http://localhost:11434"
   ```

## OAuth Setup (Optional)

### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`

### GitHub OAuth
1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create a new OAuth App
3. Set Authorization callback URL: `http://localhost:3000/api/auth/callback/github`

### Google Calendar Integration
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google Calendar API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/calendar/callback/google`
6. Add to `.env.local`:
   ```env
   GOOGLE_CALENDAR_CLIENT_ID="your-google-calendar-client-id"
   GOOGLE_CALENDAR_CLIENT_SECRET="your-google-calendar-client-secret"
   ```

## Project Structure

```
├── app/                    # Next.js app router
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard page
│   ├── resume/            # Resume assistant page
│   └── job-prep/          # Job prep assistant page
├── components/            # React components
├── lib/                   # Utility libraries
│   ├── ai-service.ts      # AI service layer
│   ├── auth.ts           # Authentication config
│   ├── prisma.ts         # Database client
│   └── utils.ts          # Utility functions
├── prisma/               # Database schema
├── types/                # TypeScript types
└── uploads/              # File uploads directory
```

## Key Features Implementation

### Job Fit Scoring
- Compares user skills with job requirements
- Uses AI to analyze job descriptions
- Provides 0-100 score with improvement suggestions

### Resume Analysis
- Extracts text from PDF/DOCX files
- AI-powered ATS optimization scoring
- Identifies missing keywords and formatting issues
- Generates enhanced resume versions

### Job Posting Analysis
- Analyzes job descriptions for preparation insights
- Generates tailored interview questions
- Identifies skill gaps and learning resources
- Provides resume customization tips

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@jobtracker.ai or create an issue in the repository.

## Roadmap

- [x] Calendar integration (Google Calendar)
- [ ] Apple Calendar integration
- [ ] Advanced analytics dashboard
- [ ] Resume templates
- [ ] Company research integration
- [ ] Mobile app
- [ ] Team collaboration features
