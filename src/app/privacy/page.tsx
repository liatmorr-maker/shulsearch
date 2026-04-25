export const dynamic = "force-dynamic";

export const metadata = {
  title: "Privacy Policy – ShulSearch",
  description: "Privacy Policy for ShulSearch",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="mb-2 text-3xl font-extrabold text-slate-900">Privacy Policy</h1>
      <p className="mb-10 text-sm text-slate-500">Last updated: April 24, 2026</p>

      <div className="prose prose-slate max-w-none space-y-8 text-sm leading-relaxed text-slate-700">

        <section>
          <h2 className="mb-2 text-lg font-bold text-slate-800">1. Introduction</h2>
          <p>
            ShulSearch (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is committed to protecting your privacy.
            This Privacy Policy explains how we collect, use, disclose, and safeguard your
            information when you visit shulsearch.com. Please read this policy carefully.
            By using the Site, you agree to the practices described here.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-bold text-slate-800">2. Information We Collect</h2>

          <h3 className="mb-1 mt-4 font-semibold text-slate-700">a. Information You Provide</h3>
          <ul className="list-disc space-y-1 pl-6">
            <li>Account registration details (name, email address) via Clerk authentication</li>
            <li>Saved property preferences and favorites</li>
            <li>Contact form or inquiry submissions (name, email, phone, message)</li>
          </ul>

          <h3 className="mb-1 mt-4 font-semibold text-slate-700">b. Information Collected Automatically</h3>
          <ul className="list-disc space-y-1 pl-6">
            <li>Pages visited, search queries, and browsing behavior on the Site</li>
            <li>Device type, browser type, operating system, and IP address</li>
            <li>Referring URLs and session duration</li>
            <li>Cookies and similar tracking technologies</li>
          </ul>

          <h3 className="mb-1 mt-4 font-semibold text-slate-700">c. Analytics</h3>
          <p>
            We use Google Analytics to understand how visitors use our Site. Google Analytics
            collects anonymized data about your interactions. You can opt out via the{" "}
            <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
              Google Analytics opt-out browser add-on
            </a>.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-bold text-slate-800">3. How We Use Your Information</h2>
          <ul className="list-disc space-y-1 pl-6">
            <li>To provide and improve the Site and its features</li>
            <li>To manage your account and saved listings</li>
            <li>To respond to your inquiries and contact requests</li>
            <li>To analyze usage patterns and improve user experience</li>
            <li>To send transactional emails (e.g., account confirmation) via Clerk</li>
            <li>To comply with legal obligations</li>
          </ul>
          <p className="mt-2">
            We do <strong>not</strong> sell, rent, or trade your personal information to third parties
            for marketing purposes.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-bold text-slate-800">4. Cookies</h2>
          <p>
            We use cookies and similar technologies to maintain your session, remember your
            preferences, and collect analytics data. You can control cookie settings through
            your browser; however, disabling cookies may affect the functionality of the Site.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-bold text-slate-800">5. Third-Party Services</h2>
          <p>We use the following third-party services that may collect data independently:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li><strong>Clerk</strong> — user authentication and account management (<a href="https://clerk.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Clerk Privacy Policy</a>)</li>
            <li><strong>Google Analytics</strong> — website analytics (<a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Google Privacy Policy</a>)</li>
            <li><strong>Mapbox</strong> — mapping and location services (<a href="https://www.mapbox.com/legal/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Mapbox Privacy Policy</a>)</li>
            <li><strong>Vercel</strong> — hosting and deployment (<a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Vercel Privacy Policy</a>)</li>
          </ul>
          <p className="mt-2">
            Each of these providers has their own privacy policy and data practices which we
            encourage you to review.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-bold text-slate-800">6. Data Retention</h2>
          <p>
            We retain your personal information for as long as your account is active or as
            needed to provide services. You may request deletion of your account and associated
            data at any time by contacting us at{" "}
            <a href="mailto:info@shulsearch.com" className="text-blue-500 hover:underline">
              info@shulsearch.com
            </a>.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-bold text-slate-800">7. Your Rights</h2>
          <p>Depending on your location, you may have the right to:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Access the personal data we hold about you</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Opt out of certain data processing activities</li>
            <li>Lodge a complaint with a supervisory authority</li>
          </ul>
          <p className="mt-2">
            To exercise any of these rights, contact us at{" "}
            <a href="mailto:info@shulsearch.com" className="text-blue-500 hover:underline">
              info@shulsearch.com
            </a>.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-bold text-slate-800">8. Children&apos;s Privacy</h2>
          <p>
            ShulSearch is not directed to children under the age of 13. We do not knowingly
            collect personal information from children. If you believe a child has provided us
            with personal information, please contact us and we will promptly delete it.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-bold text-slate-800">9. Security</h2>
          <p>
            We implement reasonable technical and organizational measures to protect your
            personal information. However, no method of transmission over the internet or
            electronic storage is 100% secure, and we cannot guarantee absolute security.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-bold text-slate-800">10. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of
            significant changes by updating the date at the top of this page. Continued use
            of the Site after changes constitutes acceptance of the revised policy.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-bold text-slate-800">11. Contact Us</h2>
          <p>
            If you have questions or concerns about this Privacy Policy, please contact us at:{" "}
            <a href="mailto:info@shulsearch.com" className="text-blue-500 hover:underline">
              info@shulsearch.com
            </a>
          </p>
        </section>

      </div>
    </div>
  );
}
