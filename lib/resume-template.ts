import type { ResumeData } from '@/types/resume'

const GOOGLE_FONT_MAP: Record<string, string | null> = {
  // Modern Sans
  'Inter':                   'Inter:wght@300;400;500;600;700',
  'DM Sans':                 'DM+Sans:wght@300;400;500;600;700',
  'Plus Jakarta Sans':       'Plus+Jakarta+Sans:wght@300;400;500;600;700',
  'Nunito Sans':             'Nunito+Sans:wght@300;400;600;700',
  'Outfit':                  'Outfit:wght@300;400;500;600;700',
  'Figtree':                 'Figtree:wght@300;400;500;600;700',
  'Sora':                    'Sora:wght@300;400;500;600;700',
  'Urbanist':                'Urbanist:wght@300;400;500;600;700',
  'Manrope':                 'Manrope:wght@300;400;500;600;700',
  'Be Vietnam Pro':          'Be+Vietnam+Pro:wght@300;400;500;600;700',
  'Lexend':                  'Lexend:wght@300;400;500;600;700',
  'Mulish':                  'Mulish:wght@300;400;500;600;700',
  'Work Sans':               'Work+Sans:wght@300;400;500;600;700',
  'Karla':                   'Karla:wght@300;400;500;600;700',
  'Rubik':                   'Rubik:wght@300;400;500;600;700',
  'Jost':                    'Jost:wght@300;400;500;600;700',
  'Quicksand':               'Quicksand:wght@300;400;500;600;700',
  'Onest':                   'Onest:wght@300;400;500;600;700',
  // Classic Sans
  'Open Sans':               'Open+Sans:wght@300;400;600;700',
  'Roboto':                  'Roboto:wght@300;400;500;700',
  'Lato':                    'Lato:wght@300;400;700',
  'Source Sans 3':           'Source+Sans+3:wght@300;400;600;700',
  'Noto Sans':               'Noto+Sans:wght@300;400;600;700',
  'PT Sans':                 'PT+Sans:wght@400;700',
  'Ubuntu':                  'Ubuntu:wght@300;400;500;700',
  'Hind':                    'Hind:wght@300;400;500;600;700',
  'Titillium Web':           'Titillium+Web:wght@300;400;600;700',
  'Exo 2':                   'Exo+2:wght@300;400;500;600;700',
  'Mukta':                   'Mukta:wght@300;400;500;600;700',
  'Oxygen':                  'Oxygen:wght@300;400;700',
  // Geometric
  'Montserrat':              'Montserrat:wght@300;400;500;600;700',
  'Poppins':                 'Poppins:wght@300;400;500;600;700',
  'Raleway':                 'Raleway:wght@300;400;500;600;700',
  'Josefin Sans':            'Josefin+Sans:wght@300;400;600;700',
  'Nunito':                  'Nunito:wght@300;400;600;700',
  'Comfortaa':               'Comfortaa:wght@300;400;500;600;700',
  // Condensed
  'IBM Plex Sans Condensed': 'IBM+Plex+Sans+Condensed:wght@300;400;500;600;700',
  'Barlow Condensed':        'Barlow+Condensed:wght@300;400;500;600;700',
  'Roboto Condensed':        'Roboto+Condensed:wght@300;400;500;600;700',
  'Oswald':                  'Oswald:wght@300;400;500;600;700',
  'Yanone Kaffeesatz':       'Yanone+Kaffeesatz:wght@300;400;500;600;700',
  'Barlow Semi Condensed':   'Barlow+Semi+Condensed:wght@300;400;500;600;700',
  'Saira Condensed':         'Saira+Condensed:wght@300;400;500;600;700',
  // Humanist
  'IBM Plex Sans':           'IBM+Plex+Sans:wght@300;400;500;600;700',
  'Cabin':                   'Cabin:wght@400;500;600;700',
  'Fira Sans':               'Fira+Sans:wght@300;400;500;600;700',
  'Dosis':                   'Dosis:wght@300;400;500;600;700',
  'Catamaran':               'Catamaran:wght@300;400;500;600;700',
  'Arimo':                   'Arimo:wght@400;500;600;700',
  // Serif
  'Merriweather':            'Merriweather:wght@300;400;700',
  'Playfair Display':        'Playfair+Display:wght@400;500;600;700',
  'Lora':                    'Lora:wght@400;500;600;700',
  'EB Garamond':             'EB+Garamond:wght@400;500;600;700',
  'Crimson Pro':             'Crimson+Pro:wght@300;400;600;700',
  'Spectral':                'Spectral:wght@300;400;600;700',
  'Cormorant Garamond':      'Cormorant+Garamond:wght@300;400;500;600;700',
  'Libre Baskerville':       'Libre+Baskerville:wght@400;700',
  'PT Serif':                'PT+Serif:wght@400;700',
  'Bitter':                  'Bitter:wght@300;400;500;600;700',
  'Arvo':                    'Arvo:wght@400;700',
  'Zilla Slab':              'Zilla+Slab:wght@300;400;500;600;700',
  'Vollkorn':                'Vollkorn:wght@400;500;600;700',
  'Cardo':                   'Cardo:wght@400;700',
  'Libre Caslon Text':       'Libre+Caslon+Text:wght@400;700',
  // Display
  'Bebas Neue':              'Bebas+Neue',
  'Anton':                   'Anton',
  'Exo':                     'Exo:wght@300;400;500;600;700',
  'Audiowide':               'Audiowide',
  'Righteous':               'Righteous',
  // Monospace
  'JetBrains Mono':          'JetBrains+Mono:wght@300;400;500;600;700',
  'Fira Code':               'Fira+Code:wght@300;400;500;600;700',
  'IBM Plex Mono':           'IBM+Plex+Mono:wght@300;400;500;600;700',
  'Space Mono':              'Space+Mono:wght@400;700',
  'Source Code Pro':         'Source+Code+Pro:wght@300;400;500;600;700',
  'Roboto Mono':             'Roboto+Mono:wght@300;400;500;600;700',
  'Courier Prime':           'Courier+Prime:wght@400;700',
  'Inconsolata':             'Inconsolata:wght@300;400;500;600;700',
  'Overpass Mono':           'Overpass+Mono:wght@300;400;500;600;700',
  'Anonymous Pro':           'Anonymous+Pro:wght@400;700',
  // System (no Google Font needed)
  'Georgia':                 null,
  'Arial':                   null,
  'Helvetica':               null,
  'Times New Roman':         null,
  'Trebuchet MS':            null,
  'Verdana':                 null,
}

