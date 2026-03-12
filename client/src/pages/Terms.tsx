import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function Terms() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#0a65c2] py-12">
        <div className="max-w-3xl mx-auto px-6">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </button>
          <h1 className="text-3xl md:text-4xl font-bold text-white">Terms of Service</h1>
          <p className="text-blue-100/80 mt-2 text-sm">Last updated: March 2026</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12 space-y-8 text-[#444]">
        <section>
          <h2 className="text-xl font-bold text-[#1D1D1D] mb-3">1. Acceptance of Terms</h2>
          <p className="text-sm leading-relaxed">
            By accessing or using the LinkedIn Boolean Search Generator ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#1D1D1D] mb-3">2. Description of Service</h2>
          <p className="text-sm leading-relaxed">
            The LinkedIn Boolean Search Generator is a free tool that helps recruiters, sales professionals, and marketers build boolean search strings for use with LinkedIn, LinkedIn Sales Navigator, and LinkedIn Recruiter. The Service uses AI to suggest relevant keyword groups.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#1D1D1D] mb-3">3. Use of the Service</h2>
          <ul className="text-sm leading-relaxed space-y-2 list-disc list-inside">
            <li>You may use the Service for lawful purposes only</li>
            <li>You may not use the Service to build searches intended to discriminate based on protected characteristics</li>
            <li>You may not attempt to reverse-engineer, scrape, or abuse the AI generation feature</li>
            <li>You are responsible for how you use the generated boolean strings on LinkedIn or other platforms</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#1D1D1D] mb-3">4. Accounts and Saved Searches</h2>
          <p className="text-sm leading-relaxed">
            You may create an account to save your boolean searches. Account data is stored locally in your browser. You are responsible for maintaining the security of your account. We reserve the right to terminate accounts that violate these terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#1D1D1D] mb-3">5. Intellectual Property</h2>
          <p className="text-sm leading-relaxed">
            The Service and its original content, features, and functionality are owned by LinkedIn Boolean Search Generator and are protected by applicable intellectual property laws. The boolean strings you generate using the Service are yours to use freely.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#1D1D1D] mb-3">6. Disclaimers</h2>
          <p className="text-sm leading-relaxed">
            The Service is provided "as is" without warranties of any kind. We do not guarantee that the generated boolean strings will produce specific results on LinkedIn or any other platform. LinkedIn's search behavior and character limits may change independently of this tool.
          </p>
          <p className="text-sm leading-relaxed mt-3">
            This tool is not affiliated with, endorsed by, or sponsored by LinkedIn Corporation.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#1D1D1D] mb-3">7. Limitation of Liability</h2>
          <p className="text-sm leading-relaxed">
            To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#1D1D1D] mb-3">8. Changes to Terms</h2>
          <p className="text-sm leading-relaxed">
            We reserve the right to modify these terms at any time. We will provide notice of significant changes. Continued use of the Service after changes constitutes acceptance of the new terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#1D1D1D] mb-3">9. Contact</h2>
          <p className="text-sm leading-relaxed">
            For questions about these Terms, contact us at <span className="text-[#0a65c2]">legal@boolean-search.com</span>.
          </p>
        </section>
      </div>

      <footer className="border-t border-gray-200 py-6 text-center text-sm text-[#888]">
        &copy; 2026 LinkedIn Boolean Search Generator. All rights reserved.
      </footer>
    </div>
  );
}
