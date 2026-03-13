import {
  LayoutDashboard,
  LogOut,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { BooleanBuilder } from "@/components/BooleanBuilder";
import { AuthModal } from "@/components/AuthModal";
import { useAuth } from "@/contexts/AuthContext";

function Navbar() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();
  const [showAuth, setShowAuth] = useState(false);

  return (
    <>
      <AuthModal open={showAuth} onClose={() => setShowAuth(false)} />
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a65c2] border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Logo */}
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-white">Boolean</span>
              <span className="text-sm text-blue-300 font-medium">Search Generator</span>
            </div>

            {/* Center: Nav Links */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#what-is-boolean" className="text-sm font-medium text-white/70 hover:text-white transition-colors">
                How It Works
              </a>
              <a href="#operators" className="text-sm font-medium text-white/70 hover:text-white transition-colors">
                Operators
              </a>
              <a href="#examples" className="text-sm font-medium text-white/70 hover:text-white transition-colors">
                Examples
              </a>
              <a href="#faq" className="text-sm font-medium text-white/70 hover:text-white transition-colors">
                FAQ
              </a>
            </div>

            {/* Right: Auth */}
            {user ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate("/dashboard")}
                  className="flex items-center gap-1.5 text-sm font-semibold text-blue-300 hover:text-white transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="hidden sm:inline">My Searches</span>
                </button>
                <div className="w-8 h-8 rounded-full bg-[#0A66C2] flex items-center justify-center text-white text-sm font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <button
                  onClick={logout}
                  className="flex items-center gap-1 text-xs text-white/50 hover:text-red-400 transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAuth(true)}
                  className="text-white/80 font-semibold hover:text-white hover:bg-white/10"
                >
                  Sign In
                </Button>
                <Button
                  size="sm"
                  onClick={() => setShowAuth(true)}
                  className="bg-white text-[#0a1628] hover:bg-blue-50 font-semibold"
                >
                  Get Started
                </Button>
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}





