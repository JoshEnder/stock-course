"use client";

import Link from "next/link";
import { UserIcon } from "./icons";

type SiteHeaderProps = {
  nickname?: string;
  showProfile?: boolean;
};

export function SiteHeader({
  nickname = "Learner",
  showProfile = false,
}: SiteHeaderProps) {
  return (
    <header
      className="sticky top-0 z-40 border-b backdrop-blur-xl"
      style={{
        borderColor: "rgba(127, 231, 242, 0.1)",
        background:
          "linear-gradient(180deg, rgba(8,17,29,0.94) 0%, rgba(10,22,38,0.9) 100%)",
      }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="alpine-brand-link">
          <span className="alpine-brand-link__word">stoked</span>
          <span className="alpine-brand-link__dot" />
        </Link>

        {showProfile ? (
          <div
            className="alpine-chip"
            style={{
              gap: "0.55rem",
              paddingInline: "0.95rem",
              paddingBlock: "0.65rem",
            }}
          >
            <UserIcon
              className="h-4 w-4"
              style={{ color: "var(--alpine-cyan)" }}
            />
            <span style={{ color: "var(--alpine-text)" }}>{nickname}</span>
          </div>
        ) : null}
      </div>
    </header>
  );
}
