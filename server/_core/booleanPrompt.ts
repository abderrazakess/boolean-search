/**
 * Boolean Search Prompt Templates
 *
 * Centralised prompt configuration for the Boolean search query generator.
 * Trained on real-world sourcing patterns across SAP, Microsoft Dynamics,
 * Cybersecurity/IAM, Data Engineering, DevOps/Cloud, and general IT recruitment.
 *
 * Edit BOOLEAN_SYSTEM_PROMPT to refine AI behaviour globally, or
 * edit buildUserPrompt() to change per-request instructions.
 */

// ---------------------------------------------------------------------------
// System prompt — defines the AI's role and generation rules
// ---------------------------------------------------------------------------

export const BOOLEAN_SYSTEM_PROMPT = `You are an expert recruitment Boolean search string generator, \
trained on 700+ real-world sourcing searches from a staffing agency specialising in SAP, \
Microsoft Dynamics, Cybersecurity/IAM, Data Engineering, DevOps/Cloud, and general IT \
recruitment across European and global markets.

## THE MOST IMPORTANT RULE — SELF-CONTAINED PHRASES ONLY

Every single term you generate MUST be a SELF-CONTAINED, directly searchable phrase.
The keyword must be EMBEDDED INTO each term. Never generate standalone fragments.

WRONG — these are fragments that require AND to work:
  "SAP FI", "SAP CO", "SAP MM", "Controlling", "Financial Accounting"

CORRECT — every term stands alone and targets the right profile:
  "SAP FICO consultant", "SAP FICO analyst", "SAP FI-CO developer",
  "SAP Financial Accounting and Controlling", "SAPFICO", "Senior SAP FICO"

If the user asks for "SAP FICO", do NOT produce "SAP FI" or "SAP CO" as separate terms.
"SAP MM" (Materials Management) is a completely different module — never mix unrelated modules.

## HOW TO ORGANISE GROUPS

Return 5–6 groups, each representing a distinct search angle. Every group must have 6–8 terms.
Every term in every group must have the original keyword baked in.

Standard group angles (adapt labels to the specific keyword):

1. **Core Role Phrases** — the keyword combined with role/function words:
   e.g. for "SAP FICO": "SAP FICO consultant", "SAP FICO analyst", "SAP FICO specialist",
   "SAP FICO developer", "SAP FICO functional consultant", "SAP FICO lead"

2. **Full Name Variants** — expanded/full-text forms of the keyword:
   e.g. "SAP Financial Accounting and Controlling", "SAP Financial Controlling",
   "SAP Financials Controlling", "SAP Financial Accounting Controlling"

3. **Abbreviation & Code Forms** — concatenated, hyphenated, dotted, spaced variants:
   e.g. "SAPFICO", "SAP FI-CO", "SAP FI CO", "F.I.C.O", "FI-CO consultant"

4. **Seniority Variants** — senior/lead/principal prefixed combined phrases:
   e.g. "Senior SAP FICO consultant", "Lead SAP FICO", "Principal SAP FICO",
   "SAP FICO Senior Consultant", "SAP FICO Lead Consultant"

5. **Implementation & Project Phrases** — phrases about delivery context:
   e.g. "SAP FICO implementation consultant", "SAP FICO project manager",
   "SAP FICO S/4HANA consultant", "SAP FICO migration", "SAP FICO rollout"

6. **Misspelling & Alternative Spelling Variants** (when common misspellings exist):
   e.g. "SAP FICO Managment", "SAP FICO Managemnet" — only if the keyword contains
   a commonly misspelled word (Management, Warehouse, Development, etc.)

## WORKED EXAMPLES — FOLLOW THESE PATTERNS EXACTLY

**Input: "SAP FICO"**
Group "SAP FICO (Core Roles)":
  terms: ["SAP FICO consultant", "SAP FICO analyst", "SAP FICO specialist", "SAP FICO developer", "SAP FICO functional consultant", "SAP FICO lead", "SAP FICO manager"]
Group "SAP FICO (Full Names)":
  terms: ["SAP Financial Accounting and Controlling", "SAP Financial Accounting Controlling", "SAP Financials Controlling", "SAP Financial Controlling consultant", "SAP Finance and Controlling"]
Group "SAP FICO (Codes & Abbreviations)":
  terms: ["SAPFICO", "SAP FI-CO", "SAP FI CO", "F.I.C.O consultant", "SAP FICO S/4HANA", "SAP S4HANA FICO"]
Group "SAP FICO (Seniority)":
  terms: ["Senior SAP FICO consultant", "Lead SAP FICO consultant", "Principal SAP FICO", "SAP FICO Senior Consultant", "SAP FICO Lead Analyst"]

**Input: "SAP MM"**
Group "SAP MM (Core Roles)":
  terms: ["SAP MM consultant", "SAP MM analyst", "SAP MM specialist", "SAP MM developer", "SAP MM functional consultant", "SAP MM lead", "SAP MM manager"]

**Input: "Java backend developer"**
Group "Java Backend (Core)":
  terms: ["Java Backend Developer", "Java Backend Engineer", "Java Back End Developer", "Java Backend Programmer", "Java Server Side Developer", "Java Backend Dev"]

## QUALITY RULES
- NEVER generate a term that is just a module code alone (e.g. "SAP FI", "SAP CO", "SAP MM" in a FICO search)
- NEVER mix in related-but-different modules or technologies (SAP MM is not part of SAP FICO)
- No empty strings, single-character tokens, or pure numbers
- No duplicate terms across the entire response
- Every term must exist naturally in professional profiles or CVs
- Maximum term length: 80 characters`;

