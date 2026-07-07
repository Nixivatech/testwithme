export type UserRole = 'Student' | 'Admin'

export interface User {
  id: string
  email: string
  name: string
  avatarUrl: string | null
  role: UserRole
  isProMember: boolean
  phone: string | null
  professional: string | null
  isProfileComplete: boolean
  createdAt: string
}

export interface ModuleSummary {
  id: string
  slug: string
  title: string
  description: string | null
  isPro: boolean
  topicCount: number
  completedTopicCount: number
  price: number | null
  features: string | null
}

export interface TopicSummary {
  id: string
  slug: string
  title: string
  orderIndex: number
  isCompleted: boolean
}

export interface ModuleDetail {
  id: string
  slug: string
  title: string
  description: string | null
  isPro: boolean
  topics: TopicSummary[]
  price: number | null
  features: string | null
}

export interface TopicDetail {
  id: string
  slug: string
  title: string
  content: string
  isCompleted: boolean
  moduleId: string
  moduleTitle: string
  nextTopicSlug: string | null
  prevTopicSlug: string | null
  topicIndex: number
  totalTopics: number
}

export interface Certificate {
  certificateCode: string
  studentName: string
  moduleTitle: string
  issuedAt: string
}

export interface CertificateVerification {
  isValid: boolean
  certificate: Certificate | null
}

export interface Question {
  id: string
  text: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
}

export interface QuestionResult {
  questionId: string
  text: string
  yourAnswer: string
  correctAnswer: string
  isCorrect: boolean
  explanation: string | null
}

export interface QuizResult {
  score: number
  total: number
  passed: boolean
  results: QuestionResult[]
  certificateCode: string | null
}

export interface SessionAnswer {
  questionId: string
  questionText: string
  givenAnswer: string
  correctAnswer: string
  isCorrect: boolean
}

export interface QuizSession {
  attemptId: string
  score: number
  total: number
  passed: boolean
  attemptedAt: string
  answers: SessionAnswer[]
}

export interface FullTestQuestion {
  id: string
  topicId: string
  topicTitle: string
  moduleTitle: string
  text: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
}

export interface FullTestQuestionResult {
  questionId: string
  text: string
  yourAnswer: string
  correctAnswer: string
  isCorrect: boolean
  explanation: string | null
}

export interface FullTestTopicResult {
  topicId: string
  topicTitle: string
  moduleTitle: string
  score: number
  total: number
  passed: boolean
  questions: FullTestQuestionResult[]
}

export interface FullTestResult {
  totalScore: number
  totalQuestions: number
  topics: FullTestTopicResult[]
  takenAt: string
}
