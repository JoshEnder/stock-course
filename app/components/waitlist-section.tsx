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
  variant?: "section" | "banner" | "modal";
  showBannerSubtitle?: boolean;
};

const helperCopy = "No spam. Early access only.";

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

  const helperTextId = showBannerSubtitle ? hintId : undefined;
  const describedBy = [helperTextId, errorMessage ? errorId : undefined]
    .filter(Boolean)
    .join(" ") || undefined;

  const baseSuccessPanel = (
    <div className="rounded-[2rem] border border-[#d9e6de] bg-white px-5 py-5 shadow-[0_30px_80px_rgba(23,43,32,0.1)] sm:px-6 sm:py-6">
      <div className="flex items-start gap-4">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#22c55e] text-sm font-bold text-white">
          ✓
        </span>
        <div>
          <p className="text-base font-semibold text-[#183225]">
            You&apos;re in.
          </p>
          <p className="mt-1 text-sm leading-6 text-[#5b6d62]">
            We&apos;ll email you when early access opens.
          </p>
        </div>
      </div>
    </div>
  );

  const formFields = (
    <>
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
    </>
  );

  if (variant === "banner") {
    return (
      <section className="scroll-mt-28 w-full max-w-[48rem]" id="waitlist">
        {submissionState === "success" ? (
          baseSuccessPanel
        ) : (
          <form
            className="w-full rounded-[2rem] border border-[#d3dfd7] bg-white px-4 py-4 shadow-[0_24px_56px_rgba(23,43,32,0.12)] sm:px-5 sm:py-5"
            noValidate
            onSubmit={handleSubmit}
          >
            {formFields}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                aria-describedby={describedBy}
                aria-invalid={Boolean(errorMessage)}
                autoComplete="email"
                className="h-15 min-w-0 flex-1 rounded-full border border-[#d3dfd7] bg-[#fbfdfb] px-6 text-[1.02rem] text-[#172b1f] outline-none transition placeholder:text-[#86978c] focus:border-[#38b26b] focus:bg-white focus:ring-2 focus:ring-[#38b26b]/15 disabled:cursor-not-allowed disabled:opacity-70"
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
                className="inline-flex h-15 items-center justify-center rounded-full bg-[linear-gradient(135deg,#16994c_0%,#22c55e_100%)] px-8 text-sm font-semibold uppercase tracking-[0.05em] text-white shadow-[0_18px_38px_rgba(22,153,76,0.24)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
                disabled={submissionState === "submitting"}
                type="submit"
              >
                {submissionState === "submitting"
                  ? "Joining..."
                  : "Get early access"}
              </button>
            </div>

            {(showBannerSubtitle || errorMessage) && (
              <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                {showBannerSubtitle ? (
                  <p className="text-sm leading-6 text-[#66786d]" id={hintId}>
                    {helperCopy}
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
            )}
          </form>
        )}
      </section>
    );
  }

  if (variant === "modal") {
    return submissionState === "success" ? (
      <div
        aria-live="polite"
        className="rounded-[1.6rem] border border-[#dde7e0] bg-white px-5 py-5 shadow-[0_20px_50px_rgba(23,43,32,0.06)]"
      >
        <div className="flex items-start gap-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1fa855] text-sm font-bold text-white">
            ✓
          </span>
          <div>
            <p className="text-base font-semibold text-[#183225]">
              You&apos;re in. We&apos;ll update you at launch.
            </p>
          </div>
        </div>
      </div>
    ) : (
      <form className="space-y-3.5" noValidate onSubmit={handleSubmit}>
        {formFields}

        <input
          aria-describedby={describedBy}
          aria-invalid={Boolean(errorMessage)}
          autoComplete="email"
          className="h-[3.35rem] w-full rounded-full border border-[#d7e2db] bg-[#fbfdfb] px-5 text-[0.98rem] text-[#172b1f] outline-none transition placeholder:text-[#85968b] focus:border-[#38b26b] focus:bg-white focus:ring-2 focus:ring-[#38b26b]/15 disabled:cursor-not-allowed disabled:opacity-70"
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
          className="inline-flex h-[3.35rem] w-full items-center justify-center rounded-full bg-[linear-gradient(135deg,#16994c_0%,#22c55e_100%)] px-8 text-sm font-semibold uppercase tracking-[0.05em] text-white shadow-[0_14px_28px_rgba(22,153,76,0.18)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
          disabled={submissionState === "submitting"}
          type="submit"
        >
          {submissionState === "submitting" ? "Joining..." : "Get early access"}
        </button>

        {(showBannerSubtitle || errorMessage) && (
          <div className="flex flex-col gap-2 pt-0.5">
            {showBannerSubtitle ? (
              <p className="text-[0.92rem] leading-6 text-[#66786d]" id={hintId}>
                {helperCopy}
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
        )}
      </form>
    );
  }

  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl rounded-[2.4rem] border border-[#d9e6de] bg-[linear-gradient(180deg,#f8fbf9_0%,#edf5f0_100%)] px-6 py-8 shadow-[0_34px_90px_rgba(23,43,32,0.08)] sm:px-8 sm:py-10 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(360px,470px)] lg:items-center lg:gap-10">
          <div className="max-w-2xl">
            <span className="inline-flex items-center rounded-full border border-[#cfe0d5] bg-white/80 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-[#18864a]">
              Early Access
            </span>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-[#172b1f] sm:text-4xl">
              Join before early access opens.
            </h2>
            <p className="mt-4 max-w-xl text-base leading-8 text-[#55675d]">
              Get the first invite when Stoked launches and start with a
              clearer, safer way to learn how stocks work.
            </p>
          </div>

          {submissionState === "success" ? (
            baseSuccessPanel
          ) : (
            <form
              className="rounded-[2rem] border border-[#d9e6de] bg-white px-4 py-4 shadow-[0_26px_70px_rgba(23,43,32,0.09)] sm:px-5 sm:py-5"
              noValidate
              onSubmit={handleSubmit}
            >
              {formFields}

              <div className="flex flex-col gap-3">
                <input
                  aria-describedby={describedBy}
                  aria-invalid={Boolean(errorMessage)}
                  autoComplete="email"
                  className="h-15 rounded-full border border-[#d7e2db] bg-[#fbfdfb] px-6 text-[1.02rem] text-[#172b1f] outline-none transition placeholder:text-[#85968b] focus:border-[#38b26b] focus:bg-white focus:ring-2 focus:ring-[#38b26b]/15 disabled:cursor-not-allowed disabled:opacity-70"
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
                  className="inline-flex h-15 items-center justify-center rounded-full bg-[linear-gradient(135deg,#16994c_0%,#22c55e_100%)] px-8 text-sm font-semibold uppercase tracking-[0.05em] text-white shadow-[0_18px_38px_rgba(22,153,76,0.24)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={submissionState === "submitting"}
                  type="submit"
                >
                  {submissionState === "submitting"
                    ? "Joining..."
                    : "Get early access"}
                </button>
              </div>

              {(showBannerSubtitle || errorMessage) && (
                <div className="mt-3 flex flex-col gap-2">
                  {showBannerSubtitle ? (
                    <p className="text-sm leading-6 text-[#66786d]" id={hintId}>
                      {helperCopy}
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
              )}
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
