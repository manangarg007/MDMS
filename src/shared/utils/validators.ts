export interface PasswordRuleResult {
  label: string;
  passed: boolean;
}

/**
 * Checks that a string is not empty or whitespace-only.
 */
export function required(value: string, fieldName = 'This field'): string | undefined {
  if (value.trim().length === 0) {
    return `${fieldName} is required.`;
  }
  return undefined;
}

/**
 * Validates basic email format. Returns undefined for empty strings so it can
 * be composed with `required(value) ?? isEmail(value)`.
 */
export function isEmail(value: string): string | undefined {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return undefined;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(trimmed) ? undefined : 'Please enter a valid email address.';
}

/**
 * Checks that a string has at least `min` characters (after trimming).
 */
export function minLength(
  value: string,
  min: number,
  fieldName = 'This field',
): string | undefined {
  if (value.trim().length < min) {
    return `${fieldName} must be at least ${min} characters.`;
  }
  return undefined;
}

/**
 * Validates a 10-digit Indian mobile number (optionally prefixed with +91).
 */
export function isPhone(value: string): string | undefined {
  const normalized = value.replace(/[\s-]/g, '');
  if (normalized.length === 0) {
    return undefined;
  }
  const indianMobileRegex = /^(?:\+91)?[6-9]\d{9}$/;
  return indianMobileRegex.test(normalized)
    ? undefined
    : 'Please enter a valid 10-digit Indian mobile number.';
}

/**
 * Evaluates password strength rules so the UI can render a live checklist.
 */
export function passwordRules(value: string): PasswordRuleResult[] {
  return [
    { label: 'At least 8 characters', passed: value.length >= 8 },
    { label: 'One uppercase letter (A-Z)', passed: /[A-Z]/.test(value) },
    { label: 'One lowercase letter (a-z)', passed: /[a-z]/.test(value) },
    { label: 'One number (0-9)', passed: /\d/.test(value) },
    { label: 'One special character (!@#$...)', passed: /[^A-Za-z0-9]/.test(value) },
  ];
}

/**
 * Checks that two strings match (for password confirmation, etc.).
 */
export function matches(
  a: string,
  b: string,
  message = 'Values do not match.',
): string | undefined {
  return a === b ? undefined : message;
}
