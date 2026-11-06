(function(){
  var root=document.documentElement, $=function(s,c){return (c||document).querySelector(s)};
  var NUM='905363133321';
  var anim=root.classList.contains('js-anim');
  var T=window.PA_T||function(s){return s};            // seçili dile çeviri (Türkçe kaynak metinden)
  var hooks=window.PA_hooks||[];                        // dil değişince çalışacak yenileyiciler
  // WhatsApp mesajı işletmenin okuyacağı dilde (Türkçe) hazırlanır; site dili farklıysa not eklenir.
  var wa=function(t){
    var l=window.PA_lang?window.PA_lang():'tr';
    if(l!=='tr')t+='\n(Site dili / Language: '+(l==='en'?'English':'العربية')+')';
    return 'https://wa.me/'+NUM+'?text='+encodeURIComponent(t);
  };
  var sayi=function(v){var n=parseFloat(String(v).replace(',','.'));return isFinite(n)&&n>0?n:NaN};
  var fmt=function(n){return String(Math.round(n*100)/100).replace('.',',')};

  // ---- Açılış perdesi (oturumda bir kez) ----
  var pre=$('.pre');
  function basla(){root.classList.add('ready')}
  if(pre&&root.classList.contains('pre-on')){
    try{sessionStorage.setItem('pre','1')}catch(e){}
    setTimeout(function(){pre.classList.add('out');setTimeout(basla,350)},1300);
    setTimeout(function(){pre.remove();root.classList.remove('pre-on')},2400);
  }else{ if(pre)pre.remove(); requestAnimationFrame(basla); }

  // ---- Başlığı kelime kelime böl (dil değişince yeniden kurulur) ----
  var h1=$('#h1'),H1TR=h1?h1.textContent.trim():'';
  function setH1(text){
    if(!h1)return;
    h1.setAttribute('aria-label',text);
    if(anim){
      h1.innerHTML=text.split(/\s+/).map(function(w,i){return '<span class="w" aria-hidden="true"><span style="--i:'+i+'">'+w+'</span></span>'}).join(' ');
    }else h1.textContent=text;
  }
  setH1(H1TR);
  hooks.push(function(){setH1(T(H1TR))});

  // ---- Görünüme girince belirme ----
  var els=[].slice.call(document.querySelectorAll('[data-r]'));
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){
      if(e.isIntersecting){var d=e.target.parentNode;var i=[].indexOf.call(d.children,e.target);e.target.style.transitionDelay=Math.min(i,5)*70+'ms';e.target.classList.add('in');io.unobserve(e.target)}
    })},{rootMargin:'0px 0px -8% 0px',threshold:.1});
    els.forEach(function(el){io.observe(el)});
  }else els.forEach(function(el){el.classList.add('in')});

  // ---- Menü: kaydırınca belirginleş / aşağıda gizle, yukarıda göster ----
  var head=$('#head'),last=0,tick=false;
  addEventListener('scroll',function(){
    if(tick)return;tick=true;
    requestAnimationFrame(function(){
      var y=scrollY;
      head.classList.toggle('solid',y>20);
      var acik=$('#burger').getAttribute('aria-expanded')==='true';
      head.classList.toggle('hide',y>300&&y>last+4&&!acik&&!head.contains(document.activeElement));
      if(y<last-4)head.classList.remove('hide');
      last=y;tick=false;
    });
  },{passive:true});

  // ---- Mobil menü ----
  var bg=$('#burger'),menu=$('#menu');
  bg.onclick=function(){var o=menu.classList.toggle('open');bg.setAttribute('aria-expanded',o)};
  menu.addEventListener('click',function(e){if(e.target.tagName==='A'){menu.classList.remove('open');bg.setAttribute('aria-expanded','false')}});
  addEventListener('keydown',function(e){if(e.key==='Escape'){menu.classList.remove('open');bg.setAttribute('aria-expanded','false');lb.hidden=true}});

  // ---- Mıknatıslı butonlar (yalnız fare, hareket tercihi yoksa) ----
  if(anim&&matchMedia('(pointer:fine)').matches){
    document.querySelectorAll('.mag').forEach(function(b){
      b.addEventListener('pointermove',function(e){var r=b.getBoundingClientRect();
        b.style.transform='translate('+((e.clientX-r.left-r.width/2)*.18).toFixed(1)+'px,'+((e.clientY-r.top-r.height/2)*.28).toFixed(1)+'px)'});
      b.addEventListener('pointerleave',function(){b.style.transform=''});
    });
  }

  // ---- İl / ilçe seçimi (tüm Türkiye) ----
  var ilS=$('#il'),ilceS=$('#ilce'),ILL=window.ILLER||{};
  function opt(v,t){var o=document.createElement('option');o.value=v;o.textContent=t||v;return o}
  Object.keys(ILL).forEach(function(k){ilS.appendChild(opt(k))});
  function ilceDoldur(){
    var l=ILL[ilS.value]||[];
    ilceS.innerHTML='';
    ilceS.appendChild(opt('',T(l.length?'İlçe seçin':'Önce il seçin')));
    l.forEach(function(x){ilceS.appendChild(opt(x))});
    ilceS.disabled=!l.length;
    if(l.length===1)ilceS.value=l[0];
  }
  ilS.addEventListener('change',function(){ilceDoldur();ilS.classList.remove('bad')});
  ilceS.addEventListener('change',function(){ilceS.classList.remove('bad')});
  ilS.value='İstanbul';ilceDoldur();
  hooks.push(function(){
    ilS.options[0].textContent=T('İl seçin');
    var l=ILL[ilS.value]||[];
    if(ilceS.options[0]&&ilceS.options[0].value==='')ilceS.options[0].textContent=T(l.length?'İlçe seçin':'Önce il seçin');
  });

  // ---- Hızlı fiyat talebi → WhatsApp ----
  var q=$('#quick');
  q.addEventListener('submit',function(e){
    e.preventDefault();
    var f=q.elements,il=f.il.value.trim(),ilce=f.ilce.value.trim(),err=$('#qerr');
    f.il.classList.toggle('bad',!il);f.ilce.classList.toggle('bad',!ilce);
    err.hidden=!!(il&&ilce);
    if(!il||!ilce){(il?f.ilce:f.il).focus();return}
    var en=sayi(f.en.value),boy=sayi(f.boy.value);
    var m='Merhaba, '+f.is.value.toLowerCase()+' için fiyat bilgisi almak istiyorum.\nİl / İlçe: '+il+' / '+ilce;
    if(en&&boy)m+='\nDuvar: yaklaşık '+fmt(en)+' m x '+fmt(boy)+' m';
    m+='\nDuvarın fotoğrafını göndereceğim.';
    window.open(wa(m),'_blank','noopener');
  });

  // ---- Rulo hesaplayıcı (tüm ölçüler cm) ----
  var c=$('#calc'),son=null;
  var KISA='Girdiğiniz rulo boyu bu yükseklik için yetmiyor görünüyor. Değerleri kontrol edin ya da bize yazın, birlikte bakalım.';
  var SONUC='{s} şerit gerekiyor, bir rulodan {p} şerit çıkıyor. Kapı/pencere payı ve hatalı kesim hesaba katılmadı; kesin sayı yerinde ölçüyle netleşir.';
  function sonucYaz(){
    if(!son)return;
    $('#rn').textContent=son.rulo||'—';
    $('#rt').textContent=son.rulo?T(SONUC).replace('{s}',son.serit).replace('{p}',son.ruloBasi):T(KISA);
  }
  hooks.push(sonucYaz);
  c.addEventListener('submit',function(e){
    e.preventDefault();
    var f=c.elements,en=sayi(f.en.value),boy=sayi(f.boy.value),re=sayi(f.re.value),rb=sayi(f.rb.value),dt=parseFloat(String(f.dt.value||'0').replace(',','.'))||0;
    var ok=true;
    [['en',en],['boy',boy],['re',re],['rb',rb]].forEach(function(p){var bad=isNaN(p[1]);f[p[0]].classList.toggle('bad',bad);if(bad)ok=false});
    if(!ok){c.querySelector('.bad').focus();return}
    var serit=Math.ceil(en/re);                 // gereken şerit sayısı
    var seritBoy=boy+dt+10;                      // yükseklik + desen payı + 10 cm kesim payı
    var ruloBasi=Math.floor(rb/seritBoy);        // bir rulodan çıkan şerit
    var out=$('#result');
    if(ruloBasi<1){
      son={rulo:0};
      $('#rwa').href=wa('Merhaba, rulo hesabı için yardım istiyorum. Duvar: '+fmt(en)+' cm x '+fmt(boy)+' cm.');
    }else{
      var rulo=Math.ceil(serit/ruloBasi);
      son={rulo:rulo,serit:serit,ruloBasi:ruloBasi};
      $('#rwa').href=wa('Merhaba, duvar kâğıdı uygulaması için fiyat almak istiyorum.\nDuvar: toplam '+fmt(en)+' cm x '+fmt(boy)+' cm yükseklik\nRulo: '+fmt(re)+' cm x '+fmt(rb)+' cm'+(dt?', desen tekrarı '+fmt(dt)+' cm':'')+'\nHesaplanan: yaklaşık '+rulo+' rulo');
    }
    sonucYaz();
    out.hidden=false;out.style.animation='none';void out.offsetWidth;out.style.animation='';
    out.scrollIntoView({block:'nearest',behavior:'smooth'});
  });
  c.addEventListener('input',function(e){e.target.classList.remove('bad')});

  // ---- Galeri: daha fazla + büyütme ----
  var more=$('#more');
  function moreYaz(){more.textContent=T(more.getAttribute('aria-expanded')==='true'?'Daha az göster':'Tüm görselleri göster')}
  more.onclick=function(){
    var acik=more.getAttribute('aria-expanded')==='true';
    document.querySelectorAll('.more-t').forEach(function(t){t.hidden=acik});
    more.setAttribute('aria-expanded',!acik);
    moreYaz();
  };
  hooks.push(moreYaz);
  var lb=$('#lb'),lbi=lb.querySelector('img');
  document.querySelectorAll('[data-lb]').forEach(function(a){
    a.addEventListener('click',function(e){e.preventDefault();lbi.src=a.href;lbi.alt=a.querySelector('img').alt;lb.hidden=false});
  });
  lb.onclick=function(){lb.hidden=true};

  // ---- Numarayı kopyala ----
  var cp=$('#copy');
  function kopyaYaz(){cp.textContent=T('Numarayı kopyala')}
  hooks.push(kopyaYaz);
  cp.onclick=function(){
    var n=cp.dataset.num,ok=function(){cp.textContent=T('Kopyalandı ✓');setTimeout(kopyaYaz,1800)};
    if(navigator.clipboard)navigator.clipboard.writeText(n).then(ok,function(){cp.textContent=n});else cp.textContent=n;
  };

  $('#y').textContent=new Date().getFullYear();
  // i18n.js DOMContentLoaded'da seçili dili uygular; yenileyiciler o sırada çalışır.
})();
