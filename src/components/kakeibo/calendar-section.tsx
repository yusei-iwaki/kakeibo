import { CalendarDayButton } from "@/components/kakeibo/calendar-day-button";
import { formatYen, weekdayLabels } from "@/lib/kakeibo";
import type { CalendarDay, Transaction } from "@/types/kakeibo";

type CalendarSectionProps = {
  balance: number;
  calendarDays: CalendarDay[];
  editTransaction: (transaction: Transaction) => void;
  expense: number;
  income: number;
  monthTransactions: Transaction[];
  selectDate: (date: string) => void;
  selectedDate: string;
};

function formatDateHeader(date: string) {
  const parsed = new Date(`${date}T00:00:00`);
  return `${parsed.getMonth() + 1}月${parsed.getDate()}日`;
}

export function CalendarSection({
  balance,
  calendarDays,
  editTransaction,
  expense,
  income,
  monthTransactions,
  selectDate,
  selectedDate,
}: CalendarSectionProps) {
  return (
    <section className="calendar-page">
      <div className="weekday-row">
        {weekdayLabels.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
      <div className="calendar-grid">
        {calendarDays.map((day, index) =>
          day ? (
            <CalendarDayButton
              day={day}
              key={day.date}
              selectedDate={selectedDate}
              selectDate={selectDate}
            />
          ) : (
            <div className="calendar-blank" key={`blank-${index}`} />
          ),
        )}
      </div>
      <div className="month-summary">
        <div>
          <span>収入</span>
          <strong>{formatYen(income)}</strong>
        </div>
        <div>
          <span>支出</span>
          <strong>{formatYen(expense)}</strong>
        </div>
        <div>
          <span>合計</span>
          <strong>{formatYen(balance)}</strong>
        </div>
      </div>
      <div className="calendar-ledger">
        {monthTransactions.length ? (
          monthTransactions.map((transaction, index) => {
            const prev = monthTransactions[index - 1];
            const showHeader = !prev || prev.date !== transaction.date;
            return (
              <div key={transaction.id}>
                {showHeader ? <div className="date-strip">{formatDateHeader(transaction.date)}</div> : null}
                <button className="ledger-row" onClick={() => editTransaction(transaction)} type="button">
                  <span>{transaction.memo || transaction.category}</span>
                  <strong className={transaction.type === "income" ? "income-text" : "expense-text"}>
                    {transaction.type === "income" ? "+" : ""}
                    {formatYen(transaction.amount)}
                  </strong>
                </button>
              </div>
            );
          })
        ) : (
          <p className="empty-state">この月の明細はまだありません。</p>
        )}
      </div>
    </section>
  );
}
