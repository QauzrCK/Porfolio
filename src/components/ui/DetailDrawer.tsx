import React from 'react'
import { X, Mail, ExternalLink, RotateCcw, GraduationCap, CheckCircle2, Cpu, User, FolderKanban, FileText, AlertTriangle, Award, ChevronLeft, ChevronRight } from 'lucide-react'
import { usePanelStore, SelectorMode } from '../../state/panelStore'
import panelData from '../../data/panelComponents.json'

interface ContactItem {
  type: 'email' | 'instagram' | 'linkedin'
  label: string
  value: string
  url: string
}

interface EducationItem {
  degree: string
  university: string
}

interface TechSkillItem {
  category: string
  detail?: string
  details?: string
}

interface BioData {
  headline: string
  summary: string
  highlights?: string[]
}

interface ProjectModeItem {
  slot: string
  name?: string
  title?: string
  role?: string
  summary: string
  tags?: string[]
  demoUrl?: string
  githubUrl?: string
}

interface ResumeData {
  status?: string
  summary?: string
  note?: string
  highlights?: string[]
  ctaLabel?: string
  ctaUrl?: string
  url?: string
}

interface UrgentData {
  status: string
  message: string
  email: string
  linkedin: string
}

const TOUR_ORDER = [
  'enclosure_door',
  'main_breaker',
  'gauge_voltmeter',
  'gauge_ammeter',
  'selector_switch',
  'plc_controller',
  'push_button_start'
] as const

const InstagramIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f472b6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
)

const LinkedInIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
)

const getContactIcon = (type: ContactItem['type']) => {
  switch (type) {
    case 'email':
      return <Mail size={18} color="#38bdf8" />
    case 'instagram':
      return <InstagramIcon />
    case 'linkedin':
      return <LinkedInIcon />
  }
}

