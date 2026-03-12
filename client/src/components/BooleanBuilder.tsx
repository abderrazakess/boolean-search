import { useState, useMemo, useEffect } from "react";
import {
  Copy,
  Check,
  MapPin,
  Linkedin,
  Pencil,
  Sparkles,
  Bookmark,
  BookmarkCheck,
  Trash2,
  ChevronDown,
  ChevronUp,
  LayoutDashboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { KeywordField } from "./KeywordField";
import { AuthModal } from "./AuthModal";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import type { KeywordGroup } from "@shared/types";

interface SavedSearch {
  id: string;
  title: string;
  booleanString: string;
  location: string;
  savedAt: string;
  userId: string;
}

const STORAGE_KEY = "boolean-saved-searches";

export function BooleanBuilder() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  const [jtSelected, setJtSelected] = useState<KeywordGroup[]>([]);
  const [kwSelected, setKwSelected] = useState<KeywordGroup[]>([]);
  const [location, setLocation] = useState("");
  const [radius, setRadius] = useState([35]);
  const [copied, setCopied] = useState(false);
  const [searchTitle, setSearchTitle] = useState("Search Title");
  const [editingTitle, setEditingTitle] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [showSaved, setShowSaved] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingSave, setPendingSave] = useState(false);

  // Load searches for current user
  useEffect(() => {
    if (!user) { setSavedSearches([]); return; }
    const raw = localStorage.getItem(STORAGE_KEY);
    const all: SavedSearch[] = raw ? JSON.parse(raw) : [];
    setSavedSearches(all.filter((s) => s.userId === user.id));
  }, [user]);

  const toggleGroup = (
    group: KeywordGroup,
    selected: KeywordGroup[],
    setSelected: React.Dispatch<React.SetStateAction<KeywordGroup[]>>
  ) => {
    const has = selected.find((g) => g.group === group.group);
    if (has) {
      setSelected((prev) => prev.filter((g) => g.group !== group.group));
    } else {
      setSelected((prev) => [...prev, group]);
    }
  };

  const booleanString = useMemo(() => {
    const parts: string[] = [];
    const jtTerms = jtSelected.flatMap((g) => g.terms).map((t) => `"${t}"`);
    if (jtTerms.length) parts.push(`(${jtTerms.join(" OR ")})`);
    const kwTerms = kwSelected.flatMap((g) => g.terms).map((t) => `"${t}"`);
    if (kwTerms.length) parts.push(`(${kwTerms.join(" OR ")})`);
    return parts.join(" AND ");
  }, [jtSelected, kwSelected]);

  const charCount = booleanString.length;
  const hasBoolean = booleanString.length > 0;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(booleanString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSearchLinkedIn = () => {
    if (!booleanString) return;
    const url = `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(booleanString)}`;
    window.open(url, "_blank");
  };

  const doSave = (currentUser: typeof user) => {
    if (!booleanString || !currentUser) return;
    const entry: SavedSearch = {
      id: Date.now().toString(),
      title: searchTitle,
      booleanString,
      location,
      savedAt: new Date().toISOString(),
      userId: currentUser.id,
    };
    const raw = localStorage.getItem(STORAGE_KEY);
    const all: SavedSearch[] = raw ? JSON.parse(raw) : [];
    const updated = [entry, ...all];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setSavedSearches(updated.filter((s) => s.userId === currentUser.id));
    setSaved(true);
    setShowSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSaveSearch = () => {
    if (!booleanString) return;
    if (!user) {
      setPendingSave(true);
      setShowAuthModal(true);
      return;
    }
    doSave(user);
  };

  const handleAuthSuccess = () => {
    if (pendingSave) {
      // user is now set via context — re-read from storage after state update
      setPendingSave(false);
      // slight delay for context to propagate
      setTimeout(() => {
        const raw = localStorage.getItem("bs_session");
        const loggedUser = raw ? JSON.parse(raw) : null;
        doSave(loggedUser);
      }, 50);
    }
  };

  const handleDeleteSearch = (id: string) => {
    const raw = localStorage.getItem(STORAGE_KEY);
    const all: SavedSearch[] = raw ? JSON.parse(raw) : [];
    const updated = all.filter((s) => s.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setSavedSearches(updated.filter((s) => s.userId === user!.id));
  };

  return (
    <div className="w-full">
      <AuthModal
        open={showAuthModal}
        onClose={() => { setShowAuthModal(false); setPendingSave(false); }}
        onSuccess={handleAuthSuccess}
      />

      {/* Card */}
      <div className="bg-card rounded-2xl shadow-lg border border-border/60 overflow-visible">
        {/* Title row */}
        <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-primary" />
            {editingTitle ? (
              <input
                autoFocus
                value={searchTitle}
                onChange={(e) => setSearchTitle(e.target.value)}
                onBlur={() => setEditingTitle(false)}
                onKeyDown={(e) => e.key === "Enter" && setEditingTitle(false)}
                className="text-lg font-bold text-foreground border-none border-b-2 border-primary outline-none bg-transparent font-sans"
              />
            ) : (
              <h3 className="text-lg font-bold text-foreground">{searchTitle}</h3>
            )}
            <button
              onClick={() => setEditingTitle(true)}
              className="p-1 rounded-md hover:bg-accent transition-colors"
            >
              <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-secondary rounded-lg px-3 py-1.5">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Boolean Options
            </span>
          </div>
        </div>

        {/* Form fields */}
        <div className="p-6 space-y-6">
          {/* Row 1: Job Title + Location */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <KeywordField
              label="Job Title"
              placeholder="e.g. Software Engineer, Data Analyst..."
              type="jobTitle"
              selectedGroups={jtSelected}
              onToggleGroup={(g) => toggleGroup(g, jtSelected, setJtSelected)}
            />

            {/* Location */}
            <div className="w-full">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                Location
              </label>
              <div className="relative flex items-center">
                <MapPin className="absolute left-3 w-4 h-4 text-muted-foreground/60" />
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Enter city, state, or country..."
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-secondary/50 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all outline-none placeholder:text-muted-foreground/50"
                />
              </div>
              {/* Radius slider */}
              <div className="flex items-center gap-4 mt-4">
                <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">
                  Radius
                </span>
                <Slider
                  value={radius}
                  onValueChange={setRadius}
                  min={5}
                  max={100}
                  step={5}
                  className="flex-1"
                />
                <span className="text-sm font-bold text-foreground min-w-[50px] text-right">
                  {radius[0]} mi
                </span>
              </div>
            </div>
          </div>

          {/* Row 2: Keywords */}
          <KeywordField
            label="Keywords & Skills"
            placeholder="e.g. React, Python, Machine Learning..."
            type="keyword"
            selectedGroups={kwSelected}
            onToggleGroup={(g) => toggleGroup(g, kwSelected, setKwSelected)}
          />
        </div>

        {/* Boolean output bar */}
        <div
          className={`border-t border-border/50 px-6 py-4 transition-colors ${
            hasBoolean ? "bg-accent/30" : "bg-muted/30"
          }`}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex-1 min-w-0">
              <p
                className={`text-sm font-mono leading-relaxed break-all boolean-output overflow-x-auto ${
                  hasBoolean ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {hasBoolean
                  ? booleanString
                  : "Your boolean search string will appear here once you start adding keywords..."}
              </p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <span className="text-xs text-muted-foreground tabular-nums">
                {charCount} characters
              </span>
              {hasBoolean && (
                <Button
                  onClick={handleCopy}
                  size="sm"
                  variant={copied ? "default" : "outline"}
                  className={`gap-1.5 text-xs font-semibold ${
                    copied
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600"
                      : ""
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy Boolean
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="border-t border-border/50 px-6 py-4 flex flex-col sm:flex-row justify-end gap-3">
          <Button
            variant="outline"
            className="gap-2 font-semibold"
            onClick={handleSearchLinkedIn}
            disabled={!hasBoolean}
          >
            <Linkedin className="w-4 h-4" />
            Search LinkedIn
          </Button>
          <Button
            onClick={handleSaveSearch}
            disabled={!hasBoolean}
            className={`gap-2 font-semibold transition-all ${
              saved
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "bg-primary hover:bg-primary/90 text-primary-foreground"
            }`}
          >
            {saved ? (
              <>
                <BookmarkCheck className="w-4 h-4" /> Saved!
              </>
            ) : (
              <>
                <Bookmark className="w-4 h-4" /> Save Search
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Saved Searches Panel */}
      {user && savedSearches.length > 0 && (
        <div className="mt-4 bg-card rounded-2xl shadow border border-border/60 overflow-hidden">
          <button
            onClick={() => setShowSaved((v) => !v)}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-accent/30 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-primary" />
              <span className="font-semibold text-sm text-foreground">
                Saved Searches ({savedSearches.length})
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={(e) => { e.stopPropagation(); navigate("/dashboard"); }}
                className="flex items-center gap-1 text-xs text-[#0A66C2] hover:underline font-semibold"
              >
                <LayoutDashboard className="w-3.5 h-3.5" /> View all
              </button>
              {showSaved ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              )}
            </div>
          </button>

          {showSaved && (
            <div className="divide-y divide-border/50">
              {savedSearches.slice(0, 3).map((s) => (
                <div
                  key={s.id}
                  className="px-6 py-4 flex items-start gap-4 hover:bg-accent/20 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground mb-1">
                      {s.title}
                    </p>
                    <p className="text-xs font-mono text-muted-foreground break-all line-clamp-2">
                      {s.booleanString}
                    </p>
                    {s.location && (
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {s.location}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground/60 mt-1">
                      {new Date(s.savedAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteSearch(s.id)}
                    className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                    title="Delete saved search"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {savedSearches.length > 3 && (
                <div className="px-6 py-3 text-center">
                  <button
                    onClick={() => navigate("/dashboard")}
                    className="text-xs text-[#0A66C2] font-semibold hover:underline"
                  >
                    View all {savedSearches.length} saved searches →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
