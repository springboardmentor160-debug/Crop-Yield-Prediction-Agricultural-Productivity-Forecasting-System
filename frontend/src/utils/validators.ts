/**
 * YieldSense AI  -  Validators
 */

export function validateEmail(email: string): string | null {
  if (!email) return "Email is required";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return "Please enter a valid email address";
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return "Password is required";
  if (password.length < 6) return "Password must be at least 6 characters";
  if (password.length > 128) return "Password must be less than 128 characters";
  return null;
}

export function validateName(name: string): string | null {
  if (!name || !name.trim()) return "Name is required";
  if (name.trim().length > 100) return "Name must be less than 100 characters";
  return null;
}

export function validateLatitude(lat: number): string | null {
  if (lat < -90 || lat > 90) return "Latitude must be between -90 and 90";
  return null;
}

export function validateLongitude(lng: number): string | null {
  if (lng < -180 || lng > 180) return "Longitude must be between -180 and 180";
  return null;
}

export function validatePositiveNumber(value: number, fieldName: string): string | null {
  if (value <= 0) return `${fieldName} must be greater than 0`;
  return null;
}

export function validateSoilPh(ph: number): string | null {
  if (ph < 0 || ph > 14) return "Soil pH must be between 0 and 14";
  return null;
}

export function validateNonNegative(value: number, fieldName: string): string | null {
  if (value < 0) return `${fieldName} cannot be negative`;
  return null;
}
