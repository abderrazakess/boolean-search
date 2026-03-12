import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Linkedin } from "lucide-react";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AuthModal({ open, onClose, onSuccess }: AuthModalProps) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setName(""); setEmail(""); setPassword(""); setError("");
  };

  const switchMode = (m: "login" | "register") => {
    setMode(m); reset();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        if (!name.trim()) { setError("Name is required"); setLoading(false); return; }
        await register(name, email, password);
      }
      reset();
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        {/* Header */}
        <div className="bg-[#0A66C2] px-8 py-6">
          <div className="flex items-center gap-2 mb-1">
            <Linkedin className="w-5 h-5 text-white" />
            <span className="text-white font-bold text-sm">Boolean Search</span>
          </div>
          <DialogHeader>
            <DialogTitle className="text-white text-2xl font-bold mt-2">
              {mode === "login" ? "Sign in to save searches" : "Create your account"}
            </DialogTitle>
            <p className="text-white/75 text-sm mt-1">
              {mode === "login"
                ? "Save and manage your boolean searches across sessions."
                : "Join to save and manage all your boolean searches."}
            </p>
          </DialogHeader>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          {(["login", "register"] as const).map((m) => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                mode === m
                  ? "text-[#0A66C2] border-b-2 border-[#0A66C2]"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {m === "login" ? "Sign In" : "Register"}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-4">
          {mode === "register" && (
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Smith"
                required
                className="w-full px-4 py-2.5 text-sm bg-secondary/50 border border-border rounded-lg focus:ring-2 focus:ring-[#0A66C2]/20 focus:border-[#0A66C2]/50 outline-none transition-all"
              />
            </div>
          )}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full px-4 py-2.5 text-sm bg-secondary/50 border border-border rounded-lg focus:ring-2 focus:ring-[#0A66C2]/20 focus:border-[#0A66C2]/50 outline-none transition-all"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="w-full px-4 py-2.5 text-sm bg-secondary/50 border border-border rounded-lg focus:ring-2 focus:ring-[#0A66C2]/20 focus:border-[#0A66C2]/50 outline-none transition-all"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0A66C2] hover:bg-[#0856A0] text-white font-semibold h-10"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Please wait...</>
            ) : mode === "login" ? (
              "Sign In"
            ) : (
              "Create Account"
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground pt-1">
            {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => switchMode(mode === "login" ? "register" : "login")}
              className="text-[#0A66C2] font-semibold hover:underline"
            >
              {mode === "login" ? "Register" : "Sign In"}
            </button>
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
