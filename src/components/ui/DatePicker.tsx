"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { FiCalendar, FiChevronLeft, FiChevronRight, FiX } from "react-icons/fi";
import clsx from "clsx";
import Select from "@/components/ui/Select";
import { addCalendarDays, addCalendarMonths, formatCalendarDate, parseCalendarDate } from "@/lib/calendar";

export interface DatePickerProps {
  value: string;
  onValueChange: (value: string) => void;
  id?: string;
  name?: string;
  required?: boolean;
  invalid?: boolean;
  disabled?: boolean;
  label?: string;
  placeholder?: string;
  emptyHelpText?: string;
  maxDate?: string;
}

const months = Array.from({ length: 12 }, (_, month) => ({
  value: String(month),
  label: new Intl.DateTimeFormat("en", { month: "long" }).format(new Date(2000, month, 1)),
}));
const weekdays = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const weekdayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const dateLabel = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });
const fullDateLabel = new Intl.DateTimeFormat("en-GB", {
  weekday: "long", day: "numeric", month: "long", year: "numeric",
});

export default function DatePicker({
  value, onValueChange, id, name = "date", required = false, invalid = false, disabled = false,
  label = "Date", placeholder = "Select date", emptyHelpText = "Choose a date", maxDate,
}: DatePickerProps) {
  const generatedId = useId();
  const pickerId = id || `date-${generatedId}`;
  const popupId = `${pickerId}-calendar`;
  const trigger = useRef<HTMLButtonElement>(null);
  const popup = useRef<HTMLDivElement>(null);
  const focusDay = useRef(false);
  const [open, setOpen] = useState(false);
  const [activeDate, setActiveDate] = useState("");
  const [view, setView] = useState("");
  const isOpen = open && !disabled;
  const selected = parseCalendarDate(value);
  const today = new Date();
  const todayValue = formatCalendarDate(today);
  const maximum = parseCalendarDate(maxDate || "");
  const maximumValue = maximum ? formatCalendarDate(maximum) : undefined;
  const month = parseCalendarDate(view) || selected || today;
  const visibleMonth = month.getMonth();
  const visibleYear = month.getFullYear();
  const first = new Date(month);
  first.setDate(1);
  const start = addCalendarDays(first, -((first.getDay() + 6) % 7));
  const days = Array.from({ length: 42 }, (_, index) => addCalendarDays(start, index));
  const firstYear = Math.min(today.getFullYear() - 120, visibleYear, selected?.getFullYear() ?? visibleYear);
  const lastYear = maximum?.getFullYear() ?? Math.max(today.getFullYear() + 10, visibleYear, selected?.getFullYear() ?? visibleYear);
  const years = Array.from({ length: lastYear - firstYear + 1 }, (_, index) => {
    const year = String(lastYear - index);
    return { value: year, label: year };
  });

  function showCalendar() {
    const candidate = selected || today;
    const date = maximum && formatCalendarDate(candidate) > maximumValue! ? maximum : candidate;
    const firstDay = new Date(date);
    firstDay.setDate(1);
    setView(formatCalendarDate(firstDay));
    setActiveDate(formatCalendarDate(date));
    focusDay.current = true;
    setOpen(true);
  }

  function closeCalendar() {
    setOpen(false);
    trigger.current?.focus({ preventScroll: true });
  }

  function choose(date: Date) {
    const next = formatCalendarDate(date);
    if (maximumValue && next > maximumValue) return;
    onValueChange(next);
    closeCalendar();
  }

  function moveTo(date: Date, moveFocus = false) {
    if (maximum && formatCalendarDate(date) > maximumValue!) date = maximum;
    setActiveDate(formatCalendarDate(date));
    const firstDay = new Date(date);
    firstDay.setDate(1);
    setView(formatCalendarDate(firstDay));
    focusDay.current = moveFocus;
  }

  function handleDayKey(event: KeyboardEvent<HTMLButtonElement>, date: Date) {
    let next: Date;
    switch (event.key) {
      case "ArrowLeft": next = addCalendarDays(date, -1); break;
      case "ArrowRight": next = addCalendarDays(date, 1); break;
      case "ArrowUp": next = addCalendarDays(date, -7); break;
      case "ArrowDown": next = addCalendarDays(date, 7); break;
      case "Home": next = addCalendarDays(date, -((date.getDay() + 6) % 7)); break;
      case "End": next = addCalendarDays(date, 6 - ((date.getDay() + 6) % 7)); break;
      case "PageUp": next = addCalendarMonths(date, event.shiftKey ? -12 : -1); break;
      case "PageDown": next = addCalendarMonths(date, event.shiftKey ? 12 : 1); break;
      default: return;
    }
    event.preventDefault();
    moveTo(next, true);
  }

  function handlePopupKey(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      closeCalendar();
    }
    if (event.key === "Tab") {
      const controls = Array.from(popup.current?.querySelectorAll<HTMLButtonElement>(
        'button:not([disabled]):not([tabindex="-1"])',
      ) || []);
      if (event.shiftKey && document.activeElement === controls[0]) {
        event.preventDefault();
        closeCalendar();
      } else if (!event.shiftKey && document.activeElement === controls.at(-1)) {
        // Continue from the field into the next form control despite the body portal.
        closeCalendar();
      }
    }
  }

  useEffect(() => {
    if (!isOpen) return;
    function outside(event: Event) {
      const target = event.target as Node;
      const inside = trigger.current?.contains(target) || popup.current?.contains(target) ||
        document.getElementById(`${pickerId}-month-options`)?.contains(target) ||
        document.getElementById(`${pickerId}-year-options`)?.contains(target);
      if (!inside) setOpen(false);
    }
    document.addEventListener("pointerdown", outside);
    document.addEventListener("focusin", outside);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("focusin", outside);
    };
  }, [isOpen, pickerId]);

  useLayoutEffect(() => {
    if (!isOpen) return;
    function position() {
      const field = trigger.current;
      const calendar = popup.current;
      if (!field || !calendar) return;
      const rect = field.getBoundingClientRect();
      const width = Math.min(320, document.documentElement.clientWidth - 16);
      calendar.style.width = `${width}px`;
      calendar.style.maxHeight = `${window.innerHeight - 16}px`;
      const height = Math.min(calendar.scrollHeight, window.innerHeight - 16);
      const below = window.innerHeight - rect.bottom - 8;
      const above = rect.top - 8;
      const top = below < height && above > below ? rect.top - height - 6 : rect.bottom + 6;
      calendar.style.left = `${Math.max(8, Math.min(rect.left, document.documentElement.clientWidth - width - 8))}px`;
      calendar.style.top = `${Math.max(8, Math.min(top, window.innerHeight - height - 8))}px`;
      calendar.style.visibility = "visible";
    }
    position();
    window.addEventListener("resize", position);
    window.addEventListener("scroll", position, true);
    return () => {
      window.removeEventListener("resize", position);
      window.removeEventListener("scroll", position, true);
    };
  }, [isOpen, view]);

  useLayoutEffect(() => {
    if (!isOpen || !focusDay.current) return;
    focusDay.current = false;
    popup.current?.querySelector<HTMLButtonElement>(`button[data-date="${activeDate}"]`)?.focus({ preventScroll: true });
  }, [isOpen, activeDate, view]);

  const arrowClass = "flex h-8 w-7 shrink-0 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-orange-50 hover:text-brand-orange disabled:cursor-not-allowed disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange";

  return (
    <div className="min-w-0">
      <input type="hidden" name={name} value={value} disabled={disabled} />
      <button
        ref={trigger}
        id={pickerId}
        type="button"
        role="combobox"
        aria-label={label}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls={isOpen ? popupId : undefined}
        aria-required={required || undefined}
        aria-invalid={invalid || undefined}
        disabled={disabled}
        onClick={() => isOpen ? closeCalendar() : showCalendar()}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") { event.preventDefault(); showCalendar(); }
        }}
        className={clsx(
          "flex w-full min-w-0 items-center justify-between gap-2 rounded-lg border bg-white px-3.5 py-2.5 text-left text-sm shadow-sm outline-none transition-colors hover:border-orange-300 focus-visible:ring-2 focus-visible:ring-brand-orange/30 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400",
          invalid ? "border-red-400 text-gray-900" : isOpen ? "border-brand-orange text-brand-navy" : "border-gray-200 text-gray-900",
        )}
      >
        <span className={clsx("min-w-0 truncate", !selected && "text-gray-400")}>
          {selected ? dateLabel.format(selected) : placeholder}
        </span>
        <FiCalendar aria-hidden="true" className={clsx("h-4 w-4 shrink-0", isOpen ? "text-brand-orange" : "text-gray-400")} />
      </button>

      {isOpen && createPortal(
        <div
          ref={popup}
          id={popupId}
          role="dialog"
          aria-label={`Choose ${label.toLowerCase()}`}
          aria-describedby={`${popupId}-help`}
          onKeyDown={handlePopupKey}
          className="fixed z-[1000] overflow-y-auto overscroll-contain rounded-2xl border border-gray-200 bg-white p-4 text-gray-700 shadow-[0_8px_30px_rgba(21,33,61,0.14)]"
          style={{ visibility: "hidden" }}
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <span className="flex items-center gap-2 text-sm font-semibold text-brand-navy">
              <FiCalendar aria-hidden="true" className="h-4 w-4 text-brand-orange" />
              {label}
            </span>
            <button type="button" aria-label="Close calendar" onClick={closeCalendar} className={arrowClass}>
              <FiX aria-hidden="true" className="h-4 w-4" />
            </button>
          </div>
          <div className="mb-3 flex items-center gap-1">
            <button type="button" aria-label="Previous month" className={arrowClass} onClick={() => moveTo(addCalendarMonths(month, -1))}>
              <FiChevronLeft aria-hidden="true" className="h-4 w-4" />
            </button>
            <Select id={`${pickerId}-month`} aria-label={`${label} month`} value={String(visibleMonth)} onValueChange={(value) => moveTo(addCalendarMonths(month, Number(value) - visibleMonth))} options={months.map((option) => ({ ...option, disabled: !!maximumValue && formatCalendarDate(new Date(visibleYear, Number(option.value), 1)) > maximumValue }))} compact className="min-w-0 flex-1" />
            <Select id={`${pickerId}-year`} aria-label={`${label} year`} value={String(visibleYear)} onValueChange={(value) => moveTo(addCalendarMonths(month, (Number(value) - visibleYear) * 12))} options={years} compact className="w-20 shrink-0 [&>button]:gap-1 [&>button]:px-2" />
            <button type="button" aria-label="Next month" disabled={!!maximumValue && formatCalendarDate(addCalendarMonths(first, 1)) > maximumValue} className={arrowClass} onClick={() => moveTo(addCalendarMonths(month, 1))}>
              <FiChevronRight aria-hidden="true" className="h-4 w-4" />
            </button>
          </div>
          <p id={`${popupId}-help`} className="sr-only">Use arrow keys to move by day or week. Page Up and Page Down change month. Enter selects a date. Escape closes the calendar.</p>
          <table role="grid" aria-label={`${months[visibleMonth].label} ${visibleYear}`} className="w-full table-fixed border-separate border-spacing-y-1 text-center text-xs">
            <thead>
              <tr>{weekdays.map((day, index) => <th key={day} scope="col" aria-label={weekdayNames[index]} className="pb-1 text-[11px] font-medium text-gray-400">{day}</th>)}</tr>
            </thead>
            <tbody>
              {Array.from({ length: 6 }, (_, week) => (
                <tr key={week}>
                  {days.slice(week * 7, week * 7 + 7).map((date) => {
                    const key = formatCalendarDate(date);
                    const isSelected = key === value;
                    return (
                      <td key={key} aria-selected={isSelected}>
                        <button
                          type="button"
                          data-date={key}
                          aria-label={fullDateLabel.format(date)}
                          aria-current={key === todayValue ? "date" : undefined}
                          disabled={!!maximumValue && key > maximumValue}
                          tabIndex={key === activeDate ? 0 : -1}
                          onFocus={() => setActiveDate(key)}
                          onClick={() => choose(date)}
                          onKeyDown={(event) => handleDayKey(event, date)}
                          className={clsx(
                            "mx-auto flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-30",
                            isSelected ? "bg-brand-orange text-white" : date.getMonth() !== visibleMonth ? "text-gray-400 hover:bg-orange-50 hover:text-brand-orange" : "text-brand-navy hover:bg-orange-50 hover:text-brand-orange",
                            key === todayValue && !isSelected && "border border-orange-200 bg-orange-50 font-semibold text-brand-orange",
                          )}
                        >
                          {date.getDate()}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
            <span className="text-[11px] text-gray-400">{selected ? dateLabel.format(selected) : emptyHelpText}</span>
            <button type="button" disabled={!value} onClick={() => { onValueChange(""); closeCalendar(); }} className="rounded px-2 py-1 text-xs font-semibold text-brand-orange hover:bg-orange-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange disabled:cursor-not-allowed disabled:text-gray-300">Clear date</button>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}
