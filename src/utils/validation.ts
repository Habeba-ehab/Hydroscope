export interface PasswordValidation {
  isValid: boolean;
  hasCapital: boolean;
  hasSpecial: boolean;
  hasNumber: boolean;
  hasMinLength: boolean;
}

export function validatePassword(password: string): PasswordValidation {
  const hasCapital = /[A-Z]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasMinLength = password.length >= 8;

  return {
    isValid: hasCapital && hasSpecial && hasNumber && hasMinLength,
    hasCapital,
    hasSpecial,
    hasNumber,
    hasMinLength,
  };
}

export function getPasswordErrors(password: string): string[] {
  const validation = validatePassword(password);
  const errors: string[] = [];
  if (!validation.hasMinLength) errors.push('Password must be at least 8 characters');
  if (!validation.hasCapital) errors.push('Password must contain at least 1 capital letter');
  if (!validation.hasSpecial) errors.push('Password must contain at least 1 special character');
  if (!validation.hasNumber) errors.push('Password must contain at least 1 number');
  return errors;
}
