import dotenv from "dotenv";
import * as cheerio from "cheerio";
import mongoose from "mongoose";
import Article from "../models/article.js";

dotenv.config();

async function getArticlesFromApi() {
  const url = `${process.env.BACKEND_BASE_URL}/api/articles`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to load articles");
  return await res.json();
}

async function googleSearch(title) {
  const url = `https://www.googleapis.com/customsearch/v1?key=${
    process.env.GOOGLE_API
  }&cx=${process.env.GOOGLE_CX}&q=${encodeURIComponent(
    title + " blog article"
  )}&num=5`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (!res.ok) {
      throw new Error(
        `HTTP ${res.status}: ${data.error?.message || "Unknown error"}`
      );
    }

    const items = data.items || [];
    const links = [];

    for (const item of items) {
      const link = item.link;
      if (!link || link.includes("beyondchats.com")) continue;
      if (link.startsWith("http") && !links.includes(link)) {
        links.push(link);
        if (links.length === 2) break;
      }
    }

    console.log(`Found ${links.length} reference links for "${title}"`);
    return links;
  } catch (e) {
    console.log(`Google search failed for "${title}":`, e.message);
    return [];
  }
}

async function fetchHtml(url) {
  const res = await fetch(url);
  if (!res.ok) return null;
  return await res.text();
}

function getStyleSample(html) {
  if (!html) return "";

  const $ = cheerio.load(html);

  // Remove unwanted elements
  $("script, style, nav, header, footer, .sidebar, .comments, .ads").remove();

  // Get only first 1000 chars of main content for STYLE analysis
  let sample = "";
  const contentSelectors = [
    ".entry-content",
    ".post-content",
    ".article-content",
    "main",
    "article",
  ];

  for (const selector of contentSelectors) {
    const content = $(selector).first();
    if (content.length) {
      sample = content.text().replace(/\s+/g, " ").trim().slice(0, 1000);
      break;
    }
  }

  return sample;
}

async function rewriteWithSonar(
  originalTitle,
  originalContent,
  style1,
  style2,
  refLinks
) {
  let styleSection = "";

  if (style1 && style2) {
    styleSection = `REFERENCE STYLES:
    
Style 1 sample:
${style1.substring(0, 800)}

Style 2 sample:
${style2.substring(0, 800)}

TASK: Rewrite the original article keeping the SAME topic, facts, and structure. 
Match the writing style, tone, and formatting of the reference styles.`;
  } else {
    styleSection = `TASK: Rewrite this article to be highly professional, engaging, and authoritative.
Use a tone similar to top tech blogs like TechCrunch or The Verge.
Focus on clarity, flow, and persuasive writing.`;
  }

  const prompt = `Rewrite this blog article:

TITLE: ${originalTitle}

ORIGINAL CONTENT:
${originalContent.substring(0, 3000)}

${styleSection}

Return ONLY the rewritten article content (no quotes, no explanations).`;

  const res = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.SONAR_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "sonar-pro",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 2500,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    throw new Error(`Sonar API failed: ${res.status}`);
  }

  const data = await res.json();
  const rewritten = data.choices?.[0]?.message?.content?.trim();

  return rewritten || "";
}

async function createUpdatedArticle(original, rewrittenContent, refLinks) {
  const url = `${process.env.BACKEND_BASE_URL}/api/articles`;

  const body = {
    title: `${original.title} (AI Enhanced)`,
    slug: `${original.slug}-enhanced`,
    content: rewrittenContent, // ONLY clean rewritten content
    sourceUrl: original.sourceUrl,
    updated: true,
    references: refLinks, // Reference URLs only
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`Failed to save: ${res.status}`);
  }

  return await res.json();
}

async function run() {
  console.log("Starting Phase 2 - Clean Content Update...");

  // Check env vars
  const required = [
    "GOOGLE_API",
    "GOOGLE_CX",
    "SONAR_API_KEY",
    "BACKEND_BASE_URL",
  ];
  for (const key of required) {
    if (!process.env[key]) {
      console.log(`Missing ${key}`);
      return;
    }
  }

  await mongoose.connect(process.env.MONGO_URI);

  const articles = await getArticlesFromApi();
  console.log(`Found ${articles.length} original articles`);

  let processed = 0;

  for (const article of articles) {
    if (
      article.updated ||
      article.isEnhanced ||
      !article.content ||
      article.content.length < 200
    ) {
      console.log(`Skipping: ${article.title}`);
      continue;
    }

    console.log(`\nProcessing: ${article.title.substring(0, 50)}...`);

    try {
      // 1. Get reference links
      const refLinks = await googleSearch(article.title);
      let style1 = "",
        style2 = "";

      if (refLinks.length >= 2) {
        console.log(`Getting style from: ${refLinks[0]} & ${refLinks[1]}`);
        const html1 = await fetchHtml(refLinks[0]);
        const html2 = await fetchHtml(refLinks[1]);
        style1 = getStyleSample(html1);
        style2 = getStyleSample(html2);
      } else {
        console.log(
          " No sufficient references found. Using default professional style."
        );
      }

      // 3. Rewrite with Sonar
      const rewritten = await rewriteWithSonar(
        article.title,
        article.content,
        style1,
        style2,
        refLinks
      );

      if (!rewritten || rewritten.length < 500) {
        console.log(" Rewrite failed or too short");
        continue;
      }

      // 4. Save clean content & Mark original as enhanced
      await createUpdatedArticle(article, rewritten, refLinks);
      await Article.findByIdAndUpdate(article._id, { isEnhanced: true });

      console.log(`SUCCESS! Saved ${rewritten.length} chars of clean content`);
      processed++;
    } catch (e) {
      console.log(`Error: ${e.message}`);
    }

    // Rate limit
    await new Promise((r) => setTimeout(r, 2000));
  }

  console.log(
    `\nPhase 2 Complete! Processed ${processed}/${articles.length} articles`
  );
  await mongoose.connection.close();
}

run().catch((e) => {
  console.error("Fatal error:", e);
  process.exit(1);
});
