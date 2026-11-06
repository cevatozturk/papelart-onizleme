/* PapelArt & Co. dil katmanı: Türkçe varsayılan, İngilizce ve Arapça (sağdan sola).
   Çeviriler i18n-data.js içinde; Türkçe kaynak metne göre eşleşir, HTML'e etiket gerekmez. */
(function () {
  var D = window.PA_D || {}, H = window.PA_H || {}, M = window.PA_M || {};
  var root = document.documentElement, lang = 'tr';
  var hooks = window.PA_hooks = [];
  var norm = function (s) { return s.replace(/\s+/g, ' ').trim(); };
  var idx = function (l) { return l === 'en' ? 0 : 1; };

  // Çeviri: seçili dil Türkçe ise ya da çeviri yoksa kaynak metin aynen döner.
  window.PA_T = function (s) { var e = D[s]; return (lang === 'tr' || !e) ? s : e[idx(lang)] || s; };
  window.PA_lang = function () { return lang; };

  var items = [], attrs = [], htmls = [], metas = [];
  function skip(n) {
    var p = n.parentNode;
    if (!p) return true;
    if (/^(SCRIPT|STYLE|NOSCRIPT)$/.test(p.tagName)) return true;
    return !!(p.closest && p.closest('#il,#ilce,#h1'));   // il/ilçe adları ve başlık ayrı yönetilir
  }
  function collect() {
    var w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT), n;
    while ((n = w.nextNode())) {
      if (skip(n)) continue;
      var k = norm(n.nodeValue);
      if (k && D[k]) { var m = n.nodeValue.match(/^(\s*)[\s\S]*?(\s*)$/); items.push({ n: n, k: k, a: m[1], b: m[2] }); }
    }
    ['placeholder', 'aria-label', 'alt', 'title', 'data-tip'].forEach(function (at) {
      document.querySelectorAll('[' + at + ']').forEach(function (e) {
        var k = norm(e.getAttribute(at)); if (D[k]) attrs.push({ e: e, at: at, k: k });
      });
    });
    document.querySelectorAll('[data-i]').forEach(function (e) { htmls.push({ e: e, k: e.getAttribute('data-i'), tr: e.innerHTML }); });
    var q = function (s) { return document.querySelector(s); };
    metas = [
      { key: 'title', get: function () { return document.title; }, set: function (v) { document.title = v; } },
      { key: 'desc', el: q('meta[name="description"]') }, { key: 'ogt', el: q('meta[property="og:title"]') }, { key: 'ogd', el: q('meta[property="og:description"]') }
    ];
    metas.forEach(function (m) { m.tr = m.el ? m.el.getAttribute('content') : m.get(); });
  }

  function loadArabicFont() {
    if (document.getElementById('font-ar')) return;
    var l = document.createElement('link');
    l.id = 'font-ar'; l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;500;700&display=swap';
    document.head.appendChild(l);
  }

  function apply(l) {
    lang = l;
    root.lang = l; root.dir = l === 'ar' ? 'rtl' : 'ltr';
    if (l === 'ar') loadArabicFont();
    items.forEach(function (i) { i.n.nodeValue = i.a + (l === 'tr' ? i.k : D[i.k][idx(l)]) + i.b; });
    attrs.forEach(function (a) { a.e.setAttribute(a.at, l === 'tr' ? a.k : D[a.k][idx(l)]); });
    htmls.forEach(function (h) { h.e.innerHTML = l === 'tr' ? h.tr : (H[h.k] ? H[h.k][idx(l)] : h.tr); });
    metas.forEach(function (m) {
      var v = l === 'tr' ? m.tr : (M[m.key] ? M[m.key][idx(l)] : m.tr);
      if (m.el) m.el.setAttribute('content', v); else m.set(v);
    });
    document.querySelectorAll('.lang button').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.lang === l ? 'true' : 'false'); });
    hooks.forEach(function (f) { try { f(l); } catch (e) {} });
  }

  window.PA_setLang = function (l, save) {
    if (!/^(tr|en|ar)$/.test(l)) l = 'tr';
    if (save) { try { localStorage.setItem('lang', l); } catch (e) {} }
    apply(l);
  };

  function init() {
    collect();
    document.querySelectorAll('.lang button').forEach(function (b) {
      b.addEventListener('click', function () { window.PA_setLang(b.dataset.lang, true); });
    });
    var l = 'tr';   // varsayılan her zaman Türkçe; yalnızca ziyaretçi seçerse değişir
    try {
      var q = new URLSearchParams(location.search).get('lang');
      l = /^(tr|en|ar)$/.test(q) ? q : (localStorage.getItem('lang') || 'tr');
    } catch (e) {}
    apply(/^(tr|en|ar)$/.test(l) ? l : 'tr');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
