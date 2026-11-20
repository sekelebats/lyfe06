document.querySelectorAll('.filter-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('is-active'));
    chip.classList.add('is-active');
    const f = chip.dataset.filter;
    document.querySelectorAll('.product-card').forEach(card => {
      const tags = card.dataset.tags || '';
      card.style.display = (f === 'all' || tags.split(' ').includes(f)) ? '' : 'none';
    });
  });
});

function highlight(el) {
  let html = el.innerHTML
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const stash = [];
  html = html.replace(/(\/\/[^\n]*|\/\*[\s\S]*?\*\/|"[^"]*"|'[^']*')/g, m => {
    const cls = m.startsWith('/') ? 'tok-comment' : 'tok-string';
    stash.push(`<span class="${cls}">${m}</span>`);
    return `\x00${stash.length - 1}\x00`;
  });
  html = html
    .replace(/\b(const|let|var|function|return|if|else|for|while|import|export|from|class|async|await|try|catch|new|this)\b/g, '<span class="tok-keyword">$1</span>')
    .replace(/\b(true|false|null|undefined)\b/g, '<span class="tok-boolean">$1</span>')
    .replace(/\b(\d+(\.\d+)?)\b/g, '<span class="tok-number">$1</span>');
  html = html.replace(/\x00(\d+)\x00/g, (_, i) => stash[i]);
  el.innerHTML = html;
}
document.querySelectorAll('.prose pre code').forEach(highlight);
