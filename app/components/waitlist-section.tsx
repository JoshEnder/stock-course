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
const formShellClassName =
  "w-full rounded-[1.9rem] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.92)_0%,rgba(247,250,247,0.98)_100%)] p-2.5 shadow-[0_18px_48px_rgba(23,43,32,0.08),inset_0_1px_0_rgba(255,255,255,0.88)] backdrop-blur-[10px] sm:p-3";
const bannerFormShellClassName =
  "w-full rounded-full border border-[#f0f2ee] bg-[rgba(255,255,255,0.74)] p-[0.1rem] shadow-[0_4px_12px_rgba(23,43,32,0.016),inset_0_1px_0_rgba(255,255,255,0.98)] backdrop-blur-[10px] sm:p-[0.24rem] sm:border-[#e7ebe5] sm:shadow-[0_8px_22px_rgba(23,43,32,0.035),inset_0_1px_0_rgba(255,255,255,0.98)]";
const formStackClassName = "flex flex-col gap-2.5";
const inlineFormStackClassName =
  "flex flex-col gap-2.5 sm:flex-row sm:items-center";
const bannerInlineFormStackClassName = "flex items-center gap-1";
const inputClassName =
  "h-[3.55rem] min-w-0 w-full rounded-[1.35rem] border border-[#dfe7e1] bg-[linear-gradient(180deg,#ffffff_0%,#f6faf7_100%)] px-5 text-[0.98rem] font-medium tracking-[-0.018em] text-[#172b1f] shadow-[inset_0_1px_0_rgba(255,255,255,0.98),0_1px_2px_rgba(23,43,32,0.04)] outline-none transition placeholder:text-[#7f9085] focus:border-[#2fa25d] focus:bg-white focus:ring-4 focus:ring-[#2fa25d]/10 disabled:cursor-not-allowed disabled:opacity-70";
const bannerInputClassName =
  "h-[2.16rem] min-w-0 w-full flex-1 rounded-full border-0 bg-transparent px-4 text-[0.86rem] font-medium tracking-[-0.02em] text-[#172b1f] outline-none transition placeholder:text-[#a4ada6] disabled:cursor-not-allowed disabled:opacity-70 sm:h-[2.72rem] sm:px-5 sm:text-[0.95rem]";
const buttonClassName =
  "inline-flex h-[3.35rem] w-full items-center justify-center rounded-[1.2rem] border border-[#128344]/30 bg-[linear-gradient(180deg,#1da858_0%,#15934b_100%)] px-6 text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-white shadow-[0_12px_26px_rgba(21,147,75,0.2),inset_0_1px_0_rgba(255,255,255,0.16)] transition hover:brightness-[1.03] disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto sm:min-w-[11rem]";
const bannerButtonClassName =
  "inline-flex h-[2.06rem] w-[2.06rem] shrink-0 items-center justify-center rounded-full border border-[#2f7f4e]/8 bg-[linear-gradient(180deg,#4e8958_0%,#417b4c_100%)] text-white shadow-[0_4px_8px_rgba(63,120,74,0.08),inset_0_1px_0_rgba(255,255,255,0.12)] transition hover:brightness-[1.03] disabled:cursor-not-allowed disabled:opacity-70 sm:h-[2.66rem] sm:w-[2.66rem] sm:shadow-[0_8px_16px_rgba(63,120,74,0.14),inset_0_1px_0_rgba(255,255,255,0.12)]";
const helperBlockClassName = "mt-3 flex flex-col gap-2 px-1";
const bannerHelperBlockClassName = "mt-0.5 pl-1 sm:mt-4";
const helperTextClassName =
  "text-[0.78rem] font-medium tracking-[0.01em] text-[#708176]";
const bannerHelperTextClassName =
  "text-[0.76rem] font-medium tracking-[0.01em] text-[#738278]";
const errorClassName =
  "inline-flex w-fit max-w-full rounded-full border border-red-200/70 bg-red-50/85 px-3 py-1.5 text-[0.72rem] font-medium text-red-700";

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
          <>
            <form
              className={bannerFormShellClassName}
              noValidate
              onSubmit={handleSubmit}
            >
              {formFields}

              <div className={bannerInlineFormStackClassName}>
                <input
                  aria-describedby={describedBy}
                  aria-invalid={Boolean(errorMessage)}
                  autoComplete="email"
                  className={bannerInputClassName}
                  id={inputId}
                  inputMode="email"
                  name="email"
                  onChange={(event) => {
                    setEmail(event.target.value);
                    if (errorMessage) {
                      setErrorMessage("");
                    }
                  }}
                  placeholder="jane@example.com"
                  required
                  type="email"
                  value={email}
                />

                <button
                  aria-label="Join waitlist"
                  className={bannerButtonClassName}
                  disabled={submissionState === "submitting"}
                  type="submit"
                >
                  {submissionState === "submitting"
                    ? "…"
                    : "→"}
                </button>
              </div>
            </form>

            {(showBannerSubtitle || errorMessage) && (
              <div className={bannerHelperBlockClassName}>
                {showBannerSubtitle ? (
                  <p className={bannerHelperTextClassName} id={hintId}>
                    {helperCopy}
                  </p>
                ) : null}

                {errorMessage ? (
                  <p
                    aria-live="polite"
                    className={errorClassName}
                    id={errorId}
                    role="status"
                  >
                    {errorMessage}
                  </p>
                ) : null}
              </div>
            )}
          </>
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
      <form
        className={`${formShellClassName} space-y-0`}
        noValidate
        onSubmit={handleSubmit}
      >
        {formFields}

        <div className={formStackClassName}>
          <input
            aria-describedby={describedBy}
            aria-invalid={Boolean(errorMessage)}
            autoComplete="email"
            className={inputClassName}
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
            className={buttonClassName}
            disabled={submissionState === "submitting"}
            type="submit"
          >
            {submissionState === "submitting"
              ? "Joining..."
              : "Get early access"}
          </button>
        </div>

        {(showBannerSubtitle || errorMessage) && (
          <div className={helperBlockClassName}>
            {showBannerSubtitle ? (
              <p className={helperTextClassName} id={hintId}>
                {helperCopy}
              </p>
            ) : null}

            {errorMessage ? (
              <p
                aria-live="polite"
                className={errorClassName}
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
              className={formShellClassName}
              noValidate
              onSubmit={handleSubmit}
            >
              {formFields}

              <div className={formStackClassName}>
                <input
                  aria-describedby={describedBy}
                  aria-invalid={Boolean(errorMessage)}
                  autoComplete="email"
                  className={inputClassName}
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
                  className={buttonClassName}
                  disabled={submissionState === "submitting"}
                  type="submit"
                >
                  {submissionState === "submitting"
                    ? "Joining..."
                    : "Get early access"}
                </button>
              </div>

              {(showBannerSubtitle || errorMessage) && (
                <div className={helperBlockClassName}>
                  {showBannerSubtitle ? (
                    <p className={helperTextClassName} id={hintId}>
                      {helperCopy}
                    </p>
                  ) : null}

                  {errorMessage ? (
                    <p
                      aria-live="polite"
                      className={errorClassName}
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
