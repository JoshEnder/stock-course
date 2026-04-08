"use client";

import { useId, useState, type FormEvent } from "react";

import {
  getWaitlistEmailError,
  normalizeWaitlistEmail,
} from "@/app/lib/waitlist";

type SubmissionState = "idle" | "submitting" | "success";

type WaitlistResponse = {
  message?: string;
};

type WaitlistSectionProps = {
  variant?: "section" | "banner";
  showBannerSubtitle?: boolean;
};

export function WaitlistSection({
  variant = "section",
  showBannerSubtitle = true,
}: WaitlistSectionProps) {
  const inputId = useId();
  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;

  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [submissionState, setSubmissionState] =
    useState<SubmissionState>("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const rawEmail = String(formData.get("email") ?? email);
    const emailError = getWaitlistEmailError(rawEmail);

    if (emailError) {
      setEmail(rawEmail);
      setErrorMessage(emailError);
      return;
    }

    const company = String(formData.get("company") ?? "");
    const normalizedEmail = normalizeWaitlistEmail(rawEmail);

    setSubmissionState("submitting");
    setErrorMessage("");
    setEmail(normalizedEmail);

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: normalizedEmail,
          company,
        }),
      });

      const payload = (await response
        .json()
        .catch(() => null)) as WaitlistResponse | null;

      if (!response.ok) {
        throw new Error(
          payload?.message ??
            "We couldn't join the waitlist right now. Please try again.",
        );
      }

      form.reset();
      setEmail("");
      setSubmissionState("success");
    } catch (error) {
      setSubmissionState("idle");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "We couldn't join the waitlist right now. Please try again.",
      );
    }
  }

  const isBanner = variant === "banner";
  const helperTextId = !isBanner || showBannerSubtitle ? hintId : undefined;
  const describedBy = [helperTextId, errorMessage ? errorId : undefined]
    .filter(Boolean)
    .join(" ") || undefined;

  if (isBanner) {
    return (
      <section className="border-b border-[#dcf1e3] bg-[#f7fff9] px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full border border-[#b9e8c8] bg-white px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[#18864a]">
                Waitlist
              </span>
              <p className="text-sm font-medium leading-6 text-[#244031] sm:text-[0.95rem]">
                Get launch updates and early access before Stoked opens publicly.
              </p>
            </div>
          </div>

          {submissionState === "success" ? (
            <div
              aria-live="polite"
              className="inline-flex items-center gap-2 rounded-full border border-[#b9e8c8] bg-white px-4 py-2 text-sm font-medium text-[#1f5134]"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#22c55e] text-[0.7rem] font-bold text-white">
                ✓
              </span>
              You&apos;re on the list.
            </div>
          ) : (
            <form
              className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto lg:min-w-[420px]"
              noValidate
              onSubmit={handleSubmit}
            >
              <label className="sr-only" htmlFor={inputId}>
                Email address
              </label>

              <input
                aria-hidden="true"
                autoComplete="off"
                className="sr-only"
                name="company"
                tabIndex={-1}
                type="text"
              />

              <input
                aria-describedby={describedBy}
                aria-invalid={Boolean(errorMessage)}
                autoComplete="email"
                className="h-10 min-w-0 flex-1 rounded-full border border-[#cfe8d8] bg-white px-4 text-sm text-[#172b1f] outline-none transition placeholder:text-[#7a9484] focus:border-[#38b26b] focus:ring-2 focus:ring-[#38b26b]/20 disabled:cursor-not-allowed disabled:opacity-70"
                id={inputId}
                inputMode="email"
                name="email"
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (errorMessage) {
                    setErrorMessage("");
                  }
                }}
                placeholder="Enter your email"
                required
                type="email"
                value={email}
              />

              <button
                className="inline-flex h-10 items-center justify-center rounded-full bg-[#22c55e] px-4 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(34,197,94,0.22)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
                disabled={submissionState === "submitting"}
                type="submit"
              >
                {submissionState === "submitting"
                  ? "Joining..."
                  : "Join waitlist"}
              </button>
            </form>
          )}
        </div>

        {submissionState !== "success" && (showBannerSubtitle || errorMessage) ? (
          <div className="mx-auto mt-2 flex max-w-6xl flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            {showBannerSubtitle ? (
              <p className="text-xs leading-5 text-[#6f897a]" id={hintId}>
                No spam. Just launch updates and early access.
              </p>
            ) : null}

            {errorMessage ? (
              <p
                aria-live="polite"
                className="rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs text-red-700"
                id={errorId}
                role="status"
              >
                {errorMessage}
              </p>
            ) : null}
          </div>
        ) : null}
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden bg-[#040b07] px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div
          className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(8,22,15,0.96)_0%,rgba(5,13,9,0.96)_100%)] shadow-[0_28px_90px_rgba(0,0,0,0.42)]"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.18),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.14),transparent_26%)]" />
          <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />

          <div className="relative grid gap-10 px-6 py-8 sm:px-8 sm:py-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-14 lg:px-14 lg:py-14">
            <div className="max-w-2xl">
              <span className="inline-flex items-center rounded-full border border-[#1d5a35] bg-[#0d1f15] px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-[#9ce3b8]">
                Early Access
              </span>

              <h2 className="mt-5 max-w-xl text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl lg:text-[3.25rem]">
                Be first to know when Stoked launches
              </h2>

              <p className="mt-5 max-w-xl text-sm leading-7 text-white/72 sm:text-base">
                Learn stocks step by step. Join the waitlist for early access,
                launch updates, and first access when Stoked goes live.
              </p>
            </div>

            <div className="rounded-[1.75rem] border border-white/10 bg-white/6 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-xl sm:p-6">
              {submissionState === "success" ? (
                <div
                  aria-live="polite"
                  className="flex min-h-[220px] flex-col justify-center rounded-[1.35rem] border border-[#1c5f39] bg-[linear-gradient(180deg,rgba(10,26,17,0.92)_0%,rgba(8,18,13,0.92)_100%)] p-6"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#2d8c55] bg-[#12311f] text-lg text-[#89e2ad]">
                    ✓
                  </div>
                  <h3 className="mt-5 text-2xl font-semibold tracking-[-0.03em] text-white">
                    You&apos;re on the list.
                  </h3>
                  <p className="mt-3 max-w-sm text-sm leading-7 text-white/72 sm:text-base">
                    We&apos;ll let you know when Stoked opens early access.
                  </p>
                </div>
              ) : (
                <form className="space-y-4" noValidate onSubmit={handleSubmit}>
                  <label className="sr-only" htmlFor={inputId}>
                    Email address
                  </label>

                  <input
                    aria-hidden="true"
                    autoComplete="off"
                    className="sr-only"
                    name="company"
                    tabIndex={-1}
                    type="text"
                  />

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <input
                      aria-describedby={describedBy}
                      aria-invalid={Boolean(errorMessage)}
                      autoComplete="email"
                      className="h-14 flex-1 rounded-2xl border border-white/12 bg-black/20 px-4 text-base text-white outline-none transition placeholder:text-white/35 focus:border-[#38b26b] focus:bg-black/30 focus:ring-2 focus:ring-[#38b26b]/25 disabled:cursor-not-allowed disabled:opacity-70"
                      id={inputId}
                      inputMode="email"
                      name="email"
                      onChange={(event) => {
                        setEmail(event.target.value);
                        if (errorMessage) {
                          setErrorMessage("");
                        }
                      }}
                      placeholder="Enter your email"
                      required
                      type="email"
                      value={email}
                    />

                    <button
                      className="inline-flex h-14 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#16994c_0%,#22c55e_100%)] px-6 text-sm font-semibold text-white shadow-[0_14px_36px_rgba(22,153,76,0.34)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70 sm:px-7"
                      disabled={submissionState === "submitting"}
                      type="submit"
                    >
                      {submissionState === "submitting"
                        ? "Joining..."
                        : "Join the waitlist"}
                    </button>
                  </div>

                  <p
                    className="text-sm leading-6 text-white/58"
                    id={hintId}
                  >
                    No spam. Just launch updates and early access.
                  </p>

                  {errorMessage ? (
                    <p
                      aria-live="polite"
                      className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-100"
                      id={errorId}
                      role="status"
                    >
                      {errorMessage}
                    </p>
                  ) : null}
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
