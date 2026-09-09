/* Reusable content components. Each returns an HTML string. */

export const esc = (s = '') => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

export const slug = (s) => String(s).toLowerCase()
  .replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-');

/* --- structure ---------------------------------------------------------- */

export const h2 = (t, id) => `<h2 id="${id || slug(t)}">${t}</h2>`;
export const h3 = (t, id) => `<h3 id="${id || slug(t)}">${t}</h3>`;

export const p = (...parts) => `<p>${parts.join(' ')}</p>`;

export const ul = (items) => `<ul>${items.map(i => `<li>${i}</li>`).join('')}</ul>`;
export const ol = (items) => `<ol>${items.map(i => `<li>${i}</li>`).join('')}</ol>`;

/** Numbered step list: [[title, body], ...] */
export const steps = (items) => `<ol class="steps">${items
  .map(([t, b]) => `<li><b>${t}</b>${b}</li>`).join('')}</ol>`;

/** Definition grid: [[term, def], ...] */
export const kv = (pairs) => `<dl class="kv">${pairs
  .map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl>`;

/** callout(kind, label, html) — kind: attack|defense|boundary|trust|warn|note */
export const callout = (kind, label, html) =>
  `<div class="callout ${kind}"><span class="lbl">${label}</span>${html}</div>`;

export const detail = (summary, html) =>
  `<details class="disc"><summary>${summary}</summary>${html}</details>`;

export const pill = (kind, text) => `<span class="pill ${kind}">${text}</span>`;

/** table(headers, rows) — cells are raw HTML */
export const table = (headers, rows) => `<div class="tablewrap"><table>
<thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
<tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>
</table></div>`;

/* --- code --------------------------------------------------------------- */

/** code(src, {lang, file, tag, tagText}) — tag: 'vuln' | 'safe' | any label.
    `tagText` overrides the rendered label while keeping the colour that `tag`
    selects, so a translated chapter can name the state in its own language. */
export const code = (src, { lang = 'py', file = '', tag = '', tagText = '' } = {}) => {
  const kind = /^(vuln|safe)$/.test(tag) ? tag : '';
  const label = tagText || (tag === 'vuln' ? 'vulnerable' : tag === 'safe' ? 'hardened' : tag);
  const head = (file || tag)
    ? `<div class="cb-head"><span>${esc(file)}</span>${tag
        ? `<span class="tag ${kind}">${esc(label)}</span>`
        : ''}</div>`
    : '';
  return `<div class="codeblock">${head}<pre><code data-lang="${lang}">${esc(src.replace(/^\n/, '').replace(/\s+$/, ''))}</code></pre></div>`;
};

/* --- figures ------------------------------------------------------------ */

/** figure(svgOrHtml, captionHtml) */
export const figure = (inner, caption = '') =>
  `<figure class="fig"><div class="fig-frame">${inner}</div>${
    caption ? `<figcaption class="fig-cap">${caption}</figcaption>` : ''}</figure>`;

/** svg(viewBoxWidth, viewBoxHeight, body, {label}) */
export const svg = (w, h, body, { label = '' } = {}) =>
  `<svg viewBox="0 0 ${w} ${h}" role="img"${label ? ` aria-label="${esc(label)}"` : ''} style="max-width:${w}px;margin:0 auto">
<defs>
  <marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
    <path d="M0 0 L10 5 L0 10 z" fill="currentColor"/></marker>
</defs>
${body}</svg>`;

/** Rounded labelled box for diagrams. */
export const box = (x, y, w, h, title, sub = '', cls = 'd-box') => `
<g><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" class="${cls}"/>
<text x="${x + w / 2}" y="${y + (sub ? h / 2 - 3 : h / 2 + 4)}" text-anchor="middle" class="d-lbl">${title}</text>
${sub ? `<text x="${x + w / 2}" y="${y + h / 2 + 12}" text-anchor="middle" class="d-sub">${sub}</text>` : ''}</g>`;

/** Straight arrow with optional label above the midpoint. */
export const arrow = (x1, y1, x2, y2, label = '', cls = 'd-arrow') => {
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  const colour = cls.includes('attack') ? 'var(--attack)' : cls.includes('def') ? 'var(--defense)' : 'var(--fg-faint)';
  return `<g color="${colour}"><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="${cls}" marker-end="url(#ah)"/>${
    label ? `<text x="${mx}" y="${my - 6}" text-anchor="middle" class="${cls.includes('attack') ? 'd-attack-t' : 'd-sub'}">${label}</text>` : ''}</g>`;
};

export const svgText = (x, y, t, cls = 'd-sub', anchor = 'middle') =>
  `<text x="${x}" y="${y}" text-anchor="${anchor}" class="${cls}">${t}</text>`;

/* --- simulator shell ---------------------------------------------------- */

/** sim({name, title, badge, controls, out, note}) */
export const sim = ({ name, title, badge = 'interactive', controls = '', body = '', note = '' }) => `
<div class="sim" data-sim="${name}">
  <div class="sim-head"><span class="t">${title}</span><span class="badge">${badge}</span></div>
  <div class="sim-body">
    ${controls ? `<div class="sim-controls">${controls}</div>` : ''}
    ${body}
    ${note ? `<p class="sim-note">${note}</p>` : ''}
  </div>
</div>`;

export const range = (id, label, min, max, value, step = 1, unit = '') => `
<label class="ctl"><span>${label} <b class="val" id="${id}-v">${value}${unit}</b></span>
<input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${value}"></label>`;

export const select = (id, label, options, value) => `
<label class="ctl"><span>${label}</span><select id="${id}">${options
  .map(([v, t]) => `<option value="${esc(v)}"${v === value ? ' selected' : ''}>${esc(t)}</option>`).join('')}</select></label>`;

export const toggle = (id, label, checked = false) => `
<label class="ctl" style="flex-direction:row;align-items:center;gap:.4rem;min-width:auto">
<input type="checkbox" id="${id}"${checked ? ' checked' : ''} style="accent-color:var(--accent)"><span>${label}</span></label>`;

export const button = (id, label, secondary = false) =>
  `<button class="act${secondary ? ' sec' : ''}" id="${id}" data-act>${label}</button>`;

export const out = (id, initial = '') => `<div class="sim-out" id="${id}">${initial}</div>`;
