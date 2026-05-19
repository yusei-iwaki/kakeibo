import { useMemo, useState } from "react";
import { CalendarDayButton } from "@/components/kakeibo/calendar-day-button";
import { formatYen, weekdayLabels } from "@/lib/kakeibo";
import type { AppSection, CalendarDay, Transaction } from "@/types/kakeibo";

type CalendarSectionProps = {
  balance: number;
  calendarDays: CalendarDay[];
  editTransaction: (transaction: Transaction) => void;
  expense: number;
  income: number;
  monthTransactions: Transaction[];
  selectDate: (date: string) => void;
  selectedDate: string;
  setActiveSection: (section: AppSection) => void;
};

function formatDateHeader(date: string) {
  const parsed = new Date(`${date}T00:00:00`);
  return `${parsed.getMonth() + 1}月${parsed.getDate()}日`;
}

function formatModalDate(date: string) {
  const parsed = new Date(`${date}T00:00:00`);
  const weekday = weekdayLabels[parsed.getDay()];
  return `${parsed.getFullYear()}年${parsed.getMonth() + 1}月${parsed.getDate()}日(${weekday})`;
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
  setActiveSection,
}: CalendarSectionProps) {
  const [modalDate, setModalDate] = useState<string | null>(null);
  const modalTransactions = useMemo(
    () =>
      modalDate
        ? monthTransactions
            .filter((transaction) => transaction.date === modalDate)
            .sort((a, b) => b.id.localeCompare(a.id))
        : [],
    [modalDate, monthTransactions],
  );
  const modalIncome = modalTransactions
    .filter((transaction) => transaction.type === "income")
    .reduce((total, transaction) => total + transaction.amount, 0);
  const modalExpense = modalTransactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((total, transaction) => total + transaction.amount, 0);

  function openDateModal(date: string) {
    selectDate(date);
    setModalDate(date);
  }

  function startInput() {
    if (modalDate) selectDate(modalDate);
    setModalDate(null);
    setActiveSection("input");
  }

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
              selectDate={openDateModal}
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

      {modalDate ? (
        <div className="date-modal-backdrop" onClick={() => setModalDate(null)} role="presentation">
          <div className="date-modal-sheet" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true">
            <div className="modal-grabber" />
            <div className="date-modal-head">
              <div>
                <span>選択日</span>
                <h2>{formatModalDate(modalDate)}</h2>
              </div>
              <button onClick={() => setModalDate(null)} type="button" aria-label="閉じる">
                ×
              </button>
            </div>
            <div className="date-modal-summary">
              <div>
                <span>収入</span>
                <strong>{formatYen(modalIncome)}</strong>
              </div>
              <div>
                <span>支出</span>
                <strong>{formatYen(modalExpense)}</strong>
              </div>
              <div>
                <span>合計</span>
                <strong className={modalIncome - modalExpense >= 0 ? "income-text" : "expense-text"}>
                  {formatYen(modalIncome - modalExpense)}
                </strong>
              </div>
            </div>
            <div className="date-modal-list">
              {modalTransactions.length ? (
                modalTransactions.map((transaction) => (
                  <button
                    className="date-modal-row"
                    key={transaction.id}
                    onClick={() => {
                      setModalDate(null);
                      editTransaction(transaction);
                    }}
                    type="button"
                  >
                    <div>
                      <span>{transaction.category}</span>
                      <p>{transaction.memo || transaction.category}</p>
                    </div>
                    <strong className={transaction.type === "income" ? "income-text" : "expense-text"}>
                      {transaction.type === "income" ? "+" : ""}
                      {formatYen(transaction.amount)}
                    </strong>
                  </button>
                ))
              ) : (
                <p className="date-modal-empty">この日の入力はまだありません。</p>
              )}
            </div>
            <button className="date-modal-action" onClick={startInput} type="button">
              この日付で新規入力
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
