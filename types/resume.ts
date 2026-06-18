export interface SkillRow {
  category: string
  items: string
}

export interface JobEntry {
  role: string
  company: string
  type: string
  dateRange: string
  bullets: string[]
}

export interface EducationEntry {
  degree: string
  school: string
  dateRange: string
  cgpa: string
  coursework?: string
}

export interface ProjectEntry {
  title: string
  url: string
  bullet: string
}

export interface UpskillingItem {
  html: string
}

export interface StyleConfig {
  fontFamily: string
  baseFontSize: number   // pt
  lineHeight: number
  sectionSpacing: number // px gap between sections
  jobSpacing: number     // px gap between jobs
}

export const DEFAULT_STYLES: StyleConfig = {
  fontFamily: 'IBM Plex Sans Condensed',
  baseFontSize: 8.7,
  lineHeight: 1.25,
  sectionSpacing: 6,
  jobSpacing: 5,
}

export interface ResumeData {
  name: string
  title: string
  contact: {
    phone: string
    email: string
    linkedin: { url: string; label: string }
    portfolio: { url: string; label: string }
    github: { url: string; label: string }
    location: string
  }
  summary: string
  skills: SkillRow[]
  upskilling: UpskillingItem[]
  experience: JobEntry[]
  education: EducationEntry[]
  projects: ProjectEntry[]
  styles: StyleConfig
}

// Full response returned by /api/tailor — everything except styles
export interface TailorResponse {
  name: string
  title: string
  contact: {
    phone: string
    email: string
    linkedin: { url: string; label: string }
    portfolio: { url: string; label: string }
    github: { url: string; label: string }
    location: string
  }
  summary: string
  skills: SkillRow[]
  upskilling: UpskillingItem[]
  experience: JobEntry[]
  education: EducationEntry[]
  projects: ProjectEntry[]
}
