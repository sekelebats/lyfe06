(() => {
  const root = document.documentElement;
  const menuButton = document.querySelector('[data-menu-toggle]');
  const navPanel = document.getElementById('nav-panel');
  const themeButton = document.querySelector('[data-theme-toggle]');

  const setMenu = open => {
    if (!menuButton || !navPanel) return;
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
    navPanel.classList.toggle('is-open', open);
    menuButton.innerHTML = open
      ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="m18 6-12 12M6 6l12 12"/></svg>'
      : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>';
  };

  if (menuButton && navPanel) setMenu(false);
  menuButton?.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
  navPanel?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') setMenu(false);
  });
  document.addEventListener('click', event => {
    if (navPanel?.classList.contains('is-open') &&
        !navPanel.contains(event.target) && !menuButton?.contains(event.target)) setMenu(false);
  });

  const savedTheme = localStorage.getItem('awwra-theme');
  if (savedTheme === 'dark' || savedTheme === 'light') root.dataset.theme = savedTheme;
  const updateThemeIcon = () => {
    if (!themeButton) return;
    const dark = root.dataset.theme === 'dark';
    themeButton.setAttribute('aria-label', dark ? 'Gunakan tema terang' : 'Gunakan tema gelap');
    themeButton.innerHTML = dark
      ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/></svg>'
      : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z"/></svg>';
  };
  updateThemeIcon();
  themeButton?.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('awwra-theme', root.dataset.theme);
    updateThemeIcon();
  });

  document.querySelectorAll('[data-filter]').forEach(button => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;
      document.querySelectorAll('[data-filter]').forEach(item => {
        const active = item === button;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      document.querySelectorAll('.product-card').forEach(card => {
        const tags = (card.dataset.tags || '').split(/\s+/);
        card.hidden = filter !== 'all' && !tags.includes(filter);
      });
    });
  });

  document.querySelectorAll('[data-share]').forEach(button => {
    button.addEventListener('click', async () => {
      const status = button.parentElement.querySelector('.share-status');
      const shareData = { title: document.title, text: document.querySelector('meta[name="description"]')?.content || '', url: location.href };
      try {
        if (navigator.share) await navigator.share(shareData);
        else {
          await navigator.clipboard.writeText(location.href);
          if (status) status.textContent = 'Link berhasil disalin.';
        }
      } catch (error) {
        if (error.name !== 'AbortError' && status) status.textContent = 'Tidak dapat membagikan link.';
      }
    });
  });
})();
