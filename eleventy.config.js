import { feedPlugin } from "@11ty/eleventy-plugin-rss";

export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });

  eleventyConfig.addFilter("dateDisplay", (date) => {
    const value = date instanceof Date ? date : new Date(date);
    if (Number.isNaN(value.getTime())) return "";

    const day = String(value.getDate()).padStart(2, "0");
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const year = String(value.getFullYear()).slice(-2);

    return `${day}.${month}.${year}`;
  });

  eleventyConfig.addFilter("currentYear", () => new Date().getFullYear());

  eleventyConfig.addFilter("dateIso", (date) => {
    const value = date instanceof Date ? date : new Date(date);
    return Number.isNaN(value.getTime()) ? "" : value.toISOString();
  });

  eleventyConfig.addFilter("absoluteUrl", (url, base) => {
    return new URL(url, base).href;
  });

  // All posts, sorted by newest date.
  eleventyConfig.addCollection("posts", (collectionApi) => {
    return collectionApi
      .getFilteredByGlob("src/posts/*.md")
      .sort((a, b) => b.date - a.date);
  });

  // Automatically collect unique tags from post front matter.
  eleventyConfig.addCollection("tagList", (collectionApi) => {
    const tags = new Set();

    for (const post of collectionApi.getFilteredByGlob("src/posts/*.md")) {
      const value = post.data.tag;

      if (typeof value === "string" && value.trim()) {
        tags.add(value.trim().toLowerCase());
      }
    }

    return [...tags].sort((a, b) => a.localeCompare(b));
  });

  eleventyConfig.addPlugin(feedPlugin, {
    type: "rss",
    outputPath: "/feed.xml",
    collection: {
      name: "posts",
      limit: 20
    },
    metadata: {
      language: "en",
      title: "FZH Studio",
      subtitle: "Notes on design, technology, and life.",
      base: "https://example.com/",
      author: {
        name: "FZH Studio",
        email: ""
      }
    }
  });

  return {
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "_site"
    },
    templateFormats: ["md", "njk", "html", "11ty.js"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk"
  };
}
