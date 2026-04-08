const WAITLIST_EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeWaitlistEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function isValidWaitlistEmail(value: string): boolean {
  return WAITLIST_EMAIL_PATTERN.test(value);
}

export function getWaitlistEmailError(value: string): string | null {
  const normalizedEmail = normalizeWaitlistEmail(value);

  if (!normalizedEmail) {
    return "Please enter your email.";
  }

  if (!isValidWaitlistEmail(normalizedEmail)) {
    return "Please enter a valid email address.";
  }

  return null;
}
