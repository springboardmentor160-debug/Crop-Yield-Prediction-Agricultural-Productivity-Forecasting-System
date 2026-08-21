export const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
};

export const isValidPhone = (phone) => {
  if (!phone) return true;
  return /^[0-9+\-\s]{7,15}$/.test(phone.trim());
};

export const isValidPassword = (password) => {
  return password.length >= 8;
};

export const validateLogin = ({ email, password }) => {
  if (!email.trim()) return "Email is required.";
  if (!isValidEmail(email)) return "Enter a valid email address.";
  if (!password) return "Password is required.";

  return null;
};

export const validateRegistration = ({
  full_name,
  email,
  phone,
  password,
}) => {
  if (!full_name.trim()) return "Full name is required.";
  if (!email.trim()) return "Email is required.";
  if (!isValidEmail(email)) return "Enter a valid email address.";
  if (!isValidPhone(phone)) return "Enter a valid phone number.";

  if (!isValidPassword(password)) {
    return "Password must contain at least 8 characters.";
  }

  return null;
};