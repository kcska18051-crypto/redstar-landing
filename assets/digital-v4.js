(() => {
  'use strict';
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  const records=[];
  const schedules={hero:[[0,'idle'],[1000,'ad'],[2600,'visit'],[4100,'action'],[6000,'inquiry'],[8700,'reset']],sales:[[0,'idle'],[400,'collect'],[2800,'settled']]};
  function stop(record,reset=false){
    record.timers.forEach(clearTimeout);record.timers=[];
    record.el.classList.remove('is-running');
    if(reset)record.el.dataset.phase='idle';
  }
  function cycle(record){
    stop(record);
    if(!record.visible||record.manualPause||document.hidden||reduce.matches)return;
    record.el.classList.add('is-running');
    schedules[record.type].forEach(([time,phase])=>record.timers.push(setTimeout(()=>{record.el.dataset.phase=phase;},time)));
    record.timers.push(setTimeout(()=>cycle(record),record.type==='hero'?10500:8500));
  }
  document.querySelectorAll('[data-motion]').forEach(el=>{
    const record={el,type:el.dataset.motion,visible:false,manualPause:false,timers:[]};records.push(record);
    new IntersectionObserver(entries=>{record.visible=entries[0].isIntersecting;if(record.visible)cycle(record);else stop(record,true);},{threshold:.15}).observe(el);
  });
  const hero=records.find(r=>r.type==='hero');
  const pause=document.querySelector('.rs-motion-toggle');
  pause.hidden=false;
  pause.addEventListener('click',()=>{
    hero.manualPause=!hero.manualPause;
    pause.setAttribute('aria-pressed',String(hero.manualPause));
    pause.setAttribute('aria-label',hero.manualPause?'Возобновить анимацию':'Приостановить анимацию');
    pause.firstElementChild.textContent=hero.manualPause?'▶':'Ⅱ';
    if(hero.manualPause)stop(hero);else cycle(hero);
  });
  let depthFrame=0;
  hero.el.addEventListener('pointermove',event=>{
    if(event.pointerType==='touch'||reduce.matches||!hero.visible)return;
    cancelAnimationFrame(depthFrame);
    depthFrame=requestAnimationFrame(()=>{
      const rect=hero.el.getBoundingClientRect();
      hero.el.style.setProperty('--depth-x',((event.clientX-rect.left)/rect.width*2-1)*2+'deg');
      hero.el.style.setProperty('--depth-y',-((event.clientY-rect.top)/rect.height*2-1)*1.5+'deg');
    });
  });
  hero.el.addEventListener('pointerleave',()=>{hero.el.style.setProperty('--depth-x','0deg');hero.el.style.setProperty('--depth-y','0deg');});
  const cards=[...document.querySelectorAll('.rs-service')];
  let active=null;
  function deactivate(){
    cards.forEach(card=>{card.classList.remove('is-active');card.querySelector('[data-demo-service]').setAttribute('aria-pressed','false');});active=null;
  }
  function activate(card){
    deactivate();active=card;card.classList.add('is-active');
    card.querySelector('[data-demo-service]').setAttribute('aria-pressed','true');
  }
  cards.forEach(card=>{
    card.querySelector('[data-demo-service]').hidden=false;
    card.addEventListener('pointerenter',event=>{if(event.pointerType!=='touch')activate(card);});
    card.addEventListener('pointerleave',event=>{if(event.pointerType!=='touch'&&!card.contains(document.activeElement)&&active===card)deactivate();});
    card.addEventListener('focusin',()=>activate(card));
    card.addEventListener('focusout',event=>{if(!card.contains(event.relatedTarget)&&active===card)deactivate();});
    card.querySelector('[data-demo-service]').addEventListener('click',()=>{
      deactivate();
      // A tap replays the finite demonstration; it never starts an endless loop.
      requestAnimationFrame(()=>activate(card));
    });
    new IntersectionObserver(entries=>{if(!entries[0].isIntersecting&&active===card)deactivate();},{threshold:.05}).observe(card);
  });
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden){records.forEach(r=>stop(r));deactivate();}else records.forEach(cycle);
  });
  reduce.addEventListener('change',()=>{deactivate();records.forEach(r=>{stop(r,true);if(!reduce.matches)cycle(r);});});
  window.redstarMotion={
    snapshot:()=>({reduced:reduce.matches,scenes:records.map(r=>({type:r.type,phase:r.el.dataset.phase,visible:r.visible,running:r.el.classList.contains('is-running'),pending:r.timers.length})),activeService:active?.dataset.service??null}),
    restart:()=>{hero.manualPause=false;pause.setAttribute('aria-pressed','false');pause.setAttribute('aria-label','Приостановить анимацию');pause.firstElementChild.textContent='Ⅱ';cycle(hero);}
  };
})();
