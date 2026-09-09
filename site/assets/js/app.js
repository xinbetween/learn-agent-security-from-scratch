/* Learn Agent Security From Scratch — runtime.
   No dependencies. Everything degrades to readable HTML without JS. */
(function () {
  'use strict';

  /* ------------------------------------------------------------- theme */
  var root = document.documentElement;
  function setTheme(t) {
    if (t === 'system') { root.removeAttribute('data-theme'); try { localStorage.removeItem('as-theme'); } catch (e) {} }
    else { root.setAttribute('data-theme', t); try { localStorage.setItem('as-theme', t); } catch (e) {} }
  }
  function currentTheme() {
    var s = root.getAttribute('data-theme');
    if (s) return s;
    return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-theme-toggle]');
    if (!b) return;
    setTheme(currentTheme() === 'dark' ? 'light' : 'dark');
  });

  /* --------------------------------------------------------- highlighter
     Deliberately small: keywords, strings, comments, numbers, calls.
     Handles Python, JS and shell well enough for teaching snippets. */
  var KW = /\b(?:def|class|return|if|elif|else|for|while|in|not|and|or|import|from|as|with|try|except|finally|raise|assert|lambda|yield|pass|break|continue|global|None|True|False|async|await|const|let|var|function|new|typeof|instanceof|export|default|this|null|undefined|throw|case|switch|of|do|extends|super|static)\b/;
  function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function highlight(src, lang) {
    var out = '', i = 0, n = src.length;
    var lineCom = (lang === 'py' || lang === 'sh' || lang === 'yaml' || lang === 'toml') ? '#' : '//';
    while (i < n) {
      var c = src[i];
      // triple-quoted / template strings
      if (lang === 'py' && (src.startsWith('"""', i) || src.startsWith("'''", i))) {
        var q3 = src.substr(i, 3), e3 = src.indexOf(q3, i + 3);
        e3 = e3 === -1 ? n : e3 + 3;
        out += '<span class="tok-str">' + esc(src.slice(i, e3)) + '</span>'; i = e3; continue;
      }
      if (c === '"' || c === "'" || c === '`') {
        var j = i + 1;
        while (j < n && src[j] !== c) { if (src[j] === '\\') j++; j++; }
        out += '<span class="tok-str">' + esc(src.slice(i, Math.min(j + 1, n))) + '</span>'; i = j + 1; continue;
      }
      if (src.startsWith(lineCom, i)) {
        var e = src.indexOf('\n', i); e = e === -1 ? n : e;
        out += '<span class="tok-com">' + esc(src.slice(i, e)) + '</span>'; i = e; continue;
      }
      if (/[0-9]/.test(c) && !/[\w.]/.test(src[i - 1] || ' ')) {
        var k = i; while (k < n && /[0-9a-fx_.]/i.test(src[k])) k++;
        out += '<span class="tok-num">' + esc(src.slice(i, k)) + '</span>'; i = k; continue;
      }
      if (/[A-Za-z_]/.test(c)) {
        var m = i; while (m < n && /[\w]/.test(src[m])) m++;
        var w = src.slice(i, m);
        if (KW.test(w) && KW.exec(w)[0] === w) out += '<span class="tok-kw">' + w + '</span>';
        else if (src[m] === '(') out += '<span class="tok-fn">' + w + '</span>';
        else out += esc(w);
        i = m; continue;
      }
      out += esc(c); i++;
    }
    return out;
  }
  document.querySelectorAll('pre > code[data-lang]').forEach(function (el) {
    el.innerHTML = highlight(el.textContent, el.getAttribute('data-lang'));
  });

  /* -------------------------------------------------------------- quiz */
  document.querySelectorAll('.quiz').forEach(function (quiz) {
    var total = quiz.querySelectorAll('.q').length, done = 0, right = 0;
    var score = quiz.querySelector('.quiz-score');
    quiz.addEventListener('click', function (e) {
      var b = e.target.closest('.opt'); if (!b) return;
      var q = b.closest('.q'); if (q.classList.contains('answered')) return;
      q.classList.add('answered');
      var ok = b.dataset.correct === '1';
      q.querySelectorAll('.opt').forEach(function (o) {
        o.disabled = true;
        if (o.dataset.correct === '1') o.classList.add('right');
      });
      if (!ok) b.classList.add('wrong');
      done++; if (ok) right++;
      if (score) score.textContent = done + ' of ' + total + ' answered · ' + right + ' correct';
    });
  });

  /* ------------------------------------------------- simulator registry */
  var SIMS = {};
  window.registerSim = function (name, fn) { SIMS[name] = fn; };
  window.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-sim]').forEach(function (el) {
      var f = SIMS[el.dataset.sim];
      if (f) { try { f(el); } catch (err) { console.error('sim ' + el.dataset.sim, err); } }
    });
  });

  /* ------------------------------------------------------- helpers for sims */
  window.simUtil = {
    $: function (el, sel) { return el.querySelector(sel); },
    $$: function (el, sel) { return Array.prototype.slice.call(el.querySelectorAll(sel)); },
    esc: esc,
    // wire every range/select/checkbox in a sim to a render function
    bind: function (el, render) {
      el.querySelectorAll('input, select, button[data-act]').forEach(function (i) {
        var ev = (i.tagName === 'BUTTON') ? 'click' : 'input';
        i.addEventListener(ev, function () { render(i); });
      });
      render(null);
    },
    // show a live value next to a range
    live: function (el, id, fmt) {
      var inp = el.querySelector('#' + id), out = el.querySelector('#' + id + '-v');
      if (inp && out) { var f = function () { out.textContent = fmt ? fmt(inp.value) : inp.value; }; inp.addEventListener('input', f); f(); }
    }
  };

  /* ----------------------------------------------------- heading anchors */
  document.querySelectorAll('article h2[id], article h3[id]').forEach(function (h) {
    var a = document.createElement('a');
    a.className = 'anchor'; a.href = '#' + h.id; a.textContent = '#';
    a.setAttribute('aria-label', 'Link to this section');
    h.appendChild(a);
  });

  /* ------------------------------------------------- global search palette
     Index is built by build.mjs into /search-index.json and fetched the first
     time the palette opens. Scoring is plain substring matching per token,
     weighted by where the token lands (title > kicker > body) and by entry
     type, so a chapter always outranks the section that merely mentions it. */
  var dlg = document.querySelector('[data-search-dlg]');
  if (dlg) {
    var input = dlg.querySelector('[data-search-input]');
    var list = dlg.querySelector('[data-search-results]');
    var count = dlg.querySelector('[data-search-count]');
    var openers = document.querySelectorAll('[data-search-open]');
    var INDEX = null, loading = null, hits = [], active = -1, lastFocus = null;
    var isMac = /Mac|iPhone|iPad/.test(navigator.platform || '');
    document.querySelectorAll('[data-search-kbd]').forEach(function (k) { k.textContent = isMac ? '⌘K' : 'Ctrl K'; });

    var GROUPS = [['chapter', 'Chapters'], ['section', 'In chapters'], ['glossary', 'Glossary'], ['page', 'Elsewhere']];
    var TYPE_W = { chapter: 40, glossary: 24, section: 12, page: 8 };
    var GROUP_CAP = { chapter: 6, section: 12, glossary: 6, page: 8 };

    function load() {
      if (INDEX) return Promise.resolve(INDEX);
      if (!loading) {
        loading = fetch('/search-index.json').then(function (r) {
          if (!r.ok) throw new Error(r.status);
          return r.json();
        }).then(function (j) {
          INDEX = j.map(function (e) {
            return { t: e.t, u: e.u, h: e.h, k: e.k || '', x: e.x || '',
                     hl: e.h.toLowerCase(), kl: (e.k || '').toLowerCase(), xl: (e.x || '').toLowerCase() };
          });
          return INDEX;
        }).catch(function (err) { loading = null; throw err; });
      }
      return loading;
    }

    function tokens(q) {
      return q.toLowerCase().split(/[\s,;:]+/).filter(Boolean);
    }
    var reEsc = function (s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); };
    function mark(text, toks) {
      if (!toks.length) return esc(text);
      var re = new RegExp('(' + toks.map(reEsc).join('|') + ')', 'ig');
      return text.split(re).map(function (part, i) {
        return i % 2 ? '<mark>' + esc(part) + '</mark>' : esc(part);
      }).join('');
    }
    function snippet(e, toks) {
      var x = e.x; if (!x) return '';
      var pos = -1;
      for (var i = 0; i < toks.length && pos === -1; i++) pos = e.xl.indexOf(toks[i]);
      if (pos === -1 || pos < 90) return x.slice(0, 180);
      var start = x.lastIndexOf(' ', pos - 60); if (start < 0) start = pos - 60;
      return '…' + x.slice(start + 1, start + 200);
    }

    function search(q) {
      var toks = tokens(q); if (!toks.length) return [];
      var ql = q.trim().toLowerCase(), out = [];
      for (var i = 0; i < INDEX.length; i++) {
        var e = INDEX[i], score = 0, ok = true;
        for (var j = 0; j < toks.length; j++) {
          var t = toks[j], s = 0;
          if (e.hl.indexOf(t) !== -1) s += 30 + (e.hl.indexOf(t) === 0 ? 10 : 0);
          if (e.kl.indexOf(t) !== -1) s += 10;
          if (e.xl.indexOf(t) !== -1) s += 4;
          if (!s) { ok = false; break; }
          score += s;
        }
        if (!ok) continue;
        if (e.hl === ql) score += 80;
        else if (e.hl.indexOf(ql) !== -1) score += 30;
        else if (e.xl.indexOf(ql) !== -1) score += 8;
        score += TYPE_W[e.t] || 0;
        out.push({ e: e, s: score });
      }
      out.sort(function (a, b) { return b.s - a.s; });
      var per = {}, res = [];
      for (var k = 0; k < out.length; k++) {
        var ty = out[k].e.t; per[ty] = (per[ty] || 0) + 1;
        if (per[ty] <= GROUP_CAP[ty]) res.push(out[k].e);
      }
      return res;
    }

    function render(q) {
      var toks = tokens(q);
      if (!INDEX) { list.innerHTML = '<div class="empty">Building the index…</div>'; count.textContent = ''; hits = []; active = -1; return; }
      hits = toks.length ? search(q) : INDEX.filter(function (e) { return e.t === 'chapter'; });
      var html = '', n = 0;
      if (!hits.length) {
        html = '<div class="empty">Nothing matches <b>“' + esc(q.trim()) + '”</b>. Try fewer words, or a term from the <a href="/glossary/">glossary</a>.</div>';
      } else if (!toks.length) {
        html += '<div class="grp">Jump to a chapter</div>';
        hits.forEach(function (e) { html += hit(e, n++, toks); });
      } else {
        GROUPS.forEach(function (g) {
          var these = hits.filter(function (e) { return e.t === g[0]; });
          if (!these.length) return;
          html += '<div class="grp">' + g[1] + '</div>';
          these.forEach(function (e) { html += hit(e, n++, toks); });
        });
        // keep `hits` in rendered order so the keyboard index lines up
        hits = GROUPS.reduce(function (acc, g) { return acc.concat(hits.filter(function (e) { return e.t === g[0]; })); }, []);
      }
      list.innerHTML = html;
      count.textContent = toks.length && hits.length ? (hits.length === 1 ? '1 result' : hits.length + ' results') : '';
      setActive(hits.length ? 0 : -1, false);
    }
    function hit(e, i, toks) {
      var sn = toks.length ? snippet(e, toks) : e.x.slice(0, 140);
      return '<a class="hit" role="option" id="sr-' + i + '" data-i="' + i + '" href="' + e.u + '" aria-selected="false">' +
        '<span class="hrow"><span class="ht">' + mark(e.h, toks) + '</span>' +
        (e.k ? '<span class="hk">' + mark(e.k, toks) + '</span>' : '') + '</span>' +
        (sn ? '<span class="hs">' + mark(sn, toks) + '</span>' : '') + '</a>';
    }
    function setActive(i, scroll) {
      active = i;
      var rows = list.querySelectorAll('.hit');
      rows.forEach(function (r, j) { r.setAttribute('aria-selected', j === i ? 'true' : 'false'); });
      input.setAttribute('aria-activedescendant', i >= 0 ? 'sr-' + i : '');
      if (scroll !== false && i >= 0 && rows[i]) rows[i].scrollIntoView({ block: 'nearest' });
    }
    function go(i) {
      var e = hits[i]; if (!e) return;
      close();
      var same = e.u.split('#')[0] === location.pathname;
      location.href = e.u;
      if (same && e.u.indexOf('#') !== -1) {           // same page: the hash change alone may not scroll
        var el = document.getElementById(e.u.split('#')[1]);
        if (el) el.scrollIntoView({ block: 'start' });
      }
    }

    function open() {
      if (!dlg.hidden) return;
      lastFocus = document.activeElement;
      dlg.hidden = false;
      document.body.classList.add('search-open');
      openers.forEach(function (b) { b.setAttribute('aria-expanded', 'true'); });
      input.value = ''; render('');
      input.focus();
      load().then(function () { if (!dlg.hidden) render(input.value); })
        .catch(function () { list.innerHTML = '<div class="empty">The search index could not be loaded. Try the <a href="/curriculum/">curriculum</a> or the <a href="/glossary/">glossary</a>.</div>'; });
    }
    function close() {
      if (dlg.hidden) return;
      dlg.hidden = true;
      document.body.classList.remove('search-open');
      openers.forEach(function (b) { b.setAttribute('aria-expanded', 'false'); });
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    openers.forEach(function (b) { b.addEventListener('click', open); });
    dlg.querySelectorAll('[data-search-close]').forEach(function (b) { b.addEventListener('click', close); });
    input.addEventListener('input', function () { render(input.value); });
    list.addEventListener('mousemove', function (e) {
      var a = e.target.closest('.hit'); if (a && +a.dataset.i !== active) setActive(+a.dataset.i, false);
    });
    list.addEventListener('click', function (e) {
      var a = e.target.closest('.hit'); if (!a) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;   // let the browser open it in a new tab
      e.preventDefault(); go(+a.dataset.i);
    });
    dlg.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.preventDefault(); close(); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); if (hits.length) setActive((active + 1) % hits.length); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); if (hits.length) setActive((active - 1 + hits.length) % hits.length); }
      else if (e.key === 'Home' && e.target === input && !input.value) { e.preventDefault(); setActive(0); }
      else if (e.key === 'End' && e.target === input && !input.value) { e.preventDefault(); setActive(hits.length - 1); }
      else if (e.key === 'Enter') { e.preventDefault(); go(active); }
      else if (e.key === 'Tab') {                       // keep focus inside the palette
        var f = dlg.querySelectorAll('input, button, a.hit');
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    document.addEventListener('keydown', function (e) {
      if ((e.metaKey || e.ctrlKey) && !e.altKey && e.key.toLowerCase() === 'k') {
        e.preventDefault(); dlg.hidden ? open() : close(); return;
      }
      if (e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey && dlg.hidden) {
        var t = e.target;
        if (t && (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable)) return;
        e.preventDefault(); open();
      }
    });
  }

  /* --------------------------------------------------- per-page filter box */
  var sb = document.querySelector('[data-filter]');
  if (sb) {
    var scope = document.querySelector(sb.dataset.filter);
    sb.addEventListener('input', function () {
      var q = sb.value.trim().toLowerCase();
      scope.querySelectorAll('[data-search]').forEach(function (row) {
        row.style.display = (!q || row.dataset.search.toLowerCase().indexOf(q) !== -1) ? '' : 'none';
      });
      scope.querySelectorAll('[data-group]').forEach(function (g) {
        var any = Array.prototype.some.call(g.querySelectorAll('[data-search]'), function (r) { return r.style.display !== 'none'; });
        g.style.display = any ? '' : 'none';
      });
    });
  }
})();
