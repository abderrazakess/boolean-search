import type { KeywordGroup } from "@shared/types";

interface TermsPreviewProps {
  group: KeywordGroup;
  anchorRect: DOMRect;
}

export function TermsPreview({ group, anchorRect }: TermsPreviewProps) {
  const booleanString = `(${group.terms.map((t) => `"${t}"`).join(" OR ")})`;

  return (
    <div
      className="fixed z-[9999] pointer-events-none"
      style={{
        top: anchorRect.top + anchorRect.height / 2,
        left: anchorRect.right + 14,
        transform: "translateY(-50%)",
      }}
    >
      {/* Arrow pointing left */}
      <div
        className="absolute -left-2 top-1/2 -translate-y-1/2 w-0 h-0"
        style={{
          borderTop: "6px solid transparent",
          borderBottom: "6px solid transparent",
          borderRight: "8px solid white",
          filter: "drop-shadow(-1px 0 1px rgba(0,0,0,0.08))",
        }}
      />
      <div className="bg-white rounded-xl border border-border shadow-2xl p-3.5 min-w-[280px] max-w-[380px]">
        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
          {group.group}
        </div>
        {/* Boolean string preview */}
        <div className="bg-accent/40 border border-border/60 rounded-lg px-3 py-2 mb-3">
          <p className="text-[11px] font-mono text-foreground/80 leading-relaxed break-all">
            {booleanString}
          </p>
        </div>
        {/* Individual terms */}
        <div className="flex flex-wrap gap-1.5 items-center">
          {group.terms.map((term, i) => (
            <span key={i} className="flex items-center gap-1.5">
              <span className="bg-accent/60 border border-border rounded-md px-2 py-0.5 text-[11px] font-medium text-foreground whitespace-nowrap">
                {term}
              </span>
              {i < group.terms.length - 1 && (
                <span className="text-[10px] font-bold text-primary">OR</span>
              )}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
