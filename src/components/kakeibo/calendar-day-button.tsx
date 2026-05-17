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
      className={`min-h-16 rounded-xl border p-1.5 text-left transition active:scale-[0.98] ${
        day.date === selectedDate ? "border-[#c77a3d] bg-[#fff0d7]" : "border-[#eadfcd] bg-white/80"
      }`}
      onClick={() => selectDate(day.date)}
      type="button"
    >
      <span className="block text-xs font-bold">{day.day}</span>
      <span className="mt-1 flex gap-1">
        {day.income ? <i className="h-1.5 w-1.5 rounded-full bg-[#5c9278]" title={`収入 ${formatCompact(day.income)}`} /> : null}
        {day.expense ? <i className="h-1.5 w-1.5 rounded-full bg-[#d4825a]" title={`支出 ${formatCompact(day.expense)}`} /> : null}
      </span>
    </button>
  );
}
