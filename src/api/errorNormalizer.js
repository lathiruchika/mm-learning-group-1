// Normalise any thrown value to a human-readable string.
export function normalizeError(err) {
  if (!err) return 'An unexpected error occurred.'
  if (err instanceof Error) return err.message
  if (typeof err === 'string') return err
  return 'An unexpected error occurred.'
}
