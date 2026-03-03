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

Return ONLY valid JSON (no markdown, no explanations) with this exact schema:
{
  "resumeSuggestions": ["specific resume edit 1", "specific resume edit 2", "..."],
  "interviewQuestions": ["question + answer strategy 1", "question + answer strategy 2", "..."],
  "skillGaps": ["specific missing skill 1 + how to close it", "..."],
  "resources": ["specific resource/course/article name + why it helps", "..."]
}

Requirements:
- Provide at least 5 items per array.
- Every item must be specific to the provided job posting text.
- Do not use generic advice.`

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
    const provider = (this.config.originalProvider || this.config.provider || '').toLowerCase()
    console.log('AI Service - Provider:', provider, 'Config:', this.config)
    
    if (provider === 'gemini' || provider === 'google') {
      console.log('Using Google Gemini provider')
      return this.callGemini(prompt)
    }

    if (provider === 'lmstudio' || provider === 'ollama' || provider === 'local') {
      console.log('Using OpenAI-compatible local provider')
      return this.callOpenAICompatible(prompt)
    }

    // If provider is missing/unknown but a base URL exists, treat as local OpenAI-compatible endpoint.
    if (this.config.baseUrl || process.env.AI_BASE_URL) {
      console.log('Using OpenAI-compatible local provider (inferred from AI_BASE_URL)')
      return this.callOpenAICompatible(prompt)
    }
    
    // default to Gemini
    console.log('Using Google Gemini provider (default)')
    return this.callGemini(prompt)
  }

  private async callGemini(prompt: string): Promise<string> {
    if (!this.config.apiKey) {
      throw new Error('Missing GEMINI_API_KEY. Set it in your environment variables.')
    }

    const model = this.normalizeGeminiModel(this.config.model || 'gemini-1.5-flash')
    const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${this.config.apiKey}`

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
          maxOutputTokens: 8192, // Increased for Gemini Pro - supports up to 8192 tokens
        }
      }),
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => '')
      throw new Error(`Gemini API error (${response.status} ${response.statusText}): ${errorText}`)
    }

    const data = await response.json()
    return data.candidates?.[0]?.content?.parts?.[0]?.text || ''
  }

  private normalizeGeminiModel(model: string): string {
    const normalized = model.trim().toLowerCase()
    // Backward-compatible aliases for older env values still used in many deployments.
    if (normalized === 'gemini-pro') {
      return 'gemini-1.5-flash'
    }
    if (normalized === 'gemini-pro-vision') {
      return 'gemini-1.5-flash'
    }
    return model
  }

  // For LM Studio / Ollama (OpenAI-compatible) via AI_BASE_URL
  private async callOpenAICompatible(prompt: string): Promise<string> {
    const baseUrl = this.config.baseUrl || process.env.AI_BASE_URL
    if (!baseUrl) {
      throw new Error('Missing AI_BASE_URL for local provider. Set it in your environment variables.')
    }

    const normalizedBaseUrl = baseUrl.replace(/\/$/, '')
    const candidateUrls = [
      `${normalizedBaseUrl}/v1/chat/completions`,
      `${normalizedBaseUrl}/api/v1/chat/completions`,
      `${normalizedBaseUrl}/api/v1/chat`,
    ]

    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    // API key is optional for local providers like LM Studio
    if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`
    }
    const model = this.config.model || process.env.AI_MODEL || 'gpt-3.5-turbo'

    let lastError = ''

    for (const url of candidateUrls) {
      const requestBody = url.endsWith('/api/v1/chat')
        ? {
            model,
            input: prompt,
          }
        : {
            model,
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 1000,
            temperature: 0.7,
            stream: false,
          }

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorText = await response.text().catch(() => '')
        lastError = `${response.status} ${response.statusText} @ ${url}: ${errorText}`

        // Try next endpoint shape when path is unsupported.
        if (response.status === 404 || response.status === 405) {
          continue
        }

        throw new Error(`Local AI API error (${response.status} ${response.statusText}): ${errorText}`)
      }

      const data = await response.json()
      const outputMessage = Array.isArray(data.output)
        ? data.output.find((item: { type?: string; content?: string }) => item?.type === 'message')?.content
        : ''
      const content = data.choices?.[0]?.message?.content || data.message?.content || outputMessage || data.response || data.text || ''
      if (content) {
        return content
      }
    }

    throw new Error(`Local AI API error: no compatible chat endpoint found. Tried: ${candidateUrls.join(', ')}${lastError ? `. Last error: ${lastError}` : ''}`)
  }

  private parseResumeAnalysis(response: string): ResumeAnalysis {
    try {
      const parsed = this.parsePossibleJson(response)
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
      const parsed = this.parsePossibleJson(response)
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
      const parsed = this.parsePossibleJson(response)
      return {
        resumeSuggestions: this.normalizeStringArray(parsed.resumeSuggestions),
        interviewQuestions: this.normalizeStringArray(parsed.interviewQuestions),
        skillGaps: this.normalizeStringArray(parsed.skillGaps),
        resources: this.normalizeStringArray(parsed.resources),
      }
    } catch {
      const extractedLines = this.extractBulletLikeLines(response)
      return {
        resumeSuggestions: extractedLines.length ? extractedLines.slice(0, 6) : ['Unable to parse structured AI output. Please retry.'],
        interviewQuestions: extractedLines.length > 6 ? extractedLines.slice(6, 12) : ['Unable to parse structured AI output. Please retry.'],
        skillGaps: extractedLines.length > 12 ? extractedLines.slice(12, 18) : ['Unable to parse structured AI output. Please retry.'],
        resources: extractedLines.length > 18 ? extractedLines.slice(18, 24) : ['Unable to parse structured AI output. Please retry.'],
      }
    }
  }

  private parsePossibleJson(response: string): any {
    try {
      return JSON.parse(response)
    } catch {
      // continue with extraction below
    }

    const fenced = response.match(/```(?:json)?\s*([\s\S]*?)```/i)
    if (fenced?.[1]) {
      return JSON.parse(fenced[1].trim())
    }

    const firstBrace = response.indexOf('{')
    const lastBrace = response.lastIndexOf('}')
    if (firstBrace >= 0 && lastBrace > firstBrace) {
      const jsonCandidate = response.slice(firstBrace, lastBrace + 1)
      return JSON.parse(jsonCandidate)
    }

    throw new Error('No JSON found in model response')
  }

  private normalizeStringArray(value: unknown): string[] {
    if (!Array.isArray(value)) {
      return []
    }
    return value
      .map((item) => String(item ?? '').trim())
      .filter(Boolean)
  }

  private extractBulletLikeLines(text: string): string[] {
    return text
      .split('\n')
      .map((line) => line.replace(/^\s*[-*•\d.)]+\s*/, '').trim())
      .filter((line) => line.length > 20)
      .slice(0, 24)
  }
}

// Factory function to create AI service instance
export function createAIService(): AIService {
  const isProduction = process.env.NODE_ENV === 'production'
  const envProvider = process.env.AI_PROVIDER || (isProduction ? 'gemini' : (process.env.AI_BASE_URL ? 'local' : 'gemini'))
  
  // Map environment variables based on provider
  let apiKey: string | undefined
  let baseUrl: string | undefined
  let model: string | undefined
  
  switch (envProvider.toLowerCase()) {
    case 'gemini':
    case 'google':
      apiKey = process.env.GEMINI_API_KEY
      model = process.env.AI_MODEL || 'gemini-1.5-flash'
      break
    case 'lmstudio':
    case 'ollama':
    case 'local':
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
    default: // gemini
      apiKey = process.env.GEMINI_API_KEY
      model = process.env.AI_MODEL || 'gemini-1.5-flash'
  }
  
  const config: AIServiceConfig & { baseUrl?: string; model?: string; originalProvider?: string } = {
    provider: envProvider === 'lmstudio' || envProvider === 'local'
      ? 'ollama'
      : (envProvider === 'google' ? 'gemini' : envProvider) as 'huggingface' | 'together' | 'gemini' | 'ollama',
    originalProvider: envProvider,
    apiKey,
    baseUrl,
    model,
  }

  return new AIService(config)
}
