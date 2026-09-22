const nav=[['introduce','소개'],['article','기사'],['image','이미지'],['video','영상'],['final','Final project']];
const header=document.querySelector('#site-header');
header.innerHTML='<div class="topline"><div class="wrap"><span>한국경제 AI 교육 · 학습과 실험의 기록</span><span>LEARN. CREATE. ARCHIVE.</span></div></div><header class="header"><div class="wrap"><a class="brand" href="article.html"><span class="brand-icon">Ai</span><span><strong>한경 AI 아카이브</strong><small>HANKYUNG AI PORTFOLIO</small></span></a><nav aria-label="주 메뉴">'+nav.map(([id,label])=>'<a href="'+id+'.html">'+label+'</a>').join('')+'</nav><span class="owner">나의 크리에이티브 노트</span></div></header>';
document.querySelector('#site-footer').innerHTML='<footer class="footer"><div class="wrap"><div><strong>한경 AI 아카이브</strong><p>한국경제 AI 교육에서 배우고, 만들고, 발견한 것들.</p><small>개인 학습 포트폴리오 · 교육기관 공식 사이트가 아닙니다.</small></div><div><p>© 2026 AI Portfolio. All rights reserved.</p><small>현재 콘텐츠는 구성 확인을 위한 예시입니다.<br>참고 사진: Unsplash · Minku Kang, Conny Schneider, Gaétan Meyer</small></div></div></footer>';

function updateNav(){
  for(const link of header.querySelectorAll('nav a')){
    const active=link.getAttribute('href')===document.body.dataset.page+'.html';
    link.classList.toggle('active',active);
    if(active)link.setAttribute('aria-current','page');
    else link.removeAttribute('aria-current');
  }
}
updateNav();

function raiseCursorAboveDialog(){
  const cursor=document.querySelector('.circle-cursor');
  if(!cursor)return;
  if(typeof cursor.showPopover!=='function'){
    document.documentElement.classList.add('dialog-native-cursor');
    return;
  }
  try{
    if(cursor.matches(':popover-open'))cursor.hidePopover();
    cursor.showPopover();
  }catch{
    cursor.removeAttribute('popover');
    document.documentElement.classList.add('dialog-native-cursor');
  }
}

// Keep document-level handlers alive when a new page body replaces the old one.
document.addEventListener('click',event=>{
  const target=event.target;
  if(!(target instanceof Element))return;
  const openButton=target.closest('[data-open]');
  if(openButton){
    const content=document.getElementById(openButton.dataset.open);
    const dialog=document.querySelector('dialog');
    if(content&&dialog){dialog.querySelector('#dialog-content').innerHTML=content.innerHTML;dialog.showModal();raiseCursorAboveDialog();}
    return;
  }
  if(target.closest('[data-close]')){document.querySelector('dialog')?.close();return;}
  const filter=target.closest('[data-filter]');
  if(filter){
    document.querySelectorAll('[data-filter]').forEach(button=>{
      const active=button===filter;
      button.classList.toggle('active',active);
      button.setAttribute('aria-pressed',String(active));
    });
    let count=0;
    document.querySelectorAll('[data-category]').forEach(item=>{
      item.hidden=filter.dataset.filter!=='all'&&item.dataset.category!==filter.dataset.filter;
      if(!item.hidden)count++;
    });
    const counter=document.querySelector('#count');
    if(counter)counter.textContent=String(count).padStart(2,'0');
    return;
  }
  if(target.tagName==='DIALOG'){
    const rect=target.getBoundingClientRect();
    if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)target.close();
  }
});

// In-site links replace only the page content. The audio element stays mounted.
const routes=new Set(nav.map(([id])=>id+'.html'));
let navigationController=null;
async function navigate(url,addHistory){
  navigationController?.abort();
  const controller=new AbortController();
  navigationController=controller;
  try{
    const response=await fetch(url.href,{credentials:'same-origin',signal:controller.signal});
    if(!response.ok)throw new Error('Page unavailable');
    const next=new DOMParser().parseFromString(await response.text(),'text/html');
    const main=next.querySelector('main');
    const dialog=next.querySelector('dialog');
    if(!main||!dialog||!next.body.dataset.page)throw new Error('Invalid page');
    if(controller.signal.aborted)return;
    document.querySelector('main').replaceWith(main);
    document.querySelector('dialog').replaceWith(dialog);
    document.querySelectorAll('body > template').forEach(template=>template.remove());
    next.querySelectorAll('body > template').forEach(template=>document.body.append(template));
    document.body.dataset.page=next.body.dataset.page;
    document.title=next.title;
    const description=next.querySelector('meta[name="description"]');
    if(description&&document.querySelector('meta[name="description"]'))document.querySelector('meta[name="description"]').content=description.content;
    updateNav();
    if(addHistory)history.pushState(null,'',url.href);
    window.scrollTo(0,0);
    main.tabIndex=-1;
    main.focus({preventScroll:true});
  }catch(error){
    if(error.name!=='AbortError')window.location.assign(url.href);
  }finally{
    if(navigationController===controller)navigationController=null;
  }
}
document.addEventListener('click',event=>{
  if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  const link=event.target.closest?.('a[href]');
  if(!link||link.target&&link.target!=='_self'||link.hasAttribute('download'))return;
  const url=new URL(link.href);
  if(url.origin!==location.origin||!routes.has(url.pathname.split('/').pop()))return;
  if(url.pathname===location.pathname&&url.hash)return;
  event.preventDefault();
  if(url.href===location.href){window.scrollTo(0,0);return;}
  navigate(url,true);
});
window.addEventListener('popstate',()=>navigate(new URL(location.href),false));

// The moving shell and the animated ring use separate transforms.
if(window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)').matches){
  const cursor=document.createElement('div');
  cursor.className='circle-cursor';
  cursor.innerHTML='<span class="circle-cursor-ring"></span>';
  cursor.setAttribute('aria-hidden','true');
  if(typeof cursor.showPopover==='function')cursor.popover='manual';
  document.body.append(cursor);
  if(cursor.popover==='manual')try{cursor.showPopover();}catch{cursor.removeAttribute('popover');}
  document.documentElement.classList.add('circle-cursor-ready');
  const position=event=>{
    if(event.pointerType!=='mouse')return false;
    cursor.style.left=event.clientX+'px';
    cursor.style.top=event.clientY+'px';
    cursor.classList.add('is-visible');
    return true;
  };
  document.addEventListener('pointermove',position);
  document.addEventListener('pointerdown',event=>{
    if(!position(event))return;
    cursor.classList.remove('is-clicking');
    void cursor.offsetWidth;
    cursor.classList.add('is-clicking');
  });
  cursor.addEventListener('animationend',()=>cursor.classList.remove('is-clicking'));
  document.addEventListener('mouseleave',()=>cursor.classList.remove('is-visible'));
  window.addEventListener('blur',()=>cursor.classList.remove('is-visible'));
}

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
