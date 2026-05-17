import { CalendarDayButton } from "@/components/kakeibo/calendar-day-button";
import { weekdayLabels } from "@/lib/kakeibo";
import type { AppSection, CalendarDay } from "@/types/kakeibo";

type CalendarSectionProps = {
  calendarDays: CalendarDay[];
  currentMonth: string;
  moveMonth: (offset: number) => void;
  selectDate: (date: string) => void;
  selectedDate: string;
  setActiveSection: (section: AppSection) => void;
};

export function CalendarSection({ calendarDays, currentMonth, moveMonth, selectDate, selectedDate, setActiveSection }: CalendarSectionProps) {
  return (
    <section className="rounded-[22px] border border-[#eadfcd] bg-[#fffaf2]/90 p-3 shadow-sm">
      <div className="mb-3 grid gap-3">
        <div>
          <h2 className="text-lg font-bold">カレンダー</h2>
          <p className="text-xs text-[#78685c]">日付を選ぶと入力画面へ移動できます。</p>
        </div>
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <button className="touch-button" onClick={() => moveMonth(-1)} type="button">
            前月
          </button>
          <strong className="min-w-24 text-center text-base">{currentMonth}</strong>
          <button className="touch-button" onClick={() => moveMonth(1)} type="button">
            翌月
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-[#9a7d5d]">
        {weekdayLabels.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) =>
          day ? (
            <CalendarDayButton
              day={day}
              key={day.date}
              selectedDate={selectedDate}
              selectDate={(date) => {
                selectDate(date);
                setActiveSection("input");
              }}
            />
          ) : (
            <div key={`blank-${index}`} />
          ),
        )}
      </div>
    </section>
  );
}
