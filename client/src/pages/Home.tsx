import {
  TrendingUp,
  BookOpen,
  Clock,
  ArrowRight,
  Bookmark,
  LogIn,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BooleanBuilder } from "@/components/BooleanBuilder";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";

function Navbar() {
  const { data: user } = trpc.auth.me.useQuery();
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      window.location.reload();
    },
    onError: () => toast.error("Failed to logout"),
  });
  const [, navigate] = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-border/20 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo */}
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-[#0A66C2]">LinkedIn</span>
            <span className="text-sm text-[#666] font-medium">Learning Solutions</span>
          </div>

          {/* Center: Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#" className="text-sm font-medium text-[#333] hover:text-[#0A66C2] transition-colors">
              Product
            </a>
            <a href="#" className="text-sm font-medium text-[#333] hover:text-[#0A66C2] transition-colors">
              Courses
            </a>
            <a href="#" className="text-sm font-medium text-[#333] hover:text-[#0A66C2] transition-colors">
              Resources
            </a>
            <a href="#" className="text-sm font-medium text-[#333] hover:text-[#0A66C2] transition-colors">
              Support
            </a>
          </div>

          {/* Right: Auth / CTA */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 font-medium text-[#333] hover:text-[#0A66C2]"
                  onClick={() => navigate("/profile")}
                >
                  <Bookmark className="w-4 h-4" />
                  <span className="hidden sm:inline">Saved Searches</span>
                </Button>
                <div className="flex items-center gap-2 pl-2 border-l border-border/40">
                  <div className="w-7 h-7 rounded-full bg-[#0A66C2]/10 flex items-center justify-center">
                    <span className="text-xs font-bold text-[#0A66C2]">
                      {(user.name ?? user.email ?? "U").charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-[#333] max-w-[120px] truncate">
                    {user.name ?? user.email}
                  </span>
                  <button
                    onClick={() => logoutMutation.mutate()}
                    className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground"
                    title="Sign out"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 font-medium text-[#333] hover:text-[#0A66C2]"
                  onClick={() => { window.location.href = getLoginUrl(); }}
                >
                  <LogIn className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign In</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#0A66C2] text-[#0A66C2] hover:bg-[#0A66C2]/5 font-medium"
                >
                  Contact Sales
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

function HeroSection() {
  return (
    <section className="pt-16 bg-[#0A66C2]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-8 items-end">
          {/* Left: Text */}
          <div className="relative z-10 py-14">
            <h1 className="text-[2.6rem] font-semibold text-white leading-[1.15] mb-4 tracking-tight">
              AI can change your<br />learning game.
            </h1>
            <p className="text-[0.95rem] text-white/75 leading-relaxed mb-7 max-w-sm font-normal">
              Build industry-leading learning with LinkedIn's unmatched expertise in AI and data you can't get anywhere else.
            </p>
            <Button
              size="sm"
              className="bg-white text-[#0A66C2] hover:bg-white/90 font-medium px-5 rounded text-sm h-9"
            >
              Contact us
            </Button>
          </div>

          {/* Right: Floating UI Mockup + Woman Photo */}
          <div className="relative hidden lg:block h-[600px]">
            {/* Woman photo - positioned on the right */}
            <div className="absolute inset-0 flex items-center justify-end">
              <img 
                src="https://d2xsxph8kpxj0f.cloudfront.net/310519663402520795/NT3MuHrFhgWNEk6bNXVHvr/boolean-hero-woman-R7CPzpiYmXqzyzo7HjpcZD.webp"
                alt="Woman using learning platform"
                className="h-full w-auto object-cover rounded-3xl"
              />
            </div>

            {/* Floating UI Mockup Card - positioned top-left */}
            <div className="absolute top-0 left-0 w-80 bg-white rounded-2xl shadow-2xl overflow-hidden transform -rotate-12 z-20">
              <div className="bg-gradient-to-r from-[#0A66C2] to-[#0856A0] h-12 flex items-center px-4">
                <div className="w-3 h-3 rounded-full bg-white/30" />
                <div className="ml-2 text-xs text-white font-semibold">Artificial Intelligence</div>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-3">
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
                <div className="flex gap-3 pt-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600" />
                  <div className="flex-1 space-y-2">
                    <div className="h-2 bg-gray-300 rounded w-2/3" />
                    <div className="h-2 bg-gray-300 rounded w-1/2" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureHighlightsSection() {
  const features = [
    {
      icon: TrendingUp,
      title: "Cultivate",
      description: "Grow your organization's AI skills.",
    },
    {
      icon: BookOpen,
      title: "Personalize",
      description: "Create the right learning plan for each employee.",
    },
    {
      icon: Clock,
      title: "Streamline",
      description: "Save time & automate repetitive tasks.",
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16 md:mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1D1D1D] mb-3">
            Advanced. Assistive. Anything but artificial.
          </h2>
          <p className="text-base text-[#666]">
            There's nothing artificial about the power of AI used to enhance organizational learning.
          </p>
        </div>

        {/* 3-Column Grid */}
        <div className="grid md:grid-cols-3 gap-12">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div key={idx}>
                <div className="mb-6">
                  <Icon className="w-8 h-8 text-[#0A66C2]" />
                </div>
                <h3 className="text-xl font-bold text-[#1D1D1D] mb-3">
                  {feature.title}
                </h3>
                <p className="text-base text-[#666] mb-4">
                  {feature.description}
                </p>
                <a href="#" className="text-[#0A66C2] font-semibold text-sm hover:underline flex items-center gap-1">
                  Learn more <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function CultivateSection() {
  return (
    <section className="py-20 md:py-28 bg-[#EAF2E3]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Text */}
          <div>
            <div className="mb-6">
              <span className="text-xs font-bold text-[#1D1D1D] uppercase tracking-widest border-b-2 border-[#0A66C2] pb-2 inline-block">
                Cultivate
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-[#1D1D1D] mb-6 leading-[1.2]">
              AI skills won't build themselves.
            </h2>
            <p className="text-base text-[#555] mb-8 leading-relaxed">
              79% of leaders agree AI adoption is critical to remain competitive<span className="text-xs align-super">*</span>. To develop your organization, you must develop AI skills from basic literacy to advanced knowledge.
            </p>
            <ul className="space-y-4">
              <li className="flex items-start gap-4">
                <div className="w-5 h-5 rounded-full bg-[#0A66C2] flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-xs font-bold">—</span>
                </div>
                <span className="text-base text-[#555]">Dynamis, up to date AI learning content aligned to our industry</span>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-5 h-5 rounded-full bg-[#0A66C2] flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-xs font-bold">—</span>
                </div>
                <span className="text-base text-[#555]">Multiple ways to learn in bite-sized chunks</span>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-5 h-5 rounded-full bg-[#0A66C2] flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-xs font-bold">—</span>
                </div>
                <span className="text-base text-[#555]">Pathways to prove skills with expert exams</span>
              </li>
            </ul>
          </div>

          {/* Right: Browser Mockup */}
          <div className="relative">
            <div className="bg-white rounded-lg shadow-2xl overflow-hidden border border-gray-200">
              <div className="bg-gradient-to-r from-[#0A66C2] to-[#0856A0] h-10 flex items-center px-4 gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-white/40" />
                  <div className="w-2.5 h-2.5 rounded-full bg-white/40" />
                  <div className="w-2.5 h-2.5 rounded-full bg-white/40" />
                </div>
                <div className="text-xs text-white font-semibold ml-2">Artificial Intelligence</div>
              </div>
              <img 
                src="https://d2xsxph8kpxj0f.cloudfront.net/310519663402520795/NT3MuHrFhgWNEk6bNXVHvr/boolean-feature-card-ikPzKv3KCmDjczYr5TGUDp.webp"
                alt="Learning platform interface"
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SubFeatureCardsSection() {
  const cards = [
    {
      title: "Dynamic, up-to-date AI learning content",
      description: "Aligned to our industry, curated by experts ahead.",
    },
    {
      title: "Multiple ways to learn",
      description: "In bite-sized chunks, in-depth courses, coding environments, & synchronous live sessions.",
    },
    {
      title: "Pathways to prove skills",
      description: "With certification preparation, practice exams, & professional certificates to share.",
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8">
          {cards.map((card, idx) => (
            <div key={idx} className="border-t-4 border-[#0A66C2] pt-6">
              <h3 className="text-base font-bold text-[#1D1D1D] mb-3">
                {card.title}
              </h3>
              <p className="text-sm text-[#666] leading-relaxed">
                {card.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BooleanBuilderSection() {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-[#1D1D1D] mb-6">
            Build Your Boolean Search
          </h2>
          <p className="text-lg text-[#666] max-w-2xl mx-auto">
            Start typing a job title or keyword below. Our AI will generate intelligent keyword groups for your Boolean search string.
          </p>
        </div>
        <BooleanBuilder />
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-20 md:py-28 bg-[#0A66C2]">
      <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
          Ask us what's next for Boolean Search.
        </h2>
        <p className="text-lg text-white/80 mb-10 max-w-2xl mx-auto">
          Get updates on our ambitious product roadmap to learn about new & upcoming features.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            className="bg-white text-[#0A66C2] hover:bg-white/90 font-semibold px-8 rounded-full"
          >
            Get in Touch
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-2 border-white text-white hover:bg-white/10 font-semibold px-8 rounded-full bg-transparent"
          >
            Explore our latest quarterly product release
          </Button>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 py-12">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm font-bold text-[#0A66C2]">LinkedIn</span>
              <span className="text-xs text-[#666]">Learning Solutions</span>
            </div>
            <p className="text-sm text-[#666]">
              AI-powered Boolean search for recruiters.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-[#1D1D1D] mb-4 text-sm">Product</h4>
            <ul className="space-y-2 text-sm text-[#666]">
              <li><a href="#" className="hover:text-[#0A66C2] transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-[#0A66C2] transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-[#0A66C2] transition-colors">Security</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-[#1D1D1D] mb-4 text-sm">Company</h4>
            <ul className="space-y-2 text-sm text-[#666]">
              <li><a href="#" className="hover:text-[#0A66C2] transition-colors">About</a></li>
              <li><a href="#" className="hover:text-[#0A66C2] transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-[#0A66C2] transition-colors">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-[#1D1D1D] mb-4 text-sm">Legal</h4>
            <ul className="space-y-2 text-sm text-[#666]">
              <li><a href="#" className="hover:text-[#0A66C2] transition-colors">Privacy</a></li>
              <li><a href="#" className="hover:text-[#0A66C2] transition-colors">Terms</a></li>
              <li><a href="#" className="hover:text-[#0A66C2] transition-colors">Cookies</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-200 pt-8 text-center text-sm text-[#666]">
          <p>&copy; 2026 LinkedIn Learning Solutions. All rights reserved.</p>
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
        <HeroSection />
        <FeatureHighlightsSection />
        <CultivateSection />
        <SubFeatureCardsSection />
        <BooleanBuilderSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
