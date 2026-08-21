const apiBaseUrl =
  process.env.EXPO_PUBLIC_API_BASE_URL;

if (!apiBaseUrl) {
  throw new Error(
    "EXPO_PUBLIC_API_BASE_URL is missing. Add it to mobile/.env or the EAS environment."
  );
}

export const config = {
  apiBaseUrl: apiBaseUrl.replace(/\/+$/, ""),
};