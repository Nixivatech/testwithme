export type UserRole = 'Student' | 'Admin'

export interface User {
  id: string
  email: string
  name: string
  avatarUrl: string | null
  role: UserRole
  isProMember: boolean
}

export interface ModuleSummary {
  id: string
  slug: string
  title: string
  description: string | null
  isPro: boolean
  topicCount: number
  completedTopicCount: number
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
}

export interface TopicDetail {
  id: string
  slug: string
  title: string
  content: string
  isCompleted: boolean
  moduleId: string
  moduleTitle: string
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
