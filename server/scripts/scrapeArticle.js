import mongoose from "mongoose";
import * as cheerio from "cheerio";
import dotenv from "dotenv";
import Article from "../models/article.js";

dotenv.config();

async function getHtml(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed ${res.status}: ${url}`);
  return await res.text();
}

function getLastPageNumber(html) {
  const $ = cheerio.load(html);
  let maxPage = 1;
  $("a.page-numbers").each((_, el) => {
    const text = $(el).text().trim();
    const num = parseInt(text, 10);
    if (!isNaN(num) && num > maxPage) maxPage = num;
  });
  return maxPage || 1;
}

function getArticleLinks(html) {
  const $ = cheerio.load(html);
  const links = [];

  // Better selectors for blog post links
  $(
    "article a[href*='/blogs/'], .post-title a, h2 a, h3 a, .entry-title a"
  ).each((_, el) => {
    let href = $(el).attr("href");
    const title = $(el).text().trim();

    // Handle relative URLs
    if (href && !href.startsWith("http")) {
      href = "https://beyondchats.com" + href;
    }

    if (
      href &&
      title &&
      href.includes("/blogs/") &&
      !href.includes("#") &&
      href.startsWith("https://beyondchats.com")
    ) {
      links.push({ href, title });
    }
  });

  // Remove duplicates
  const seen = new Set();
  return links
    .filter((item) => {
      if (!seen.has(item.href)) {
        seen.add(item.href);
        return true;
      }
      return false;
    })
    .slice(0, 10);
}

function extractFullArticleContent(html) {
  const $ = cheerio.load(html);

  // Remove unwanted elements first
  $(
    "script, style, nav, header, footer, .sidebar, .comments, .related, .ads, .social"
  ).remove();

  // Title selectors (most specific first)
  const titleSelectors = [
    "h1.entry-title",
    ".entry-title",
    "h1.post-title",
    ".post-title h1",
    "h1",
    ".article-header h1",
  ];

  let title = "";
  for (const selector of titleSelectors) {
    const el = $(selector).first();
    if (el.length && el.text().trim().length > 10) {
      title = el.text().trim();
      break;
    }
  }

  // Content selectors - try article body areas
  const contentSelectors = [
    ".entry-content",
    ".post-content",
    ".article-content",
    ".content-area",
    "main .content",
    ".single-post .content",
    "article",
    "main",
    ".post",
  ];

  let fullContent = "";

  for (const selector of contentSelectors) {
    const contentEl = $(selector).first();
    if (contentEl.length) {
      // Remove unwanted child elements
      contentEl
        .find("script, style, nav, .sidebar, .comments, footer, .related")
        .remove();

      // Get text from paragraphs, headings, lists
      const paragraphs = contentEl
        .find("p, li, h1, h2, h3, h4, h5, h6, div")
        .filter((i, el) => {
          const text = $(el).text().trim();
          return text.length > 20; // Only substantial content
        });

      paragraphs.each((i, el) => {
        const text = $(el).text().trim();
        if (text.length > 30) {
          fullContent += text + "\n\n";
        }
      });

      if (fullContent.length > 1000) break; // Good content found
    }
  }

  // Final cleanup
  fullContent = fullContent
    .replace(/\n\s*\n\s*\n/g, "\n\n") // Remove excess newlines
    .replace(/^\s+|\s+$/g, "") // Trim
    .slice(0, 15000); // Max length

  return {
    title: title || "BeyondChats Article",
    content:
      fullContent.length > 500 ? fullContent : "Full content extraction failed",
  };
}

async function scrapeAndSave() {
  console.log("Starting BeyondChats scraper...");

  await mongoose.connect(process.env.MONGO_URI);

  // Step 1: Get blogs page to find last page
  const blogsUrl = "https://beyondchats.com/blogs/";
  console.log("Getting blog listing...");
  const blogsHtml = await getHtml(blogsUrl);
  const lastPageNum = getLastPageNumber(blogsHtml);
  const lastPageUrl =
    lastPageNum > 1
      ? `https://beyondchats.com/blogs/page/${lastPageNum}/`
      : blogsUrl;

  console.log(
    `Scraping oldest articles from page ${lastPageNum}: ${lastPageUrl}`
  );

  // Step 2: Get article links from LAST page (oldest articles)
  const lastPageHtml = await getHtml(lastPageUrl);
  const articleLinks = getArticleLinks(lastPageHtml);

  console.log(`Found ${articleLinks.length} article links:`);
  articleLinks.forEach((link, i) => {
    console.log(`  ${i + 1}. ${link.title.substring(0, 60)}... → ${link.href}`);
  });

  // Step 3: Visit EACH article page and extract FULL content
  let savedCount = 0;

  for (let i = 0; i < articleLinks.length; i++) {
    const { href, title } = articleLinks[i];

    try {
      console.log(
        `\n[${i + 1}/${articleLinks.length}] Extracting: ${title.substring(
          0,
          60
        )}...`
      );

      // Visit individual article page
      const articleHtml = await getHtml(href);

      // Extract FULL content from article page
      const contentData = extractFullArticleContent(articleHtml);

      // Check if already exists
      const slug = href.split("/").filter(Boolean).pop() || `article-${i}`;
      const existing = await Article.findOne({ slug });

      if (existing) {
        console.log("Already exists, skipping");
        continue;
      }

      // Save full article
      const article = new Article({
        title: contentData.title,
        slug,
        content: contentData.content,
        sourceUrl: href,
      });

      await article.save();
      console.log(`Saved! (${contentData.content.length} chars)`);
      savedCount++;
      if (savedCount >= 1) break;
    } catch (error) {
      console.log(`Failed ${href}: ${error.message}`);
    }

    // Small delay to be respectful
    await new Promise((r) => setTimeout(r, 1000));
  }

  console.log(
    `\nComplete! Saved ${savedCount}/${articleLinks.length} full articles`
  );
  await mongoose.connection.close();
}

scrapeAndSave().catch(console.error);
