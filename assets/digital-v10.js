(() => {
  'use strict';
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  const records=[];
  const panels=[...document.querySelectorAll('.rs-case5')];
  const schedules={hero:[[0,'idle'],[1000,'ad'],[2600,'visit'],[4100,'action'],[5400,'inquiry'],[6900,'complete'],[9400,'reset']],sales:[[0,'idle'],[400,'collect'],[2800,'settled']]};
  let currentCase=null;
  function stop(record,reset=false){record.timers.forEach(clearTimeout);record.timers=[];record.el.classList.remove('is-running');if(reset)record.el.dataset.phase='idle';}
  function cycle(record){
    stop(record);record.el.classList.remove('is-paused');
    if(!record.visible||record.manualPause||document.hidden||reduce.matches||(record.type==='hero'&&!record.selected))return;
    record.el.classList.add('is-running');
    schedules[record.type].forEach(([time,phase])=>record.timers.push(setTimeout(()=>{record.el.dataset.phase=phase;},time)));
    record.timers.push(setTimeout(()=>cycle(record),record.type==='hero'?10500:8500));
  }
  function syncCases(){
    const inView=panels.filter(panel=>{const rect=(panel.closest('.case-stack-slot')||panel).getBoundingClientRect();return rect.top<innerHeight&&rect.bottom>78;});
    // Select the front panel after it covers half the reading area; covered panels stay calm.
    const entered=inView.filter(panel=>(panel.closest('.case-stack-slot')||panel).getBoundingClientRect().top<innerHeight*.55);
    currentCase=entered.at(-1)||inView[0]||null;
    panels.forEach(panel=>panel.classList.toggle('is-case-current',panel===currentCase));
    records.filter(r=>r.type==='hero').forEach(r=>{
      const selected=r.visible&&(!r.panel||r.panel===currentCase);
      if(selected!==r.selected){r.selected=selected;if(selected)cycle(r);else stop(r,true);}
    });
  }
  document.querySelectorAll('[data-motion=hero]').forEach(el=>{
    const record={el,type:el.dataset.motion,panel:el.closest('.rs-case5'),visible:false,selected:false,manualPause:false,timers:[]};records.push(record);
    new IntersectionObserver(entries=>{
      record.visible=entries[0].isIntersecting&&entries[0].intersectionRatio>=.15;
      if(record.type==='hero')syncCases();else if(record.visible)cycle(record);else stop(record,true);
    },{threshold:[0,.15,.35,.5,.7]}).observe(el);
    if(record.type!=='hero')return;
    let frame=0;
    el.addEventListener('pointermove',event=>{
      if(event.pointerType==='touch'||reduce.matches||!record.selected)return;
      cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{const rect=el.getBoundingClientRect();el.style.setProperty('--depth-x',((event.clientX-rect.left)/rect.width*2-1)*2+'deg');el.style.setProperty('--depth-y',-((event.clientY-rect.top)/rect.height*2-1)*1.5+'deg');});
    });
    el.addEventListener('pointerleave',()=>{el.style.setProperty('--depth-x','0deg');el.style.setProperty('--depth-y','0deg');});
  });
  let scrollFrame=0;
  // Native document scrolling only: no wheel interception, snapping or scroll lock.
  addEventListener('scroll',()=>{cancelAnimationFrame(scrollFrame);scrollFrame=requestAnimationFrame(syncCases);},{passive:true});
  addEventListener('resize',syncCases);
  const cards=[...document.querySelectorAll('.rs-service')];let active=null;
  function deactivate(){cards.forEach(card=>{card.classList.remove('is-active');});active=null;}
  function activate(card){deactivate();active=card;card.classList.add('is-active');}
  cards.forEach(card=>{
    card.addEventListener('pointerenter',event=>{if(event.pointerType!=='touch')activate(card);});
    card.addEventListener('pointerleave',event=>{if(event.pointerType!=='touch'&&!card.contains(document.activeElement)&&active===card)deactivate();});
    card.addEventListener('focusin',()=>activate(card));card.addEventListener('focusout',event=>{if(!card.contains(event.relatedTarget)&&active===card)deactivate();});
    card.addEventListener('pointerdown',e=>{if(e.pointerType==='touch'&&!e.target.closest('a')){if(active===card)deactivate();else activate(card);}});
    card.addEventListener('keydown',e=>{if(e.target===card&&(e.key==='Enter'||e.key===' ')){e.preventDefault();if(active===card)deactivate();else activate(card);}});
    new IntersectionObserver(entries=>{if(!entries[0].isIntersecting&&active===card)deactivate();},{threshold:.05}).observe(card);
  });
  document.addEventListener('visibilitychange',()=>{if(document.hidden){records.forEach(r=>stop(r));deactivate();}else records.forEach(cycle);});
  reduce.addEventListener('change',()=>{deactivate();records.forEach(r=>{stop(r,true);if(!reduce.matches)cycle(r);});});
  window.redstarMotion={
    snapshot:()=>({reduced:reduce.matches,activeCase:currentCase?.id??null,scenes:records.map(r=>({type:r.type,case:r.panel?.id??null,phase:r.el.dataset.phase,visible:r.visible,selected:r.selected,running:r.el.classList.contains('is-running'),pending:r.timers.length})),activeService:active?.dataset.service??null}),
    restart:(caseId='hero')=>{const r=records.find(r=>caseId==='hero'?!r.panel:r.panel?.id===caseId);if(r){r.manualPause=false;cycle(r);}}
  };
})();

