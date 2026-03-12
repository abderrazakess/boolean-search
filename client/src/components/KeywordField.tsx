import { useState, useRef, useEffect, useCallback } from "react";
import { Search, X, Plus, Minus, Loader2 } from "lucide-react";
import { TermsPreview } from "./TermsPreview";
import type { KeywordGroup } from "@shared/types";
import { trpc } from "@/lib/trpc";

interface KeywordFieldProps {
  label: string;
  placeholder: string;
  type: "jobTitle" | "keyword";
  selectedGroups: KeywordGroup[];
  onToggleGroup: (group: KeywordGroup) => void;
  accentColor?: string;
}

export function KeywordField({
  label,
  placeholder,
  type,
  selectedGroups,
  onToggleGroup,
  accentColor = "primary",
}: KeywordFieldProps) {
  const [input, setInput] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const generateMutation = trpc.boolean.generateGroups.useMutation();

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const loadGroups = useCallback(
    (val: string) => {
      generateMutation.mutate({ keyword: val, type });
      setShowDropdown(true);
    },
    [type]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInput(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.length >= 3) {
      debounceRef.current = setTimeout(() => loadGroups(val), 600);
    } else {
      setShowDropdown(false);
    }
  };

  const handleClear = () => {
    setInput("");
    setShowDropdown(false);
    generateMutation.reset();
  };

  const groups = generateMutation.data?.groups ?? [];
  const isLoading = generateMutation.isPending;
  const selectedGroupNames = selectedGroups.map((g) => g.group);

  const chipBg = type === "jobTitle" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-emerald-50 text-emerald-700 border-emerald-200";
  const chipRemoveBg = type === "jobTitle" ? "hover:bg-blue-100" : "hover:bg-emerald-100";

  return (
    <div ref={containerRef} className="w-full">
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
        {label}
      </label>
      <div className="relative">
        <div className="relative flex items-center">
          <Search className="absolute left-3 w-4 h-4 text-muted-foreground/60" />
          <input
            value={input}
            onChange={handleChange}
            onFocus={() => groups.length > 0 && setShowDropdown(true)}
            placeholder={placeholder}
            className="w-full pl-10 pr-9 py-2.5 text-sm bg-secondary/50 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all outline-none placeholder:text-muted-foreground/50"
          />
          {input && (
            <button
              onClick={handleClear}
              className="absolute right-2.5 p-0.5 rounded-full hover:bg-muted transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
          {isLoading && (
            <Loader2 className="absolute right-2.5 w-4 h-4 text-primary animate-spin" />
          )}
        </div>

        {/* Dropdown */}
        {showDropdown && (groups.length > 0 || isLoading) && (
          <div className="absolute top-[calc(100%+6px)] left-0 right-0 bg-white border border-border rounded-xl shadow-lg z-50 overflow-visible animate-in fade-in slide-in-from-top-1 duration-150">
            {isLoading ? (
              <div className="py-8 text-center">
                <div className="flex justify-center gap-1.5 mb-3">
                  <div className="w-2 h-2 rounded-full bg-primary pulse-dot" />
                  <div className="w-2 h-2 rounded-full bg-primary pulse-dot" />
                  <div className="w-2 h-2 rounded-full bg-primary pulse-dot" />
                </div>
                <p className="text-xs text-muted-foreground">AI generating keyword groups...</p>
              </div>
            ) : (
              <div className="max-h-[300px] overflow-y-auto">
                {groups.map((group, idx) => {
                  const isSel = selectedGroupNames.includes(group.group);
                  const isHov = hoveredIdx === idx;

                  // Highlight matching text
                  const groupLabel = group.group;
                  const lower = input.toLowerCase();
                  const matchIdx = groupLabel.toLowerCase().indexOf(lower);
                  const before = matchIdx >= 0 ? groupLabel.slice(0, matchIdx) : "";
                  const match = matchIdx >= 0 ? groupLabel.slice(matchIdx, matchIdx + input.length) : groupLabel;
                  const after = matchIdx >= 0 ? groupLabel.slice(matchIdx + input.length) : "";

                  return (
                    <div
                      key={idx}
                      className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                        isSel ? "bg-accent/50" : "hover:bg-accent/30"
                      } ${idx < groups.length - 1 ? "border-b border-border/50" : ""}`}
                    >
                      {/* Group name - fixed width */}
                      <div className="text-sm font-medium text-foreground flex-shrink-0 w-36">
                        {matchIdx >= 0 ? (
                          <>
                            {before}
                            <span className="font-bold">{match}</span>
                            {after}
                          </>
                        ) : (
                          groupLabel
                        )}
                      </div>

                      {/* Inline terms preview - single line, truncated */}
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <div className="flex items-center gap-1 overflow-hidden">
                          {group.terms.slice(0, 5).map((term, ti) => (
                            <span key={ti} className="flex items-center gap-1 flex-shrink-0">
                              <span className="bg-amber-50 border border-amber-200 text-amber-800 rounded px-1.5 py-0.5 text-[11px] font-medium whitespace-nowrap">
                                &ldquo;{term}&rdquo;
                              </span>
                              {ti < Math.min(group.terms.length, 5) - 1 && (
                                <span className="text-[10px] font-bold text-[#0A66C2] flex-shrink-0">OR</span>
                              )}
                            </span>
                          ))}
                          {group.terms.length > 5 && (
                            <span className="text-[10px] text-muted-foreground flex-shrink-0 ml-1">+{group.terms.length - 5} more</span>
                          )}
                        </div>
                      </div>

                      {/* Add/Remove button */}
                      <div
                        className="relative flex-shrink-0"
                        onMouseEnter={(e) => {
                          setHoveredIdx(idx);
                          setAnchorRect((e.currentTarget as HTMLDivElement).getBoundingClientRect());
                        }}
                        onMouseLeave={() => {
                          setHoveredIdx(null);
                          setAnchorRect(null);
                        }}
                      >
                        <button
                          onClick={() => onToggleGroup(group)}
                          className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                            isSel
                              ? "bg-primary border-primary text-primary-foreground"
                              : "bg-white border-primary text-primary hover:bg-primary/10"
                          }`}
                        >
                          {isSel ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                        </button>
                        {isHov && anchorRect && <TermsPreview group={group} anchorRect={anchorRect} />}
                      </div>
                    </div>
                  );
                })}
                {/* Add custom keyword */}
                <button
                  onClick={() => {
                    onToggleGroup({ group: `${input} (custom)`, terms: [input] });
                    setShowDropdown(false);
                  }}
                  className="w-full px-4 py-3 text-sm font-semibold text-primary hover:bg-accent/30 transition-colors border-t border-border/50 flex items-center gap-2"
                >
                  ADD NEW KEYWORD <Plus className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selected chips */}
      {selectedGroups.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {selectedGroups.map((g) => (
            <span
              key={g.group}
              className={`chip-animate inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border ${chipBg}`}
            >
              {g.group}
              <button
                onClick={() => onToggleGroup(g)}
                className={`rounded-full p-0.5 transition-colors ${chipRemoveBg}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
