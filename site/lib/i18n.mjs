/* Locales, and every string that belongs to the page furniture rather than to
   the course content. Chapter prose, the glossary, the maps and the timeline
   live in per-locale content trees under site/content/; what follows is the
   chrome: nav, footer, pager, quiz labels, the search palette.

   English is served from the origin root so that every URL published before
   the site had a second language still resolves. Chinese is served under /zh/.
   Add a locale by appending to LOCALES and adding a UI block with the same
   keys; build.mjs will pick it up and check.mjs will verify it. */

export const LOCALES = [
  { code: 'en', base: '',    lang: 'en',      dir: 'ltr', label: 'EN', name: 'English' },
  { code: 'zh', base: '/zh', lang: 'zh-Hans', dir: 'ltr', label: '中文', name: '简体中文' },
];

export const localeOf = (code) => LOCALES.find(l => l.code === code) || LOCALES[0];

/** Prefix an absolute site path with the locale base. href('/curriculum/', 'zh') → '/zh/curriculum/' */
export const href = (path, code) => {
  const base = localeOf(code).base;
  if (!base) return path;
  return path === '/' ? base + '/' : base + path;
};

export const UI = {
  en: {
    siteTitle: 'Learn Agent Security From Scratch',
    siteShort: 'Agent Security',
    brand: 'Agent Security',
    siteDescription:
      'Learn AI agent security from scratch: prompt injection, tool poisoning, memory attacks, ' +
      'MCP supply chain, CaMeL, information-flow control, sandboxing and red-teaming. ' +
      '27 chapters, runnable Python, interactive attack labs, six graded projects.',

    skipToContent: 'Skip to content',
    toggleTheme: 'Toggle colour theme',
    themeTitle: 'Toggle theme',
    language: 'Language',

    nav: {
      curriculum: 'Curriculum',
      projects: 'Projects',
      threats: 'Threat map',
      timeline: 'Timeline',
      glossary: 'Glossary',
      references: 'References',
    },

    search: {
      label: 'Search the course',
      button: 'Search',
      placeholder: 'Search chapters, glossary, references…',
      close: 'Close search',
      browse: 'Jump to a chapter',
      loading: 'Building the index…',
      failed: 'The search index could not be loaded. Try the',
      failedOr: 'or the',
      noResultsBefore: 'Nothing matches',
      noResultsAfter: 'Try fewer words, or a term from the',
      glossaryWord: 'glossary',
      curriculumWord: 'curriculum',
      one: '1 result',
      many: (n) => `${n} results`,
      groups: { chapter: 'Chapters', section: 'In chapters', glossary: 'Glossary', page: 'Elsewhere' },
      hintNavigate: 'navigate',
      hintOpen: 'open',
      hintClose: 'close',
    },

    chapter: {
      part: (id, title) => `Part ${id} · ${title}`,
      minRead: 'read',
      minutes: 'min',
      lines: 'lines',
      references: 'references',
      inThisChapter: 'In this chapter',
      quizTitle: 'Check yourself',
      quizIntro: 'Six questions. Answers explain the reasoning, not just the letter.',
      quizAnswered: (d, t) => `${d} of ${t} answered`,
      quizScore: (d, t, r) => `${d} of ${t} answered · ${r} correct`,
      prev: '← Previous',
      next: 'Next →',
      toCurriculum: 'The curriculum',
      toCapstone: 'The capstone',
    },

    refs: {
      heading: 'References and credits',
      note: `Every source below is the work of the researchers named. This chapter is a
teaching summary of their findings; read the originals for the detail, the caveats and the
numbers. Links go to the authors' own pages wherever one exists.`,
    },

    searchKicker: {
      curriculum: 'All chapters, six parts, the projects and the capstone',
      projects: 'Five graded builds and a capstone',
      threats: 'Six surfaces, twenty-five vulnerability classes',
      defenses: 'Thirty-three controls across design, development and operations',
      glossary: (n) => `${n} terms`,
      timeline: (n) => `${n} landmarks, 2022 to 2026`,
      references: 'Every paper and post the course was built from',
      sources: 'The awesome-lists and surveys behind the reference pages',
      setup: 'Run the code and the site on your machine',
    },
    searchWords: {
      references: 'bibliography credits sources authors papers',
      setup: 'python uv ruff node build install clone quickstart',
    },

    footer: {
      blurb: `27 chapters, six projects, and a capstone that builds an agent, breaks it,
      and then rebuilds it so the same attacks stop working. Every chapter closes with the papers
      it was built from, credited to their authors.`,
      source: 'Source on GitHub',
      sibling: 'Sister course: Build an LLM Inference Engine',
      courseHead: 'Course',
      startAt: 'Start at A01',
      capstone: 'Capstone',
      setup: 'Local setup',
      referenceHead: 'Reference',
      defenses: 'Defence map',
      creditsHead: 'Credits',
      allReferences: 'All references',
      sourceLists: 'Source lists',
    },
  },

  zh: {
    siteTitle: '从零学习智能体安全',
    siteShort: '智能体安全',
    brand: '智能体安全',
    siteDescription:
      '从零学习 AI 智能体安全：提示注入、工具投毒、记忆攻击、MCP 供应链、CaMeL、' +
      '信息流控制、沙箱与红队演练。27 章正文，可直接运行的 Python，浏览器内的攻击实验，六个评分项目。',

    skipToContent: '跳到正文',
    toggleTheme: '切换配色主题',
    themeTitle: '切换主题',
    language: '语言',

    nav: {
      curriculum: '课程大纲',
      projects: '项目',
      threats: '威胁地图',
      timeline: '时间线',
      glossary: '术语表',
      references: '参考文献',
    },

    search: {
      label: '搜索本课程',
      button: '搜索',
      placeholder: '搜索章节、术语表、参考文献…',
      close: '关闭搜索',
      browse: '跳转到某一章',
      loading: '正在建立索引…',
      failed: '搜索索引加载失败。可以先看',
      failedOr: '或',
      noResultsBefore: '没有匹配',
      noResultsAfter: '的内容。试试更短的关键词，或者',
      glossaryWord: '术语表',
      curriculumWord: '课程大纲',
      one: '1 条结果',
      many: (n) => `${n} 条结果`,
      groups: { chapter: '章节', section: '章节内容', glossary: '术语表', page: '其他页面' },
      hintNavigate: '选择',
      hintOpen: '打开',
      hintClose: '关闭',
    },

    chapter: {
      part: (id, title) => `第 ${id} 部分 · ${title}`,
      minRead: '阅读',
      minutes: '分钟',
      lines: '行',
      references: '篇参考文献',
      inThisChapter: '本章目录',
      quizTitle: '自测',
      quizIntro: '六道题。答案解释的是推理过程，而不只是告诉你选哪个字母。',
      quizAnswered: (d, t) => `已答 ${d} / ${t}`,
      quizScore: (d, t, r) => `已答 ${d} / ${t} · 正确 ${r}`,
      prev: '← 上一章',
      next: '下一章 →',
      toCurriculum: '课程大纲',
      toCapstone: '毕业项目',
    },

    refs: {
      heading: '参考文献与致谢',
      note: `下列每一项成果都属于文中列出的研究者。本章只是对他们工作的教学性归纳；
细节、前提和具体数字请以原文为准。凡是作者本人有主页的，链接都指向他们自己的页面。`,
    },

    searchKicker: {
      curriculum: '全部章节、六个部分、项目与毕业项目',
      projects: '五个评分项目，外加一个毕业项目',
      threats: '六个威胁面，二十五类漏洞',
      defenses: '横跨设计、开发与运营的三十三类控制措施',
      glossary: (n) => `${n} 条术语`,
      timeline: (n) => `${n} 个节点，2022 至 2026 年`,
      references: '本课程所依据的全部论文与文章',
      sources: '参考页面背后的清单与综述',
      setup: '在本机运行代码与站点',
    },
    searchWords: {
      references: '参考 文献 致谢 论文 作者 出处',
      setup: '安装 环境 运行 部署 依赖 快速开始 python node',
    },

    footer: {
      blurb: `27 章正文、六个项目，外加一个毕业项目：先造出一个智能体，把它打穿，
      再重建到同样的攻击不再奏效。每一章结尾都列出它所依据的论文，并注明作者。`,
      source: '在 GitHub 上查看源码',
      sibling: '姊妹课程：从零构建 LLM 推理引擎',
      courseHead: '课程',
      startAt: '从 A01 开始',
      capstone: '毕业项目',
      setup: '本地环境',
      referenceHead: '参考',
      defenses: '防御地图',
      creditsHead: '致谢',
      allReferences: '全部参考文献',
      sourceLists: '资料来源',
    },
  },
};

export const t = (code) => UI[code] || UI.en;

/* Chinese is written without word spaces, so a line break inside a sentence in
   the source renders as a visible gap. English needs that break to become a
   space; Chinese needs it to vanish. This only touches whitespace that sits
   between two CJK characters and contains a newline, so it cannot join two
   words a translator deliberately spaced, and it is a no-op for English. */
const CJK = '\\u2e80-\\u303f\\u3040-\\u30ff\\u3400-\\u4dbf\\u4e00-\\u9fff\\uf900-\\ufaff\\uff00-\\uffef';
const CJK_WRAP = new RegExp(`([${CJK}])[ \\t]*\\n[ \\t]*(?=[${CJK}])`, 'g');

export function tightenCJK(html) {
  // leave code, script and style blocks exactly as the author wrote them
  return html.split(/(<pre[\s\S]*?<\/pre>|<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>)/)
    .map((part, i) => i % 2 ? part : part.replace(CJK_WRAP, '$1'))
    .join('');
}
