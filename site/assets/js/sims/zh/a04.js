registerSim('a04map', function (el) {
  var T = [
    ['直接威胁',  60, 25, 35, [['直接提示注入',52,'a06'],['违规使用',19,'a06'],['直接多模态攻击',2,'a08']]],
    ['间接威胁',  55, 20, 35, [['IAM 失效',30,'a22'],['工具攻击',27,'a11'],['间接提示注入',20,'a07'],['知识库攻击',15,'a12'],['内部智能体攻击',15,'a15']]],
    ['内部威胁',  62, 31, 31, [['基础模型漏洞',34,'a04'],['工具误用',17,'a10'],['数据投毒',14,'a14'],['推理与规划失效',10,'a16'],['欺骗与规避',10,'a19'],['模型后门',9,'a14']]],
    ['资源威胁',  29, 13, 16, [['算力盗用',13,'a16'],['网络入侵',12,'a23'],['供应链攻击',9,'a13'],['物理层攻陷',4,'a08']]],
    ['监督失效',  19, 10,  9, [['可解释性失效',9,'a24'],['监控失效',9,'a26'],['人工确认失效',8,'a24']]],
    ['复合威胁',  24, 13, 11, [['级联失效',14,'a15'],['多智能体不良动力学',13,'a15'],['系统级失效',5,'a15']]]
  ];
  var v = el.querySelector('#a04-view'), o = el.querySelector('#a04-out');
  function bar(n, max, w) { var k = Math.max(1, Math.round(n / max * w)); return '█'.repeat(k); }
  // CJK glyphs take two monospace columns, so pad by display width, not code units.
  function cols(s) { return s.length + (s.match(/[\u2e80-\u9fff\uff00-\uff60\u3000-\u303f]/g) || []).length; }
  function pad(s, n) { var k = n - cols(s); return s + (k > 0 ? new Array(k + 1).join(' ') : ''); }

  function render() {
    var mode = v.value, h = '';
    if (mode === 'count') {
      h += '<span class="dim">类别                                  173 份资料里的提及数</span>\n\n';
      T.forEach(function (s) {
        h += '<span class="hl">' + s[0] + '</span> <span class="dim">(n=' + s[1] + ')</span>\n';
        s[4].forEach(function (c) {
          h += '  ' + pad(simUtil.esc(c[0]), 34) + String(c[1]).padStart(3) + '  <span class="bad">' + bar(c[1], 34, 26) + '</span>\n';
        });
        h += '\n';
      });
    } else if (mode === 'split') {
      h += '<span class="dim">威胁面        学术界      业界   倾向</span>\n\n';
      T.forEach(function (s) {
        var lean = s[2] > s[3] * 1.15 ? '<span class="bnd">学术界</span>' : s[3] > s[2] * 1.15 ? '<span class="hl">业界</span>' : '<span class="dim">均衡</span>';
        h += '  ' + pad(s[0], 12) + String(s[2]).padStart(6) + String(s[3]).padStart(10) + '   ' + lean + '\n';
        h += '    ' + '<span class="bnd">' + bar(s[2], 35, 22) + '</span>\n';
        h += '    ' + '<span class="hl">' + bar(s[3], 35, 22) + '</span>\n\n';
      });
      h += '<span class="dim">只读学术资料，你会低估 IAM、工具和供应链。\n只读厂商指南，你会低估后门和评测作弊。</span>';
    } else {
      h += '<span class="dim">类别                                  本课程在哪一章讲</span>\n\n';
      T.forEach(function (s) {
        s[4].forEach(function (c) {
          h += '  ' + pad(simUtil.esc(c[0]), 36) + '<span class="hl">' + c[2].toUpperCase() + '</span>\n';
        });
      });
      h += '\n<span class="dim">分类法里的每一个类别都有对应的一章。这就是这门课程搭建时\n所遵守的设计约束。</span>';
    }
    o.innerHTML = h;
  }
  v.onchange = render; render();
});
