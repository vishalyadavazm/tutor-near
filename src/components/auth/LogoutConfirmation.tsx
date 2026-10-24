"use client";

import { useEffect, useState } from "react";
import { AiOutlineLogout } from "react-icons/ai";
import AuthService from "@/services/auth.service";

export default function LogoutConfirmation() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const openDialog = () => setIsOpen(true);
    window.addEventListener("logout-confirmation-requested", openDialog);
    return () => window.removeEventListener("logout-confirmation-requested", openDialog);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#15213D]/50 px-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) setIsOpen(false);
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="logout-dialog-title"
        aria-describedby="logout-dialog-description"
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
      >
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-50 text-[#E8621A]">
          <AiOutlineLogout className="h-6 w-6" />
        </div>
        <h2 id="logout-dialog-title" className="mt-4 text-center text-lg font-bold text-[#15213D]">
          Log out?
        </h2>
        <p id="logout-dialog-description" className="mt-2 text-center text-sm text-gray-500">
          Are you sure you want to log out of your account?
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            type="button"
            autoFocus
            onClick={() => setIsOpen(false)}
            className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => AuthService.confirmLogout()}
            className="rounded-lg bg-[#E8621A] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#cf5012] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8621A] focus-visible:ring-offset-2"
          >
            Yes, log out
          </button>
        </div>
      </section>
    </div>
  );
}
