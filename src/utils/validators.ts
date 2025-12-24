export function isNonEmpty(value: string): boolean {
  return value.trim().length > 0;
}

export function validateRequired(label: string, value: string): string | undefined {
  return isNonEmpty(value) ? undefined : `${label} is required.`;
}

// Simple, pragmatic email validation
export function validateEmail(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return 'Email is required.';
  const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
  return ok ? undefined : 'Enter a valid email address.';
}

export function normalizePhone(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';

  const hasPlus = trimmed.startsWith('+');
  const digits = trimmed.replace(/\D/g, '');
  return hasPlus ? `+${digits}` : digits;
}

export function validatePhoneOptional(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  const normalized = normalizePhone(trimmed);
  const digits = normalized.replace(/\D/g, '');

  // E.164 typically allows up to 15 digits; allow 10–15 digits for practicality
  if (digits.length < 10 || digits.length > 15) {
    return 'Enter a valid phone number.';
  }

  return undefined;
}

export function validateZip(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return 'Zip Code is required.';

  // Allow 4–10 digits (handles international-ish cases while keeping sanity)
  const ok = /^\d{4,10}$/.test(trimmed);
  return ok ? undefined : 'Enter a valid Zip Code.';
}

export function validateName(label: string, value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return `${label} is required.`;
  if (trimmed.length < 2) return `${label} is too short.`;
  return undefined;
}

export function validatePassword(value: string): string | undefined {
  if (!value) return 'Password is required.';
  if (value.length < 8) return 'Password must be at least 8 characters.';

  const hasLetter = /[A-Za-z]/.test(value);
  const hasNumber = /\d/.test(value);
  if (!hasLetter || !hasNumber) return 'Password must include a letter and a number.';

  return undefined;
}

export function validateConfirmPassword(password: string, confirm: string): string | undefined {
  if (!confirm) return 'Confirm Password is required.';
  if (password !== confirm) return 'Passwords do not match.';
  return undefined;
}

export function validateOtp(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return 'OTP is required.';
  const ok = /^\d{6}$/.test(trimmed);
  return ok ? undefined : 'OTP must be 6 digits.';
}
