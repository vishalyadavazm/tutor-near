"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FiCheck, FiChevronDown } from "react-icons/fi";
import clsx from "clsx";

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  id?: string;
  name?: string;
  value: string | number | undefined;
  options: readonly SelectOption[];
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  invalid?: boolean;
  compact?: boolean;
  variant?: "default" | "plain";
  className?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
}

export default function Select({
  id,
  name,
  value,
  options,
  onValueChange,
  placeholder = "Select an option",
  disabled = false,
  required = false,
  invalid = false,
  compact = false,
  variant = "default",
  className,
  "aria-label": ariaLabel,
  "aria-labelledby": labelledBy,
  "aria-describedby": describedBy,
}: SelectProps) {
  const generatedId = useId();
  const triggerId = id ?? `select-${generatedId}`;
  const menuId = `${triggerId}-options`;
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const trigger = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const typeahead = useRef({ text: "", time: 0 });
  const selectedIndex = options.findIndex((option) => String(option.value) === String(value ?? ""));
  const selected = options[selectedIndex];
  const enabled = options
    .map((option, index) => (!option.disabled ? index : -1))
    .filter((index) => index >= 0);
  const isOpen = open && !disabled;

  function openMenu(last = false) {
    setActiveIndex(
      selectedIndex >= 0 && !selected?.disabled
        ? selectedIndex
        : last
        ? enabled.at(-1) ?? -1
        : enabled[0] ?? -1
    );
    setOpen(true);
  }

  function choose(index: number) {
    const option = options[index];
    if (!option || option.disabled) return;
    onValueChange(String(option.value));
    setOpen(false);
    trigger.current?.focus({ preventScroll: true });
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "Escape" && isOpen) {
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
      return;
    }
    if (event.key === "Tab") {
      setOpen(false);
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (isOpen) choose(activeIndex);
      else openMenu();
      return;
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!isOpen) {
        openMenu(event.key === "ArrowUp");
        return;
      }
      const current = enabled.indexOf(activeIndex);
      const direction = event.key === "ArrowDown" ? 1 : -1;
      setActiveIndex(enabled[(current + direction + enabled.length) % enabled.length] ?? -1);
      return;
    }
    if (isOpen && (event.key === "Home" || event.key === "End")) {
      event.preventDefault();
      setActiveIndex(event.key === "Home" ? enabled[0] ?? -1 : enabled.at(-1) ?? -1);
      return;
    }
    if (event.key.length === 1 && !event.ctrlKey && !event.altKey && !event.metaKey) {
      event.preventDefault();
      const now = Date.now();
      const previous = now - typeahead.current.time < 600 ? typeahead.current.text : "";
      const text = previous + event.key.toLocaleLowerCase();
      typeahead.current = { text, time: now };
      const repeated = text.split("").every((character) => character === text[0]);
      const search = repeated ? text[0] : text;
      const start = isOpen ? activeIndex : selectedIndex;
      const matches = [
        ...enabled.filter((index) => index > start),
        ...enabled.filter((index) => index <= start),
      ];
      const match = matches.find((index) =>
        options[index].label.toLocaleLowerCase().startsWith(search)
      );
      if (match !== undefined) {
        if (isOpen) setActiveIndex(match);
        else onValueChange(String(options[match].value));
      }
    }
  }

  useEffect(() => {
    if (!isOpen) return;
    function outside(event: PointerEvent) {
      const target = event.target as Node;
      if (!trigger.current?.contains(target) && !menu.current?.contains(target)) setOpen(false);
    }
    const button = trigger.current;
    function escape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
    }
    document.addEventListener("pointerdown", outside);
    button?.addEventListener("keydown", escape, true);
    return () => {
      document.removeEventListener("pointerdown", outside);
      button?.removeEventListener("keydown", escape, true);
    };
  }, [isOpen]);

  useLayoutEffect(() => {
    if (!isOpen) return;
    function positionMenu() {
      const button = trigger.current;
      const popup = menu.current;
      if (!button || !popup) return;
      const rect = button.getBoundingClientRect();
      const viewport = document.documentElement.clientWidth;
      const width = Math.min(Math.max(rect.width, 200), viewport - 16);
      const below = window.innerHeight - rect.bottom - 12;
      const above = rect.top - 12;
      const desired = Math.min(popup.scrollHeight, 288);
      const upward = below < desired && above > below;
      const height = Math.min(288, Math.max(48, upward ? above : below));
      popup.style.width = `${width}px`;
      popup.style.maxHeight = `${height}px`;
      popup.style.left = `${Math.max(8, Math.min(rect.left, viewport - width - 8))}px`;
      popup.style.top = `${
        upward ? Math.max(8, rect.top - Math.min(popup.scrollHeight, height) - 6) : rect.bottom + 6
      }px`;
      popup.style.visibility = "visible";
    }
    positionMenu();
    window.addEventListener("resize", positionMenu);
    window.addEventListener("scroll", positionMenu, true);
    return () => {
      window.removeEventListener("resize", positionMenu);
      window.removeEventListener("scroll", positionMenu, true);
    };
  }, [isOpen, options]);

  useLayoutEffect(() => {
    if (!isOpen || activeIndex < 0) return;
    const popup = menu.current;
    const option = document.getElementById(`${menuId}-${activeIndex}`);
    if (!popup || !option) return;
    if (option.offsetTop < popup.scrollTop) popup.scrollTop = option.offsetTop;
    else if (option.offsetTop + option.offsetHeight > popup.scrollTop + popup.clientHeight) {
      popup.scrollTop = option.offsetTop + option.offsetHeight - popup.clientHeight;
    }
  }, [isOpen, activeIndex, menuId]);

  return (
    <div className={clsx("min-w-0", className)}>
      {name && <input type="hidden" name={name} value={value ?? ""} disabled={disabled} />}
      <button
        ref={trigger}
        id={triggerId}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={isOpen ? menuId : undefined}
        aria-activedescendant={isOpen && activeIndex >= 0 ? `${menuId}-${activeIndex}` : undefined}
        aria-label={ariaLabel}
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        aria-required={required || undefined}
        aria-invalid={invalid || undefined}
        disabled={disabled}
        onClick={() => {
          if (isOpen) setOpen(false);
          else openMenu();
        }}
        onKeyDown={handleKeyDown}
        className={clsx(
          "flex w-full min-w-0 items-center justify-between gap-2 text-left text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand-orange/30 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400",
          variant === "plain"
            ? "rounded-md bg-transparent text-gray-700"
            : "rounded-lg border bg-white shadow-sm hover:border-orange-300",
          variant !== "plain" &&
            (invalid
              ? "border-red-400 text-gray-900"
              : isOpen
              ? "border-brand-orange text-brand-navy"
              : "border-gray-200 text-gray-900"),
          compact ? "px-3 py-2" : variant === "plain" ? "px-1 py-0.5" : "px-3.5 py-2.5"
        )}
      >
        <span className={clsx("min-w-0 truncate", !selected && "text-gray-400")}>
          {selected?.label ?? placeholder}
        </span>
        <FiChevronDown
          aria-hidden="true"
          className={clsx(
            "h-4 w-4 shrink-0 text-gray-400 transition-transform",
            isOpen && "rotate-180 text-brand-orange"
          )}
        />
      </button>
      {isOpen &&
        createPortal(
          <div
            ref={menu}
            id={menuId}
            role="listbox"
            aria-label={ariaLabel ?? "Options"}
            aria-labelledby={labelledBy}
            className="fixed z-[1000] overflow-y-auto overscroll-contain rounded-xl border border-gray-200 bg-white p-1.5 text-sm text-gray-700 shadow-[0_8px_30px_rgba(21,33,61,0.14)]"
            style={{ visibility: "hidden" }}
          >
            {options.length === 0 ? (
              <p className="px-3 py-2.5 text-gray-400">No options available</p>
            ) : (
              options.map((option, index) => (
                <div
                  key={String(option.value)}
                  id={`${menuId}-${index}`}
                  role="option"
                  aria-selected={index === selectedIndex}
                  aria-disabled={option.disabled || undefined}
                  onMouseDown={(event) => event.preventDefault()}
                  onMouseEnter={() => {
                    if (!option.disabled) setActiveIndex(index);
                  }}
                  onClick={() => choose(index)}
                  className={clsx(
                    "flex items-center justify-between gap-3 rounded-lg px-3 py-2.5",
                    option.disabled ? "cursor-not-allowed text-gray-300" : "cursor-pointer",
                    !option.disabled &&
                      (index === activeIndex
                        ? "bg-brand-peach text-brand-navy"
                        : index === selectedIndex
                        ? "bg-orange-50 text-brand-orange"
                        : "text-gray-700")
                  )}
                >
                  <span className="min-w-0 break-words">{option.label}</span>
                  {index === selectedIndex && (
                    <FiCheck aria-hidden="true" className="h-4 w-4 shrink-0 text-brand-orange" />
                  )}
                </div>
              ))
            )}
          </div>,
          document.body
        )}
    </div>
  );
}