/* Natural scroll progress: transforms live only inside their original section boxes. */
(()=>{
 const media=matchMedia('(prefers-reduced-motion: reduce)'),hero=document.querySelector('.rs7-hero-band'),art=document.querySelector('.rs7-hero-art'),sales=document.querySelector('.rs-sales'),leads=[...sales.querySelectorAll('.rs-lead-card')],services=[...document.querySelectorAll('.rs-service')];let frame=0;
 const clamp=x=>Math.max(0,Math.min(1,x));
 function update(){frame=0;if(document.hidden)return;const hr=hero.getBoundingClientRect(),sr=sales.getBoundingClientRect();const exit=media.matches?0:clamp(-hr.top/(hr.height*.8));art.style.setProperty('--hero-exit',exit.toFixed(4));const progress=clamp((innerHeight*.88-sr.top)/(Math.min(innerHeight*.58,sr.height+160)));sales.dataset.scrollProgress=progress.toFixed(3);leads.forEach((lead,i)=>{const t=media.matches?1:clamp((progress-i*.16)/.66),rest=1-t;lead.style.transform=`translate3d(${(i-1)*rest*16}px,${rest*(i%2?-18:22)}px,0) rotate(${(i-1)*rest*6}deg)`;lead.style.borderColor=t>.96?'#083575':'#8C8C8C';});}
 function queue(){if(!frame)frame=requestAnimationFrame(update)}
 const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){const i=services.indexOf(entry.target);entry.target.style.transitionDelay=media.matches?'0ms':`${(i%3)*85}ms`;entry.target.classList.add('is-revealed');observer.unobserve(entry.target);}})},{threshold:.12});
 document.documentElement.classList.add('js-motion');services.forEach(e=>observer.observe(e));addEventListener('scroll',queue,{passive:true});addEventListener('resize',queue);media.addEventListener('change',queue);document.addEventListener('visibilitychange',queue);queue();
})();

/* Workshop and client belts stop outside the viewport and in an inactive tab. */
(()=>{const reduced=matchMedia('(prefers-reduced-motion: reduce)'),items=[...document.querySelectorAll('[data-workshop],.logo-row')],visible=new Map();function sync(){items.forEach(e=>e.classList.toggle('is-running',!!visible.get(e)&&!document.hidden&&!reduced.matches));}const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>visible.set(entry.target,entry.isIntersecting&&entry.intersectionRatio>.12));sync();},{threshold:[0,.12,.3]});items.forEach(e=>observer.observe(e));document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',sync);})();
