import { useState, useEffect, useRef, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { BooleanBuilder } from "@/components/BooleanBuilder";
import { X } from "lucide-react";
import {
  Plus,
  MapPin,
  LogOut,
  Search,
  Pencil,
  Linkedin,
  Trash2,
  Copy,
  Check,
  Bell,
  User,
  Camera,
  Save,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Users,
  Scale,
  DollarSign,
  GraduationCap,
  Globe,
  Building2,
  ChevronDown,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

interface SavedSearch {
  id: string;
  title: string;
  booleanString: string;
  location: string;
  radius?: number;
  savedAt: string;
  userId: string;
}

const STORAGE_KEY = "boolean-saved-searches";
const PAGE_SIZE = 10;
const NEWS_PREFS_KEY = "bs_news_prefs";

const NEWS_CATEGORIES = [
  { id: "labor-market", label: "Labor Market", icon: TrendingUp },
  { id: "industry", label: "Industry Trends", icon: Building2 },
  { id: "hr-talent", label: "HR & Talent", icon: Users },
  { id: "remote", label: "Remote Work", icon: Globe },
  { id: "skills", label: "Skills & Learning", icon: GraduationCap },
  { id: "compensation", label: "Compensation", icon: DollarSign },
  { id: "legal", label: "Employment Law", icon: Scale },
];

const NEWS_COUNTRIES = [
  { code: "us", name: "United States", flag: "🇺🇸" },
  { code: "gb", name: "United Kingdom", flag: "🇬🇧" },
  { code: "ca", name: "Canada", flag: "🇨🇦" },
  { code: "au", name: "Australia", flag: "🇦🇺" },
  { code: "de", name: "Germany", flag: "🇩🇪" },
  { code: "fr", name: "France", flag: "🇫🇷" },
  { code: "in", name: "India", flag: "🇮🇳" },
  { code: "ae", name: "UAE", flag: "🇦🇪" },
  { code: "sg", name: "Singapore", flag: "🇸🇬" },
  { code: "nl", name: "Netherlands", flag: "🇳🇱" },
];

const NEWS_PRESETS = [
  { id: "recruiter", emoji: "🎯", label: "Recruiter", categories: ["labor-market", "hr-talent", "skills", "industry"] },
  { id: "hr", emoji: "📋", label: "HR Manager", categories: ["compensation", "legal", "remote", "hr-talent"] },
  { id: "agency", emoji: "🏢", label: "Agency", categories: ["labor-market", "industry", "compensation"] },
];

// ── Funding Rounds ──────────────────────────────────────────────────────────
const FUNDING_PREFS_KEY = "bs_funding_prefs";

const FUNDING_LOCATIONS = [
  { id: "us", label: "United States", flag: "🇺🇸" },
  { id: "gb", label: "United Kingdom", flag: "🇬🇧" },
  { id: "eu", label: "Europe", flag: "🇪🇺" },
  { id: "ca", label: "Canada", flag: "🇨🇦" },
  { id: "au", label: "Australia", flag: "🇦🇺" },
  { id: "in", label: "India", flag: "🇮🇳" },
  { id: "sg", label: "Singapore", flag: "🇸🇬" },
  { id: "ae", label: "UAE", flag: "🇦🇪" },
  { id: "il", label: "Israel", flag: "🇮🇱" },
  { id: "global", label: "Global", flag: "🌍" },
];

const FUNDING_INDUSTRIES = [
  { id: "hr-tech", label: "HR Tech" },
  { id: "fintech", label: "FinTech" },
  { id: "saas", label: "SaaS" },
  { id: "healthtech", label: "HealthTech" },
  { id: "edtech", label: "EdTech" },
  { id: "ai-ml", label: "AI / ML" },
  { id: "cybersecurity", label: "Cybersecurity" },
  { id: "logistics", label: "Logistics" },
  { id: "proptech", label: "PropTech" },
  { id: "cleantech", label: "CleanTech" },
];

const FUNDING_TYPES = [
  { id: "pre-seed", label: "Pre-Seed" },
  { id: "seed", label: "Seed" },
  { id: "series-a", label: "Series A" },
  { id: "series-b", label: "Series B" },
  { id: "series-c", label: "Series C" },
  { id: "series-d", label: "Series D+" },
  { id: "ipo", label: "IPO" },
  { id: "acquisition", label: "Acquisition" },
];

const FUNDING_RANGES = [
  { id: "0-1m", label: "Under $1M" },
  { id: "1-5m", label: "$1M – $5M" },
  { id: "5-20m", label: "$5M – $20M" },
  { id: "20-100m", label: "$20M – $100M" },
  { id: "100m+", label: "$100M+" },
];

const FUNDING_PERIODS = [
  { id: "7d", label: "Last 7 days" },
  { id: "30d", label: "Last 30 days" },
  { id: "3m", label: "Last 3 months" },
  { id: "6m", label: "Last 6 months" },
  { id: "12m", label: "Last 12 months" },
];


const MOCK_NEWS: Record<string, { title: string; source: string; time: string; tag: string; url: string }[]> = {
  "labor-market": [
    { title: "US Job Openings Remain Elevated at 8.7M as Hiring Slows", source: "Bloomberg", time: "2h ago", tag: "Labor Market", url: "https://www.bloomberg.com/markets/labor" },
    { title: "Tech Layoffs Hit 60K in Q1 2026, But AI Roles Rebound", source: "TechCrunch", time: "5h ago", tag: "Labor Market", url: "https://techcrunch.com/tag/layoffs/" },
    { title: "Gen Z Now Makes Up 27% of Workforce", source: "SHRM", time: "1d ago", tag: "Labor Market", url: "https://www.shrm.org/topics-tools/news" },
  ],
  "industry": [
    { title: "Healthcare Faces Critical Talent Shortage Through 2030", source: "Forbes", time: "3h ago", tag: "Industry", url: "https://www.forbes.com/healthcare" },
    { title: "FinTech Startups on Hiring Spree for Compliance Talent", source: "FT", time: "6h ago", tag: "Industry", url: "https://www.ft.com/companies/financial-services" },
    { title: "Reshoring Drives 200K New US Manufacturing Jobs", source: "WSJ", time: "2d ago", tag: "Industry", url: "https://www.wsj.com/economy" },
  ],
  "hr-talent": [
    { title: "AI Screening Tools Now Used by 78% of Fortune 500", source: "HRCI", time: "1h ago", tag: "HR & Talent", url: "https://www.hrci.org/community/blogs-and-announcements" },
    { title: "Employee Referrals Outperform All Other Channels", source: "LinkedIn", time: "4h ago", tag: "HR & Talent", url: "https://www.linkedin.com/business/talent/blog" },
    { title: "Skills-Based Hiring Adoption Doubles Year-Over-Year", source: "HBR", time: "1d ago", tag: "HR & Talent", url: "https://hbr.org/topic/subject/hiring" },
  ],
  "remote": [
    { title: "RTO Mandates Causing 'Quiet Quitting' Wave, Study Finds", source: "Gallup", time: "2h ago", tag: "Remote Work", url: "https://www.gallup.com/workplace/remote-work.aspx" },
    { title: "Hybrid Work Settles at 3 Days In-Office Globally", source: "Stanford", time: "8h ago", tag: "Remote Work", url: "https://siepr.stanford.edu/research/remote-work" },
    { title: "Async-First Companies Report 30% Lower Burnout Rates", source: "Remote.com", time: "2d ago", tag: "Remote Work", url: "https://remote.com/resources" },
  ],
  "skills": [
    { title: "AI Literacy Is Now the #1 Most Requested Skill", source: "WEF", time: "3h ago", tag: "Skills", url: "https://www.weforum.org/agenda/jobs-and-the-future-of-work/" },
    { title: "Soft Skills Gap Widens as Automation Accelerates", source: "McKinsey", time: "7h ago", tag: "Skills", url: "https://www.mckinsey.com/capabilities/people-and-organizational-performance" },
    { title: "Upskilling Programs Deliver 3.5x ROI, Study Shows", source: "Deloitte", time: "1d ago", tag: "Skills", url: "https://www2.deloitte.com/us/en/insights/topics/talent.html" },
  ],
  "compensation": [
    { title: "Salary Transparency Laws Now Cover 60% of US Workers", source: "SHRM", time: "2h ago", tag: "Compensation", url: "https://www.shrm.org/topics-tools/employment-law-compliance/pay-transparency" },
    { title: "RSUs Replacing Stock Options for Mid-Level Roles", source: "Carta", time: "6h ago", tag: "Compensation", url: "https://carta.com/blog/" },
    { title: "Tech Median Comp Trails Finance for First Time", source: "Levels.fyi", time: "1d ago", tag: "Compensation", url: "https://www.levels.fyi/blog/" },
  ],
  "legal": [
    { title: "EU AI Act Employment Provisions Take Full Effect", source: "Reuters", time: "1h ago", tag: "Employment Law", url: "https://www.reuters.com/technology/artificial-intelligence/" },
    { title: "Non-Compete Agreements Banned in 11 US States", source: "Law360", time: "5h ago", tag: "Employment Law", url: "https://www.law360.com/employment" },
    { title: "Supreme Court to Hear Landmark Gig Worker Case", source: "NYT", time: "2d ago", tag: "Employment Law", url: "https://www.nytimes.com/section/business/economy" },
  ],
};

type MainTab = "my" | "team";
type RightTab = "notifications" | "leads";
type View = "searches" | "profile" | "news" | "funding";

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 60) return `${mins}m ago`;
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? "s" : ""} ago`;
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  return `a week ago`;
}

export default function Dashboard() {
  const { user, logout, updateProfile } = useAuth();
  const [, navigate] = useLocation();

  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [query, setQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [mainTab, setMainTab] = useState<MainTab>("my");
  const [rightTab, setRightTab] = useState<RightTab>("notifications");
  const [page, setPage] = useState(1);
  const [view, setView] = useState<View>("searches");
  const [showNewSearch, setShowNewSearch] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Profile state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // News widget state
  type NewsPrefs = { categories: string[]; country: typeof NEWS_COUNTRIES[0] };
  const [newsPrefs, setNewsPrefs] = useState<NewsPrefs | null>(() => {
    try { const r = localStorage.getItem(NEWS_PREFS_KEY); return r ? JSON.parse(r) : null; } catch { return null; }
  });
  const [newsEditing, setNewsEditing] = useState(!newsPrefs);
  const [newsPreset, setNewsPreset] = useState<string | null>(null);
  const [newsCats, setNewsCats] = useState<string[]>(newsPrefs?.categories ?? []);
  const [newsCountry, setNewsCountry] = useState<typeof NEWS_COUNTRIES[0] | null>(newsPrefs?.country ?? null);
  const [newsDropdown, setNewsDropdown] = useState(false);

  const saveNewsPrefs = () => {
    if (!newsCats.length || !newsCountry) return;
    const p: NewsPrefs = { categories: newsCats, country: newsCountry };
    localStorage.setItem(NEWS_PREFS_KEY, JSON.stringify(p));
    setNewsPrefs(p);
    setNewsEditing(false);
  };

  // Funding Rounds widget state
  type FundingPrefs = {
    locations: string[];
    industries: string[];
    types: string[];
    range: string | null;
    period: string;
  };
  const [fundingPrefs, setFundingPrefs] = useState<FundingPrefs | null>(() => {
    try { const r = localStorage.getItem(FUNDING_PREFS_KEY); return r ? JSON.parse(r) : null; } catch { return null; }
  });
  const [fundingEditing, setFundingEditing] = useState(!fundingPrefs ? true : false);
  const [fundingLocations, setFundingLocations] = useState<string[]>(fundingPrefs?.locations ?? []);
  const [fundingIndustries, setFundingIndustries] = useState<string[]>(fundingPrefs?.industries ?? []);
  const [fundingTypes, setFundingTypes] = useState<string[]>(fundingPrefs?.types ?? []);
  const [fundingRange, setFundingRange] = useState<string | null>(fundingPrefs?.range ?? null);
  const [fundingPeriod, setFundingPeriod] = useState<string>(fundingPrefs?.period ?? "12m");
  const [fundingLocDropdown, setFundingLocDropdown] = useState(false);
  const [fundingIndDropdown, setFundingIndDropdown] = useState(false);
  const [fundingTypeDropdown, setFundingTypeDropdown] = useState(false);
  const [fundingRangeDropdown, setFundingRangeDropdown] = useState(false);
  const [fundingPeriodDropdown, setFundingPeriodDropdown] = useState(false);

  const saveFundingPrefs = () => {
    if (!fundingIndustries.length && !fundingTypes.length) return;
    const p: FundingPrefs = {
      locations: fundingLocations,
      industries: fundingIndustries,
      types: fundingTypes,
      range: fundingRange,
      period: fundingPeriod,
    };
    localStorage.setItem(FUNDING_PREFS_KEY, JSON.stringify(p));
    setFundingPrefs(p);
    setFundingEditing(false);
  };


  const newsQuery = trpc.news.fetch.useQuery(
    { categories: newsPrefs?.categories ?? [], country: newsPrefs?.country?.code ?? "us" },
    { enabled: !!newsPrefs && newsPrefs.categories.length > 0, staleTime: 5 * 60 * 1000 }
  );

  const newsArticles = useMemo(() => {
    if (!newsQuery.data?.articles) return [];
    return newsQuery.data.articles.map((a) => ({
      title: a.title, source: a.source, url: a.url, publishedAt: a.publishedAt, image: (a as { image?: string | null }).image ?? null,
    }));
  }, [newsQuery.data]);

  const fundingQuery = trpc.funding.fetch.useQuery(
    {
      locations: fundingPrefs?.locations ?? [],
      industries: fundingPrefs?.industries ?? [],
      types: fundingPrefs?.types ?? [],
      range: fundingPrefs?.range ?? null,
      period: fundingPrefs?.period ?? "12m",
    },
    { enabled: !!fundingPrefs, staleTime: 5 * 60 * 1000 }
  );

  useEffect(() => {
    if (!user) { navigate("/"); return; }
    const raw = localStorage.getItem(STORAGE_KEY);
    const all: SavedSearch[] = raw ? JSON.parse(raw) : [];
    setSearches(all.filter((s) => s.userId === user.id));
    setName(user.name);
    setEmail(user.email);
    setAvatarUrl(user.avatar || "");
  }, [user, navigate]);

  useEffect(() => {
    if (!showNotifications) return;
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showNotifications]);

  const startRename = (s: SavedSearch) => {
    setEditingId(s.id);
    setEditingTitle(s.title);
    setHoveredId(null);
  };

  const commitRename = (id: string) => {
    const newTitle = editingTitle.trim();
    if (!newTitle) { setEditingId(null); return; }
    const raw = localStorage.getItem(STORAGE_KEY);
    const all: SavedSearch[] = raw ? JSON.parse(raw) : [];
    const updated = all.map((s) => s.id === id ? { ...s, title: newTitle } : s);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setSearches(updated.filter((s) => s.userId === user!.id));
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    const raw = localStorage.getItem(STORAGE_KEY);
    const all: SavedSearch[] = raw ? JSON.parse(raw) : [];
    const updated = all.filter((s) => s.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setSearches(updated.filter((s) => s.userId === user!.id));
  };

  const handleCopy = async (s: SavedSearch) => {
    await navigator.clipboard.writeText(s.booleanString);
    setCopiedId(s.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSearchLinkedIn = (booleanString: string) => {
    window.open(`https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(booleanString)}`, "_blank");
  };

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarUrl(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    setProfileError("");
    setProfileSuccess("");
    if (!currentPassword) { setProfileError("Please enter your current password to save changes."); return; }
    setSaving(true);
    try {
      await updateProfile({ name: name.trim() || undefined, email: email.trim() || undefined, password: newPassword || undefined, avatar: avatarUrl }, currentPassword);
      setCurrentPassword("");
      setNewPassword("");
      setProfileSuccess("Profile updated successfully!");
      setTimeout(() => setProfileSuccess(""), 3000);
    } catch (err: unknown) {
      setProfileError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  const avatarDisplay = avatarUrl || user.avatar;

  const newSearchModal = showNewSearch && (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) setShowNewSearch(false); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <span className="text-base font-bold text-[#1D1D1D]">New Boolean Search</span>
          <button
            onClick={() => setShowNewSearch(false)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6">
          <BooleanBuilder onSave={() => {
            setShowNewSearch(false);
            // Refresh saved searches list
            const raw = localStorage.getItem(STORAGE_KEY);
            const all: SavedSearch[] = raw ? JSON.parse(raw) : [];
            setSearches(all.filter((s) => s.userId === user.id));
          }} />
        </div>
      </div>
    </div>
  );

  const filtered = searches.filter(
    (s) => s.title.toLowerCase().includes(query.toLowerCase()) || s.booleanString.toLowerCase().includes(query.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Notifications built from saved searches (most recent activity)
  const notifications = [...searches]
    .sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime())
    .slice(0, 8)
    .map((s) => ({
      id: s.id,
      text: `Search saved: "${s.title}"`,
      location: s.location || "No location",
      time: timeAgo(s.savedAt),
      isNew: Date.now() - new Date(s.savedAt).getTime() < 24 * 60 * 60 * 1000,
    }));

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {newSearchModal}
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          {/* Left: New Search */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowNewSearch(true)}
              className="w-9 h-9 rounded-full bg-[#0a65c2] hover:bg-[#0856a0] flex items-center justify-center shadow-sm transition-colors"
              title="New Search"
            >
              <Plus className="w-5 h-5 text-white" />
            </button>
            <span
              onClick={() => setShowNewSearch(true)}
              className="text-sm font-semibold text-[#0a65c2] hover:underline cursor-pointer"
            >
              New Search
            </span>
          </div>

          {/* Right: user + notifications */}
          <div className="flex items-center gap-4">
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotifications((v) => !v)}
                className="relative p-1.5 text-gray-500 hover:text-gray-700"
              >
                <Bell className="w-5 h-5" />
                {notifications.filter((n) => n.isNew).length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {notifications.filter((n) => n.isNew).length}
                  </span>
                )}
              </button>
              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl border border-gray-200 shadow-xl z-50 overflow-hidden">
                  <div className="flex items-center gap-0 px-4 pt-3 pb-0 border-b border-gray-100">
                    <button
                      onClick={() => setRightTab("notifications")}
                      className={`text-xs font-bold pb-2 pr-3 border-b-2 transition-colors ${rightTab === "notifications" ? "border-[#0a65c2] text-[#0a65c2]" : "border-transparent text-gray-400 hover:text-gray-600"}`}
                    >
                      ALL NOTIFICATIONS
                    </button>
                    <span className="text-gray-300 pb-2 pr-3 text-xs">|</span>
                    <button
                      onClick={() => setRightTab("leads")}
                      className={`text-xs font-bold pb-2 border-b-2 transition-colors ${rightTab === "leads" ? "border-[#0a65c2] text-[#0a65c2]" : "border-transparent text-gray-400 hover:text-gray-600"}`}
                    >
                      ACTIVITY
                    </button>
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-8">No activity yet.</p>
                    ) : (
                      notifications.map((n) => (
                        <div key={n.id} className="px-4 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Pencil className="w-3.5 h-3.5 text-gray-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-700 leading-snug">
                              {n.text}
                              {n.isNew && <span className="ml-1.5 inline-block bg-emerald-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">New</span>}
                            </p>
                            <p className="text-[11px] text-gray-400 mt-0.5">{n.location}</p>
                          </div>
                          <span className="text-[10px] text-gray-400 flex-shrink-0 mt-0.5">{n.time}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setView(view === "profile" ? "searches" : "profile")}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              {avatarDisplay ? (
                <img src={avatarDisplay} alt={user.name} className="w-8 h-8 rounded-full object-cover border border-gray-200" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#0a65c2] flex items-center justify-center text-white text-sm font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
            </button>

            <button onClick={() => { logout(); navigate("/"); }} className="text-gray-400 hover:text-red-500 transition-colors" title="Sign out">
              <LogOut className="w-4 h-4" />
            </button>

          </div>
        </div>
      </div>

      {view === "news" ? (
        /* ── Full News View ── */
        <div className="max-w-3xl mx-auto px-6 py-10 w-full">
          <button onClick={() => setView("searches")} className="flex items-center gap-1.5 text-sm text-[#0a65c2] font-semibold mb-6 hover:underline">
            <ChevronLeft className="w-4 h-4" /> Back to Dashboard
          </button>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-[#1D1D1D]">Recruiting News</h1>
              <p className="text-sm text-gray-400 mt-0.5">{newsPrefs?.country?.flag} {newsPrefs?.categories.length} topics · {newsArticles.length} articles</p>
            </div>
            <button onClick={() => setNewsEditing(true)} className="flex items-center gap-1.5 text-sm font-semibold text-[#0a65c2] hover:underline">
              <Pencil className="w-3.5 h-3.5" /> Edit preferences
            </button>
          </div>
          {newsQuery.isLoading ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-6 h-6 border-2 border-[#0a65c2] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm text-gray-400">Fetching latest news…</p>
            </div>
          ) : newsQuery.isError ? (
            <div className="py-16 text-center">
              <p className="text-sm text-red-400 font-medium">Could not load news.</p>
              <button onClick={() => newsQuery.refetch()} className="mt-3 text-sm text-[#0a65c2] hover:underline">Retry</button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm divide-y divide-gray-100 overflow-hidden">
              {newsArticles.length === 0 ? (
                <div className="py-16 text-center px-6">
                  <p className="text-sm text-gray-400">No articles found for your topics.</p>
                  <button onClick={() => setNewsEditing(true)} className="mt-3 text-sm text-[#0a65c2] hover:underline">Change topics</button>
                </div>
              ) : newsArticles.map((article, idx) => (
                <a key={idx} href={article.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-start gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
                  <div className="w-20 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                    {article.image ? (
                      <img src={article.image} alt="" className="w-full h-full object-cover"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-sm font-bold text-gray-300 uppercase tracking-wide">{article.source.slice(0, 2)}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#1D1D1D] leading-snug mb-1.5 line-clamp-2">{article.title}</p>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-gray-400 font-medium">
                        {article.source} · {article.publishedAt ? timeAgo(article.publishedAt) : ""}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#0a65c2] flex-shrink-0">
                        Read article <ExternalLink className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      ) : view === "funding" ? (
        /* ── Full Funding Rounds View ── */
        <div className="max-w-3xl mx-auto px-6 py-10 w-full">
          <button onClick={() => setView("searches")} className="flex items-center gap-1.5 text-sm text-[#0a65c2] font-semibold mb-6 hover:underline">
            <ChevronLeft className="w-4 h-4" /> Back to Dashboard
          </button>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-[#1D1D1D]">Funding Rounds</h1>
              <p className="text-sm text-gray-400 mt-0.5">
                {[
                  fundingPrefs?.period ? FUNDING_PERIODS.find((p) => p.id === fundingPrefs.period)?.label : null,
                  fundingPrefs?.types?.length ? fundingPrefs.types.map((id) => FUNDING_TYPES.find((t) => t.id === id)?.label).filter(Boolean).join(", ") : null,
                  fundingQuery.data?.rounds.length ? `${fundingQuery.data.rounds.length} rounds` : null,
                ].filter(Boolean).join(" · ")}
              </p>
            </div>
            <button onClick={() => setFundingEditing(true)} className="flex items-center gap-1.5 text-sm font-semibold text-[#0a65c2] hover:underline">
              <Pencil className="w-3.5 h-3.5" /> Edit filters
            </button>
          </div>
          {/* Active filter chips */}
          {fundingPrefs && (fundingPrefs.locations.length > 0 || fundingPrefs.range) && (
            <div className="flex flex-wrap gap-1.5 mb-5">
              {fundingPrefs.locations.map((id) => {
                const l = FUNDING_LOCATIONS.find((x) => x.id === id);
                return l ? (
                  <span key={id} className="inline-flex items-center gap-1 bg-blue-50 text-[#0a65c2] text-xs font-semibold px-2.5 py-1 rounded-full border border-blue-100">
                    {l.flag} {l.label}
                  </span>
                ) : null;
              })}
              {fundingPrefs.range && (
                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-emerald-100">
                  {FUNDING_RANGES.find((r) => r.id === fundingPrefs.range)?.label}
                </span>
              )}
            </div>
          )}
          {fundingQuery.isLoading ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-6 h-6 border-2 border-[#0a65c2] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm text-gray-400">Fetching latest rounds…</p>
            </div>
          ) : fundingQuery.isError ? (
            <div className="py-16 text-center">
              <p className="text-sm text-red-400 font-medium">Could not load funding data.</p>
              <button onClick={() => fundingQuery.refetch()} className="mt-3 text-sm text-[#0a65c2] hover:underline">Retry</button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm divide-y divide-gray-100 overflow-hidden">
              {!fundingQuery.data?.rounds.length ? (
                <div className="py-16 text-center px-6">
                  <p className="text-sm text-gray-400">No rounds found for your filters.</p>
                  <button onClick={() => setFundingEditing(true)} className="mt-3 text-sm text-[#0a65c2] hover:underline">Adjust filters</button>
                </div>
              ) : fundingQuery.data.rounds.map((round, idx) => (
                <a key={idx} href={round.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-start gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
                  <div className="w-20 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                    {round.image ? (
                      <img src={round.image ?? ""} alt="" className="w-full h-full object-cover"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-sm font-bold text-gray-300 uppercase tracking-wide">
                          {(round.company ?? round.source)?.slice(0, 2) ?? "?"}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-semibold text-[#1D1D1D] leading-snug line-clamp-2">{round.title}</p>
                      {round.amount && (
                        <span className="text-sm font-black text-emerald-600 flex-shrink-0 whitespace-nowrap">{round.amount}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      {round.roundType && (
                        <span className="text-xs font-semibold bg-blue-50 text-[#0a65c2] px-2 py-0.5 rounded">{round.roundType}</span>
                      )}
                      <span className="text-xs text-gray-400">{round.source}</span>
                      <span className="text-xs text-gray-300">·</span>
                      <span className="text-xs text-gray-400">{timeAgo(round.publishedAt)}</span>
                      <span className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-[#0a65c2] flex-shrink-0">
                        Read article <ExternalLink className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      ) : view === "profile" ? (
        /* ── Profile Edit View ── */
        <div className="max-w-lg mx-auto px-6 py-10 w-full">
          <button onClick={() => setView("searches")} className="flex items-center gap-1.5 text-sm text-[#0a65c2] font-semibold mb-6 hover:underline">
            <ChevronLeft className="w-4 h-4" /> Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold text-[#1D1D1D] mb-1">Edit Profile</h1>
          <p className="text-muted-foreground text-sm mb-6">Update your name, email, password, or profile picture.</p>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
            {/* Avatar */}
            <div className="flex items-center gap-5">
              <div className="relative">
                {avatarDisplay ? (
                  <img src={avatarDisplay} alt={user.name} className="w-20 h-20 rounded-full object-cover border-2 border-gray-200" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-[#0a65c2] flex items-center justify-center text-white text-2xl font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <button onClick={() => fileInputRef.current?.click()} className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#0a65c2] hover:bg-[#0856a0] rounded-full flex items-center justify-center shadow-md transition-colors">
                  <Camera className="w-3.5 h-3.5 text-white" />
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarFile} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground mb-1">Profile Picture</p>
                <p className="text-xs text-muted-foreground mb-2">Upload or paste image URL</p>
                <input value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://example.com/photo.jpg" className="w-full px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#0a65c2]/20 transition-all" />
              </div>
            </div>

            <div className="border-t border-gray-100" />

            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Full Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#0a65c2]/20 transition-all" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#0a65c2]/20 transition-all" />
            </div>

            <div className="border-t border-gray-100" />

            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">New Password <span className="normal-case font-normal">(leave blank to keep)</span></label>
              <div className="relative">
                <input type={showNew ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password..." className="w-full px-3 py-2.5 pr-10 text-sm bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#0a65c2]/20 transition-all" />
                <button type="button" onClick={() => setShowNew((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">{showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Current Password <span className="text-red-500">*</span></label>
              <div className="relative">
                <input type={showCurrent ? "text" : "password"} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Required to save changes" className="w-full px-3 py-2.5 pr-10 text-sm bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#0a65c2]/20 transition-all" />
                <button type="button" onClick={() => setShowCurrent((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">{showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
              </div>
            </div>

            {profileError && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{profileError}</p>}
            {profileSuccess && <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">{profileSuccess}</p>}

            <Button onClick={handleSaveProfile} disabled={saving} className="w-full bg-[#0a65c2] hover:bg-[#0856a0] text-white font-semibold gap-2">
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      ) : (
        /* ── Main Dashboard View ── */
        <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-6 flex gap-6">
          {/* Left panel */}
          <div className="flex-1 min-w-0">
            {/* Tabs + Search */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-0">
                <button
                  onClick={() => setMainTab("my")}
                  className={`text-sm font-bold pb-2 pr-4 border-b-2 transition-colors ${mainTab === "my" ? "border-[#0a65c2] text-[#0a65c2]" : "border-transparent text-gray-400 hover:text-gray-600"}`}
                >
                  MY SEARCHES
                </button>
                <span className="text-gray-300 pb-2 pr-4">|</span>
                <button
                  onClick={() => setMainTab("team")}
                  className={`text-sm font-bold pb-2 pr-4 border-b-2 transition-colors ${mainTab === "team" ? "border-[#0a65c2] text-[#0a65c2]" : "border-transparent text-gray-400 hover:text-gray-600"}`}
                >
                  TEAM SEARCHES
                </button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                  placeholder="Find a Search"
                  className="pl-8 pr-4 py-1.5 text-sm bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#0a65c2]/20 w-52"
                />
              </div>
            </div>

            {/* Search list */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              {paginated.length === 0 ? (
                <div className="py-20 text-center">
                  <p className="text-gray-400 text-sm mb-4">No searches found.</p>
                  <button onClick={() => setShowNewSearch(true)} className="inline-flex items-center gap-2 bg-[#0a65c2] hover:bg-[#0856a0] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
                    <Plus className="w-4 h-4" /> New Search
                  </button>
                </div>
              ) : (
                paginated.map((s, idx) => (
                  <div
                    key={s.id}
                    onMouseEnter={() => setHoveredId(s.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    className={`flex items-center gap-3 px-4 py-3 transition-colors cursor-default ${idx < paginated.length - 1 ? "border-b border-gray-100" : ""} ${hoveredId === s.id ? "bg-blue-50/60" : "hover:bg-gray-50"}`}
                  >
                    {/* Icon */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${hoveredId === s.id ? "bg-[#0a65c2]" : "bg-gray-200"}`}>
                      <User className={`w-4 h-4 ${hoveredId === s.id ? "text-white" : "text-gray-500"}`} />
                    </div>

                    {/* Title — inline rename when editing */}
                    {editingId === s.id ? (
                      <input
                        autoFocus
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onBlur={() => commitRename(s.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") commitRename(s.id);
                          if (e.key === "Escape") setEditingId(null);
                        }}
                        className="flex-1 text-sm font-semibold text-[#1D1D1D] border-b-2 border-[#0a65c2] outline-none bg-transparent py-0.5 min-w-0"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <span
                        className="flex-1 text-sm font-semibold text-[#1D1D1D] truncate cursor-text"
                        onDoubleClick={() => startRename(s)}
                        title="Double-click to rename"
                      >
                        {s.title}
                      </span>
                    )}

                    {/* Hover actions */}
                    {editingId === s.id ? null : hoveredId === s.id ? (
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => startRename(s)}
                          className="flex items-center gap-1 text-xs font-semibold text-[#0a65c2] hover:underline"
                          title="Rename"
                        >
                          <Pencil className="w-3.5 h-3.5" /> Rename
                        </button>
                        <span className="text-gray-300">|</span>
                        <button
                          onClick={() => handleCopy(s)}
                          className="flex items-center gap-1 text-xs font-semibold text-[#0a65c2] hover:underline"
                        >
                          {copiedId === s.id ? <><Check className="w-3.5 h-3.5" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                        </button>
                        <span className="text-gray-300">|</span>
                        <button
                          onClick={() => handleSearchLinkedIn(s.booleanString)}
                          className="flex items-center gap-1 text-xs font-semibold text-[#0a65c2] hover:underline"
                        >
                          <Linkedin className="w-3.5 h-3.5" /> Search LinkedIn
                        </button>
                        <span className="text-gray-300">|</span>
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4 flex-shrink-0 text-xs text-gray-400">
                        {s.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {s.location}{s.radius ? ` (${s.radius}mi)` : ""}
                          </span>
                        )}
                        <span>{new Date(s.savedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }).replace(/\//g, "/")}</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1 mt-4 text-sm">
                <button onClick={() => setPage(1)} disabled={page === 1} className="px-2 py-1 text-gray-500 hover:text-[#0a65c2] disabled:opacity-30 text-xs">First Page</button>
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-1 text-gray-500 hover:text-[#0a65c2] disabled:opacity-30">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((n) => (
                  <button key={n} onClick={() => setPage(n)} className={`w-7 h-7 rounded-full text-xs font-semibold transition-colors ${page === n ? "bg-[#0a65c2] text-white" : "text-gray-500 hover:text-[#0a65c2]"}`}>
                    {n}
                  </button>
                ))}
                {totalPages > 5 && <span className="text-gray-400 text-xs">...</span>}
                {totalPages > 5 && (
                  <button onClick={() => setPage(totalPages)} className={`w-7 h-7 rounded-full text-xs font-semibold ${page === totalPages ? "bg-[#0a65c2] text-white" : "text-gray-500 hover:text-[#0a65c2]"}`}>
                    {totalPages}
                  </button>
                )}
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1 text-gray-500 hover:text-[#0a65c2] disabled:opacity-30">
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button onClick={() => setPage(totalPages)} disabled={page === totalPages} className="px-2 py-1 text-gray-500 hover:text-[#0a65c2] disabled:opacity-30 text-xs">Last Page</button>
              </div>
            )}
          </div>

          {/* Right panel */}
          <div className="w-80 flex-shrink-0 space-y-4">
            {/* News widget */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              {newsEditing ? (
                /* Onboarding */
                <>
                  <div className="px-4 py-3 text-white" style={{ background: "#0a65c2" }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold">Recruiting News</p>
                        <p className="text-white/70 text-[11px]">Pick topics you care about</p>
                      </div>
                      {newsPrefs && (
                        <button onClick={() => setNewsEditing(false)} className="text-white/60 hover:text-white text-[11px] font-semibold">Cancel</button>
                      )}
                    </div>
                  </div>
                  <div className="p-4 space-y-4">
                    {/* Country */}
                    <div>
                      <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5 block">Country</label>
                      <div className="relative">
                        <button
                          onClick={() => setNewsDropdown((v) => !v)}
                          className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg border border-gray-200 hover:border-[#0a65c2]/40 bg-white text-xs transition-all"
                        >
                          {newsCountry ? (
                            <span className="flex items-center gap-1.5">
                              <span>{newsCountry.flag}</span>
                              <span className="text-gray-700">{newsCountry.name}</span>
                            </span>
                          ) : <span className="text-gray-400">Select country...</span>}
                          <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${newsDropdown ? "rotate-180" : ""}`} />
                        </button>
                        {newsDropdown && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-gray-200 shadow-lg z-30 max-h-40 overflow-auto">
                            {NEWS_COUNTRIES.map((c) => (
                              <button
                                key={c.code}
                                onClick={() => { setNewsCountry(c); setNewsDropdown(false); }}
                                className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-gray-50 ${newsCountry?.code === c.code ? "bg-blue-50 text-[#0a65c2] font-semibold" : "text-gray-700"}`}
                              >
                                <span>{c.flag}</span>{c.name}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Presets */}
                    <div>
                      <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5 block">I am a</label>
                      <div className="flex gap-1.5">
                        {NEWS_PRESETS.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => { setNewsPreset(p.id); setNewsCats(p.categories); }}
                            className={`flex-1 py-1.5 rounded-lg border-2 text-center transition-all ${newsPreset === p.id ? "border-[#0a65c2] bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}
                          >
                            <span className="text-base block">{p.emoji}</span>
                            <span className="text-[10px] font-semibold text-gray-700">{p.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Topics */}
                    <div>
                      <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5 block">Topics</label>
                      <div className="flex flex-wrap gap-1">
                        {NEWS_CATEGORIES.map((cat) => {
                          const Icon = cat.icon;
                          const sel = newsCats.includes(cat.id);
                          return (
                            <button
                              key={cat.id}
                              onClick={() => { setNewsPreset(null); setNewsCats((prev) => sel ? prev.filter((x) => x !== cat.id) : [...prev, cat.id]); }}
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold transition-all ${sel ? "bg-[#0a65c2] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                            >
                              <Icon className="w-2.5 h-2.5" />{cat.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <button
                      onClick={saveNewsPrefs}
                      disabled={!newsCats.length || !newsCountry}
                      className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${newsCats.length && newsCountry ? "bg-[#0a65c2] hover:bg-[#0856a0] text-white shadow" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
                    >
                      Show My Feed <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </>
              ) : (
                /* News feed */
                <>
                  <div className="px-4 py-3 flex items-center justify-between border-b border-gray-100">
                    <div>
                      <p className="text-xs font-bold text-[#1D1D1D]">Recruiting News</p>
                      <p className="text-[10px] text-gray-400">{newsPrefs?.country?.flag} {newsPrefs?.categories.length} topics</p>
                    </div>
                    <button onClick={() => setNewsEditing(true)} className="text-[11px] font-semibold text-[#0a65c2] hover:underline flex items-center gap-1">
                      <Pencil className="w-3 h-3" /> Edit
                    </button>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {newsQuery.isLoading ? (
                      <div className="py-10 text-center space-y-2">
                        <div className="w-5 h-5 border-2 border-[#0a65c2] border-t-transparent rounded-full animate-spin mx-auto" />
                        <p className="text-[10px] text-gray-400">Fetching latest news…</p>
                      </div>
                    ) : newsQuery.isError ? (
                      <div className="py-8 text-center px-4">
                        <p className="text-[11px] text-red-400 font-medium">Could not load news.</p>
                        <button onClick={() => newsQuery.refetch()} className="mt-2 text-[10px] text-[#0a65c2] hover:underline">Retry</button>
                      </div>
                    ) : newsArticles.length === 0 ? (
                      <div className="py-8 text-center px-4">
                        <p className="text-[11px] text-gray-400">No articles found for your topics.</p>
                        <button onClick={() => setNewsEditing(true)} className="mt-2 text-[10px] text-[#0a65c2] hover:underline">Change topics</button>
                      </div>
                    ) : (
                      <>
                        {newsArticles.slice(0, 3).map((article, idx) => (
                          <a key={idx} href={article.url} target="_blank" rel="noopener noreferrer"
                            className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                            <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                              {article.image ? (
                                <img src={article.image} alt="" className="w-full h-full object-cover"
                                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wide leading-none text-center px-1">{article.source.slice(0, 2)}</span>
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-[#1D1D1D] leading-snug mb-1 line-clamp-2">{article.title}</p>
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[10px] text-gray-400 font-medium truncate">
                                  {article.source} · {article.publishedAt ? timeAgo(article.publishedAt) : ""}
                                </span>
                                <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-[#0a65c2] flex-shrink-0">
                                  Read <ExternalLink className="w-2.5 h-2.5" />
                                </span>
                              </div>
                            </div>
                          </a>
                        ))}
                        {newsArticles.length > 3 && (
                          <button
                            onClick={() => setView("news")}
                            className="w-full flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-bold text-[#0a65c2] hover:bg-blue-50 transition-colors border-t border-gray-100"
                          >
                            See all {newsArticles.length} articles <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Funding Rounds widget */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              {fundingEditing ? (
                <>
                  <div className="px-4 py-3 text-white" style={{ background: "#0a65c2" }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold">Funding Rounds</p>
                        <p className="text-white/70 text-[11px]">Customize your deal flow</p>
                      </div>
                      {fundingPrefs && (
                        <button onClick={() => setFundingEditing(false)} className="text-white/60 hover:text-white text-[11px] font-semibold">Cancel</button>
                      )}
                    </div>
                  </div>
                  <div className="p-4 space-y-4">
                    {/* Locations — multi-select dropdown */}
                    <div>
                      <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5 block">Locations</label>
                      <div className="relative">
                        <button
                          onClick={() => setFundingLocDropdown((v) => !v)}
                          className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg border border-gray-200 hover:border-[#0a65c2]/40 bg-white text-xs transition-all"
                        >
                          {fundingLocations.length === 0 ? (
                            <span className="text-gray-400">Select locations…</span>
                          ) : (
                            <span className="flex items-center gap-1 flex-wrap">
                              {fundingLocations.slice(0, 3).map((id) => {
                                const l = FUNDING_LOCATIONS.find((x) => x.id === id);
                                return l ? (
                                  <span key={id} className="inline-flex items-center gap-0.5 bg-blue-50 text-[#0a65c2] text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
                                    {l.flag} {l.label}
                                  </span>
                                ) : null;
                              })}
                              {fundingLocations.length > 3 && (
                                <span className="text-[10px] text-gray-400 font-semibold">+{fundingLocations.length - 3} more</span>
                              )}
                            </span>
                          )}
                          <ChevronDown className={`w-3.5 h-3.5 text-gray-400 flex-shrink-0 ml-1 transition-transform ${fundingLocDropdown ? "rotate-180" : ""}`} />
                        </button>
                        {fundingLocDropdown && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-gray-200 shadow-lg z-30 max-h-48 overflow-auto">
                            {FUNDING_LOCATIONS.map((l) => {
                              const sel = fundingLocations.includes(l.id);
                              return (
                                <button
                                  key={l.id}
                                  onClick={() => setFundingLocations((prev) => sel ? prev.filter((x) => x !== l.id) : [...prev, l.id])}
                                  className={`w-full flex items-center justify-between gap-2 px-3 py-1.5 text-xs hover:bg-gray-50 transition-colors ${sel ? "bg-blue-50 text-[#0a65c2] font-semibold" : "text-gray-700"}`}
                                >
                                  <span className="flex items-center gap-2">
                                    <span>{l.flag}</span>{l.label}
                                  </span>
                                  {sel && <Check className="w-3 h-3 text-[#0a65c2] flex-shrink-0" />}
                                </button>
                              );
                            })}
                            {fundingLocations.length > 0 && (
                              <div className="border-t border-gray-100 px-3 py-1.5">
                                <button
                                  onClick={() => { setFundingLocations([]); setFundingLocDropdown(false); }}
                                  className="text-[10px] text-red-400 hover:text-red-600 font-semibold"
                                >
                                  Clear all
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Industries */}
                    <div>
                      <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5 block">Industries</label>
                      <div className="relative">
                        <button
                          onClick={() => setFundingIndDropdown((v) => !v)}
                          className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg border border-gray-200 hover:border-[#0a65c2]/40 bg-white text-xs transition-all"
                        >
                          {fundingIndustries.length === 0 ? (
                            <span className="text-gray-400">Select industries…</span>
                          ) : (
                            <span className="flex items-center gap-1 flex-wrap">
                              {fundingIndustries.slice(0, 3).map((id) => {
                                const ind = FUNDING_INDUSTRIES.find((x) => x.id === id);
                                return ind ? (
                                  <span key={id} className="bg-blue-50 text-[#0a65c2] text-[10px] font-semibold px-1.5 py-0.5 rounded-full">{ind.label}</span>
                                ) : null;
                              })}
                              {fundingIndustries.length > 3 && <span className="text-[10px] text-gray-400 font-semibold">+{fundingIndustries.length - 3} more</span>}
                            </span>
                          )}
                          <ChevronDown className={`w-3.5 h-3.5 text-gray-400 flex-shrink-0 ml-1 transition-transform ${fundingIndDropdown ? "rotate-180" : ""}`} />
                        </button>
                        {fundingIndDropdown && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-gray-200 shadow-lg z-30 max-h-48 overflow-auto">
                            {FUNDING_INDUSTRIES.map((ind) => {
                              const sel = fundingIndustries.includes(ind.id);
                              return (
                                <button
                                  key={ind.id}
                                  onClick={() => setFundingIndustries((prev) => sel ? prev.filter((x) => x !== ind.id) : [...prev, ind.id])}
                                  className={`w-full flex items-center justify-between gap-2 px-3 py-1.5 text-xs hover:bg-gray-50 transition-colors ${sel ? "bg-blue-50 text-[#0a65c2] font-semibold" : "text-gray-700"}`}
                                >
                                  {ind.label}
                                  {sel && <Check className="w-3 h-3 text-[#0a65c2] flex-shrink-0" />}
                                </button>
                              );
                            })}
                            {fundingIndustries.length > 0 && (
                              <div className="border-t border-gray-100 px-3 py-1.5">
                                <button onClick={() => { setFundingIndustries([]); setFundingIndDropdown(false); }} className="text-[10px] text-red-400 hover:text-red-600 font-semibold">Clear all</button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Funding Type */}
                    <div>
                      <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5 block">Funding Type</label>
                      <div className="relative">
                        <button
                          onClick={() => setFundingTypeDropdown((v) => !v)}
                          className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg border border-gray-200 hover:border-[#0a65c2]/40 bg-white text-xs transition-all"
                        >
                          {fundingTypes.length === 0 ? (
                            <span className="text-gray-400">Select funding type…</span>
                          ) : (
                            <span className="flex items-center gap-1 flex-wrap">
                              {fundingTypes.slice(0, 3).map((id) => {
                                const ft = FUNDING_TYPES.find((x) => x.id === id);
                                return ft ? (
                                  <span key={id} className="bg-blue-50 text-[#0a65c2] text-[10px] font-semibold px-1.5 py-0.5 rounded-full">{ft.label}</span>
                                ) : null;
                              })}
                              {fundingTypes.length > 3 && <span className="text-[10px] text-gray-400 font-semibold">+{fundingTypes.length - 3} more</span>}
                            </span>
                          )}
                          <ChevronDown className={`w-3.5 h-3.5 text-gray-400 flex-shrink-0 ml-1 transition-transform ${fundingTypeDropdown ? "rotate-180" : ""}`} />
                        </button>
                        {fundingTypeDropdown && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-gray-200 shadow-lg z-30 max-h-48 overflow-auto">
                            {FUNDING_TYPES.map((ft) => {
                              const sel = fundingTypes.includes(ft.id);
                              return (
                                <button
                                  key={ft.id}
                                  onClick={() => setFundingTypes((prev) => sel ? prev.filter((x) => x !== ft.id) : [...prev, ft.id])}
                                  className={`w-full flex items-center justify-between gap-2 px-3 py-1.5 text-xs hover:bg-gray-50 transition-colors ${sel ? "bg-blue-50 text-[#0a65c2] font-semibold" : "text-gray-700"}`}
                                >
                                  {ft.label}
                                  {sel && <Check className="w-3 h-3 text-[#0a65c2] flex-shrink-0" />}
                                </button>
                              );
                            })}
                            {fundingTypes.length > 0 && (
                              <div className="border-t border-gray-100 px-3 py-1.5">
                                <button onClick={() => { setFundingTypes([]); setFundingTypeDropdown(false); }} className="text-[10px] text-red-400 hover:text-red-600 font-semibold">Clear all</button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Money Raised */}
                    <div>
                      <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5 block">Money Raised</label>
                      <div className="relative">
                        <button
                          onClick={() => setFundingRangeDropdown((v) => !v)}
                          className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg border border-gray-200 hover:border-[#0a65c2]/40 bg-white text-xs transition-all"
                        >
                          {fundingRange ? (
                            <span className="bg-emerald-50 text-emerald-700 text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
                              {FUNDING_RANGES.find((r) => r.id === fundingRange)?.label}
                            </span>
                          ) : (
                            <span className="text-gray-400">Select range…</span>
                          )}
                          <ChevronDown className={`w-3.5 h-3.5 text-gray-400 flex-shrink-0 ml-1 transition-transform ${fundingRangeDropdown ? "rotate-180" : ""}`} />
                        </button>
                        {fundingRangeDropdown && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-gray-200 shadow-lg z-30">
                            {FUNDING_RANGES.map((rng) => {
                              const sel = fundingRange === rng.id;
                              return (
                                <button
                                  key={rng.id}
                                  onClick={() => { setFundingRange(sel ? null : rng.id); setFundingRangeDropdown(false); }}
                                  className={`w-full flex items-center justify-between gap-2 px-3 py-1.5 text-xs hover:bg-gray-50 transition-colors ${sel ? "bg-emerald-50 text-emerald-700 font-semibold" : "text-gray-700"}`}
                                >
                                  {rng.label}
                                  {sel && <Check className="w-3 h-3 text-emerald-600 flex-shrink-0" />}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Time Period */}
                    <div>
                      <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5 block">Time Period</label>
                      <div className="relative">
                        <button
                          onClick={() => setFundingPeriodDropdown((v) => !v)}
                          className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg border border-gray-200 hover:border-[#0a65c2]/40 bg-white text-xs transition-all"
                        >
                          <span className="bg-blue-50 text-[#0a65c2] text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
                            {FUNDING_PERIODS.find((p) => p.id === fundingPeriod)?.label}
                          </span>
                          <ChevronDown className={`w-3.5 h-3.5 text-gray-400 flex-shrink-0 ml-1 transition-transform ${fundingPeriodDropdown ? "rotate-180" : ""}`} />
                        </button>
                        {fundingPeriodDropdown && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-gray-200 shadow-lg z-30">
                            {FUNDING_PERIODS.map((per) => {
                              const sel = fundingPeriod === per.id;
                              return (
                                <button
                                  key={per.id}
                                  onClick={() => { setFundingPeriod(per.id); setFundingPeriodDropdown(false); }}
                                  className={`w-full flex items-center justify-between gap-2 px-3 py-1.5 text-xs hover:bg-gray-50 transition-colors ${sel ? "bg-blue-50 text-[#0a65c2] font-semibold" : "text-gray-700"}`}
                                >
                                  {per.label}
                                  {sel && <Check className="w-3 h-3 text-[#0a65c2] flex-shrink-0" />}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={saveFundingPrefs}
                      disabled={!fundingIndustries.length && !fundingTypes.length}
                      className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${(fundingIndustries.length || fundingTypes.length) ? "bg-[#0a65c2] hover:bg-[#0856a0] text-white shadow" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
                    >
                      Show Funding Rounds <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="px-4 py-3 flex items-center justify-between border-b border-gray-100">
                    <div>
                      <p className="text-xs font-bold text-[#1D1D1D]">Funding Rounds</p>
                      <p className="text-[10px] text-gray-400">
                        {[
                          fundingPrefs?.period ? FUNDING_PERIODS.find((p) => p.id === fundingPrefs.period)?.label : null,
                          fundingPrefs?.types?.length ? fundingPrefs.types.map((id) => FUNDING_TYPES.find((t) => t.id === id)?.label).filter(Boolean).join(", ") : null,
                        ].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                    <button onClick={() => setFundingEditing(true)} className="text-[11px] font-semibold text-[#0a65c2] hover:underline flex items-center gap-1">
                      <Pencil className="w-3 h-3" /> Edit
                    </button>
                  </div>
                  {/* Active filter chips */}
                  {fundingPrefs && (fundingPrefs.locations.length > 0 || fundingPrefs.range) && (
                    <div className="px-4 pt-2.5 pb-0 flex flex-wrap gap-1">
                      {fundingPrefs.locations.map((id) => {
                        const l = FUNDING_LOCATIONS.find((x) => x.id === id);
                        return l ? (
                          <span key={id} className="inline-flex items-center gap-0.5 bg-blue-50 text-[#0a65c2] text-[10px] font-semibold px-2 py-0.5 rounded-full border border-blue-100">
                            {l.flag} {l.label}
                          </span>
                        ) : null;
                      })}
                      {fundingPrefs.range && (
                        <span className="inline-flex items-center gap-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-emerald-100">
                          {FUNDING_RANGES.find((r) => r.id === fundingPrefs.range)?.label}
                        </span>
                      )}
                    </div>
                  )}
                  <div className="divide-y divide-gray-50">
                    {fundingQuery.isLoading ? (
                      <div className="py-10 text-center space-y-2">
                        <div className="w-5 h-5 border-2 border-[#0a65c2] border-t-transparent rounded-full animate-spin mx-auto" />
                        <p className="text-[10px] text-gray-400">Fetching latest rounds…</p>
                      </div>
                    ) : fundingQuery.isError ? (
                      <div className="py-8 text-center px-4">
                        <p className="text-[11px] text-red-400 font-medium">Could not load funding data.</p>
                        <button onClick={() => fundingQuery.refetch()} className="mt-2 text-[10px] text-[#0a65c2] hover:underline">Retry</button>
                      </div>
                    ) : !fundingQuery.data?.rounds.length ? (
                      <div className="py-8 text-center px-4">
                        <p className="text-[11px] text-gray-400">No rounds found for your filters.</p>
                        <button onClick={() => setFundingEditing(true)} className="mt-2 text-[10px] text-[#0a65c2] hover:underline">Adjust filters</button>
                      </div>
                    ) : (
                      <>
                        {fundingQuery.data.rounds.slice(0, 3).map((round, idx) => (
                          <a key={idx} href={round.url} target="_blank" rel="noopener noreferrer"
                            className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                            <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                              {round.image ? (
                                <img src={round.image ?? ""} alt="" className="w-full h-full object-cover"
                                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wide leading-none text-center px-1">
                                    {(round.company ?? round.source)?.slice(0, 2) ?? "?"}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-baseline justify-between gap-2">
                                <p className="text-xs font-bold text-[#1D1D1D] leading-snug line-clamp-2">{round.title}</p>
                                {round.amount && (
                                  <span className="text-xs font-black text-emerald-600 flex-shrink-0 whitespace-nowrap">{round.amount}</span>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                {round.roundType && (
                                  <span className="text-[10px] font-semibold bg-blue-50 text-[#0a65c2] px-1.5 py-0.5 rounded">{round.roundType}</span>
                                )}
                                <span className="text-[10px] text-gray-400">{round.source}</span>
                                <span className="text-[10px] text-gray-300">·</span>
                                <span className="text-[10px] text-gray-400">{timeAgo(round.publishedAt)}</span>
                              </div>
                            </div>
                          </a>
                        ))}
                        {fundingQuery.data.rounds.length > 3 && (
                          <button
                            onClick={() => setView("funding")}
                            className="w-full flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-bold text-[#0a65c2] hover:bg-blue-50 transition-colors border-t border-gray-100"
                          >
                            See all {fundingQuery.data.rounds.length} rounds <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
