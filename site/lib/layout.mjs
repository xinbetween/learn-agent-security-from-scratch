import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { esc } from './components.mjs';
import { LOCALES, localeOf, href, t } from './i18n.mjs';

/* The stylesheet and script are served with a four-hour cache, so a fix to
   either would otherwise sit unseen in a reader's browser until the copy
   expired. A content hash on the URL makes every deploy a fresh fetch. */
const assetVersion = (rel) =>
  createHash('sha1').update(readFileSync(new URL(rel, import.meta.url))).digest('hex').slice(0, 8);
const CSS_URL = `/assets/css/app.css?v=${assetVersion('../assets/css/app.css')}`;
const JS_URL = `/assets/js/app.js?v=${assetVersion('../assets/js/app.js')}`;

export { LOCALES, localeOf, href } from './i18n.mjs';

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
    '27 chapters, runnable Python, interactive attack labs, six graded projects.',
};

/* `path` is always the locale-independent path, e.g. /curriculum/. The locale
   base is added here, so a page never has to know where it is being served. */
const nav = (active, code) => {
  const L = t(code);
  const items = [
    ['/curriculum/', L.nav.curriculum, false],
    ['/projects/', L.nav.projects, false],
    ['/threats/', L.nav.threats, true],
    ['/timeline/', L.nav.timeline, true],
    ['/glossary/', L.nav.glossary, true],
    ['/references/', L.nav.references, true],
  ];
  return items.map(([p, label, small]) =>
    `<a href="${href(p, code)}"${small ? ' class="hide-sm"' : ''}${active === p ? ' aria-current="page"' : ''}>${label}</a>`
  ).join('');
};

/* Same page, other language. Every path exists in every locale, so the switch
   never dead-ends the reader on a home page. */
const langSwitch = (path, code) => {
  const L = t(code);
  return `<div class="langsw" role="group" aria-label="${esc(L.language)}">${
    LOCALES.map(l => l.code === code
      ? `<span class="on" lang="${l.lang}" aria-current="true" title="${esc(l.name)}">${l.label}</span>`
      : `<a lang="${l.lang}" href="${href(path, l.code)}" title="${esc(l.name)}" hreflang="${l.lang}">${l.label}</a>`
    ).join('')}</div>`;
};

const SEARCH_ICON = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5 L21 21"/></svg>`;

const GITHUB_ICON = `<svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg>`;

/* The palette. Markup is static; app.js fills the results and fetches the
   locale's search index the first time it opens. The page reads fine without
   JS because the button simply does nothing. */
const searchDialog = (code) => {
  const L = t(code);
  const strings = {
    base: localeOf(code).base,
    browse: L.search.browse,
    loading: L.search.loading,
    failed: L.search.failed,
    failedOr: L.search.failedOr,
    noResultsBefore: L.search.noResultsBefore,
    noResultsAfter: L.search.noResultsAfter,
    glossaryWord: L.search.glossaryWord,
    curriculumWord: L.search.curriculumWord,
    one: L.search.one,
    many: L.search.many(0).replace('0', '{n}'),
    groups: L.search.groups,
  };
  return `
<div class="search-dlg" data-search-dlg hidden data-search-i18n="${esc(JSON.stringify(strings))}">
  <div class="search-backdrop" data-search-close></div>
  <div class="search-panel" role="dialog" aria-modal="true" aria-label="${esc(L.search.label)}">
    <form class="search-in" role="search" onsubmit="return false">
      ${SEARCH_ICON}
      <input type="search" data-search-input placeholder="${esc(L.search.placeholder)}"
             aria-label="${esc(L.search.button)}" autocomplete="off" autocapitalize="off" spellcheck="false"
             role="combobox" aria-expanded="true" aria-controls="search-results" aria-autocomplete="list">
      <button type="button" class="search-esc" data-search-close aria-label="${esc(L.search.close)}">esc</button>
    </form>
    <div class="search-results" id="search-results" role="listbox" data-search-results></div>
    <div class="search-foot">
      <span><kbd>↑</kbd><kbd>↓</kbd> ${L.search.hintNavigate}</span>
      <span><kbd>↵</kbd> ${L.search.hintOpen}</span>
      <span><kbd>esc</kbd> ${L.search.hintClose}</span>
      <span class="count" data-search-count aria-live="polite"></span>
    </div>
  </div>
</div>`;
};

