// Maps axios/network errors to user-friendly messages per the LLD error handling matrix.
export function mapError(error) {
  if (!error || !error.isAxiosError) {
    return "Something went wrong. Please try again.";
  }

  if (!error.response) {
    // No response reached the client: network down, DNS failure, or CORS block.
    return "Cannot reach server. Ensure backend is running and CORS is configured.";
  }

  const { status } = error.response;

  switch (status) {
    case 400:
      return "The request was invalid. Please check your input and try again.";
    case 401:
      return "Invalid username or password";
    case 403:
      return "You do not have permission to perform this action.";
    case 404:
      return "The requested item was not found.";
    default:
      if (status >= 500) {
        return "The server encountered an error. Please try again later.";
      }
      return "Something went wrong. Please try again.";
  }
}

export function isUnauthorized(error) {
  return Boolean(error && error.isAxiosError && error.response && error.response.status === 401);
}
