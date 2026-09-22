const page=document.body.dataset.page;
const nav=[['introduce','소개'],['article','기사'],['image','이미지'],['video','영상'],['final','Final project']];
document.querySelector('#site-header').innerHTML='<div class="topline"><div class="wrap"><span>한국경제 AI 교육 · 학습과 실험의 기록</span><span>LEARN. CREATE. ARCHIVE.</span></div></div><header class="header"><div class="wrap"><a class="brand" href="article.html"><span class="brand-icon">Ai</span><span><strong>한경 AI 아카이브</strong><small>HANKYUNG AI PORTFOLIO</small></span></a><nav aria-label="주 메뉴">'+nav.map(([id,label])=>'<a href="'+id+'.html" '+(page===id?'class="active" aria-current="page"':'')+'>'+label+'</a>').join('')+'</nav><span class="owner">나의 크리에이티브 노트</span></div></header>';
document.querySelector('#site-footer').innerHTML='<footer class="footer"><div class="wrap"><div><strong>한경 AI 아카이브</strong><p>한국경제 AI 교육에서 배우고, 만들고, 발견한 것들.</p><small>개인 학습 포트폴리오 · 교육기관 공식 사이트가 아닙니다.</small></div><div><p>© 2026 AI Portfolio. All rights reserved.</p><small>현재 콘텐츠는 구성 확인을 위한 예시입니다.<br>참고 사진: Unsplash · Minku Kang, Conny Schneider, Gaétan Meyer</small></div></div></footer>';
const dialog=document.querySelector('dialog');
document.querySelectorAll('[data-open]').forEach(b=>b.addEventListener('click',()=>{document.querySelector('#dialog-content').innerHTML=document.getElementById(b.dataset.open).innerHTML;dialog.showModal();}));
document.querySelector('[data-close]').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('[data-filter]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b));});let count=0;document.querySelectorAll('[data-category]').forEach(x=>{x.hidden=b.dataset.filter!=='all'&&x.dataset.category!==b.dataset.filter;if(!x.hidden)count++;});const c=document.querySelector('#count');if(c)c.textContent=String(count).padStart(2,'0');}));

// Use the custom pointer only when a mouse and animation are available.
if(window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)').matches){
  const cursor=document.createElement('div');
  cursor.className='circle-cursor';
  cursor.setAttribute('aria-hidden','true');
  document.body.append(cursor);
  document.documentElement.classList.add('circle-cursor-ready');
  document.addEventListener('pointermove',event=>{
    if(event.pointerType!=='mouse')return;
    cursor.style.left=event.clientX+'px';
    cursor.style.top=event.clientY+'px';
    cursor.classList.add('is-visible');
  });
  document.addEventListener('pointerdown',event=>{
    if(event.pointerType!=='mouse')return;
    cursor.classList.remove('is-clicking');
    void cursor.offsetWidth;
    cursor.classList.add('is-clicking');
  });
  cursor.addEventListener('animationend',()=>cursor.classList.remove('is-clicking'));
  document.addEventListener('mouseleave',()=>cursor.classList.remove('is-visible'));
  window.addEventListener('blur',()=>cursor.classList.remove('is-visible'));
}

// Reading music starts only after a deliberate click; browsers block autoplay.
const readingMusic=document.createElement('audio');
readingMusic.src=new URL('assets/reading-lofi.wav',document.baseURI).href;
readingMusic.loop=true;
readingMusic.preload='none';
readingMusic.volume=0.35;
const musicToggle=document.createElement('button');
musicToggle.type='button';
musicToggle.className='music-toggle';
musicToggle.setAttribute('aria-pressed','false');
musicToggle.textContent='♪ 음악 켜기';
document.body.append(readingMusic,musicToggle);
const updateMusicButton=playing=>{
  musicToggle.setAttribute('aria-pressed',String(playing));
  musicToggle.textContent=playing?'♪ 음악 끄기':'♪ 음악 켜기';
};
musicToggle.addEventListener('click',async()=>{
  if(!readingMusic.paused){readingMusic.pause();updateMusicButton(false);return;}
  musicToggle.disabled=true;
  try{await readingMusic.play();updateMusicButton(true);}
  catch{musicToggle.textContent='음악을 재생할 수 없음';}
  finally{musicToggle.disabled=false;}
});
document.addEventListener('visibilitychange',()=>{
  if(document.hidden&&!readingMusic.paused){readingMusic.pause();updateMusicButton(false);}
});
