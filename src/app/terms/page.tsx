export const dynamic = "force-dynamic";

export const metadata = {
  title: "Terms of Service – ShulSearch",
  description: "Terms of Service for ShulSearch",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="mb-2 text-3xl font-extrabold text-slate-900">Terms of Service</h1>
      <p className="mb-10 text-sm text-slate-500">Last updated: April 24, 2026</p>

      <div className="prose prose-slate max-w-none space-y-8 text-sm leading-relaxed text-slate-700">

        <section>
          <h2 className="mb-2 text-lg font-bold text-slate-800">1. Acceptance of Terms</h2>
          <p>
            By accessing or using ShulSearch (&quot;the Site&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), you agree to be
            bound by these Terms of Service. If you do not agree, please do not use the Site.
            We reserve the right to modify these terms at any time. Continued use of the Site
            after changes constitutes acceptance of the revised terms.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-bold text-slate-800">2. No Brokerage Relationship</h2>
          <p>
            ShulSearch is an information platform only. Use of this website does <strong>not</strong> create
            a client, agency, fiduciary, or brokerage relationship between you and ShulSearch or
            any of its operators, employees, or affiliated parties. ShulSearch is not a licensed
            real estate broker, agent, or salesperson. Nothing on this Site constitutes real
            estate advice, legal advice, or financial advice.
          </p>
          <p className="mt-2">
            All real estate transactions must be conducted through a licensed real estate
            professional. We strongly encourage you to consult a licensed agent or broker
            before making any real estate decision.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-bold text-slate-800">3. Listing Information &amp; Accuracy</h2>
          <p>
            Property listings displayed on ShulSearch are sourced from third-party providers
            including MLS feeds, public records, and external APIs. ShulSearch makes no
            representations or warranties regarding the accuracy, completeness, or timeliness
            of any listing information, including but not limited to price, availability,
            square footage, or property features.
          </p>
          <p className="mt-2">
            Listing data may be subject to change without notice. Always verify information
            directly with the listing agent or seller before relying on it.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-bold text-slate-800">4. Synagogue Location Data</h2>
          <p>
            Synagogue locations, distances, denominations, and related information displayed
            on this Site are provided for general informational purposes only. ShulSearch does
            not guarantee the accuracy of synagogue locations, hours of service, denominational
            affiliations, or any other synagogue data. Users should independently verify all
            synagogue information before relying on it.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-bold text-slate-800">5. Third-Party Links &amp; Services</h2>
          <p>
            The Site may contain links to or integrations with third-party websites, services,
            or professionals (including listing providers, mapping services, and mortgage
            calculators). ShulSearch does not control, endorse, or assume responsibility for
            any third-party content, products, services, or practices. Use of third-party
            services is at your own risk and subject to their respective terms and policies.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-bold text-slate-800">6. User Accounts</h2>
          <p>
            You may create an account to access certain features such as saving favorite
            listings. You are responsible for maintaining the confidentiality of your login
            credentials and for all activities that occur under your account. You agree to
            provide accurate information and to notify us immediately of any unauthorized use
            of your account.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-bold text-slate-800">7. Prohibited Use</h2>
          <p>You agree not to:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Use the Site for any unlawful purpose</li>
            <li>Scrape, harvest, or systematically download listing data</li>
            <li>Attempt to gain unauthorized access to any part of the Site</li>
            <li>Transmit spam, malware, or harmful content</li>
            <li>Misrepresent your identity or affiliation</li>
            <li>Interfere with the Site&apos;s operation or infrastructure</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-bold text-slate-800">8. Intellectual Property</h2>
          <p>
            All content on ShulSearch — including but not limited to its name, logo, design,
            software, and original text — is the property of ShulSearch and protected by
            applicable intellectual property laws. You may not reproduce, distribute, or
            create derivative works without our prior written consent.
          </p>
          <p className="mt-2">
            Listing photos and property data remain the property of their respective owners
            and are displayed under license from third-party providers.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-bold text-slate-800">9. Limitation of Liability</h2>
          <p>
            To the fullest extent permitted by law, ShulSearch, its operators, employees, and
            affiliates shall not be liable for any direct, indirect, incidental, special,
            consequential, or punitive damages arising out of or related to your use of — or
            inability to use — this Site or any content or services provided herein, even if
            advised of the possibility of such damages.
          </p>
          <p className="mt-2">
            Your sole remedy for dissatisfaction with the Site is to stop using it.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-bold text-slate-800">10. Disclaimer of Warranties</h2>
          <p>
            The Site and all content are provided &quot;as is&quot; and &quot;as available&quot; without warranties
            of any kind, either express or implied, including but not limited to warranties of
            merchantability, fitness for a particular purpose, or non-infringement.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-bold text-slate-800">11. Governing Law</h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of the
            State of Florida, without regard to its conflict of law provisions. Any disputes
            arising under these Terms shall be subject to the exclusive jurisdiction of the
            courts located in Miami-Dade County, Florida.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-bold text-slate-800">12. Contact</h2>
          <p>
            For questions about these Terms, please contact us at{" "}
            <a href="mailto:info@shulsearch.com" className="text-blue-500 hover:underline">
              info@shulsearch.com
            </a>.
          </p>
        </section>

      </div>
    </div>
  );
}
