import { AIServiceConfig, ResumeAnalysis, JobFitScore, JobPostingPrep } from '@/types'

export class AIService {
  private config: AIServiceConfig & { baseUrl?: string; model?: string; originalProvider?: string }

  constructor(config: AIServiceConfig & { baseUrl?: string; model?: string; originalProvider?: string }) {
    this.config = config
  }

  async analyzeResume(resumeText: string, jobRole?: string): Promise<ResumeAnalysis> {
    const prompt = `Analyze this resume for ATS optimization and provide suggestions:

Resume Text: ${resumeText}
${jobRole ? `Target Job Role: ${jobRole}` : ''}

Please provide:
1. ATS Score (0-100)
2. Specific improvement suggestions
3. Missing keywords
4. Formatting issues
5. Skill gaps

Format as JSON with keys: atsScore, suggestions, missingKeywords, formattingIssues, skillGaps`

    const response = await this.callAI(prompt)
    return this.parseResumeAnalysis(response)
  }

  async calculateJobFitScore(userSkills: string[], jobDescription: string): Promise<JobFitScore> {
    const prompt = `Calculate job fit score based on user skills vs job requirements:

User Skills: ${userSkills.join(', ')}
Job Description: ${jobDescription}

Provide:
1. Fit score (0-100)
2. Matched skills
3. Missing skills
4. Improvement suggestions

Format as JSON with keys: score, matchedSkills, missingSkills, suggestions`

    const response = await this.callAI(prompt)
    return this.parseJobFitScore(response)
  }

