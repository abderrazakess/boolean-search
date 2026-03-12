import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
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
  Menu,
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

type MainTab = "my" | "team";
type RightTab = "notifications" | "leads";
type View = "searches" | "profile";

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

  useEffect(() => {
    if (!user) { navigate("/"); return; }
    const raw = localStorage.getItem(STORAGE_KEY);
    const all: SavedSearch[] = raw ? JSON.parse(raw) : [];
    setSearches(all.filter((s) => s.userId === user.id));
    setName(user.name);
    setEmail(user.email);
    setAvatarUrl(user.avatar || "");
  }, [user, navigate]);

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
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          {/* Left: New Search */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="w-9 h-9 rounded-full bg-[#0a65c2] hover:bg-[#0856a0] flex items-center justify-center shadow-sm transition-colors"
              title="New Search"
            >
              <Plus className="w-5 h-5 text-white" />
            </button>
            <span
              onClick={() => navigate("/")}
              className="text-sm font-semibold text-[#0a65c2] hover:underline cursor-pointer"
            >
              New Search
            </span>
          </div>

          {/* Right: user + notifications */}
          <div className="flex items-center gap-4">
            <button className="relative p-1.5 text-gray-500 hover:text-gray-700">
              <Bell className="w-5 h-5" />
              {notifications.filter((n) => n.isNew).length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {notifications.filter((n) => n.isNew).length}
                </span>
              )}
            </button>

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

            <button className="text-gray-400 hover:text-gray-600">
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {view === "profile" ? (
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
                  <button onClick={() => navigate("/")} className="inline-flex items-center gap-2 bg-[#0a65c2] hover:bg-[#0856a0] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
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

                    {/* Title */}
                    <span className="flex-1 text-sm font-semibold text-[#1D1D1D] truncate">{s.title}</span>

                    {/* Hover actions */}
                    {hoveredId === s.id ? (
                      <div className="flex items-center gap-2 flex-shrink-0">
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
            {/* Notifications */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-4 pt-4 pb-0">
                <div className="flex items-center gap-0">
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

            {/* Profile quick edit card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <div className="flex items-center gap-3 mb-3">
                {avatarDisplay ? (
                  <img src={avatarDisplay} alt={user.name} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#0a65c2] flex items-center justify-center text-white font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#1D1D1D] truncate">{user.name}</p>
                  <p className="text-xs text-gray-400 truncate">{user.email}</p>
                </div>
              </div>
              <button
                onClick={() => setView("profile")}
                className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-[#0a65c2] border border-[#0a65c2]/30 hover:bg-[#0a65c2]/5 rounded-lg py-2 transition-colors"
              >
                <User className="w-3.5 h-3.5" /> Edit Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
