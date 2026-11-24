/** Read API validation/authentication messages without displaying raw response objects. */
export function getApiErrorMessage(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const body = data as Record<string, unknown>;

  function messages(value: unknown, depth = 0): string[] {
    if (depth > 4) return [];
    if (typeof value === "string") return value.trim() ? [value.trim()] : [];
    if (Array.isArray(value)) return value.flatMap((item) => messages(item, depth + 1));
    if (value && typeof value === "object") {
      return Object.values(value).flatMap((item) => messages(item, depth + 1));
    }
    return [];
  }

  for (const key of ["error", "detail", "message", "errors", "non_field_errors"]) {
    const found = messages(body[key]);
    if (found.length) return [...new Set(found)].slice(0, 3).join(" ");
  }

  // Field validation responses may be shaped as { email: ["Already registered."] }.
  const fields = Object.values(body).filter((value) => Array.isArray(value));
  const found = messages(fields);
  return found.length ? [...new Set(found)].slice(0, 3).join(" ") : null;
}
