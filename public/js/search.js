(() => {
  const input = document.getElementById('site-search');
  const output = document.getElementById('search-results');
  if (!input || !output) return;

  let pagefind;
  let timer;
  const escapeHTML = value => String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[char]));

  async function runSearch(query) {
    if (!query.trim()) {
      output.innerHTML = '<p class="search-empty">Masukkan kata kunci untuk mulai mencari.</p>';
      return;
    }
    output.innerHTML = '<p class="search-empty">Mencari…</p>';
    try {
      pagefind ||= await import('/pagefind/pagefind.js');
      const search = await pagefind.search(query);
      const results = await Promise.all(search.results.slice(0, 20).map(result => result.data()));
      if (!results.length) {
        output.innerHTML = '<p class="search-empty">Tidak ada hasil yang cocok.</p>';
        return;
      }
      output.innerHTML = results.map(result => `
        <article class="search-result">
          <h2><a href="${escapeHTML(result.url)}">${escapeHTML(result.meta.title || 'Tanpa judul')}</a></h2>
          <p>${result.excerpt || ''}</p>
        </article>`).join('');
    } catch (error) {
      console.error(error);
      output.innerHTML = '<p class="search-empty">Pencarian belum tersedia. Coba jalankan proses build lengkap.</p>';
    }
  }

  input.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => runSearch(input.value), 180);
  });
  output.innerHTML = '<p class="search-empty">Masukkan kata kunci untuk mulai mencari.</p>';
})();
