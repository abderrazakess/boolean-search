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
