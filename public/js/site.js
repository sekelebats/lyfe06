/* =========================================================
   AWWRA — Site interactions
   Vanilla JavaScript · No dependencies
========================================================= */
(() => {
  'use strict';

  const root = document.documentElement;
  const menuButton = document.querySelector('[data-menu-toggle]');
  const navPanel = document.querySelector('[data-nav-panel]');
  const themeButton = document.querySelector('[data-theme-toggle]');

  const icon = (name, size = 18) => {
    const paths = {
      menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
      close: '<path d="m18 6-12 12M6 6l12 12"/>',
      sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/>',
      moon: '<path d="M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z"/>'
    };
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${paths[name] || ''}</svg>`;
  };

  // Mobile navigation
  if (menuButton && navPanel) {
    const mobileQuery = window.matchMedia('(max-width: 41.999rem)');
    const menuIsOpen = () => menuButton.getAttribute('aria-expanded') === 'true';

    const setMenu = open => {
      navPanel.classList.toggle('is-open', open);
      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
      menuButton.setAttribute('title', open ? 'Tutup menu' : 'Buka menu');
      menuButton.innerHTML = icon(open ? 'close' : 'menu', 20);
    };

    setMenu(false);
    menuButton.addEventListener('click', event => {
      event.preventDefault();
      setMenu(!menuIsOpen());
    });

    navPanel.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => setMenu(false));
    });

    document.addEventListener('pointerdown', event => {
      if (menuIsOpen() && !navPanel.contains(event.target) && !menuButton.contains(event.target)) {
        setMenu(false);
      }
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && menuIsOpen()) {
        setMenu(false);
        menuButton.focus();
      }
    });

    const handleBreakpoint = event => {
      if (!event.matches) setMenu(false);
    };
    if (typeof mobileQuery.addEventListener === 'function') {
      mobileQuery.addEventListener('change', handleBreakpoint);
    } else {
      mobileQuery.addListener(handleBreakpoint);
    }
  }

  // Dark / light theme
  const storageKey = 'awwra-theme';
  const readSavedTheme = () => {
    try {
      const value = localStorage.getItem(storageKey);
      return value === 'dark' || value === 'light' ? value : null;
    } catch (_) {
      return null;
    }
  };
  const getSystemTheme = () =>
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

  const updateThemeButton = theme => {
    if (!themeButton) return;
    const dark = theme === 'dark';
    themeButton.innerHTML = icon(dark ? 'sun' : 'moon', 18);
    themeButton.setAttribute('aria-label', dark ? 'Aktifkan mode terang' : 'Aktifkan mode gelap');
    themeButton.setAttribute('title', dark ? 'Mode terang' : 'Mode gelap');
  };

  const applyTheme = (theme, save = false) => {
    root.dataset.theme = theme;
    updateThemeButton(theme);
    if (save) {
      try { localStorage.setItem(storageKey, theme); } catch (_) {}
    }
  };

  applyTheme(readSavedTheme() || root.dataset.theme || getSystemTheme());
  themeButton?.addEventListener('click', () => {
    applyTheme(root.dataset.theme === 'dark' ? 'light' : 'dark', true);
  });

  if (window.matchMedia) {
    const systemQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemTheme = event => {
      if (!readSavedTheme()) applyTheme(event.matches ? 'dark' : 'light');
    };
    if (typeof systemQuery.addEventListener === 'function') {
      systemQuery.addEventListener('change', handleSystemTheme);
    } else {
      systemQuery.addListener(handleSystemTheme);
    }
  }

  // Product filters
  const filterButtons = [...document.querySelectorAll('[data-filter]')];
  const productCards = [...document.querySelectorAll('.product-grid .product-card')];
  if (filterButtons.length && productCards.length) {
    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        const filter = button.dataset.filter || 'all';
        filterButtons.forEach(item => {
          const active = item === button;
          item.classList.toggle('is-active', active);
          item.setAttribute('aria-pressed', String(active));
        });
        productCards.forEach(card => {
          const tags = (card.dataset.tags || '').split(/\s+/).filter(Boolean);
          card.hidden = filter !== 'all' && !tags.includes(filter);
        });
      });
    });
  }

  // Share / copy link
  const copyText = async value => {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(value);
      return true;
    }
    const field = document.createElement('textarea');
    field.value = value;
    field.setAttribute('readonly', '');
    field.style.position = 'fixed';
    field.style.opacity = '0';
    field.style.pointerEvents = 'none';
    document.body.appendChild(field);
    field.select();
    let copied = false;
    try { copied = document.execCommand('copy'); }
    finally { field.remove(); }
    return copied;
  };

  document.querySelectorAll('[data-share]').forEach(button => {
    button.addEventListener('click', async () => {
      const status = button.parentElement?.querySelector('.share-status');
      const shareData = {
        title: document.title,
        text: document.querySelector('meta[name="description"]')?.content || '',
        url: window.location.href
      };
      button.disabled = true;
      if (status) status.textContent = '';
      try {
        if (navigator.share) {
          await navigator.share(shareData);
        } else if (await copyText(shareData.url)) {
          if (status) status.textContent = 'Link berhasil disalin.';
        } else if (status) {
          status.textContent = 'Tidak dapat menyalin link di browser ini.';
        }
      } catch (error) {
        if (error?.name !== 'AbortError' && status) status.textContent = 'Tidak dapat membagikan link.';
      } finally {
        button.disabled = false;
      }
    });
  });
})();