  async analyzeJobPosting(jobPosting: string, userSkills: string[], jobRole?: string): Promise<JobPostingPrep> {
    const prompt = `Analyze this job posting and provide preparation guidance:

Job Posting: ${jobPosting}
User Skills: ${userSkills.join(', ')}
${jobRole ? `User's Target Role: ${jobRole}` : ''}

Provide:
1. Resume customization suggestions
2. Likely interview questions with answer strategies
3. Skill gaps to fill
4. Learning resources

Format as JSON with keys: resumeSuggestions, interviewQuestions, skillGaps, resources`

    const response = await this.callAI(prompt)
    return this.parseJobPostingPrep(response)
  }

  async generateResumeEnhancement(resumeText: string, jobDescription: string): Promise<string> {
    const prompt = `Enhance this resume to better match the job description:

Original Resume: ${resumeText}
Job Description: ${jobDescription}

Provide an enhanced version that:
1. Incorporates relevant keywords from the job description
2. Highlights matching skills and experiences
3. Maintains professional formatting
4. Optimizes for ATS systems

Return the enhanced resume text directly.`

    return await this.callAI(prompt)
  }

  private async callAI(prompt: string): Promise<string> {
    const provider = (this.config.originalProvider || this.config.provider || 'openai').toLowerCase()
    console.log('AI Service - Provider:', provider, 'Config:', this.config)
    if (provider === 'lmstudio' || provider === 'ollama' || provider === 'local') {
      console.log('Using OpenAI-compatible local provider')
      return this.callOpenAICompatible(prompt)
    }
    // default to OpenAI
    console.log('Using OpenAI provider')
    return this.callOpenAI(prompt)
  }

  private async callOpenAI(prompt: string): Promise<string> {
    if (!this.config.apiKey) {
      throw new Error('Missing OPENAI_API_KEY. Set it in your environment variables.')
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.config.model || 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => '')
      throw new Error(`OpenAI API error (${response.status} ${response.statusText}): ${errorText}`)
    }

    const data = await response.json()
    return data.choices?.[0]?.message?.content || ''
  }

  // For LM Studio / Ollama (OpenAI-compatible) via AI_BASE_URL
  private async callOpenAICompatible(prompt: string): Promise<string> {
    const baseUrl = this.config.baseUrl || process.env.AI_BASE_URL
    if (!baseUrl) {
      throw new Error('Missing AI_BASE_URL for local provider. Set it in your environment variables.')
    }

    const url = `${baseUrl.replace(/\/$/, '')}/v1/chat/completions`

    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    // API key is optional for local providers like LM Studio
    if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: this.config.model || process.env.AI_MODEL || 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => '')
      throw new Error(`Local AI API error (${response.status} ${response.statusText}): ${errorText}`)
    }

    const data = await response.json()
    return data.choices?.[0]?.message?.content || ''
  }

  private parseResumeAnalysis(response: string): ResumeAnalysis {
    try {
      const parsed = JSON.parse(response)
      return {
        atsScore: parsed.atsScore || 0,
        suggestions: parsed.suggestions || [],
        missingKeywords: parsed.missingKeywords || [],
        formattingIssues: parsed.formattingIssues || [],
        skillGaps: parsed.skillGaps || [],
      }
    } catch {
      // Fallback parsing if JSON parsing fails
      return {
        atsScore: 75, // Default score
        suggestions: ['Review resume formatting', 'Add more relevant keywords'],
        missingKeywords: [],
        formattingIssues: [],
        skillGaps: [],
      }
    }
  }

  private parseJobFitScore(response: string): JobFitScore {
    try {
      const parsed = JSON.parse(response)
      return {
        score: parsed.score || 0,
        matchedSkills: parsed.matchedSkills || [],
        missingSkills: parsed.missingSkills || [],
        suggestions: parsed.suggestions || [],
      }
    } catch {
      return {
        score: 50,
        matchedSkills: [],
        missingSkills: [],
        suggestions: ['Review job requirements and update skills'],
      }
    }
  }

  private parseJobPostingPrep(response: string): JobPostingPrep {
    try {
      const parsed = JSON.parse(response)
      return {
        resumeSuggestions: parsed.resumeSuggestions || [],
        interviewQuestions: parsed.interviewQuestions || [],
        skillGaps: parsed.skillGaps || [],
        resources: parsed.resources || [],
      }
    } catch {
      return {
        resumeSuggestions: ['Customize resume for this role'],
        interviewQuestions: ['Prepare for common interview questions'],
        skillGaps: ['Identify and address skill gaps'],
        resources: ['Research company and role requirements'],
      }
    }
  }
}

// Factory function to create AI service instance
export function createAIService(): AIService {
  const envProvider = process.env.AI_PROVIDER || 'openai'
  
  // Map environment variables based on provider
  let apiKey: string | undefined
  let baseUrl: string | undefined
  let model: string | undefined
  
  switch (envProvider.toLowerCase()) {
    case 'lmstudio':
    case 'ollama':
      baseUrl = process.env.AI_BASE_URL
      model = process.env.AI_MODEL || 'llama3.1:8b'
      break
    case 'huggingface':
      apiKey = process.env.HUGGINGFACE_API_KEY
      baseUrl = process.env.AI_BASE_URL || 'https://api-inference.huggingface.co'
      model = process.env.AI_MODEL || 'microsoft/DialoGPT-medium'
      break
    case 'together':
      apiKey = process.env.TOGETHER_API_KEY
      baseUrl = process.env.AI_BASE_URL || 'https://api.together.xyz'
      model = process.env.AI_MODEL || 'meta-llama/Llama-2-7b-chat-hf'
      break
    case 'groq':
      apiKey = process.env.GROQ_API_KEY
      baseUrl = process.env.AI_BASE_URL || 'https://api.groq.com'
      model = process.env.AI_MODEL || 'llama3-8b-8192'
      break
    default: // openai
      apiKey = process.env.OPENAI_API_KEY
      model = process.env.AI_MODEL || 'gpt-3.5-turbo'
  }
  
  const config: AIServiceConfig & { baseUrl?: string; model?: string; originalProvider?: string } = {
    provider: envProvider === 'lmstudio' ? 'ollama' : (envProvider as 'huggingface' | 'together' | 'openai' | 'ollama'),
    originalProvider: envProvider,
    apiKey,
    baseUrl,
    model,
  }

  return new AIService(config)
}