function googleFontLink(family: string): string {
  const key = GOOGLE_FONT_MAP[family]
  if (!key) return ''
  return `
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=${key}&display=swap" rel="stylesheet">`
}

function phoneIcon() {
  return `<svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.32.57 3.58.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1C10.29 21 3 13.71 3 4.5c0-.55.45-1 1-1H8c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.36.03.74-.24 1.01L6.6 10.8z"/></svg>`
}
function emailIcon() {
  return `<svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>`
}
function linkedinIcon() {
  return `<svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/></svg>`
}
function globeIcon() {
  return `<svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>`
}
function githubIcon() {
  return `<svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"/></svg>`
}
function pinIcon() {
  return `<svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`
}

export function buildResumeHtml(data: ResumeData, printMode = false): string {
  const { styles } = data
  const ff = `'${styles.fontFamily}', Arial, sans-serif`
  const fw = styles.fontWeight ?? 400
  const fs = styles.baseFontSize
  const lh = styles.lineHeight
  const ss = styles.sectionSpacing
  const js = styles.jobSpacing
  const ac = styles.accentColor ?? '#000000'
  const pm = styles.pageMargin ?? 0.5

  const vPad = printMode ? `${Math.max(0.3, pm - 0.12)}in` : `${pm * 0.78}in`
  const hPad = `${pm}in`
  const screenPad = `${vPad} ${hPad}`
  const titleFs = Math.round((fs + 0.7) * 10) / 10

  const co = data.contact

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${data.name} — Resume</title>${googleFontLink(styles.fontFamily)}
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: ${ff};
      font-size: ${fs}pt;
      font-weight: ${fw};
      line-height: ${lh};
      color: #000;
      background: #fff;
      padding: ${screenPad};
    }
    .hdr-name { font-size: 26pt; font-weight: 700; letter-spacing: 0.5px; margin-bottom: 2px; color: ${ac}; }
    .hdr-title { font-size: ${titleFs}pt; font-weight: 500; color: #444; margin-bottom: 4px; letter-spacing: 0.2px; }
    .hdr-contact {
      display: flex; align-items: center; gap: 10px; flex-wrap: nowrap;
      font-size: 9pt; font-weight: bold;
    }
    .hdr-contact a { color: #000; text-decoration: none; font-weight: bold; }
    a { color: #000; text-decoration: none; }
    a:hover { text-decoration: underline; }
    .ci { display: inline-flex; align-items: center; gap: 4px; white-space: nowrap; }
    .ci svg { flex-shrink: 0; }
    .sec { margin-top: ${ss}px; }
    .sec-title {
      font-weight: 700; font-size: ${titleFs}pt; text-transform: uppercase;
      letter-spacing: 0.4px; border-bottom: 1.5px solid ${ac};
      padding-bottom: 2px; margin-bottom: 3px; color: ${ac};
    }
    .summary { text-align: justify; }
    .sk-ul { list-style: disc; padding-left: 15px; }
    .sk-ul li { margin-bottom: 0.5px; }
    .sk { font-weight: 700; }
    .in-ul { list-style: disc; padding-left: 15px; }
    .in-ul li { margin-bottom: 2px; text-align: justify; }
    .in-ul a { color: #000; text-decoration: none; }
    .job { margin-bottom: ${js}px; }
    .job-hdr { display: flex; justify-content: space-between; align-items: baseline; }
    .job-role { font-weight: 700; }
    .job-date { font-style: italic; font-size: ${fs}pt; white-space: nowrap; margin-left: 6px; }
    .job-co { font-size: ${fs}pt; margin-bottom: 1.5px; }
    .job-ul { list-style: disc; padding-left: 15px; }
    .job-ul li { text-align: justify; margin-bottom: 1px; }
    .bottom { margin-top: ${ss}px; }
    .bottom::after { content: ''; display: block; clear: both; }
    .edu-col { float: left; width: 35%; padding-right: 10px; }
    .proj-col { float: left; width: 65%; padding-left: 6px; }
    .edu-e, .proj-e { page-break-inside: avoid; break-inside: avoid; }
    .col-title {
      font-weight: 700; font-size: ${titleFs}pt; text-transform: uppercase;
      letter-spacing: 0.4px; border-bottom: 1.5px solid ${ac};
      padding-bottom: 2px; margin-bottom: 3px; color: ${ac};
    }
    .edu-e { margin-bottom: 3px; }
    .edu-deg { font-weight: 700; font-size: ${titleFs}pt; }
    .edu-school { font-style: italic; font-size: ${fs}pt; }
    .edu-meta { font-size: ${fs}pt; }
    .edu-cw { font-size: ${Math.max(fs - 0.2, 7)}pt; margin-top: 1px; }
    .edu-cwl { font-weight: 700; }
    .proj-e { margin-bottom: 3px; }
    .proj-t { font-weight: 700; font-size: ${titleFs}pt; }
    .proj-t a { color: #000; font-weight: bold; text-decoration: none; }
    .proj-ul { list-style: disc; padding-left: 15px; }
    .proj-ul li { font-size: ${fs}pt; text-align: justify; }
    @media print {
      @page { size: letter; margin: 0; }
      body { padding: 0.37in 0.5in 0.24in 0.5in; }
    }
  </style>
</head>
<body>

<div>
  <div class="hdr-name">${data.name}</div>
  ${data.title ? `<div class="hdr-title">${data.title}</div>` : ''}
  <div class="hdr-contact">
    ${co.phone ? `<span class="ci">${phoneIcon()} ${co.phone}</span>` : ''}
    ${co.email ? `<span class="ci">${emailIcon()} <a href="mailto:${co.email}">${co.email}</a></span>` : ''}
    ${co.linkedin.url ? `<span class="ci">${linkedinIcon()} <a href="${co.linkedin.url}">${co.linkedin.label || co.linkedin.url}</a></span>` : ''}
    ${co.portfolio.url ? `<span class="ci">${globeIcon()} <a href="${co.portfolio.url}">${co.portfolio.label || 'Portfolio'}</a></span>` : ''}
    ${co.github.url ? `<span class="ci">${githubIcon()} <a href="${co.github.url}">${co.github.label || co.github.url}</a></span>` : ''}
    ${co.location ? `<span class="ci">${pinIcon()} ${co.location}</span>` : ''}
  </div>
</div>

<div class="sec">
  <div class="sec-title">PROFESSIONAL SUMMARY</div>
  <p class="summary">${data.summary}</p>
</div>

<div class="sec">
  <div class="sec-title">TECHNICAL SKILLS</div>
  <ul class="sk-ul">
    ${data.skills.map(s => `<li><span class="sk">${s.category}:</span> ${s.items}</li>`).join('\n    ')}
  </ul>
</div>

${data.upskilling.length > 0 ? `
<div class="sec">
  <div class="sec-title">UPSKILLING &amp; PRODUCT INNOVATION</div>
  <ul class="in-ul">
    ${data.upskilling.map(u => `<li>${u.html}</li>`).join('\n    ')}
  </ul>
</div>
` : ''}

<div class="sec">
  <div class="sec-title">WORK EXPERIENCE</div>
  ${data.experience.map(job => `
  <div class="job">
    <div class="job-hdr">
      <div class="job-role">${job.role}</div>
      <div class="job-date">${job.dateRange}</div>
    </div>
    <div class="job-co">${job.company} &nbsp;&bull;&nbsp; ${job.type}</div>
    <ul class="job-ul">
      ${job.bullets.map(b => `<li>${b}</li>`).join('\n      ')}
    </ul>
  </div>`).join('')}
</div>

<div class="bottom">
  <div class="edu-col">
    <div class="col-title">EDUCATION</div>
    ${data.education.map(e => `
    <div class="edu-e">
      <div class="edu-deg">${e.degree}</div>
      <div class="edu-school">${e.school}</div>
      <div class="edu-meta">${e.dateRange}${e.cgpa ? ` | CGPA: ${e.cgpa}` : ''}</div>
      ${e.coursework ? `<div class="edu-cw"><span class="edu-cwl">Relevant Coursework:</span> ${e.coursework}</div>` : ''}
    </div>`).join('')}
  </div>
  <div class="proj-col">
    <div class="col-title">PROJECTS</div>
    ${data.projects.map(p => `
    <div class="proj-e">
      ${p.url ? `<div class="proj-t"><a href="${p.url}">${p.title}</a></div>` : `<div class="proj-t">${p.title}</div>`}
      <ul class="proj-ul"><li>${p.bullet}</li></ul>
    </div>`).join('')}
  </div>
</div>

</body>
</html>`
}
