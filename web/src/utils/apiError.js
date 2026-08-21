export function getApiErrorMessage(
  error,
  fallback = "Something went wrong"
) {
  const detail = error?.response?.data?.detail;

  if (typeof detail === "string") {
    return detail;
  }

  if (Array.isArray(detail)) {
    return detail
      .map((item) => item.msg || "Invalid input")
      .join(", ");
  }

  if (error?.code === "ECONNABORTED") {
    return "The request timed out. Please try again.";
  }

  if (!error?.response) {
    return "Unable to connect to the server. Check the backend and network.";
  }

  if (error.response.status === 401) {
    return "Your session has expired. Please log in again.";
  }

  if (error.response.status === 403) {
    return "You do not have permission to perform this action.";
  }

  if (error.response.status === 404) {
    return "The requested farm was not found.";
  }

  return fallback;
}