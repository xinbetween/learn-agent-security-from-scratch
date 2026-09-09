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

  /* ------------------------------------------------------------ search */
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
