import { formatCompact } from "@/lib/kakeibo";
import type { CalendarDay } from "@/types/kakeibo";

type CalendarDayButtonProps = {
  day: NonNullable<CalendarDay>;
  selectedDate: string;
  selectDate: (date: string) => void;
};

export function CalendarDayButton({ day, selectedDate, selectDate }: CalendarDayButtonProps) {
  return (
    <button
      className={`calendar-day ${day.date === selectedDate ? "active" : ""}`}
      onClick={() => selectDate(day.date)}
      type="button"
    >
      <span>{day.day}</span>
      <span>
        {day.expense ? <b>{formatCompact(day.expense)}</b> : null}
        {day.income ? <i>{formatCompact(day.income)}</i> : null}
      </span>
    </button>
  );
}
