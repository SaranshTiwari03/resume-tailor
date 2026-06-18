import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import type { SkillRow, JobEntry, EducationEntry, ProjectEntry, TailorResponse } from '@/types/resume'

const SYSTEM_PROMPT = `You are a professional resume writer and ATS optimization expert.

Given raw resume text and a job description, parse the resume into structured JSON and tailor it to the role.

PARSING RULES:
- Extract ALL content faithfully — every job, every bullet, every skill, every project, every education entry
- If a field is missing (e.g., no portfolio URL, no upskilling section), use empty string or empty array
- Clean up formatting artifacts from PDF text extraction
- Infer professional title from the resume context (most recent role or stated objective)

TAILORING RULES — PRESERVATION IS THE #1 PRIORITY:
- NEVER remove any job, bullet point, skill, project, education entry, or section — the output must contain everything from the original
- NEVER reduce the number of bullet points in any job — if the original has 5 bullets, the output must have exactly 5 bullets
- NEVER remove any skill from the skills section — only reorder them for relevance
- NEVER remove any project — keep every project exactly as-is
- NEVER remove education entries
- Keep ALL quantified metrics exactly as-is (numbers, %, user counts, durations, dollar amounts)
- Summary: rewrite in 2-3 sentences, align keywords and tone to the JD, keep all achievements
- Skills: reorder rows so most JD-relevant skills appear first; reorder items within each row too; you may add a skill only if the candidate clearly demonstrates it in their experience
- Work experience bullets: lightly reword to surface JD-relevant keywords; change no more than 20% of the words per bullet; never cut a bullet; keep all metrics intact
- Education and projects: copy verbatim from the original — do NOT rewrite or remove
- Upskilling section: if present in original, copy verbatim; if absent, return empty array
- Do NOT invent experience, tools, accomplishments, or metrics
- If the user provides additional instructions, follow them precisely — but still never remove content unless the user explicitly says to remove something specific

Return ONLY valid JSON matching this exact shape:
{
  "name": "string",
  "title": "string — professional headline, e.g. 'Software Engineer | Full-Stack Developer'",
  "contact": {
    "phone": "string",
    "email": "string",
    "linkedinUrl": "string — full URL with https:// or empty",
    "linkedinLabel": "string — display text e.g. 'linkedin.com/in/username'",
    "portfolioUrl": "string — full URL or empty",
    "portfolioLabel": "string — display text e.g. 'Developer Portfolio'",
    "githubUrl": "string — full URL or empty",
    "githubLabel": "string — display text e.g. 'github.com/username'",
    "location": "string — e.g. 'City, State' or empty"
  },
  "summary": "string",
  "skills": [{ "category": "string", "items": "string — comma-separated skill names" }],
  "upskilling": ["string — plain text bullet, no HTML markup"],
  "experience": [{
    "role": "string",
    "company": "string",
    "type": "string — e.g. 'Full-time', 'Internship', 'Contract', 'Part-time'",
    "dateRange": "string — e.g. 'Jan 2023 – Present'",
    "bullets": ["string"]
  }],
  "education": [{
    "degree": "string",
    "school": "string",
    "dateRange": "string",
    "cgpa": "string — GPA or grade, or empty string",
    "coursework": "string — comma-separated or empty string"
  }],
  "projects": [{
    "title": "string",
    "url": "string — project URL or empty",
    "bullet": "string — one-sentence description of what it is and what it does"
  }]
}`

const COST_BASIC = 2
const COST_PROMPT = 4

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Sign in to tailor your resume.' }, { status: 401 })
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  try {
    const body = await req.json()
    const { resumeText, jd, customPrompt } = body as {
      resumeText?: string
      jd?: string
      customPrompt?: string
    }

    if (!resumeText || resumeText.trim().length < 100) {
      return NextResponse.json({ error: 'Resume text is missing or too short.' }, { status: 400 })
    }
    if (!jd || jd.trim().length < 20) {
      return NextResponse.json({ error: 'Job description is too short.' }, { status: 400 })
    }

    const cost = customPrompt?.trim() ? COST_PROMPT : COST_BASIC
    const isAdmin = session.user.role === 'admin'

    if (!isAdmin) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { credits: true },
      })
      if (!user || user.credits < cost) {
        return NextResponse.json(
          { error: 'Insufficient credits', creditsRemaining: user?.credits ?? 0, cost },
          { status: 402 }
        )
      }
    }

    let userMessage = `RESUME TEXT:\n${resumeText.trim()}\n\n---\n\nJOB DESCRIPTION:\n${jd.trim()}`
    if (customPrompt?.trim()) {
      userMessage += `\n\n---\n\nADDITIONAL INSTRUCTIONS:\n${customPrompt.trim()}`
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    })

    const raw = response.choices[0].message.content ?? '{}'
    const p = JSON.parse(raw)

    if (!p.name || !p.summary || !Array.isArray(p.skills) || !Array.isArray(p.experience)) {
      return NextResponse.json({ error: 'AI returned an unexpected format. Please try again.' }, { status: 500 })
    }

    const c = p.contact ?? {}
    const result: TailorResponse = {
      name: String(p.name ?? ''),
      title: String(p.title ?? ''),
      contact: {
        phone: String(c.phone ?? ''),
        email: String(c.email ?? ''),
        linkedin: { url: String(c.linkedinUrl ?? ''), label: String(c.linkedinLabel ?? '') },
        portfolio: { url: String(c.portfolioUrl ?? ''), label: String(c.portfolioLabel ?? 'Portfolio') },
        github: { url: String(c.githubUrl ?? ''), label: String(c.githubLabel ?? '') },
        location: String(c.location ?? ''),
      },
      summary: String(p.summary ?? ''),
      skills: (p.skills as SkillRow[]).map((s: SkillRow) => ({
        category: String(s.category ?? ''),
        items: String(s.items ?? ''),
      })),
      upskilling: Array.isArray(p.upskilling)
        ? p.upskilling.map((u: string) => ({ html: String(u) }))
        : [],
      experience: (p.experience as JobEntry[]).map((j: JobEntry) => ({
        role: String(j.role ?? ''),
        company: String(j.company ?? ''),
        type: String(j.type ?? ''),
        dateRange: String(j.dateRange ?? ''),
        bullets: Array.isArray(j.bullets) ? j.bullets.map(String) : [],
      })),
      education: Array.isArray(p.education)
        ? (p.education as EducationEntry[]).map((e: EducationEntry) => ({
            degree: String(e.degree ?? ''),
            school: String(e.school ?? ''),
            dateRange: String(e.dateRange ?? ''),
            cgpa: String(e.cgpa ?? ''),
            coursework: e.coursework ? String(e.coursework) : undefined,
          }))
        : [],
      projects: Array.isArray(p.projects)
        ? (p.projects as ProjectEntry[]).map((proj: ProjectEntry) => ({
            title: String(proj.title ?? ''),
            url: String(proj.url ?? ''),
            bullet: String(proj.bullet ?? ''),
          }))
        : [],
    }

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        // Admins get unlimited — only deduct credits for regular users
        ...(isAdmin ? {} : { credits: { decrement: cost } }),
        tailorCount: { increment: 1 },
      },
      select: { credits: true },
    }).catch(() => null)

    return NextResponse.json({ ...result, creditsRemaining: isAdmin ? null : (updated?.credits ?? null) })
  } catch (err) {
    console.error('[tailor]', err)
    return NextResponse.json(
      { error: 'Something went wrong. Check your API key and try again.' },
      { status: 500 }
    )
  }
}