const foot = (code) => {
  const L = t(code);
  return `
<footer class="sitefoot"><div class="wrap"><div class="cols">
<div>
  <h5>${esc(L.siteTitle)}</h5>
  <p class="note">${L.footer.blurb}</p>
  <p class="note"><a href="${SITE.repo}">${L.footer.source}</a> · <a href="${SITE.sibling}">${L.footer.sibling}</a></p>
</div>
<div><h5>${L.footer.courseHead}</h5><ul>
  <li><a href="${href('/chapters/a01/', code)}">${L.footer.startAt}</a></li>
  <li><a href="${href('/curriculum/', code)}">${L.nav.curriculum}</a></li>
  <li><a href="${href('/projects/', code)}">${L.nav.projects}</a></li>
  <li><a href="${href('/capstone/', code)}">${L.footer.capstone}</a></li>
  <li><a href="${href('/setup/', code)}">${L.footer.setup}</a></li>
</ul></div>
<div><h5>${L.footer.referenceHead}</h5><ul>
  <li><a href="${href('/threats/', code)}">${L.nav.threats}</a></li>
  <li><a href="${href('/defenses/', code)}">${L.footer.defenses}</a></li>
  <li><a href="${href('/glossary/', code)}">${L.nav.glossary}</a></li>
  <li><a href="${href('/timeline/', code)}">${L.nav.timeline}</a></li>
</ul></div>
<div><h5>${L.footer.creditsHead}</h5><ul>
  <li><a href="${href('/references/', code)}">${L.footer.allReferences}</a></li>
  <li><a href="${href('/sources/', code)}">${L.footer.sourceLists}</a></li>
  <li><a href="https://github.com/ucsb-mlsec/Awesome-Agent-Security">Awesome-Agent-Security</a></li>
  <li><a href="https://github.com/LLMSecurity/awesome-agent-skills-security">Agent Skills Security</a></li>
  <li><a href="https://github.com/VoltAgent/awesome-ai-agent-papers">Awesome AI Agent Papers</a></li>
</ul></div>
</div></div></footer>`;
};

/**
 * page({ title, description, path, body, locale, bodyClass, head, scripts })
 * `path` is locale-independent (/curriculum/); the locale base is applied here.
 */
export function page({ title, description, path, body, locale = 'en', bodyClass = '', head = '', scripts = [] }) {
  const loc = localeOf(locale);
  const L = t(locale);
  const full = path === '/' ? L.siteTitle : `${title} · ${L.siteTitle}`;
  const desc = description || L.siteDescription;
  const canonical = SITE.url + href(path, locale);
  const alternates = LOCALES.map(l =>
    `<link rel="alternate" hreflang="${l.lang}" href="${SITE.url + href(path, l.code)}">`).join('\n') +
    `\n<link rel="alternate" hreflang="x-default" href="${SITE.url + href(path, 'en')}">`;

  return `<!doctype html>
<html lang="${loc.lang}" dir="${loc.dir}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(full)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${canonical}">
${alternates}
<meta name="theme-color" content="#fbfaf8" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#100f0d" media="(prefers-color-scheme: dark)">
<meta name="color-scheme" content="light dark">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(full)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${canonical}">
<meta property="og:locale" content="${loc.lang.replace('-', '_')}">
<meta property="og:site_name" content="${esc(L.siteTitle)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="${SITE.twitter}">
<meta name="twitter:title" content="${esc(full)}">
<meta name="twitter:description" content="${esc(desc)}">
<link rel="stylesheet" href="${CSS_URL}">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<script>(function(){try{var t=localStorage.getItem('as-theme');if(t)document.documentElement.setAttribute('data-theme',t);}catch(e){}})();</script>
${head}
</head>
<body class="${bodyClass}">
<a class="skip" href="#main">${esc(L.skipToContent)}</a>
<header class="topbar"><div class="topbar-inner">
  <a class="brand" href="${href('/', locale)}"><span class="brand-mark">▲</span> ${esc(L.brand)}</a>
  <nav class="topnav">
    ${nav(path, locale)}
    <button class="searchbtn" type="button" data-search-open aria-label="${esc(L.search.label)}" aria-haspopup="dialog" aria-expanded="false" title="${esc(L.search.button)} (⌘K)">
      ${SEARCH_ICON}<span class="lbl">${esc(L.search.button)}</span><kbd class="kb" data-search-kbd>⌘K</kbd></button>
    ${langSwitch(path, locale)}
    <button class="iconbtn" data-theme-toggle aria-label="${esc(L.toggleTheme)}" title="${esc(L.themeTitle)}">◐</button>
    <a class="iconbtn" href="${SITE.repo}" aria-label="${esc(L.footer.source)}" title="${esc(L.footer.source)}" rel="noopener">${GITHUB_ICON}</a>
  </nav>
</div></header>
<main id="main">
${body}
</main>
${foot(locale)}
${searchDialog(locale)}
<script src="${JS_URL}"></script>
${scripts.map(s => `<script src="${s}"></script>`).join('\n')}
</body>
</html>`;
}
