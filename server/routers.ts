import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod/v4";
import { generateObject } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { ENV } from "./_core/env";
import { createPatchedFetch } from "./_core/patchedFetch";

function createLLMProvider() {
  const baseURL = ENV.forgeApiUrl.endsWith("/v1")
    ? ENV.forgeApiUrl
    : `${ENV.forgeApiUrl}/v1`;

  return createOpenAI({
    baseURL,
    apiKey: ENV.forgeApiKey,
    fetch: createPatchedFetch(fetch),
  });
}

const keywordGroupSchema = z.object({
  groups: z.array(
    z.object({
      group: z.string().describe("A descriptive label for this keyword group"),
      terms: z.array(z.string()).describe("6-8 search terms for this group"),
    })
  ),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  news: router({
    fetch: publicProcedure
      .input(
        z.object({
          categories: z.array(z.string()),
          country: z.string().default("us"),
        })
      )
      .query(async ({ input }) => {
        // Verified working RSS feeds (tested directly)
        const FEEDS = {
          hrdive:    { url: "https://www.hrdive.com/feeds/news/",      source: "HR Dive" },
          hrexec:    { url: "https://hrexecutive.com/feed/",           source: "HR Executive" },
          social:    { url: "https://socialtalent.com/feed/",          source: "SocialTalent" },
          personnel: { url: "https://www.personneltoday.com/feed/",    source: "Personnel Today" },
        };

        const CATEGORY_FEEDS: Record<string, (keyof typeof FEEDS)[]> = {
          "labor-market":  ["hrdive", "hrexec"],
          "industry":      ["hrdive", "hrexec"],
          "hr-talent":     ["social", "hrdive"],
          "remote":        ["hrdive", "personnel"],
          "skills":        ["social", "hrexec"],
          "compensation":  ["hrexec", "hrdive"],
          "legal":         ["hrexec", "personnel"],
        };

        // Country-to-feed preference: which feeds are most relevant per region
        const COUNTRY_FEEDS: Record<string, (keyof typeof FEEDS)[]> = {
          "gb": ["personnel", "social"],   // UK — Personnel Today is UK-focused
          "ie": ["personnel", "social"],   // Ireland
          "au": ["hrdive", "social"],      // Australia — global/US coverage works well
          "ca": ["hrdive", "hrexec"],      // Canada
          "de": ["personnel", "social"],   // Germany — international coverage
          "fr": ["personnel", "social"],
          "nl": ["personnel", "social"],
          "in": ["hrdive", "social"],
          "ae": ["hrdive", "personnel"],
          "sg": ["hrdive", "personnel"],
        };

        // Collect up to 3 unique feed keys for the selected categories
        const selected = new Set<keyof typeof FEEDS>();

        // Seed with country-preferred feeds first
        const countryPreferred = COUNTRY_FEEDS[input.country] ?? ["hrdive", "hrexec"];
        for (const key of countryPreferred) {
          selected.add(key);
          if (selected.size >= 2) break;
        }

        // Then fill remaining slots from category-mapped feeds
        for (const cat of input.categories) {
          for (const key of CATEGORY_FEEDS[cat] ?? []) {
            selected.add(key);
            if (selected.size >= 3) break;
          }
          if (selected.size >= 3) break;
        }
        if (!selected.size) selected.add("hrdive");

        // Parse RSS XML directly — no third-party service needed
        function parseRss(xml: string, source: string) {
          const items: { title: string; source: string; url: string; publishedAt: string; image: string | null }[] = [];
          const itemMatches = xml.matchAll(/<item>([\s\S]*?)<\/item>/g);
          for (const m of itemMatches) {
            const block = m[1];
            const title = block.match(/<title[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/)?.[1]
              ?.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
              .replace(/&apos;/g, "'").replace(/&quot;/g, '"').replace(/<[^>]+>/g, "").trim();
            const url = block.match(/<link>(https?:\/\/[^\s<]+)/)?.[1]
              ?? block.match(/<guid[^>]*>(https?:\/\/[^\s<]+)/)?.[1];
            const pubDate = block.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1]?.trim();

            // Extract image: try media:content, media:thumbnail, enclosure, then <img> in description
            const image =
              block.match(/<media:content[^>]+url="([^"]+)"/)?.[1] ??
              block.match(/<media:thumbnail[^>]+url="([^"]+)"/)?.[1] ??
              block.match(/<enclosure[^>]+url="([^"]+)"[^>]+type="image/)?.[1] ??
              block.match(/<img[^>]+src="(https?:\/\/[^"]+)"/)?.[1] ??
              null;

            if (title && url) {
              items.push({ title, source, url, publishedAt: pubDate ?? new Date().toISOString(), image });
            }
          }
          return items;
        }

        const results = await Promise.allSettled(
          Array.from(selected).map(async (key) => {
            const { url, source } = FEEDS[key];
            const res = await fetch(url, {
              signal: AbortSignal.timeout(6000),
              headers: { "User-Agent": "Mozilla/5.0 (compatible; NewsBot/1.0)" },
            });
            if (!res.ok) return [];
            const xml = await res.text();
            return parseRss(xml, source).slice(0, 5);
          })
        );

        const articles = results
          .flatMap((r) => r.status === "fulfilled" ? r.value : [])
          .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
          .slice(0, 12);

        return { articles, fallback: false };
      }),
  }),

  funding: router({
    fetch: publicProcedure
      .input(
        z.object({
          locations: z.array(z.string()).default([]),
          industries: z.array(z.string()).default([]),
          types: z.array(z.string()).default([]),
          range: z.string().nullable().default(null),
          period: z.string().default("12m"),
        })
      )
      .query(async ({ input }) => {
        // Verified funding-focused RSS feeds
        const FEEDS = {
          techcrunch: { url: "https://techcrunch.com/tag/funding/feed/", source: "TechCrunch", region: "us" },
          venturebeat: { url: "https://venturebeat.com/feed/", source: "VentureBeat", region: "us" },
          sifted: { url: "https://sifted.eu/feed", source: "Sifted", region: "eu" },
          uktech: { url: "https://uktech.news/feed", source: "UKTech", region: "gb" },
        } as const;

        // Region-to-feed preference
        const REGION_FEEDS: Record<string, (keyof typeof FEEDS)[]> = {
          "us": ["techcrunch", "venturebeat"],
          "ca": ["techcrunch", "venturebeat"],
          "au": ["techcrunch", "venturebeat"],
          "in": ["techcrunch", "venturebeat"],
          "sg": ["techcrunch", "venturebeat"],
          "ae": ["techcrunch", "venturebeat"],
          "gb": ["uktech", "sifted"],
          "eu": ["sifted", "techcrunch"],
          "il": ["techcrunch", "sifted"],
          "global": ["techcrunch", "sifted"],
        };

        // Pick feeds based on selected locations; fallback to all
        const selected = new Set<keyof typeof FEEDS>();
        if (input.locations.length) {
          for (const loc of input.locations) {
            for (const key of REGION_FEEDS[loc] ?? ["techcrunch"]) {
              selected.add(key);
              if (selected.size >= 3) break;
            }
            if (selected.size >= 3) break;
          }
        }
        if (!selected.size) {
          selected.add("techcrunch");
          selected.add("venturebeat");
          selected.add("sifted");
        }

        // Parse RSS XML
        function parseRss(xml: string, source: string) {
          const items: {
            title: string; source: string; url: string; publishedAt: string;
            amount: string | null; roundType: string | null; company: string | null;
            image: string | null;
          }[] = [];
          const itemMatches = xml.matchAll(/<item>([\s\S]*?)<\/item>/g);
          for (const m of itemMatches) {
            const block = m[1];
            const title = block.match(/<title[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/)?.[1]
              ?.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
              .replace(/&apos;/g, "'").replace(/&quot;/g, '"').replace(/<[^>]+>/g, "").trim();
            const url = block.match(/<link>(https?:\/\/[^\s<]+)/)?.[1]
              ?? block.match(/<guid[^>]*>(https?:\/\/[^\s<]+)/)?.[1];
            const pubDate = block.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1]?.trim();
            if (!title || !url) continue;

            // Extract image — handle double and single quotes, content:encoded HTML, og:image
            const imgUrl = (s: string | undefined) => s?.startsWith("http") ? s : null;
            const image =
              imgUrl(block.match(/<media:content[^>]+url=["']([^"']+)["']/)?.[1]) ??
              imgUrl(block.match(/<media:thumbnail[^>]+url=["']([^"']+)["']/)?.[1]) ??
              imgUrl(block.match(/<enclosure[^>]+url=["']([^"']+)["'][^>]+type=["']image/)?.[1]) ??
              imgUrl(block.match(/<enclosure[^>]+type=["']image[^"']*["'][^>]+url=["']([^"']+)["']/)?.[1]) ??
              imgUrl(block.match(/<content:encoded[^>]*>[\s\S]*?<img[^>]+src=["'](https?:\/\/[^"']+)["']/)?.[1]) ??
              imgUrl(block.match(/<description[^>]*>[\s\S]*?<img[^>]+src=["'](https?:\/\/[^"']+)["']/)?.[1]) ??
              imgUrl(block.match(/<img[^>]+src=["'](https?:\/\/[^"']+)["']/)?.[1]) ??
              null;

            // Extract funding amount from title (e.g. "$50M", "€20 million")
            const amountMatch = title.match(/\$[\d,.]+\s*[MBK](?:illion)?|\€[\d,.]+\s*[MBK](?:illion)?|£[\d,.]+\s*[MBK](?:illion)?/i);
            const amount = amountMatch ? amountMatch[0].replace(/illion/i, "").trim() : null;

            // Extract round type from title
            const roundMatch = title.match(/\b(Pre-?Seed|Seed|Series [A-F]|Series [A-F]\+?|IPO|Acquisition|angel round|bridge round)\b/i);
            const roundType = roundMatch ? roundMatch[0] : null;

            // Extract company name (first word(s) before "raises" or "secures" or "closes")
            const companyMatch = title.match(/^([A-Z][^\s,]+(?:\s+[A-Z][^\s,]+)?)\s+(?:raises?|secures?|closes?|lands?|gets?)\b/i);
            const company = companyMatch ? companyMatch[1] : null;

            // Only include articles that look like funding news
            const isFundingArticle =
              /raises?|funding|round|series [a-f]|seed|venture|invest|backed|secures?/i.test(title);
            if (!isFundingArticle) continue;

            items.push({
              title, source, url,
              publishedAt: pubDate ?? new Date().toISOString(),
              amount, roundType, company, image,
            });
          }
          return items;
        }

        const results = await Promise.allSettled(
          Array.from(selected).map(async (key) => {
            const { url, source } = FEEDS[key];
            const res = await fetch(url, {
              signal: AbortSignal.timeout(7000),
              headers: { "User-Agent": "Mozilla/5.0 (compatible; FundingBot/1.0)" },
            });
            if (!res.ok) return [];
            const xml = await res.text();
            return parseRss(xml, source).slice(0, 8);
          })
        );

        // Period cutoff in ms
        const PERIOD_MS: Record<string, number> = {
          "7d":  7  * 86400000,
          "30d": 30 * 86400000,
          "3m":  90 * 86400000,
          "6m":  180 * 86400000,
          "12m": 365 * 86400000,
        };
        const cutoff = Date.now() - (PERIOD_MS[input.period] ?? PERIOD_MS["12m"]);

        // Funding type label → round type string mapping for filtering
        const TYPE_LABELS: Record<string, string[]> = {
          "pre-seed":  ["pre-seed", "pre seed"],
          "seed":      ["seed"],
          "series-a":  ["series a"],
          "series-b":  ["series b"],
          "series-c":  ["series c"],
          "series-d":  ["series d", "series d+", "series e", "series f"],
          "ipo":        ["ipo"],
          "acquisition":["acquisition"],
        };

        const rounds = results
          .flatMap((r) => r.status === "fulfilled" ? r.value : [])
          .filter((r) => new Date(r.publishedAt).getTime() >= cutoff)
          .filter((r) => {
            if (!input.types.length) return true;
            if (!r.roundType) return true; // keep unknowns
            const rt = r.roundType.toLowerCase();
            return input.types.some((tid) =>
              (TYPE_LABELS[tid] ?? []).some((label) => rt.includes(label))
            );
          })
          .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
          .slice(0, 15);

        return { rounds };
      }),
  }),

  boolean: router({
    generateGroups: publicProcedure
      .input(
        z.object({
          keyword: z.string().min(2).max(100),
          type: z.enum(["jobTitle", "keyword"]).default("jobTitle"),
        })
      )
      .mutation(async ({ input }) => {
        const openai = createLLMProvider();

        const contextLabel =
          input.type === "jobTitle" ? "job title" : "skill or keyword";

        const result = await generateObject({
          model: openai.chat("gpt-4o-mini"),
          schema: keywordGroupSchema,
          prompt: `You are a recruitment Boolean search expert. For the ${contextLabel}: "${input.keyword}", generate 6 keyword groups a recruiter would use to find candidates on LinkedIn or job boards.

Rules:
- First entry should be "${input.keyword}" as an exact match group with the group name just being "${input.keyword}"
- Each subsequent group represents a different angle: variants, tools, seniority levels, related technologies, abbreviations, or industry context
- Group name format: "${input.keyword} (part of X)" where X describes the category
- Each group should have 6-8 practical terms for Boolean searches
- Terms should be real-world job titles, skills, or keywords that recruiters actually search for
- Include common abbreviations, alternative spellings, and related terms`,
        });

        return result.object;
      }),
  }),
});

export type AppRouter = typeof appRouter;
