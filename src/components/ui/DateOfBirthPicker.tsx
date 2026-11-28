"use client";

import DatePicker, { type DatePickerProps } from "@/components/ui/DatePicker";
import { formatCalendarDate } from "@/lib/calendar";

type DateOfBirthPickerProps = Omit<DatePickerProps, "maxDate" | "label" | "emptyHelpText">;

export default function DateOfBirthPicker(props: DateOfBirthPickerProps) {
  return (
    <DatePicker
      {...props}
      name={props.name ?? "date_of_birth"}
      label="Date of Birth"
      emptyHelpText="Select your birthday"
      maxDate={formatCalendarDate(new Date())}
    />
  );
}
