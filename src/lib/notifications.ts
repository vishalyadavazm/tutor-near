import toast from "react-hot-toast";

const QUEUED_NOTIFICATION_KEY = "tutor-near:notification";
type NotificationType = "success" | "error";

export function notifySuccess(message: string, id: string): void {
  toast.success(message, { id });
}

export function notifyError(message: string, id: string): void {
  toast.error(message, { id });
}

/** Carry one notification through a full-page login/logout redirect. */
export function queueNotification(type: NotificationType, message: string, id: string): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(
      QUEUED_NOTIFICATION_KEY,
      JSON.stringify({ type, message, id, createdAt: Date.now() })
    );
  } catch {
    toast[type](message, { id });
  }
}

export function showQueuedNotification(): void {
  if (typeof window === "undefined") return;
  try {
    const stored = sessionStorage.getItem(QUEUED_NOTIFICATION_KEY);
    if (!stored) return;
    // Consume before displaying so Strict Mode and subsequent reloads cannot replay it.
    sessionStorage.removeItem(QUEUED_NOTIFICATION_KEY);
    const notification: unknown = JSON.parse(stored);
    if (!notification || typeof notification !== "object") return;
    const item = notification as Record<string, unknown>;
    if (
      (item.type !== "success" && item.type !== "error") ||
      typeof item.message !== "string" ||
      typeof item.id !== "string" ||
      typeof item.createdAt !== "number" ||
      Date.now() - item.createdAt > 60_000
    )
      return;
    toast[item.type](item.message, { id: item.id });
  } catch {
    // Notifications must never interrupt authentication or page navigation.
  }
}
