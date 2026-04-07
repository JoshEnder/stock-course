import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | Stoked",
  description: "How Stoked collects, uses, and protects personal information.",
};

const sections = [
  {
    title: "Overview",
    body:
      "Stoked is an educational product designed to help beginners learn stock market concepts. This page explains what information we collect, why we collect it, and how we use it.",
  },
  {
    title: "Information We Collect",
    body:
      "If you sign in with Google, we may receive your name, email address, and profile image from your Google account. We also store product data needed to run the course, such as lesson progress, hearts, streaks, XP, nickname, and account-related login metadata like recent sign-in time and IP address.",
  },
  {
    title: "How We Use Information",
    body:
      "We use your information to authenticate your account, save your learning progress across visits, personalize the experience, show leaderboard placement, and improve the reliability and security of the product.",
  },
  {
    title: "Guest Mode",
    body:
      "If you use Stoked as a guest, some progress may be stored only in your browser on your device. That guest progress can be lost if you clear browser storage or switch devices.",
  },
  {
    title: "Third-Party Services",
    body:
      "We use third-party providers to operate the product, including authentication, hosting, analytics, and database infrastructure. Those providers may process data on our behalf to deliver the service.",
  },
  {
    title: "Data Retention and Deletion",
    body:
      "We keep account and course progress data for as long as needed to provide the service, comply with legal obligations, and resolve disputes. If account deletion is available in the product and you request it, we will remove associated account data subject to operational and legal requirements.",
  },
  {
    title: "Children's Privacy",
    body:
      "Stoked is not intended for children under 13, and we do not knowingly collect personal information from children under 13.",
  },
  {
    title: "Contact",
    body:
      "If you have privacy questions or requests, contact the site owner through the same support or contact channel used for this product.",
  },
];

export default function PrivacyPolicyPage() {
  const updatedOn = "March 21, 2026";

  return (
    <main className="alpine-page">
      <div className="alpine-page__inner">
        <div className="alpine-topbar">
          <Link href="/" className="alpine-brand-link">
            <span className="alpine-brand-link__word">stoked</span>
            <span className="alpine-brand-link__dot" />
          </Link>
          <Link href="/" className="alpine-back-link">
            Back home
          </Link>
        </div>

        <article className="alpine-panel alpine-panel--accent mt-10 p-8 lg:p-10">
          <p className="alpine-kicker">Legal</p>
          <h1 className="alpine-heading">Privacy Policy</h1>
          <p className="mt-3 text-sm" style={{ color: "var(--alpine-text-tertiary)" }}>
            Last updated {updatedOn}
          </p>

          <div className="mt-8 space-y-8">
            {sections.map((section) => (
              <section key={section.title}>
                <h2 className="alpine-panel__title text-[1.3rem]">{section.title}</h2>
                <p className="alpine-panel__copy">{section.body}</p>
              </section>
            ))}
          </div>

          <section className="alpine-panel mt-8 p-5">
            <p className="text-sm leading-7" style={{ color: "var(--alpine-text-secondary)" }}>
              Stoked is for education only. It does not provide financial advice, investment
              recommendations, or trading signals.
            </p>
          </section>
        </article>
      </div>
    </main>
  );
}
