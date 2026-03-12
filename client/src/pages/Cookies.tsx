import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function Cookies() {
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
          <h1 className="text-3xl md:text-4xl font-bold text-white">Cookie Policy</h1>
          <p className="text-blue-100/80 mt-2 text-sm">Last updated: March 2026</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12 space-y-8 text-[#444]">
        <section>
          <h2 className="text-xl font-bold text-[#1D1D1D] mb-3">1. What Are Cookies?</h2>
          <p className="text-sm leading-relaxed">
            Cookies are small text files stored on your device when you visit a website. They help websites remember your preferences, keep you logged in, and understand how you use the site. This policy explains how the LinkedIn Boolean Search Generator uses cookies and similar technologies.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#1D1D1D] mb-3">2. How We Use Storage</h2>
          <p className="text-sm leading-relaxed">
            Our Service primarily uses <strong>localStorage</strong> (a browser storage mechanism similar to cookies) rather than traditional cookies. We use localStorage to:
          </p>
          <ul className="text-sm leading-relaxed space-y-2 list-disc list-inside mt-3">
            <li><strong>Session persistence:</strong> Keep you logged in between visits (<code className="bg-gray-100 px-1 rounded text-xs">bs_session</code>)</li>
            <li><strong>Saved searches:</strong> Store your boolean search strings locally (<code className="bg-gray-100 px-1 rounded text-xs">boolean-saved-searches</code>)</li>
            <li><strong>User accounts:</strong> Store account data locally (<code className="bg-gray-100 px-1 rounded text-xs">bs_users</code>)</li>
          </ul>
          <p className="text-sm leading-relaxed mt-3">
            All of this data stays on your device and is never transmitted to our servers unless you explicitly request cloud sync features.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#1D1D1D] mb-3">3. Analytics Cookies</h2>
          <p className="text-sm leading-relaxed">
            We may use privacy-friendly analytics (such as Umami) to understand aggregate usage patterns — for example, how many people use the tool per day. These analytics are cookieless and do not track individual users or collect personally identifiable information.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#1D1D1D] mb-3">4. Third-Party Cookies</h2>
          <p className="text-sm leading-relaxed">
            We do not use third-party advertising cookies. If you click "Search LinkedIn" in our tool, you will be redirected to LinkedIn's website, which has its own cookie and privacy policies. Please refer to <a href="https://www.linkedin.com/legal/cookie-policy" target="_blank" rel="noopener noreferrer" className="text-[#0a65c2] hover:underline">LinkedIn's Cookie Policy</a> for details.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#1D1D1D] mb-3">5. Managing Your Storage</h2>
          <p className="text-sm leading-relaxed">
            You can clear all locally stored data at any time by:
          </p>
          <ul className="text-sm leading-relaxed space-y-2 list-disc list-inside mt-3">
            <li>Opening your browser's Developer Tools → Application → Local Storage → clearing entries for this site</li>
            <li>Using your browser's "Clear browsing data" feature and selecting "Cookies and site data"</li>
            <li>Logging out of your account (clears session data)</li>
          </ul>
          <p className="text-sm leading-relaxed mt-3">
            Note: clearing localStorage will log you out and remove your saved searches from this device.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#1D1D1D] mb-3">6. Changes to This Policy</h2>
          <p className="text-sm leading-relaxed">
            We may update this Cookie Policy as our technology or legal requirements change. Updates will be posted on this page with a revised date.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#1D1D1D] mb-3">7. Contact</h2>
          <p className="text-sm leading-relaxed">
            For questions about our use of cookies and storage, contact us at <span className="text-[#0a65c2]">privacy@boolean-search.com</span>.
          </p>
        </section>
      </div>

      <footer className="border-t border-gray-200 py-6 text-center text-sm text-[#888]">
        &copy; 2026 LinkedIn Boolean Search Generator. All rights reserved.
      </footer>
    </div>
  );
}
