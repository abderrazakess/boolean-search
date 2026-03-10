import type { KeywordGroup } from "@shared/types";

interface TermsPreviewProps {
  group: KeywordGroup;
}

export function TermsPreview({ group }: TermsPreviewProps) {
  return (
    <div className="absolute right-[calc(100%+12px)] top-1/2 -translate-y-1/2 z-50 pointer-events-none">
      <div className="bg-white rounded-xl border border-border shadow-xl p-3.5 min-w-[320px] max-w-[440px]">
        <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2.5">
          {group.group}
        </div>
        <div className="flex flex-wrap gap-1.5 items-center">
          {group.terms.map((term, i) => (
            <span key={i} className="flex items-center gap-1.5">
              <span className="bg-accent/60 border border-border rounded-md px-2.5 py-1 text-xs font-medium text-foreground whitespace-nowrap">
                {term}
              </span>
              {i < group.terms.length - 1 && (
                <span className="text-[10px] font-bold text-primary">OR</span>
              )}
            </span>
          ))}
        </div>
      </div>
      {/* Arrow pointing right */}
      <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[7px] border-l-white" />
    </div>
  );
}