function BooleanBuilderSection() {
  return (
    <section
      id="tool"
      className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden"
      style={{
        background: "#0a65c2",
      }}
    >
      {/* Background grid pattern */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      {/* Glow blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#0A66C2] rounded-full opacity-10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-blue-400 rounded-full opacity-10 blur-3xl pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-6 lg:px-8">
        {/* H1 */}
        <h1 className="text-center text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-5 tracking-tight">
          LinkedIn Boolean Search Generator
        </h1>

        {/* Subheading */}
        <p className="text-center text-lg md:text-xl text-blue-100/80 max-w-2xl mx-auto mb-8 leading-relaxed">
          Build precise LinkedIn boolean search strings in seconds. AI generates intelligent keyword groups automatically — paste directly into LinkedIn, Sales Navigator, or Recruiter.
        </p>

        {/* Trust badges */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mb-12">
          {[
            { label: "LinkedIn", color: "bg-white/10 border-white/20 text-white" },
            { label: "Sales Navigator", color: "bg-white/10 border-white/20 text-white" },
            { label: "LinkedIn Recruiter", color: "bg-white/10 border-white/20 text-white" },
            { label: "Free — No Signup", color: "bg-emerald-500/20 border-emerald-400/40 text-emerald-300" },
          ].map(({ label, color }) => (
            <span
              key={label}
              className={`inline-flex items-center gap-1.5 text-xs font-semibold border rounded-full px-3 py-1 ${color}`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current flex-shrink-0 opacity-70" />
              {label}
            </span>
          ))}
        </div>

        {/* Tool card */}
        <div className="relative">
          {/* Glow ring behind card */}
          <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-blue-500/30 via-purple-500/20 to-blue-500/30 blur-xl" />
          <div className="relative">
            <BooleanBuilder />
          </div>
        </div>

        {/* Trusted-by logos */}
        <div className="mt-14 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-7">
            Trusted by recruiters at top companies
          </p>
          <div className="flex items-center justify-center gap-8 flex-nowrap">
            {/* LinkedIn */}
            <svg height="18" viewBox="0 0 84 21" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="LinkedIn" className="opacity-60 hover:opacity-90 transition-opacity">
              <path d="M2.36 0C1.057 0 0 1.05 0 2.345c0 1.294 1.057 2.344 2.36 2.344 1.3 0 2.357-1.05 2.357-2.344C4.717 1.05 3.66 0 2.36 0zM.282 20.708h4.153V6.545H.282v14.163zM15.9 6.22c-2.02 0-3.38.893-4.163 1.74V6.545H7.584v14.163h4.153v-7.573c0-1.803.977-2.972 2.63-2.972 1.6 0 2.39 1.11 2.39 2.972v7.573h4.153v-8.63c0-3.684-2.165-5.858-5.01-5.858zM28.05.41H23.9v20.298h4.152V.41zM37.23 6.22c-4.273 0-7.254 3.008-7.254 7.395 0 4.387 2.98 7.394 7.254 7.394 4.272 0 7.254-3.007 7.254-7.394 0-4.387-2.982-7.394-7.254-7.394zm0 11.262c-1.944 0-3.102-1.54-3.102-3.868 0-2.328 1.158-3.867 3.102-3.867 1.942 0 3.1 1.539 3.1 3.867 0 2.328-1.158 3.868-3.1 3.868zM53.1 6.22c-2.02 0-3.38.893-4.163 1.74V6.545h-4.153v14.163h4.153v-7.573c0-1.803.977-2.972 2.63-2.972 1.6 0 2.39 1.11 2.39 2.972v7.573h4.153v-8.63c0-3.684-2.165-5.858-5.01-5.858z" fill="white"/>
              <rect x="59" y="1" width="17" height="17" rx="4" fill="white"/>
              <path d="M63.2 5.8a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm-1.4 1.5h2.8v8.4h-2.8V7.3zm4.5 0h2.7v1.15c.38-.65 1.2-1.35 2.45-1.35 2.1 0 3.1 1.45 3.1 3.7v4.9h-2.8v-4.5c0-1.1-.45-1.85-1.5-1.85-.9 0-1.45.65-1.45 1.85v4.5h-2.5V7.3z" fill="#0a65c2"/>
            </svg>

            {/* Indeed */}
            <svg height="18" viewBox="0 0 72 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Indeed" className="opacity-60 hover:opacity-90 transition-opacity">
              <circle cx="7" cy="7" r="5" stroke="white" strokeWidth="2" fill="none"/>
              <line x1="10.5" y1="3.5" x2="14" y2="0" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <text x="17" y="17" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="16" fill="white">indeed</text>
            </svg>

            {/* Robert Half */}
            <svg height="14" viewBox="0 0 110 14" xmlns="http://www.w3.org/2000/svg" aria-label="Robert Half" className="opacity-60 hover:opacity-90 transition-opacity">
              <text x="0" y="12" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="13" fill="white" letterSpacing="0.5">ROBERT HALF</text>
            </svg>

            {/* Korn Ferry */}
            <svg height="14" viewBox="0 0 90 14" xmlns="http://www.w3.org/2000/svg" aria-label="Korn Ferry" className="opacity-60 hover:opacity-90 transition-opacity">
              <text x="0" y="12" fontFamily="Georgia, serif" fontWeight="400" fontSize="13" fill="white" letterSpacing="1">KORN FERRY</text>
            </svg>

            {/* Randstad */}
            <svg height="14" viewBox="0 0 80 14" xmlns="http://www.w3.org/2000/svg" aria-label="Randstad" className="opacity-60 hover:opacity-90 transition-opacity">
              <text x="0" y="12" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="13" fill="white">randstad</text>
            </svg>

            {/* ManpowerGroup */}
            <svg height="14" viewBox="0 0 125 14" xmlns="http://www.w3.org/2000/svg" aria-label="ManpowerGroup" className="opacity-60 hover:opacity-90 transition-opacity">
              <text x="0" y="12" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="13" fill="white">ManpowerGroup</text>
            </svg>

            {/* Workday */}
            <svg height="14" viewBox="0 0 80 14" xmlns="http://www.w3.org/2000/svg" aria-label="Workday" className="opacity-60 hover:opacity-90 transition-opacity">
              <text x="0" y="12" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="13" fill="white">Workday</text>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── SEO Content Sections ───────────────────────────────────── */

function WhatIsBooleanSection() {
  return (
    <section id="what-is-boolean" className="py-16 md:py-20 bg-gray-50 border-t border-gray-100">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-[#1D1D1D] mb-4">
          What Is LinkedIn Boolean Search?
        </h2>
        <p className="text-base text-[#555] leading-relaxed mb-4">
          LinkedIn Boolean Search uses logical operators — <strong>AND</strong>, <strong>OR</strong>, and <strong>NOT</strong> — combined with quotation marks and parentheses to create highly targeted search queries. Instead of a simple keyword search that returns broad, noisy results, boolean search lets recruiters and sales professionals find exactly the right profiles.
        </p>
        <p className="text-base text-[#555] leading-relaxed mb-4">
          For example, searching <code className="bg-white border border-gray-200 px-2 py-0.5 rounded text-sm font-mono text-[#0A66C2]">("Software Engineer" OR "Developer") AND "React" NOT "Junior"</code> finds senior React developers while filtering out junior and intern roles — something a plain keyword search can't do.
        </p>
        <p className="text-base text-[#555] leading-relaxed">
          Boolean search is supported across LinkedIn's free search, <strong>Sales Navigator</strong>, and <strong>LinkedIn Recruiter</strong> — making it one of the most powerful and underused sourcing techniques available. This generator automates the hardest part: knowing which terms and variations to include.
        </p>
      </div>
    </section>
  );
}

function OperatorsSection() {
  const operators = [
    {
      op: "AND",
      color: "bg-blue-50 border-blue-200 text-blue-800",
      badge: "bg-blue-600",
      description: "Narrows results — both terms must be present.",
      example: '"Product Manager" AND "Agile"',
      use: "Combine required skills or titles",
    },
    {
      op: "OR",
      color: "bg-green-50 border-green-200 text-green-800",
      badge: "bg-green-600",
      description: "Broadens results — either term can be present.",
      example: '"Software Engineer" OR "Developer" OR "Programmer"',
      use: "Capture all variations of a title",
    },
    {
      op: "NOT",
      color: "bg-red-50 border-red-200 text-red-800",
      badge: "bg-red-600",
      description: "Excludes results — profiles with this term are filtered out.",
      example: '"Marketing Manager" NOT "Digital Marketing"',
      use: "Remove irrelevant roles or seniority levels",
    },
    {
      op: '""',
      color: "bg-purple-50 border-purple-200 text-purple-800",
      badge: "bg-purple-600",
      description: "Exact phrase match — the words must appear together in that order.",
      example: '"Vice President of Sales"',
      use: "Match multi-word titles precisely",
    },
    {
      op: "(  )",
      color: "bg-orange-50 border-orange-200 text-orange-800",
      badge: "bg-orange-600",
      description: "Groups terms — controls operator precedence like in math.",
      example: '("CTO" OR "VP Engineering") AND "SaaS"',
      use: "Combine AND/OR logic cleanly",
    },
  ];

  return (
    <section id="operators" className="py-16 md:py-20 bg-white border-t border-gray-100">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-[#1D1D1D] mb-3">
          LinkedIn Boolean Search Operators Explained
        </h2>
        <p className="text-base text-[#555] mb-10">
          LinkedIn supports five boolean operators. All operators must be typed in <strong>UPPERCASE</strong> — LinkedIn ignores lowercase "and", "or", "not".
        </p>
        <div className="space-y-4">
          {operators.map((o) => (
            <div key={o.op} className={`border rounded-xl p-5 ${o.color}`}>
              <div className="flex items-start gap-4">
                <span className={`${o.badge} text-white text-xs font-bold px-2.5 py-1 rounded-md font-mono flex-shrink-0`}>
                  {o.op}
                </span>
                <div className="min-w-0">
                  <p className="font-semibold text-sm mb-1">{o.description}</p>
                  <p className="text-xs opacity-75 mb-2">Use case: {o.use}</p>
                  <code className="text-xs font-mono bg-white/60 border border-current/20 px-2 py-1 rounded block w-fit">
                    {o.example}
                  </code>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ExamplesSection() {
  const examples = [
    {
      role: "Software Engineer (Recruiter)",
      string: '("Software Engineer" OR "Software Developer" OR "SWE") AND ("React" OR "Node.js" OR "TypeScript") NOT "Junior" NOT "Intern"',
    },
    {
      role: "Marketing Manager (Recruiter)",
      string: '("Marketing Manager" OR "Head of Marketing" OR "Marketing Director") AND ("B2B" OR "SaaS" OR "Demand Generation")',
    },
    {
      role: "VP of Sales (Sales Prospecting)",
      string: '("VP of Sales" OR "Vice President Sales" OR "Sales Director" OR "Chief Revenue Officer") AND ("SaaS" OR "Software" OR "Technology")',
    },
    {
      role: "Data Scientist (Recruiter)",
      string: '("Data Scientist" OR "ML Engineer" OR "Machine Learning Engineer") AND ("Python" OR "TensorFlow" OR "PyTorch") NOT "Junior"',
    },
    {
      role: "LinkedIn X-Ray Search (Google)",
      string: 'site:linkedin.com/in/ "Product Manager" "SaaS" "New York"',
    },
  ];

  return (
    <section id="examples" className="py-16 md:py-20 bg-gray-50 border-t border-gray-100">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-[#1D1D1D] mb-3">
          Boolean Search String Examples
        </h2>
        <p className="text-base text-[#555] mb-8">
          Ready-to-copy boolean search strings for common recruiting and sales prospecting use cases. Paste these directly into LinkedIn's search bar.
        </p>
        <div className="space-y-4">
          {examples.map((ex) => (
            <div key={ex.role} className="bg-white border border-gray-200 rounded-xl p-5">
              <p className="text-xs font-bold text-[#0A66C2] uppercase tracking-wide mb-2">{ex.role}</p>
              <code className="text-sm font-mono text-[#333] leading-relaxed break-all block">{ex.string}</code>
            </div>
          ))}
        </div>
        <p className="text-sm text-[#666] mt-6 text-center">
          Want AI-generated keyword suggestions? <a href="#tool" className="text-[#0A66C2] font-semibold hover:underline">Use the generator above ↑</a>
        </p>
      </div>
    </section>
  );
}

function ComparisonSection() {
  const platforms = [
    {
      name: "LinkedIn Free",
      operators: "AND, OR, NOT, quotes, parentheses",
      charLimit: "~1,000 characters",
      fields: "Keywords only",
      notes: "Basic boolean support. Good for testing strings.",
    },
    {
      name: "Sales Navigator",
      operators: "AND, OR, NOT, quotes, parentheses",
      charLimit: "~2,000 characters",
      fields: "Keywords + advanced filters",
      notes: "Best for sales prospecting. Boolean in keyword field.",
    },
    {
      name: "LinkedIn Recruiter",
      operators: "AND, OR, NOT, quotes, parentheses",
      charLimit: "~2,000 characters",
      fields: "Keywords, title, company, skills fields",
      notes: "Boolean works per field. Most powerful for hiring.",
    },
  ];

  return (
    <section className="py-16 md:py-20 bg-white border-t border-gray-100">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-[#1D1D1D] mb-3">
          Boolean Search: LinkedIn vs Sales Navigator vs Recruiter
        </h2>
        <p className="text-base text-[#555] mb-8">
          Boolean search works across all LinkedIn platforms, but there are important differences in character limits, supported fields, and operator behavior.
        </p>
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#0A66C2] text-white">
                <th className="text-left px-5 py-3 font-semibold">Platform</th>
                <th className="text-left px-5 py-3 font-semibold">Operators</th>
                <th className="text-left px-5 py-3 font-semibold">Char Limit</th>
                <th className="text-left px-5 py-3 font-semibold">Notes</th>
              </tr>
            </thead>
            <tbody>
              {platforms.map((p, i) => (
                <tr key={p.name} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="px-5 py-3 font-semibold text-[#1D1D1D]">{p.name}</td>
                  <td className="px-5 py-3 text-[#555]">{p.operators}</td>
                  <td className="px-5 py-3 text-[#555] whitespace-nowrap">{p.charLimit}</td>
                  <td className="px-5 py-3 text-[#555]">{p.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-sm text-[#666] mt-4">
          <strong>Note:</strong> LinkedIn does <strong>not</strong> support wildcard searches (e.g., <code className="font-mono text-xs bg-gray-100 px-1 rounded">manage*</code>). Use OR to list all variations explicitly — the generator does this automatically.
        </p>
      </div>
    </section>
  );
}

function TipsSection() {
  const tips = [
    {
      num: "01",
      title: "Always capitalize operators",
      body: "LinkedIn ignores lowercase \"and\", \"or\", \"not\". They must be AND, OR, NOT in uppercase or they'll be treated as regular search terms.",
      bg: "#e7fade",
    },
    {
      num: "02",
      title: "Use parentheses to group OR terms",
      body: "Wrap OR alternatives in parentheses so AND applies correctly. Example: (\"CTO\" OR \"CIO\") AND \"FinTech\" — without parentheses the logic breaks.",
      bg: "#fff8ed",
    },
    {
      num: "03",
      title: "Quote multi-word phrases",
      body: "Always put multi-word titles in quotes: \"Product Manager\", \"Vice President\", \"Machine Learning\". Without quotes, LinkedIn searches each word independently.",
      bg: "#e7fade",
    },
    {
      num: "04",
      title: "Use NOT to cut noise",
      body: "Searching for senior engineers? Add NOT \"Junior\" NOT \"Intern\" NOT \"Student\". This dramatically improves result quality without narrowing too much.",
      bg: "#fff8ed",
    },
    {
      num: "05",
      title: "Watch the character limit",
      body: "LinkedIn free search caps at ~1,000 characters. Our tool shows a live character count. If you're over limit, remove lower-priority keyword groups.",
      bg: "#e7fade",
    },
    {
      num: "06",
      title: "Combine with LinkedIn filters",
      body: "Boolean handles the keyword complexity; use LinkedIn's built-in filters (location, connections, industry) to further narrow results without bloating your string.",
      bg: "#fff8ed",
    },
  ];

  return (
    <section className="py-16 md:py-20 bg-gray-50 border-t border-gray-100">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-[#1D1D1D] mb-3">
          Tips for Better LinkedIn Boolean Searches
        </h2>
        <p className="text-base text-[#555] mb-10">
          Common mistakes that kill search precision — and how to avoid them.
        </p>
        <div className="grid sm:grid-cols-2 gap-6">
          {tips.map((tip) => (
            <div key={tip.num} className="border border-gray-200 rounded-xl p-5" style={{ background: tip.bg }}>
              <span className="text-3xl font-black text-[#0A66C2]/15 leading-none block mb-2">{tip.num}</span>
              <h3 className="font-bold text-[#1D1D1D] mb-2 text-sm">{tip.title}</h3>
              <p className="text-sm text-[#555] leading-relaxed">{tip.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  const faqs = [
    {
      q: "What is LinkedIn Boolean Search?",
      a: "LinkedIn Boolean Search uses logical operators (AND, OR, NOT) with quotation marks and parentheses to build targeted search queries on LinkedIn. It lets you find very specific profiles instead of broad, noisy results.",
    },
    {
      q: "Does this tool work with LinkedIn Sales Navigator?",
      a: "Yes. The boolean strings generated work with LinkedIn free search, Sales Navigator, and LinkedIn Recruiter. Copy the string and paste it into the keyword field of any platform.",
    },
    {
      q: "Is this boolean search generator really free?",
      a: "Completely free — no signup, no credit card, no usage limits. Build and copy as many boolean search strings as you need.",
    },
    {
      q: "What is the character limit for LinkedIn boolean searches?",
      a: "LinkedIn free search supports approximately 1,000 characters. Sales Navigator and LinkedIn Recruiter support up to ~2,000 characters. Our tool displays a live character count so you can stay within limits.",
    },
    {
      q: "Does LinkedIn support wildcard searches?",
      a: "No — LinkedIn does not support wildcard operators like * or ?. You need to spell out each variation explicitly. This is exactly why using an AI-powered generator that suggests all relevant variations saves so much time.",
    },
    {
      q: "Can I use boolean search on LinkedIn mobile?",
      a: "LinkedIn's mobile app has limited boolean support. For best results, use the LinkedIn desktop site or a desktop browser. Sales Navigator's mobile app does support basic boolean operators in the keyword field.",
    },
    {
      q: "What is LinkedIn X-Ray search?",
      a: "X-Ray search uses Google to find LinkedIn profiles by adding site:linkedin.com/in/ to a Google search query. Example: site:linkedin.com/in/ \"React Developer\" \"New York\". This works even for profiles that aren't in your LinkedIn network.",
    },
    {
      q: "How is this tool different from other boolean generators?",
      a: "Instead of requiring you to manually type every keyword, our AI generates relevant keyword variations, synonyms, and related terms — organized into logical groups. It builds a correctly formatted string automatically, cutting a 10-minute task down to under 2 minutes.",
    },
    {
      q: "Can I save my boolean search strings?",
      a: "Yes — create a free account and click 'Save Search' after generating a string. All saved searches are organized in your personal dashboard, where you can copy or reuse them anytime.",
    },
  ];

  return (
    <section id="faq" className="py-16 md:py-20 bg-white border-t border-gray-100">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-[#1D1D1D] mb-10">
          Frequently Asked Questions
        </h2>
        <div className="divide-y divide-gray-200">
          {faqs.map((faq, i) => (
            <FAQItem key={i} question={faq.q} answer={faq.a} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="py-5">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-4 text-left"
      >
        <span className="font-semibold text-[#1D1D1D] text-sm">{question}</span>
        <span className={`text-[#0A66C2] text-lg font-bold flex-shrink-0 transition-transform ${open ? "rotate-45" : ""}`}>+</span>
      </button>
      {open && (
        <p className="mt-3 text-sm text-[#555] leading-relaxed">{answer}</p>
      )}
    </div>
  );
}

const profilesLeft = [
  { name: "Sarah Chen", role: "VP Engineering", company: "Google", verified: true, avatar: "https://randomuser.me/api/portraits/women/26.jpg" },
  { name: "Marcus Johnson", role: "CTO", company: "Microsoft", verified: true, avatar: "https://randomuser.me/api/portraits/men/46.jpg" },
  { name: "Bessie Cooper", role: "Sales Manager", company: "Louis Vuitton", verified: true, avatar: "https://randomuser.me/api/portraits/women/44.jpg" },
];

const profilesRight = [
  { name: "Emma Wilson", role: "Product Lead", company: "Netflix", verified: true, avatar: "https://randomuser.me/api/portraits/women/17.jpg" },
  { name: "David Kim", role: "Sales Director", company: "Samsung", verified: true, avatar: "https://randomuser.me/api/portraits/men/52.jpg" },
  { name: "Floyd Miles", role: "Director", company: "McDonald's", verified: false, avatar: "https://randomuser.me/api/portraits/men/22.jpg" },
];

const ctaAvatars = [
  "https://randomuser.me/api/portraits/women/44.jpg",
  "https://randomuser.me/api/portraits/men/32.jpg",
  "https://randomuser.me/api/portraits/women/68.jpg",
  "https://randomuser.me/api/portraits/men/75.jpg",
  "https://randomuser.me/api/portraits/women/26.jpg",
  "https://randomuser.me/api/portraits/men/46.jpg",
  "https://randomuser.me/api/portraits/women/89.jpg",
  "https://randomuser.me/api/portraits/men/22.jpg",
  "https://randomuser.me/api/portraits/men/29.jpg",
  "https://randomuser.me/api/portraits/men/85.jpg",
  "https://randomuser.me/api/portraits/women/17.jpg",
  "https://randomuser.me/api/portraits/men/52.jpg",
];

function ProfileCard({ profile, isLight = false, avatarIndex = 0 }: {
  profile: { name: string; role: string; company: string; verified: boolean; avatar?: string };
  isLight?: boolean;
  avatarIndex?: number;
}) {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg ${
        isLight ? "bg-white text-gray-800" : "bg-[#4a90e2] text-white"
      }`}
      style={{ width: "220px" }}
    >
      <img
        src={profile.avatar || ctaAvatars[avatarIndex % ctaAvatars.length]}
        alt={profile.name}
        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-sm truncate">{profile.name}</span>
          {profile.verified ? (
            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="10" fill="#22c55e" />
              <path d="M6 10l3 3 5-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="10" fill="#ef4444" />
              <path d="M7 7l6 6M13 7l-6 6" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          )}
        </div>
        <p className={`text-xs truncate ${isLight ? "text-gray-500" : "text-blue-100"}`}>
          {profile.role} at {profile.company}
        </p>
      </div>
    </div>
  );
}

function AnimatedColumn({ profiles, side }: {
  profiles: typeof profilesLeft;
  side: "left" | "right";
}) {
  const cardHeight = 70;
  const gap = 20;
  const itemHeight = cardHeight + gap;
  const totalHeight = itemHeight * profiles.length;
  // Start right column mid-cycle so cards are immediately visible on both sides
  const [offset, setOffset] = useState(() => side === "right" ? -(totalHeight / 2) : 0);

  useEffect(() => {
    const speed = side === "left" ? 0.4 : -0.4;
    const interval = setInterval(() => {
      setOffset((prev) => {
        let next = prev + speed;
        if (side === "left" && next >= totalHeight) next = 0;
        if (side === "right" && next <= -totalHeight) next = 0;
        return next;
      });
    }, 20);
    return () => clearInterval(interval);
  }, [totalHeight, side]);

  const allProfiles = [...profiles, ...profiles, ...profiles];
  const leftOffsets = [0, 50, 15];
  const rightOffsets = [0, 30, 10];
  const colorPattern = [true, false, true];

  return (
    <div
      className="absolute overflow-hidden"
      style={{
        width: "320px",
        [side]: "-10px",
        top: "0px",
        height: "60%",
        maskImage: "linear-gradient(to bottom, transparent 0%, black 22%, black 72%, transparent 100%)",
        WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 22%, black 72%, transparent 100%)",
      }}
    >
      {allProfiles.map((profile, idx) => {
        const patternIdx = idx % 3;
        const baseY = idx * itemHeight;
        const y = side === "left" ? baseY - offset : baseY + offset;
        const xOffset = side === "left" ? leftOffsets[patternIdx] : rightOffsets[patternIdx];
        const isLight = colorPattern[patternIdx];
        if (y < -150 || y > 620) return null;
        return (
          <div
            key={`${profile.name}-${idx}`}
            className="absolute transition-opacity duration-300"
            style={{
              transform: `translateY(${y}px)`,
              [side]: `${xOffset + 5}px`,
              opacity: y > -80 && y < 460 ? 1 : 0,
            }}
          >
            <ProfileCard profile={profile} isLight={isLight} avatarIndex={idx % ctaAvatars.length} />
          </div>
        );
      })}
    </div>
  );
}

function CTASection() {
  return (
    <section className="pt-0 pb-16 bg-white">
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        <div
          className="relative rounded-3xl min-h-[420px] flex items-center justify-center"
          style={{
            background: "linear-gradient(180deg, #2563eb 0%, #3b82f6 100%)",
            transform: "translateY(-40px)",
            boxShadow: "0 32px 80px rgba(37, 99, 235, 0.35), 0 8px 24px rgba(0,0,0,0.12)",
            overflow: "visible",
          }}
        >
          <AnimatedColumn profiles={profilesLeft} side="left" />
          <AnimatedColumn profiles={profilesRight} side="right" />
          <div className="relative z-10 text-center px-4 max-w-md mx-auto">
            <h2 className="text-white text-4xl md:text-5xl font-bold leading-tight mb-8">
              Precise LinkedIn
              <br />
              Boolean Search
            </h2>
            <button
              onClick={() => document.getElementById("tool")?.scrollIntoView({ behavior: "smooth" })}
              className="inline-flex items-center gap-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6 py-3.5 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 mb-6"
              style={{ boxShadow: "0 10px 40px rgba(16, 185, 129, 0.4)" }}
            >
              <span className="text-base font-semibold">Start for Free</span>
            </button>
            <div className="flex flex-nowrap items-center justify-center gap-2.5 mt-4 mb-12">
              {["LinkedIn", "Sales Navigator", "LinkedIn Recruiter"].map((label) => (
                <span key={label} className="inline-flex items-center gap-1.5 text-xs font-semibold border rounded-full px-3 py-1 bg-white/10 border-white/20 text-white whitespace-nowrap">
                  <span className="w-1.5 h-1.5 rounded-full bg-current flex-shrink-0 opacity-70"></span>
                  {label}
                </span>
              ))}
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold border rounded-full px-3 py-1 bg-emerald-500/20 border-emerald-400/40 text-emerald-300 whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-current flex-shrink-0 opacity-70"></span>
                Free — No Signup
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 py-6">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-[#0A66C2]">Boolean</span>
          <span className="text-xs text-[#666]">Search Generator</span>
        </div>
        <p className="text-sm text-[#666]">&copy; 2026 LinkedIn Boolean Search Generator. All rights reserved.</p>
        <div className="flex items-center gap-5 text-sm text-[#666]">
          <a href="/privacy" className="hover:text-[#0A66C2] transition-colors">Privacy</a>
          <a href="/terms" className="hover:text-[#0A66C2] transition-colors">Terms</a>
          <a href="/cookies" className="hover:text-[#0A66C2] transition-colors">Cookies</a>
        </div>
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1">
        <BooleanBuilderSection />
        {/* SEO content — below the tool */}
        <WhatIsBooleanSection />
        <OperatorsSection />
        <ExamplesSection />
        <ComparisonSection />
        <TipsSection />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
