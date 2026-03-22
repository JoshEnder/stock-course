import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | Stoked",
  description: "How Stoked collects, uses, and protects personal information.",
};

const sectionTitleClassName = "text-xl font-black tracking-tight text-[#172b4d]";
const sectionBodyClassName = "mt-3 text-sm leading-7 text-gray-600";

export default function PrivacyPolicyPage() {
  const updatedOn = "March 21, 2026";

  return (
    <main
      className="min-h-screen bg-[#f7faf8] px-6 py-8 lg:px-8"
      style={{ fontFamily: "var(--font-dm-sans,'DM Sans',system-ui,sans-serif)" }}
    >
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="inline-flex items-end gap-0.5 text-decoration-none">
            <span className="text-2xl font-black tracking-tight text-[#1a2b4a]">stoked</span>
            <span className="mb-[0.2em] h-3 w-3 rounded-full bg-[#22c55e]" />
          </Link>
          <Link
            href="/"
            className="rounded-2xl border-2 border-gray-200 bg-white px-4 py-2 text-sm font-black uppercase tracking-wide text-[#172b4d] shadow-[0_3px_0_#e5e7eb]"
          >
            Back home
          </Link>
        </div>

        <article className="mt-10 rounded-[32px] border-2 border-gray-100 bg-white p-8 shadow-[0_6px_0_#e5e7eb] lg:p-10">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#22c55e]">
            Legal
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-[#172b4d]">
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm leading-7 text-gray-500">
            Last updated {updatedOn}
          </p>

          <section className="mt-8">
            <h2 className={sectionTitleClassName}>Overview</h2>
            <p className={sectionBodyClassName}>
              Stoked is an educational product designed to help beginners learn stock market
              concepts. This page explains what information we collect, why we collect it, and
              how we use it.
            </p>
          </section>

          <section className="mt-8">
            <h2 className={sectionTitleClassName}>Information We Collect</h2>
            <p className={sectionBodyClassName}>
              If you sign in with Google, we may receive your name, email address, and profile
              image from your Google account. We also store product data needed to run the course,
              such as lesson progress, hearts, streaks, XP, nickname, and account-related login
              metadata like recent sign-in time and IP address.
            </p>
          </section>

          <section className="mt-8">
            <h2 className={sectionTitleClassName}>How We Use Information</h2>
            <p className={sectionBodyClassName}>
              We use your information to authenticate your account, save your learning progress
              across visits, personalize the experience, show leaderboard placement, and improve
              the reliability and security of the product.
            </p>
          </section>

          <section className="mt-8">
            <h2 className={sectionTitleClassName}>Guest Mode</h2>
            <p className={sectionBodyClassName}>
              If you use Stoked as a guest, some progress may be stored only in your browser on
              your device. That guest progress can be lost if you clear browser storage or switch
              devices.
            </p>
          </section>

          <section className="mt-8">
            <h2 className={sectionTitleClassName}>Third-Party Services</h2>
            <p className={sectionBodyClassName}>
              We use third-party providers to operate the product, including authentication,
              hosting, analytics, and database infrastructure. Those providers may process data on
              our behalf to deliver the service.
            </p>
          </section>

          <section className="mt-8">
            <h2 className={sectionTitleClassName}>Data Retention and Deletion</h2>
            <p className={sectionBodyClassName}>
              We keep account and course progress data for as long as needed to provide the
              service, comply with legal obligations, and resolve disputes. If account deletion is
              available in the product and you request it, we will remove associated account data
              subject to operational and legal requirements.
            </p>
          </section>

          <section className="mt-8">
            <h2 className={sectionTitleClassName}>Children&apos;s Privacy</h2>
            <p className={sectionBodyClassName}>
              Stoked is not intended for children under 13, and we do not knowingly collect
              personal information from children under 13.
            </p>
          </section>

          <section className="mt-8">
            <h2 className={sectionTitleClassName}>Contact</h2>
            <p className={sectionBodyClassName}>
              If you have privacy questions or requests, contact the site owner through the same
              support or contact channel used for this product.
            </p>
          </section>

          <section className="mt-8 rounded-3xl border-2 border-[#dcfce7] bg-[#f0fdf4] p-5">
            <p className="text-sm leading-7 text-[#166534]">
              Stoked is for education only. It does not provide financial advice, investment
              recommendations, or trading signals.
            </p>
          </section>
        </article>
      </div>
    </main>
  );
}
