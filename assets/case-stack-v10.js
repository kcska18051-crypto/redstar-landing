(()=>{
 const root=document.documentElement,slots=[...document.querySelectorAll('.case-stack-slot')],reduce=matchMedia('(prefers-reduced-motion: reduce)');let frame=0;
 const clamp=x=>Math.max(0,Math.min(1,x));
 function layout(){const header=document.querySelector('.topbar').getBoundingClientRect().height;slots.forEach((slot,i)=>{slot.style.setProperty('--stack-order',i+1);const height=slot.offsetHeight;slot.style.setProperty('--stack-top',Math.min(header+16,innerHeight-height-22)+'px')});root.classList.toggle('case-stack-enabled',!reduce.matches);update()}
 function update(){frame=0;if(document.hidden)return;slots.forEach((slot,i)=>{const next=slots[i+1];let progress=0;if(next&&!reduce.matches){const top=next.getBoundingClientRect().top,target=parseFloat(next.style.getPropertyValue('--stack-top'));const ownTop=parseFloat(slot.style.getPropertyValue('--stack-top')),gap=parseFloat(getComputedStyle(slot).marginBottom)||0,start=Math.min(innerHeight,ownTop+slot.offsetHeight+gap);progress=clamp((start-top)/(start-target))}slot.style.setProperty('--stack-progress',progress.toFixed(5))})}
 function queue(){if(!frame)frame=requestAnimationFrame(update)}
 addEventListener('scroll',queue,{passive:true});addEventListener('resize',layout);reduce.addEventListener('change',layout);document.addEventListener('visibilitychange',queue);
 new ResizeObserver(layout).observe(document.querySelector('.rs5-case-list'));document.fonts.ready.then(layout);layout();
})();
