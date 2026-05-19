"use client";

import { CalendarSection } from "@/components/kakeibo/calendar-section";
import { ChartsSection } from "@/components/kakeibo/charts-section";
import { FixedCostSection } from "@/components/kakeibo/fixed-cost-section";
import { Toast } from "@/components/kakeibo/toast";
import { TransactionSection } from "@/components/kakeibo/transaction-section";
import { useKakeibo } from "@/hooks/use-kakeibo";
import type { AppSection, TransactionType } from "@/types/kakeibo";

type AppShellProps = {
  kakeibo: ReturnType<typeof useKakeibo>;
};

const tabs: { id: AppSection; icon: string; label: string }[] = [
  { id: "input", icon: "✎", label: "入力" },
  { id: "calendar", icon: "▣", label: "カレンダー" },
  { id: "charts", icon: "◔", label: "グラフ" },
  { id: "settings", icon: "⚙", label: "設定" },
];

function formatMonth(month: string) {
  const [year, value] = month.split("-");
  return `${year}年${value}月`;
}

function PageHeader({ kakeibo }: AppShellProps) {
  const titleMap: Record<AppSection, string> = {
    input: "入力",
    calendar: formatMonth(kakeibo.currentMonth),
    charts: formatMonth(kakeibo.currentMonth),
    settings: "設定",
  };

  function setType(type: TransactionType) {
    kakeibo.updateTransactionForm({ type, category: type === "expense" ? "食費" : "給与" });
  }

  return (
    <header className="app-header">
      <div className="header-content">
        {kakeibo.activeSection === "input" ? (
          <SegmentedControl
            value={kakeibo.transactionForm.type}
            items={[
              ["expense", "支出"],
              ["income", "収入"],
            ]}
            onChange={(value) => setType(value as TransactionType)}
          />
        ) : null}

        {kakeibo.activeSection === "calendar" || kakeibo.activeSection === "charts" ? (
          <div className="month-header">
            <button className="icon-button" onClick={() => kakeibo.moveMonth(-1)} type="button" aria-label="前月">
              ‹
            </button>
            <div className="month-title">
              <h1>{titleMap[kakeibo.activeSection]}</h1>
              <span>{kakeibo.periodRangeLabel}</span>
            </div>
            <button className="icon-button" onClick={() => kakeibo.moveMonth(1)} type="button" aria-label="翌月">
              ›
            </button>
          </div>
        ) : null}

        {kakeibo.activeSection === "settings" ? <h1 className="plain-header-title">{titleMap.settings}</h1> : null}
      </div>
    </header>
  );
}

function SegmentedControl({
  items,
  onChange,
  value,
}: {
  items: [string, string][];
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <div className="segmented-control">
      {items.map(([id, label]) => (
        <button
          className={value === id ? "active" : ""}
          key={id}
          onClick={() => onChange(id)}
          type="button"
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export function AppShell({ kakeibo }: AppShellProps) {
  return (
    <main className="app-viewport">
      <div className="phone-shell">
        <PageHeader kakeibo={kakeibo} />
        <div className="screen-content">
          {kakeibo.activeSection === "input" ? (
            <TransactionSection
              cancelEdit={kakeibo.cancelEdit}
              deleteTransaction={kakeibo.deleteTransaction}
              editTransaction={kakeibo.editTransaction}
              editingTransactionId={kakeibo.editingTransactionId}
              selectedTransactions={kakeibo.selectedTransactions}
              submitTransaction={kakeibo.submitTransaction}
              transactionForm={kakeibo.transactionForm}
              updateTransactionForm={kakeibo.updateTransactionForm}
            />
          ) : null}

          {kakeibo.activeSection === "calendar" ? (
            <CalendarSection
              calendarDays={kakeibo.calendarDays}
              balance={kakeibo.balance}
              expense={kakeibo.expense}
              income={kakeibo.income}
              monthTransactions={kakeibo.monthTransactions}
              selectDate={kakeibo.selectDate}
              selectedDate={kakeibo.selectedDate}
              setActiveSection={kakeibo.setActiveSection}
              editTransaction={kakeibo.editTransaction}
            />
          ) : null}

          {kakeibo.activeSection === "charts" ? (
            <ChartsSection
              balance={kakeibo.balance}
              expenseCategoryTotals={kakeibo.expenseCategoryTotals}
              expense={kakeibo.expense}
              income={kakeibo.income}
              incomeCategoryTotals={kakeibo.incomeCategoryTotals}
              trendData={kakeibo.trendData}
            />
          ) : null}

          {kakeibo.activeSection === "settings" ? (
            <FixedCostSection
              applyFixedCosts={kakeibo.applyFixedCosts}
              deleteFixedCost={kakeibo.deleteFixedCost}
              fixedCostForm={kakeibo.fixedCostForm}
              fixedCosts={kakeibo.fixedCosts}
              monthStartDay={kakeibo.monthStartDay}
              periodRangeLabel={kakeibo.periodRangeLabel}
              setFixedCostForm={kakeibo.setFixedCostForm}
              submitFixedCost={kakeibo.submitFixedCost}
              toggleFixedCost={kakeibo.toggleFixedCost}
              updateMonthStartDay={kakeibo.updateMonthStartDay}
            />
          ) : null}
        </div>
        <nav className="bottom-tabs" aria-label="主要ページ">
          {tabs.map((tab) => (
            <button
              className={kakeibo.activeSection === tab.id ? "active" : ""}
              key={tab.id}
              onClick={() => kakeibo.setActiveSection(tab.id)}
              type="button"
            >
              <span aria-hidden="true">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      <Toast toast={kakeibo.toast} />
    </main>
  );
}
