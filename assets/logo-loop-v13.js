(()=>{
  document.querySelectorAll('.logo-row').forEach(row=>{
    const belt=row.querySelector('.logo-belt'), group=belt.querySelector('.logo-group');
    function fit(){
      const cycle=group.getBoundingClientRect().width;
      if(!cycle)return;
      belt.style.setProperty('--logo-cycle',cycle+'px');
      const copies=Math.max(2,Math.ceil(row.clientWidth/cycle)+1);
      while(belt.children.length<copies){const copy=group.cloneNode(true);copy.setAttribute('aria-hidden','true');belt.append(copy);}
      while(belt.children.length>copies)belt.lastElementChild.remove();
    }
    new ResizeObserver(fit).observe(row);fit();
  });
})();
