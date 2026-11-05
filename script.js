(function(){
  var slides=[].slice.call(document.querySelectorAll('.slide')),dots=document.getElementById('dots'),i=0,timer;
  slides.forEach(function(_,n){var b=document.createElement('button');b.setAttribute('aria-label','Görsel '+(n+1));b.onclick=function(){go(n,true)};dots.appendChild(b)});
  function go(n,manual){
    i=(n+slides.length)%slides.length;
    slides.forEach(function(s,k){s.classList.toggle('active',k===i)});
    [].forEach.call(dots.children,function(d,k){d.classList.toggle('on',k===i)});
    if(manual)restart();
  }
  function restart(){clearInterval(timer);timer=setInterval(function(){go(i+1)},5000)}
  document.getElementById('prev').onclick=function(){go(i-1,true)};
  document.getElementById('next').onclick=function(){go(i+1,true)};
  go(0);restart();

  document.getElementById('theme').onclick=function(){
    var r=document.documentElement,dark=getComputedStyle(r).getPropertyValue('--bg').trim()==='#0b0b0b';
    var t=dark?'light':'dark';r.dataset.theme=t;
    try{localStorage.setItem('theme',t)}catch(e){}
  };

  var lb=document.getElementById('lb'),lbImg=lb.querySelector('img');
  document.querySelectorAll('[data-lb]').forEach(function(a){
    a.addEventListener('click',function(e){e.preventDefault();lbImg.src=a.href;lb.hidden=false});
  });
  lb.onclick=function(){lb.hidden=true};
  document.addEventListener('keydown',function(e){if(e.key==='Escape')lb.hidden=true});
  document.getElementById('y').textContent=new Date().getFullYear();
})();
