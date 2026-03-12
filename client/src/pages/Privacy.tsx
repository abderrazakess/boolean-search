import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function Privacy() {
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
          <h1 className="text-3xl md:text-4xl font-bold text-white">Privacy Policy</h1>
          <p className="text-blue-100/80 mt-2 text-sm">Last updated: March 2026</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12 space-y-8 text-[#444]">
        <section>
          <h2 className="text-xl font-bold text-[#1D1D1D] mb-3">1. Information We Collect</h2>
          <p className="text-sm leading-relaxed">
            We collect information you provide directly to us, such as when you create an account, save a boolean search, or contact us for support. This may include your name, email address, and any search strings you choose to save.
          </p>
          <p className="text-sm leading-relaxed mt-3">
            We also automatically collect certain information when you use our service, including log data (IP address, browser type, pages visited), device information, and usage patterns to improve our product.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#1D1D1D] mb-3">2. How We Use Your Information</h2>
          <ul className="text-sm leading-relaxed space-y-2 list-disc list-inside">
            <li>To provide, maintain, and improve our boolean search generator tool</li>
            <li>To authenticate your account and persist your saved searches</li>
            <li>To send you service-related communications (with your consent)</li>
            <li>To monitor usage patterns and improve user experience</li>
            <li>To comply with legal obligations</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#1D1D1D] mb-3">3. Data Storage</h2>
          <p className="text-sm leading-relaxed">
            Your account information and saved searches are stored locally in your browser's localStorage. We do not transmit your saved boolean strings to our servers unless you explicitly choose to sync them. You can delete all locally stored data at any time by clearing your browser storage.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#1D1D1D] mb-3">4. Third-Party Services</h2>
          <p className="text-sm leading-relaxed">
            Our AI keyword generation feature uses the OpenAI API. When you type a job title or keyword, that input is sent to OpenAI's servers to generate suggestions. Please review <a href="https://openai.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[#0a65c2] hover:underline">OpenAI's Privacy Policy</a> for details on how they handle data.
          </p>
          <p className="text-sm leading-relaxed mt-3">
            We may use analytics services to understand aggregate usage patterns. These services collect anonymized data only.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#1D1D1D] mb-3">5. Your Rights</h2>
          <p className="text-sm leading-relaxed">
            You have the right to access, correct, or delete your personal data at any time. Since most data is stored locally in your browser, you can manage it directly. For any additional requests, contact us at the email below.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#1D1D1D] mb-3">6. Children's Privacy</h2>
          <p className="text-sm leading-relaxed">
            Our service is not directed to children under 13. We do not knowingly collect personal information from children under 13.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#1D1D1D] mb-3">7. Changes to This Policy</h2>
          <p className="text-sm leading-relaxed">
            We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new policy on this page with an updated date.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#1D1D1D] mb-3">8. Contact Us</h2>
          <p className="text-sm leading-relaxed">
            If you have any questions about this Privacy Policy, please contact us at <span className="text-[#0a65c2]">privacy@boolean-search.com</span>.
          </p>
        </section>
      </div>

      <footer className="border-t border-gray-200 py-6 text-center text-sm text-[#888]">
        &copy; 2026 LinkedIn Boolean Search Generator. All rights reserved.
      </footer>
    </div>
  );
}
