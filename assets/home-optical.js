(() => {
  'use strict';
  const burger = document.querySelector('.burger');
  const mobile = document.querySelector('.mobile-menu');
  const closeMenu = (restore = true) => {
    mobile.hidden = true;
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Открыть меню');
    if (restore) burger.focus();
  };
  burger.addEventListener('click', () => {
    const open = burger.getAttribute('aria-expanded') !== 'true';
    mobile.hidden = !open;
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    if (open) mobile.querySelector('a').focus();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !mobile.hidden) closeMenu();
    if (event.key === 'Tab' && !mobile.hidden) {
      const items = [burger, ...mobile.querySelectorAll('a')];
      if (event.shiftKey && document.activeElement === items[0]) { event.preventDefault(); items.at(-1).focus(); }
      else if (!event.shiftKey && document.activeElement === items.at(-1)) { event.preventDefault(); burger.focus(); }
    }
  });
  mobile.querySelectorAll('a').forEach(a => a.addEventListener('click', () => closeMenu(false)));
  window.addEventListener('resize', () => { if (innerWidth > 1020 && !mobile.hidden) closeMenu(false); });
  document.querySelectorAll('.has-drop').forEach(item => item.addEventListener('keydown', e => {
    if (e.key === 'Escape') { item.classList.remove('is-open'); item.querySelector('a').focus(); }
  }));
  document.querySelectorAll('[data-modal]').forEach(trigger => {
    const dialog = document.getElementById(trigger.dataset.modal);
    trigger.addEventListener('click', e => { e.preventDefault(); dialog.showModal(); });
    dialog.querySelector('[data-modal-close]').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
    dialog.addEventListener('close', () => trigger.focus());
  });
  document.querySelectorAll('[data-local-form]').forEach(form => {
    form.querySelector('button[type="submit"]').disabled = false;
    // There is no endpoint in the original project. Never fabricate a server receipt.
    form.addEventListener('submit', event => {
      event.preventDefault();
      const note = form.querySelector('.form__note');
      note.classList.add('is-error');
      note.innerHTML = 'Заявка не отправлена: серверный обработчик пока не подключён. Данные сохранены в полях. <a href="tel:+74852319404">Позвоните нам</a> или <a href="https://t.me/rodin_kapustina">напишите в Телеграм</a>.';
    });
  });
  document.querySelectorAll('.review').forEach((review, index) => {
    const quote = review.querySelector('blockquote');
    if (quote.textContent.length < 330) return;
    quote.id = 'review-text-' + index;
    review.classList.add('is-collapsed');
    const toggle = document.createElement('button');
    toggle.type = 'button'; toggle.className = 'review-toggle';
    toggle.textContent = 'Читать полностью';
    toggle.setAttribute('aria-expanded', 'false'); toggle.setAttribute('aria-controls', quote.id);
    quote.after(toggle);
    toggle.addEventListener('click', () => {
      const collapsed = review.classList.toggle('is-collapsed');
      toggle.setAttribute('aria-expanded', String(!collapsed));
      toggle.textContent = collapsed ? 'Читать полностью' : 'Свернуть';
    });
  });
})();
