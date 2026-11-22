(() => {
  const input = document.getElementById("searchInput");
  const results = document.getElementById("searchResults");
  const clear = document.getElementById("clearSearch");
  const list = document.getElementById("postList");
  const tags = document.getElementById("tagNavigation");

  if (!input || !results) return;

  let pagefind;
  let loading;
  let requestId = 0;
  let debounce;

  async function getPagefind() {
    if (!loading) {
      loading = import("/pagefind/pagefind.js")
        .then((module) => {
          pagefind = module;
          return module;
        })
        .catch((error) => {
          loading = undefined;
          throw error;
        });
    }

    return loading;
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[char]);
  }

  function showDefault(show) {
    if (list) list.hidden = !show;
    if (tags) tags.hidden = !show;
  }

  async function search(query) {
    const currentRequest = ++requestId;
    const term = query.trim();

    if (clear) clear.hidden = !term;

    if (!term) {
      results.innerHTML = "";
      results.classList.remove("is-visible");
      showDefault(true);
      return;
    }

    showDefault(false);
    results.classList.add("is-visible");
    results.innerHTML = '<p class="search-status">Searching…</p>';

    try {
      const api = await getPagefind();

      const response = await api.search(term);

      const data = await Promise.all(
        response.results
          .slice(0, 12)
          .map((item) => item.data())
      );

      // Ignore outdated search requests.
      if (currentRequest !== requestId) return;

      if (!data.length) {
        results.innerHTML = '<p class="empty">No writings found.</p>';
        return;
      }

      results.innerHTML = data.map((item) => {
        const title = item.meta?.title || "Read article";

        return `
          <article class="search-result">
            <h2 class="post-title">
              <a href="${escapeHtml(item.url)}">
                ${escapeHtml(title)}
              </a>
            </h2>
            <p class="search-excerpt">${item.excerpt || ""}</p>
          </article>
        `;
      }).join("");

    } catch (error) {
      // Do not let an outdated request overwrite newer results.
      if (currentRequest !== requestId) return;

      console.error("Pagefind search failed:", error);

      results.innerHTML =
        '<p class="empty">Search is unavailable. Please try again.</p>';
    }
  }

  input.addEventListener("input", () => {
    window.clearTimeout(debounce);

    debounce = window.setTimeout(() => {
      search(input.value);
    }, 160);
  });

  clear?.addEventListener("click", () => {
    input.value = "";
    search("");
    input.focus();
  });

  if (window.location.hash === "#search") {
    input.focus({ preventScroll: true });
  }
})();
