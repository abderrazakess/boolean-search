import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  Bookmark,
  Trash2,
  Copy,
  Check,
  ArrowLeft,
  Linkedin,
  Search,
  LogIn,
} from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";
import type { KeywordGroup } from "@shared/types";

function SearchCard({
  id,
  title,
  booleanString,
  jtGroups,
  kwGroups,
  location,
  radius,
  createdAt,
  onDelete,
  onLoad,
}: {
  id: number;
  title: string;
  booleanString: string;
  jtGroups: string;
  kwGroups: string;
  location: string | null;
  radius: number | null;
  createdAt: Date;
  onDelete: (id: number) => void;
  onLoad: (data: {
    title: string;
    jtGroups: KeywordGroup[];
    kwGroups: KeywordGroup[];
    location: string;
    radius: number;
  }) => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(booleanString);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLinkedIn = () => {
    const url = `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(booleanString)}`;
    window.open(url, "_blank");
  };

  const handleLoad = () => {
    try {
      const jt: KeywordGroup[] = JSON.parse(jtGroups);
      const kw: KeywordGroup[] = JSON.parse(kwGroups);
      onLoad({
        title,
        jtGroups: jt,
        kwGroups: kw,
        location: location ?? "",
        radius: radius ?? 35,
      });
    } catch {
      toast.error("Failed to load search.");
    }
  };

  const date = new Date(createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground text-base truncate">{title}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{date}</p>
        </div>
        <button
          onClick={() => onDelete(id)}
          className="p-1.5 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors text-muted-foreground flex-shrink-0"
          title="Delete search"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="bg-secondary/50 rounded-lg px-3 py-2.5">
        <p className="text-xs font-mono text-foreground/80 break-all leading-relaxed line-clamp-3">
          {booleanString}
        </p>
      </div>

      {location && (
        <p className="text-xs text-muted-foreground">
          📍 {location} · {radius ?? 35} mi radius
        </p>
      )}

      <div className="flex gap-2 flex-wrap pt-1">
        <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={handleLoad}>
          <Search className="w-3.5 h-3.5" />
          Load in Builder
        </Button>
        <Button
          size="sm"
          variant="outline"
          className={`gap-1.5 text-xs ${copied ? "border-emerald-500 text-emerald-600" : ""}`}
          onClick={handleCopy}
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "Copied!" : "Copy"}
        </Button>
        <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={handleLinkedIn}>
          <Linkedin className="w-3.5 h-3.5" />
          LinkedIn
        </Button>
      </div>
    </div>
  );
}

export default function Profile() {
  const [, navigate] = useLocation();
  const { data: user, isLoading: userLoading } = trpc.auth.me.useQuery();
  const { data: searches, isLoading: searchesLoading, refetch } = trpc.savedSearches.list.useQuery(
    undefined,
    { enabled: !!user }
  );

  const deleteMutation = trpc.savedSearches.delete.useMutation({
    onSuccess: () => {
      toast.success("Search deleted.");
      refetch();
    },
    onError: () => toast.error("Failed to delete search."),
  });

  const handleDelete = (id: number) => {
    deleteMutation.mutate({ id });
  };

  const handleLoad = (data: {
    title: string;
    jtGroups: KeywordGroup[];
    kwGroups: KeywordGroup[];
    location: string;
    radius: number;
  }) => {
    // Store in sessionStorage so BooleanBuilder can pick it up on home page
    sessionStorage.setItem("loadSearch", JSON.stringify(data));
    navigate("/");
    toast.success("Search loaded! Scroll down to the Boolean Builder.");
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 px-4">
        <div className="text-center max-w-sm">
          <Bookmark className="w-12 h-12 text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Sign in to view your searches</h1>
          <p className="text-muted-foreground mb-6">
            Create an account to save and manage all your boolean searches in one place.
          </p>
          <Button className="gap-2 w-full" onClick={() => { window.location.href = getLoginUrl(); }}>
            <LogIn className="w-4 h-4" />
            Create Account / Sign In
          </Button>
          <Button variant="ghost" className="w-full mt-2" onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Builder
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b border-border/20 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Builder
          </button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-bold text-primary">
                {(user.name ?? user.email ?? "U").charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-foreground">{user.name ?? "User"}</p>
              {user.email && <p className="text-xs text-muted-foreground">{user.email}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Bookmark className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Saved Searches</h1>
          {searches && (
            <span className="ml-auto text-sm text-muted-foreground">
              {searches.length} {searches.length === 1 ? "search" : "searches"} saved
            </span>
          )}
        </div>

        {searchesLoading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : searches && searches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {searches.map((s) => (
              <SearchCard
                key={s.id}
                id={s.id}
                title={s.title}
                booleanString={s.booleanString}
                jtGroups={s.jtGroups}
                kwGroups={s.kwGroups}
                location={s.location ?? null}
                radius={s.radius ?? null}
                createdAt={s.createdAt}
                onDelete={handleDelete}
                onLoad={handleLoad}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-secondary/30 rounded-2xl border border-dashed border-border">
            <Bookmark className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <h2 className="text-lg font-semibold text-foreground mb-1">No saved searches yet</h2>
            <p className="text-sm text-muted-foreground mb-5">
              Use the Boolean Builder and click "Save Search" to save your searches here.
            </p>
            <Button variant="outline" className="gap-2" onClick={() => navigate("/")}>
              <Search className="w-4 h-4" />
              Go to Boolean Builder
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