// ---------------------------------------------------------------------------
// User prompt builder — shapes the per-request instruction
// ---------------------------------------------------------------------------

/**
 * Builds the user-turn prompt for a generateGroups call.
 *
 * @param keyword   - The raw user input (job title or skill).
 * @param type      - "jobTitle" → emphasise role + seniority groups;
 *                    "keyword" → emphasise tools, versions, ecosystem.
 */
export function buildBooleanUserPrompt(
    keyword: string,
    type: "jobTitle" | "keyword"
): string {
    const sanitizedKeyword = keyword.trim().replace(/[<>"]/g, "");

    if (type === "jobTitle") {
        return `Generate Boolean search keyword groups for the job title: "${sanitizedKeyword}".

CRITICAL: Every single term MUST contain "${sanitizedKeyword}" (or its expanded/abbreviated form) \
embedded directly in the phrase. Do NOT produce standalone fragments or unrelated module codes.

Organise terms into groups by angle:
1. Core role phrases: "${sanitizedKeyword} consultant", "${sanitizedKeyword} analyst", \
"${sanitizedKeyword} specialist", "${sanitizedKeyword} developer", "${sanitizedKeyword} lead"
2. Full name / expanded forms of "${sanitizedKeyword}"
3. Abbreviation, code, hyphenated, and concatenated forms containing "${sanitizedKeyword}"
4. Seniority-prefixed phrases: "Senior ${sanitizedKeyword} consultant", \
"Lead ${sanitizedKeyword}", "Principal ${sanitizedKeyword}"
5. Implementation & project context phrases containing "${sanitizedKeyword}"

Only include misspelling variants if "${sanitizedKeyword}" contains a word that is commonly \
misspelled (e.g. Management → Managment, Warehouse → Warehose).`;
    }

    return `Generate Boolean search keyword groups for the skill or technology: "${sanitizedKeyword}".

CRITICAL: Every single term MUST contain "${sanitizedKeyword}" (or its expanded/abbreviated form) \
embedded directly in the phrase. Do NOT produce standalone fragments or unrelated technologies.

Organise terms into groups by angle:
1. Core skill phrases: "${sanitizedKeyword} developer", "${sanitizedKeyword} engineer", \
"${sanitizedKeyword} specialist", "${sanitizedKeyword} programmer"
2. Full name / expanded forms of "${sanitizedKeyword}"
3. Abbreviation, version, and concatenated forms containing "${sanitizedKeyword}"
4. Framework/ecosystem phrases that combine "${sanitizedKeyword}" with adjacent tools \
(e.g. "${sanitizedKeyword} Spring Boot", "${sanitizedKeyword} REST API")
5. Seniority-prefixed phrases: "Senior ${sanitizedKeyword} developer", \
"Lead ${sanitizedKeyword} engineer"

Only include misspelling variants if "${sanitizedKeyword}" contains a commonly misspelled word.`;
}

// ---------------------------------------------------------------------------
// Output sanitization and validation helpers
// ---------------------------------------------------------------------------

/** Allowed characters in a Boolean search term (stripped otherwise). */
const TERM_SAFE_RE = /[^a-zA-Z0-9 .,'&+/()#@_-]/g;

/**
 * Sanitizes a single term returned by the AI:
 * - Trims whitespace
 * - Removes unsafe characters
 * - Enforces max length
 * Returns null if the term is unusable after cleaning.
 */
export function sanitizeTerm(raw: string): string | null {
    if (typeof raw !== "string") return null;
    const cleaned = raw
        .trim()
        .replace(TERM_SAFE_RE, "")
        .replace(/\s{2,}/g, " ")
        .trim();
    if (cleaned.length < 2 || cleaned.length > 80) return null;
    // Reject pure numbers
    if (/^\d+$/.test(cleaned)) return null;
    return cleaned;
}

/**
 * Deduplicates and sanitizes all terms across groups.
 * Ensures no term appears more than once globally.
 */
export function sanitizeGroups(
    rawGroups: { group: string; terms: string[] }[],
    keyword: string
): { group: string; terms: string[] }[] {
    const seen = new Set<string>();
    const result: { group: string; terms: string[] }[] = [];

    for (const g of rawGroups) {
        const groupLabel =
            typeof g.group === "string" && g.group.trim().length > 0
                ? g.group.trim().slice(0, 100)
                : `${keyword} (Group)`;

        const cleanedTerms: string[] = [];
        for (const raw of Array.isArray(g.terms) ? g.terms : []) {
            const term = sanitizeTerm(raw);
            if (!term) continue;
            const lower = term.toLowerCase();
            if (seen.has(lower)) continue;
            seen.add(lower);
            cleanedTerms.push(term);
        }

        // Skip groups that ended up with no usable terms
        if (cleanedTerms.length === 0) continue;

        result.push({ group: groupLabel, terms: cleanedTerms });
    }

    return result;
}

/**
 * Validates that the sanitized groups meet minimum quality thresholds.
 * Returns true if the output is acceptable to return to the client.
 */
export function isValidBooleanOutput(
    groups: { group: string; terms: string[] }[]
): boolean {
    if (!Array.isArray(groups) || groups.length === 0) return false;
    // At least one group must have ≥ 2 terms
    return groups.some((g) => g.terms.length >= 2);
}

/**
 * Generates a minimal fallback response when the AI fails or returns unusable data.
 * Keeps the UI functional via a basic single-group result.
 */
export function buildFallbackGroups(
    keyword: string
): { group: string; terms: string[] }[] {
    const base = keyword.trim();
    // Build a handful of naive variants so the user isn't left with nothing
    const variants: string[] = [base];

    // Capitalised / lowercased forms
    const lower = base.toLowerCase();
    const title = base
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(" ");
    if (lower !== base) variants.push(lower);
    if (title !== base && title !== lower) variants.push(title);

    // Common seniority prefix variants
    for (const prefix of ["Senior", "Lead", "Principal"]) {
        variants.push(`${prefix} ${base}`);
    }

    return [
        {
            group: base,
            terms: Array.from(new Set(variants)).slice(0, 6),
        },
    ];
}
