export const ACCOUNT_PROFILE_KEY = "accountProfile";

export interface AccountProfile {
  name: string;
  email: string;
  phone: string;
}

function object(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

/** Store account display details only; credentials and tokens are excluded. */
export function saveAccountProfile(response: unknown, signInEmail: string): void {
  if (typeof window === "undefined") return;
  const root = object(response);
  const data = object(root.data);
  const sources = [object(root.user), object(data.user), data, root];
  function field(key: string): string {
    for (const source of sources) {
      const value = source[key];
      if (typeof value === "string" && value.trim()) return value.trim();
      if (key === "phone" && typeof value === "number") return String(value);
    }
    return "";
  }
  const profile: AccountProfile = {
    name: [field("first_name"), field("last_name")].filter(Boolean).join(" ") || field("name"),
    email: field("email") || signInEmail.trim(),
    phone: field("phone"),
  };
  try {
    localStorage.setItem(ACCOUNT_PROFILE_KEY, JSON.stringify(profile));
    window.dispatchEvent(new Event("auth-state-change"));
  } catch {
    // Display details must not prevent a successful sign-in.
  }
}

export function getAccountSnapshot(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(ACCOUNT_PROFILE_KEY);
  } catch {
    return null;
  }
}

export function parseAccountProfile(snapshot: string | null): AccountProfile | null {
  if (!snapshot) return null;
  try {
    const profile = object(JSON.parse(snapshot));
    if (typeof profile.email !== "string") return null;
    return {
      name: typeof profile.name === "string" ? profile.name : "",
      email: profile.email,
      phone: typeof profile.phone === "string" ? profile.phone : "",
    };
  } catch {
    return null;
  }
}
