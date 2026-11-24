"use client";

import { useEffect } from "react";
import toast, { ToastBar, Toaster } from "react-hot-toast";
import { FiX } from "react-icons/fi";
import { showQueuedNotification } from "@/lib/notifications";

export default function ToastProvider() {
  useEffect(() => {
    showQueuedNotification();
  }, []);

  return (
    <Toaster
      position="top-right"
      gutter={10}
      containerStyle={{ top: 20, left: 16, right: 16, zIndex: 3000 }}
      toastOptions={{
        duration: 3000,
        style: {
          background: "#ffffff",
          color: "#15213D",
          border: "1px solid #e5e7eb",
          borderRadius: "12px",
          boxShadow: "0 8px 30px rgba(21, 33, 61, 0.12)",
          padding: "12px 14px",
          fontSize: "14px",
          maxWidth: "min(380px, calc(100vw - 32px))",
        },
        success: { iconTheme: { primary: "#16a34a", secondary: "#ffffff" } },
        error: { duration: 4500, iconTheme: { primary: "#dc2626", secondary: "#ffffff" } },
      }}
    >
      {(notification) => (
        <ToastBar toast={notification}>
          {({ icon, message }) => (
            <>
              {icon}
              <div className="min-w-0 flex-1 break-words">{message}</div>
              <button
                type="button"
                aria-label="Dismiss notification"
                onClick={() => toast.dismiss(notification.id)}
                className="ml-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-brand-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-orange"
              >
                <FiX aria-hidden="true" className="h-4 w-4" />
              </button>
            </>
          )}
        </ToastBar>
      )}
    </Toaster>
  );
}
