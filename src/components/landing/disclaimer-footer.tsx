import Link from "next/link";

export function DisclaimerFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white px-4 py-8">
      <div className="mx-auto max-w-4xl space-y-4 text-center text-xs leading-relaxed text-slate-500">

        <p>
          <span className="font-semibold text-slate-600">No Brokerage Relationship</span>
          <br />
          Use of this website does not create a client, agency, or brokerage relationship between the user and ShulSearch or any affiliated parties.
        </p>

        <p>
          <span className="font-semibold text-slate-600">Third-Party Links &amp; Services</span>
          <br />
          ShulSearch may include links to third-party websites, services, or professionals. We do not control or endorse these third parties and are not responsible for their content, services, or practices.
        </p>

        <p>
          <span className="font-semibold text-slate-600">Limitation of Liability</span>
          <br />
          ShulSearch shall not be held liable for any direct, indirect, incidental, or consequential damages arising from the use of this website or reliance on any information provided herein.
        </p>

        <p>
          ShulSearch is committed to ensuring digital accessibility for individuals with disabilities. We are continuously working to improve the accessibility of our web experience for everyone, and we welcome feedback and accommodation requests. If you wish to report an issue or seek an accommodation, please{" "}
          <a
            href="mailto:info@shulsearch.com"
            className="text-blue-500 underline-offset-2 hover:underline"
          >
            let us know
          </a>
          .
        </p>

        <div className="flex items-center justify-center gap-4 pt-2">
          <Link href="/terms" className="text-blue-500 hover:underline">Terms of Service</Link>
          <span className="text-slate-300">·</span>
          <Link href="/privacy" className="text-blue-500 hover:underline">Privacy Policy</Link>
        </div>

        <p className="text-slate-400">
          © {new Date().getFullYear()} ShulSearch. All rights reserved.
        </p>

      </div>
    </footer>
  );
}
