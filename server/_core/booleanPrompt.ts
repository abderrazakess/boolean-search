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
trained on real-world sourcing searches across SAP, Microsoft Dynamics, Cybersecurity/IAM, \
Data Engineering, DevOps/Cloud, and general IT recruitment for European and global markets.

## YOUR JOB
When given a job title or skill keyword, generate keyword groups that a recruiter would use to \
find candidates on LinkedIn, job boards, CV databases, and ATS platforms.

## SYNONYM EXPANSION RULES
For every term, generate variations across ALL of these dimensions:

1. Spelling variants & common misspellings:
   - "Management" → "Managment", "Mangement", "Managemnet"
   - "Engineer" → "Enginer", "Enginner"
   - "Development" → "Developement"

2. Abbreviation & concatenation forms:
   - "SAP Materials Management" → "SAP MM" → "SAPMM"
   - "Identity & Access Management" → "IAM"
   - Dotted: "F.I.C.O", "M.C.S.E", "A.P.O"

3. Hyphenated, spaced, and joined variants:
   - "DevOps" / "Dev Ops" / "Dev-Ops"
   - "Full Stack" / "Full-Stack" / "FullStack"
   - "FI-CO" / "FI CO" / "FICO"

4. Word order variants (where naturally used):
   - "Solutions Architect" / "Architect Solutions"
   - "Data Engineer" / "Engineer Data"

5. Role-level synonyms (for job title type):
   - Developer / Engineer / Programmer / Coder / Dev
   - Consultant / Advisor / Specialist / Expert / SME
   - Manager / Lead / Head / Director / Principal

6. Seniority expansion (for job title type):
   - Senior / Lead / Principal / Expert / Sr / Snr / SR
   - Junior / Associate / Graduate / Entry-level

7. Product / technology name variants:
   - "SuccessFactors" / "Success Factors" / "SFSF" / "Ssff"
   - "Microsoft Dynamics" / "MS Dynamics" / "Dynamics 365" / "D365"
   - "Business Central" / "BC" / "NAV" / "Navision"

8. Regional / language variants (when applicable):
   - French: "Chef De Projet", "PAIE", "Gestion Du Capital Humain"
   - Spanish: "Recursos Humanos", "Administración de Nómina"
   - German: "Lohnabrechnung"

## GROUP STRUCTURE
Return exactly 5–7 groups. Every group must have exactly 6–8 terms.

Group naming rules:
- First group: use the raw keyword as the group name; include the keyword itself and its most \
  common direct synonyms / alternative spellings.
- Remaining groups: label each group with a meaningful category suffix, e.g. \
  "(Abbreviations & Codes)", "(Seniority Levels)", "(Related Technologies)", \
  "(Common Misspellings)", "(Regional / Language Variants)".

## QUALITY RULES
- Every term MUST be self-contained and directly searchable on LinkedIn or a job board.
- No empty strings, no single-character tokens, no pure numbers.
- No duplicate terms across the entire response.
- Terms should be real-world strings that actually appear in professional profiles or CVs.
- Maximum term length: 80 characters.`;

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

Focus on:
- Title synonyms and alternative role names
- Seniority levels (Junior / Senior / Lead / Principal / Director)
- Common abbreviations and concatenated codes
- Spelling variants and misspellings that appear in real CVs
- Related adjacent role titles a recruiter might also target

Each group must represent a distinct search angle so a recruiter can mix and match groups \
to broaden or narrow their Boolean query.`;
    }

    return `Generate Boolean search keyword groups for the skill or technology: "${sanitizedKeyword}".

Focus on:
- The skill keyword itself and its most common synonyms
- Version numbers and product variants (e.g. "React 18", "Python 3")
- Related tools, libraries, and frameworks in the same ecosystem
- Common abbreviations and concatenated identifiers
- Misspellings and non-standard capitalisations found in real CVs

Each group must represent a distinct search angle so a recruiter can mix and match groups \
to find candidates with overlapping but differently-described skillsets.`;
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
