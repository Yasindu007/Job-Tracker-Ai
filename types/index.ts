export interface User {
  id: string;
  name?: string;
  email: string;
  image?: string;
  expectedJobRole?: string;
  skills: string[];
  isProfileComplete: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  status: JobStatus;
  dateApplied: Date;
  notes?: string;
  expectedInterviewDate?: Date;
  expectedInterviewTime?: string;
  jobFitScore?: number;
  jobDescription?: string;
  jobUrl?: string;
  location?: string;
  salary?: string;
  calendarEventId?: string;
  calendarSynced: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Resume {
  id: string;
  originalFileName: string;
  filePath: string;
  extractedText?: string;
  atsScore?: number;
  enhancementSuggestions?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface JobPostingAnalysis {
  id: string;
  jobPostingText: string;
  analysisResults: string;
  resumeSuggestions?: string;
  interviewQuestions?: string;
  skillGaps?: string;
  userId: string;
  createdAt: Date;
}

export enum JobStatus {
  APPLIED = 'APPLIED',
  INTERVIEW = 'INTERVIEW',
  OFFERED = 'OFFERED',
  REJECTED = 'REJECTED'
}

export interface JobFitScore {
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
  suggestions: string[];
}

export interface ResumeAnalysis {
  atsScore: number;
  suggestions: string[];
  missingKeywords: string[];
  formattingIssues: string[];
  skillGaps: string[];
}

export interface JobPostingPrep {
  resumeSuggestions: string[];
  interviewQuestions: string[];
  skillGaps: string[];
  resources: string[];
}

export interface CalendarEvent {
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  location?: string;
}

export interface AIServiceConfig {
  provider: 'huggingface' | 'together' | 'openai' | 'ollama';
  apiKey?: string;
  model?: string;
  baseUrl?: string;
}
