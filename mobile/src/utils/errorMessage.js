export function getErrorMessage(error, fallback = "Something went wrong") {
  if (error?.response?.data?.detail) {
    return error.response.data.detail;
  }

  if (error?.code === "ECONNABORTED") {
    return "The request timed out. Please try again.";
  }

  if (!error?.response) {
    return "Unable to connect to the server. Check the backend and network.";
  }

  return fallback;
}