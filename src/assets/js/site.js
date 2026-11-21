(() => {
  const root = document.documentElement;
  const toggle = document.getElementById("themeToggle");
  const icon = document.getElementById("themeIcon");

  const icons = {
    sun: '<circle cx="12" cy="12" r="3.6"></circle><path d="M12 2.5v2M12 19.5v2M4.7 4.7l1.4 1.4m11.8 11.8 1.4 1.4M2.5 12h2m15 0h2M4.7 19.3l1.4-1.4M17.9 6.1l1.4-1.4"></path>',
    moon: '<path d="M19.2 15.1A8 8 0 0 1 8.9 4.8 8.3 8.3 0 1 0 19.2 15.1Z"></path>'
  };

  function applyTheme(theme, persist = true) {
    const selected = theme === "dark" ? "dark" : "light";
    root.dataset.theme = selected;
    root.style.colorScheme = selected;

    if (icon) icon.innerHTML = selected === "dark" ? icons.moon : icons.sun;
    if (toggle) {
      toggle.setAttribute("aria-label", selected === "dark" ? "Switch to light mode" : "Switch to dark mode");
      toggle.title = selected === "dark" ? "Switch to light mode" : "Switch to dark mode";
    }
    if (persist) {
      try { localStorage.setItem("fzh-theme", selected); } catch {}
    }
  }

  applyTheme(root.dataset.theme || "light", false);
  toggle?.addEventListener("click", () => {
    applyTheme(root.dataset.theme === "dark" ? "light" : "dark");
  });

  document.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-share-url]");
    if (!button) return;

    const url = new URL(button.dataset.shareUrl, window.location.origin).href;
    const title = button.dataset.shareTitle || document.title;

    try {
      if (navigator.share) {
        await navigator.share({ title, url });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        button.setAttribute("aria-label", "Link copied");
        button.title = "Link copied";
        window.setTimeout(() => {
          button.setAttribute("aria-label", "Share");
          button.title = "Share";
        }, 1600);
      } else {
        window.prompt("Copy this link:", url);
      }
    } catch (error) {
      if (error?.name !== "AbortError") console.error("Share failed:", error);
    }
  });

  const tagButtons = [...document.querySelectorAll(".tag[data-tag]")];
  const posts = [...document.querySelectorAll(".post[data-tag]")];
  const empty = document.getElementById("filterEmpty");

  function applyTagFilter(selected) {
    const chosen = tagButtons.find((button) => button.dataset.tag === selected) ||
      tagButtons.find((button) => button.dataset.tag === "all");
    if (!chosen) return;

    let visible = 0;
    tagButtons.forEach((tag) => {
      const active = tag === chosen;
      tag.classList.toggle("active", active);
      tag.setAttribute("aria-pressed", String(active));
    });

    posts.forEach((post) => {
      const show = chosen.dataset.tag === "all" || post.dataset.tag === chosen.dataset.tag;
      post.hidden = !show;
      if (show) visible += 1;
    });

    if (empty) empty.hidden = visible !== 0;
  }

  tagButtons.forEach((button) => {
    button.addEventListener("click", () => applyTagFilter(button.dataset.tag));
  });

  const tagFromHash = new URLSearchParams(window.location.hash.slice(1)).get("tag");
  if (tagFromHash) applyTagFilter(tagFromHash);
})();