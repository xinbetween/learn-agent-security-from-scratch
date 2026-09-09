import { esc } from './components.mjs';

export const SITE = {
  title: 'Learn Agent Security From Scratch',
  short: 'Agent Security',
  url: 'https://agentsecurity.xinbetween.com',
  repo: 'https://github.com/xinbetween/learn-agent-security-from-scratch',
  sibling: 'https://llminference.xinbetween.com/en/',
  author: 'xinbetween',
  twitter: '@xinbetween',
  description:
    'Learn AI agent security from scratch: prompt injection, tool poisoning, memory attacks, ' +
    'MCP supply chain, CaMeL, information-flow control, sandboxing and red-teaming. ' +
    '27 chapters, runnable Python, interactive attack labs, five projects and a capstone.',
};

const nav = (active) => {
  const items = [
    ['/curriculum/', 'Curriculum', false],
    ['/projects/', 'Projects', false],
    ['/threats/', 'Threat map', true],
    ['/timeline/', 'Timeline', true],
    ['/glossary/', 'Glossary', true],
    ['/references/', 'References', true],
  ];
  return items.map(([href, label, small]) =>
    `<a href="${href}"${small ? ' class="hide-sm"' : ''}${active === href ? ' aria-current="page"' : ''}>${label}</a>`
  ).join('');
};

const foot = () => `
<footer class="sitefoot"><div class="wrap"><div class="cols">
<div>
  <h5>${esc(SITE.title)}</h5>
  <p class="note">27 chapters, five projects, and a capstone that builds an agent, breaks it,
  and then rebuilds it so the same attacks stop working. Every chapter closes with the papers
  it was built from, credited to their authors.</p>
  <p class="note"><a href="${SITE.repo}">Source on GitHub</a> · <a href="${SITE.sibling}">Sister course: Build an LLM Inference Engine</a></p>
</div>
<div><h5>Course</h5><ul>
  <li><a href="/chapters/a01/">Start at A01</a></li>
  <li><a href="/curriculum/">Curriculum</a></li>
  <li><a href="/projects/">Projects</a></li>
  <li><a href="/capstone/">Capstone</a></li>
  <li><a href="/setup/">Local setup</a></li>
</ul></div>
<div><h5>Reference</h5><ul>
  <li><a href="/threats/">Threat map</a></li>
  <li><a href="/defenses/">Defense map</a></li>
  <li><a href="/glossary/">Glossary</a></li>
  <li><a href="/timeline/">Timeline</a></li>
</ul></div>
<div><h5>Credits</h5><ul>
  <li><a href="/references/">All references</a></li>
  <li><a href="/sources/">Source lists</a></li>
  <li><a href="https://github.com/ucsb-mlsec/Awesome-Agent-Security">Awesome-Agent-Security</a></li>
  <li><a href="https://github.com/LLMSecurity/awesome-agent-skills-security">Agent Skills Security</a></li>
  <li><a href="https://github.com/VoltAgent/awesome-ai-agent-papers">Awesome AI Agent Papers</a></li>
</ul></div>
</div></div></footer>`;

/**
 * page({ title, description, path, body, cls, ogType })
 */
export function page({ title, description, path, body, bodyClass = '', head = '', scripts = [] }) {
  const full = path === '/' ? SITE.title : `${title} · ${SITE.title}`;
  const desc = description || SITE.description;
  const canonical = SITE.url + path;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(full)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${canonical}">
<meta name="theme-color" content="#fbfaf8" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#100f0d" media="(prefers-color-scheme: dark)">
<meta name="color-scheme" content="light dark">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(full)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${canonical}">
<meta property="og:site_name" content="${esc(SITE.title)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="${SITE.twitter}">
<meta name="twitter:title" content="${esc(full)}">
<meta name="twitter:description" content="${esc(desc)}">
<link rel="stylesheet" href="/assets/css/app.css">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<script>(function(){try{var t=localStorage.getItem('as-theme');if(t)document.documentElement.setAttribute('data-theme',t);}catch(e){}})();</script>
${head}
</head>
<body class="${bodyClass}">
<a class="skip" href="#main">Skip to content</a>
<header class="topbar"><div class="topbar-inner">
  <a class="brand" href="/"><span class="brand-mark">▲</span> Agent Security</a>
  <nav class="topnav">
    ${nav(path)}
    <button class="iconbtn" data-theme-toggle aria-label="Toggle colour theme" title="Toggle theme">◐</button>
  </nav>
</div></header>
<main id="main">
${body}
</main>
${foot()}
<script src="/assets/js/app.js"></script>
${scripts.map(s => `<script src="${s}"></script>`).join('\n')}
</body>
</html>`;
}
