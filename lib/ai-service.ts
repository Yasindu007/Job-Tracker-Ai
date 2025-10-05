import { AIServiceConfig, ResumeAnalysis, JobFitScore, JobPostingPrep } from '@/types'

export class AIService {
  private config: AIServiceConfig

  constructor(config: AIServiceConfig) {
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
    // For now we only support OpenAI in this project setup
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
        model: 'gpt-3.5-turbo',
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
  const config: AIServiceConfig = {
    provider: 'openai',
    apiKey: process.env.OPENAI_API_KEY,
  }

  return new AIService(config)
}