export const DetailDrawer: React.FC = () => {
  const selectedComponent = usePanelStore((s) => s.selectedComponent)
  const setSelectedComponent = usePanelStore((s) => s.setSelectedComponent)
  const selectorMode = usePanelStore((s) => s.selectorMode)
  const cycleSelector = usePanelStore((s) => s.cycleSelector)
  const resetView = usePanelStore((s) => s.resetView)

  const isOpen = selectedComponent !== null && Boolean((panelData as any)[selectedComponent])
  const data = isOpen ? (panelData as any)[selectedComponent] : null

  if (!data) {
    return (
      <aside className="detail-drawer closed ui-interactive" aria-hidden="true" />
    )
  }

  const contacts: ContactItem[] = data.contacts || []
  const education: EducationItem[] = data.education || []
  const skills: string[] | undefined = data.skills
  const techSkills: TechSkillItem[] | undefined = data.techSkills
  const bio: BioData | string | undefined = data.bio
  const projectsByMode: Record<SelectorMode, ProjectModeItem> | undefined = data.projectsByMode
  const resume: ResumeData | undefined = data.resume
  const urgent: UrgentData | undefined = data.urgent
  const certifications: string[] | undefined = data.certifications

  const tourIndex = TOUR_ORDER.indexOf(selectedComponent as any)
  const handleTourStep = (dir: -1 | 1) => {
    const base = tourIndex === -1 ? 0 : tourIndex
    const nextIdx = (base + dir + TOUR_ORDER.length) % TOUR_ORDER.length
    setSelectedComponent(TOUR_ORDER[nextIdx])
  }

  return (
    <aside className="detail-drawer ui-interactive" aria-label="Component Details">
      {/* Drawer Header */}
      <div className="drawer-header">
        <div>
          <h2 className="drawer-title">{data.title}</h2>
          {data.subtitle && <div className="drawer-subtitle">{data.subtitle}</div>}
        </div>
        <button
          className="close-btn"
          onClick={() => setSelectedComponent(null)}
          title="Close details (Esc)"
        >
          <X size={18} />
        </button>
      </div>

      {/* Drawer Content */}
      <div className="drawer-body">
        {contacts.length > 0 ? (
          <div className="links-section">
            <span className="section-label">Social Contacts</span>
            {contacts.map((item, idx) => (
              <a
                key={idx}
                href={item.url}
                target={item.type === 'email' ? undefined : '_blank'}
                rel={item.type === 'email' ? undefined : 'noopener noreferrer'}
                className="portfolio-link-btn"
                onClick={(e) => {
                  if (item.url === '#') e.preventDefault()
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {getContactIcon(item.type)}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {item.label}
                    </span>
                    <span style={{ fontSize: '14px', color: '#0f172a', fontWeight: 600 }}>
                      {item.value}
                    </span>
                  </div>
                </div>
                <ExternalLink size={14} />
              </a>
            ))}
          </div>
        ) : education.length > 0 ? (
          <div className="links-section" style={{ gap: '12px' }}>
            <span className="section-label">Degrees</span>
            {education.map((edu, idx) => (
              <div
                key={idx}
                className="action-card"
                style={{ gap: '6px', padding: '14px 16px' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  <GraduationCap size={15} />
                  <span>{edu.degree}</span>
                </div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: edu.university ? '#0f172a' : 'var(--text-muted)', lineHeight: 1.45 }}>
                  {edu.university || '—'}
                </div>
              </div>
            ))}
          </div>
        ) : techSkills !== undefined ? (
          <div className="links-section" style={{ gap: '10px' }}>
            <span className="section-label">Technical Skills ({techSkills.length})</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {techSkills.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '10px 13px',
                    borderRadius: '10px',
                    background: 'rgba(2, 132, 199, 0.07)',
                    border: '1px solid rgba(2, 132, 199, 0.18)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0284c7', fontSize: '12.5px', fontWeight: 700 }}>
                    <Cpu size={14} style={{ flexShrink: 0 }} />
                    <span>{item.category}</span>
                  </div>
                  <div style={{ fontSize: '12.5px', color: '#334155', lineHeight: 1.45, paddingLeft: '22px' }}>
                    {item.detail || item.details}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : skills !== undefined ? (
          <div className="links-section" style={{ gap: '10px' }}>
            <span className="section-label">Skills</span>
            {skills.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {skills.map((skill, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      background: 'rgba(2, 132, 199, 0.07)',
                      border: '1px solid rgba(2, 132, 199, 0.18)',
                      fontSize: '13px',
                      color: '#0f172a',
                      fontWeight: 500
                    }}
                  >
                    <CheckCircle2 size={15} color="#0284c7" style={{ flexShrink: 0 }} />
                    <span>{skill}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="drawer-description" style={{ color: 'var(--text-muted)' }}>
                Skills list ready to be added.
              </p>
            )}
          </div>
        ) : bio ? (
          <div className="links-section" style={{ gap: '12px' }}>
            <span className="section-label">Profile Summary</span>
            <div className="action-card" style={{ gap: '8px', padding: '14px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0284c7', fontSize: '13px', fontWeight: 700 }}>
                <User size={15} />
                <span>{typeof bio === 'string' ? 'Chanawit Krobbang' : bio.headline}</span>
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: '#334155', lineHeight: 1.55 }}>
                {typeof bio === 'string' ? bio : bio.summary}
              </p>
            </div>
            {typeof bio !== 'string' && bio.highlights && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {bio.highlights.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      background: 'rgba(2, 132, 199, 0.07)',
                      border: '1px solid rgba(2, 132, 199, 0.18)',
                      fontSize: '12.5px',
                      color: '#0f172a'
                    }}
                  >
                    <CheckCircle2 size={14} color="#0284c7" style={{ flexShrink: 0 }} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : projectsByMode ? (
          <div className="links-section" style={{ gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="section-label">Mode: {selectorMode}</span>
              <button
                onClick={cycleSelector}
                style={{
                  background: 'rgba(2, 132, 199, 0.1)',
                  border: '1px solid rgba(2, 132, 199, 0.3)',
                  color: '#0284c7',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Switch Slot ↻
              </button>
            </div>
            {(() => {
              const activeProj = projectsByMode[selectorMode]
              return (
                <div className="action-card" style={{ gap: '10px', padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0284c7', fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 600 }}>
                    <FolderKanban size={15} />
                    <span>{activeProj.slot}</span>
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
                    {activeProj.name || activeProj.title}
                  </div>
                  {activeProj.role && (
                    <div style={{ fontSize: '12px', color: '#475569', fontFamily: 'var(--font-mono)' }}>
                      {activeProj.role}
                    </div>
                  )}
                  <p style={{ margin: 0, fontSize: '13px', color: '#334155', lineHeight: 1.5 }}>
                    {activeProj.summary}
                  </p>
                  {activeProj.tags && activeProj.tags.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                      {activeProj.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          style={{
                            fontSize: '11px',
                            padding: '3px 9px',
                            borderRadius: '999px',
                            background: 'rgba(2, 132, 199, 0.1)',
                            border: '1px solid rgba(2, 132, 199, 0.22)',
                            color: '#0369a1',
                            fontWeight: 500
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  {(activeProj.demoUrl || activeProj.githubUrl) && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
                      {activeProj.demoUrl && (
                        <a
                          href={activeProj.demoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="portfolio-link-btn"
                        >
                          <span style={{ fontWeight: 600, color: '#0f172a' }}>Live Project Page</span>
                          <ExternalLink size={14} />
                        </a>
                      )}
                      {activeProj.githubUrl && (
                        <a
                          href={activeProj.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="portfolio-link-btn"
                        >
                          <span style={{ fontWeight: 600, color: '#0f172a' }}>GitHub Repository</span>
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              )
            })()}
          </div>
        ) : resume ? (
          <div className="links-section" style={{ gap: '12px' }}>
            <span className="section-label">{resume.status || 'Resume / CV'}</span>
            <div className="action-card" style={{ gap: '8px', padding: '14px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#16a34a', fontSize: '13px', fontWeight: 700 }}>
                <FileText size={15} />
                <span>Curriculum Vitae</span>
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: '#334155', lineHeight: 1.5 }}>
                {resume.summary || resume.note}
              </p>
            </div>
            {resume.highlights && resume.highlights.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  background: 'rgba(22, 163, 74, 0.08)',
                  border: '1px solid rgba(22, 163, 74, 0.22)',
                  fontSize: '12.5px',
                  color: '#0f172a'
                }}
              >
                <CheckCircle2 size={14} color="#16a34a" style={{ flexShrink: 0 }} />
                <span>{item}</span>
              </div>
            ))}
            {(resume.ctaUrl || (resume.url && resume.url !== '#')) && (
              <a
                href={resume.ctaUrl || resume.url}
                target="_blank"
                rel="noopener noreferrer"
                className="portfolio-link-btn"
                style={{ marginTop: '4px' }}
              >
                <span style={{ fontWeight: 600, color: '#0f172a' }}>{resume.ctaLabel || 'Open Resume PDF'}</span>
                <ExternalLink size={14} />
              </a>
            )}
          </div>
        ) : urgent ? (
          <div className="links-section" style={{ gap: '12px' }}>
            <span className="section-label" style={{ color: '#dc2626' }}>{urgent.status || 'Urgent Hire'}</span>
            <div
              className="action-card"
              style={{
                gap: '8px',
                padding: '14px 16px',
                borderColor: 'rgba(220, 38, 38, 0.35)',
                background: 'rgba(220, 38, 38, 0.06)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#dc2626', fontSize: '13px', fontWeight: 700 }}>
                <AlertTriangle size={15} />
                <span>Direct Recruiter Hotline</span>
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: '#334155', lineHeight: 1.5 }}>
                {urgent.message}
              </p>
            </div>
            <a
              href={urgent.email.startsWith('mailto:') ? urgent.email : `mailto:${urgent.email}`}
              className="portfolio-link-btn"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Mail size={16} color="#0284c7" />
                <span style={{ fontWeight: 600, color: '#0f172a' }}>{urgent.email.replace(/^mailto:/, '')}</span>
              </div>
              <ExternalLink size={14} />
            </a>
            <a href={urgent.linkedin} target="_blank" rel="noopener noreferrer" className="portfolio-link-btn">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <LinkedInIcon />
                <span style={{ fontWeight: 600, color: '#0f172a' }}>LinkedIn Profile</span>
              </div>
              <ExternalLink size={14} />
            </a>
          </div>
        ) : certifications !== undefined ? (
          <div className="links-section" style={{ gap: '10px' }}>
            <span className="section-label">Certifications &amp; Awards</span>
            {certifications.map((cert, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: 'rgba(217, 119, 6, 0.08)',
                  border: '1px solid rgba(217, 119, 6, 0.22)',
                  fontSize: '13px',
                  color: '#0f172a',
                  fontWeight: 500
                }}
              >
                <Award size={15} color="#d97706" style={{ flexShrink: 0 }} />
                <span>{cert}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="drawer-description" style={{ color: 'var(--text-muted)' }}>
            Portfolio section ready for content.
          </p>
        )}

        {/* Guided Tour & Reset Camera */}
        <div style={{ marginTop: 'auto', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => handleTourStep(-1)}
              style={{
                flex: 1,
                background: 'rgba(2, 132, 199, 0.08)',
                border: '1px solid rgba(2, 132, 199, 0.24)',
                color: '#0f172a',
                padding: '9px 10px',
                borderRadius: '8px',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px'
              }}
            >
              <ChevronLeft size={13} />
              Prev
            </button>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', minWidth: '42px', textAlign: 'center' }}>
              {tourIndex === -1 ? '1' : tourIndex + 1} / {TOUR_ORDER.length}
            </span>
            <button
              onClick={() => handleTourStep(1)}
              style={{
                flex: 1,
                background: 'rgba(2, 132, 199, 0.08)',
                border: '1px solid rgba(2, 132, 199, 0.24)',
                color: '#0f172a',
                padding: '9px 10px',
                borderRadius: '8px',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px'
              }}
            >
              Next
              <ChevronRight size={13} />
            </button>
          </div>
          <button
            onClick={resetView}
            style={{
              width: '100%',
              background: 'transparent',
              border: '1px dashed rgba(15, 23, 42, 0.2)',
              color: 'var(--text-muted)',
              padding: '10px',
              borderRadius: '8px',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <RotateCcw size={12} />
            Reset Camera to Full View
          </button>
        </div>
      </div>
    </aside>
  )
}
