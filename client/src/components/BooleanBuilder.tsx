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
  LogIn,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { KeywordField } from "./KeywordField";
import type { KeywordGroup } from "@shared/types";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { getLoginUrl } from "@/const";

export function BooleanBuilder() {
  const [jtSelected, setJtSelected] = useState<KeywordGroup[]>([]);
  const [kwSelected, setKwSelected] = useState<KeywordGroup[]>([]);
  const [location, setLocation] = useState("");
  const [radius, setRadius] = useState([35]);
  const [copied, setCopied] = useState(false);
  const [searchTitle, setSearchTitle] = useState("Search Title");
  const [editingTitle, setEditingTitle] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  const { data: user } = trpc.auth.me.useQuery();

  // Load a saved search from sessionStorage (set by Profile page)
  useEffect(() => {
    const raw = sessionStorage.getItem("loadSearch");
    if (!raw) return;
    sessionStorage.removeItem("loadSearch");
    try {
      const data = JSON.parse(raw);
      if (data.title) setSearchTitle(data.title);
      if (data.jtGroups) setJtSelected(data.jtGroups);
      if (data.kwGroups) setKwSelected(data.kwGroups);
      if (data.location) setLocation(data.location);
      if (data.radius) setRadius([data.radius]);
    } catch {
      // ignore parse errors
    }
  }, []);

  const saveMutation = trpc.savedSearches.save.useMutation({
    onSuccess: () => {
      setSaved(true);
      toast.success("Search saved to your profile!");
      setTimeout(() => setSaved(false), 3000);
    },
    onError: () => {
      toast.error("Failed to save search. Please try again.");
    },
  });

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

  const handleSave = () => {
    if (!hasBoolean) return;
    if (!user) {
      setShowLoginDialog(true);
      return;
    }
    saveMutation.mutate({
      title: searchTitle,
      booleanString,
      jtGroups: JSON.stringify(jtSelected),
      kwGroups: JSON.stringify(kwSelected),
      location,
      radius: radius[0],
    });
  };

  return (
    <div className="w-full">
      {/* Login prompt dialog */}
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Bookmark className="w-5 h-5 text-primary" />
              Save Your Boolean Search
            </DialogTitle>
            <DialogDescription className="text-base pt-1">
              Create a free account to save your boolean searches and access them anytime from your profile.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 pt-2">
            <div className="bg-secondary/60 rounded-lg p-4 text-sm text-muted-foreground space-y-1.5">
              <p className="font-semibold text-foreground">With an account you can:</p>
              <p>• Save unlimited boolean searches</p>
              <p>• Access all previous searches from your profile</p>
              <p>• Load saved searches back into the builder</p>
            </div>
            <Button
              className="w-full gap-2 font-semibold"
              onClick={() => { window.location.href = getLoginUrl(); }}
            >
              <LogIn className="w-4 h-4" />
              Create Account / Sign In
            </Button>
            <Button
              variant="ghost"
              className="w-full text-muted-foreground"
              onClick={() => setShowLoginDialog(false)}
            >
              Continue without saving
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
            className={`gap-2 font-semibold ${
              saved
                ? "border-emerald-500 text-emerald-600 hover:bg-emerald-50"
                : ""
            }`}
            onClick={handleSave}
            disabled={!hasBoolean || saveMutation.isPending}
          >
            {saved ? (
              <>
                <BookmarkCheck className="w-4 h-4" /> Saved!
              </>
            ) : (
              <>
                <Bookmark className="w-4 h-4" />
                {saveMutation.isPending ? "Saving..." : "Save Search"}
              </>
            )}
          </Button>
          <Button
            variant="outline"
            className="gap-2 font-semibold"
            onClick={handleSearchLinkedIn}
            disabled={!hasBoolean}
          >
            <Linkedin className="w-4 h-4" />
            Search LinkedIn
          </Button>
        </div>
      </div>
    </div>
  );
}
