export function isUnauthenticatedError(error: { name: string }) {
  return (
    error.name === "AuthSessionMissingError" ||
    error.name === "AuthInvalidJwtError"
  );
}
