"use client";

import { CalendarSection } from "@/components/kakeibo/calendar-section";
import { ChartsSection } from "@/components/kakeibo/charts-section";
import { FixedCostSection } from "@/components/kakeibo/fixed-cost-section";
import { KakeiboHeader } from "@/components/kakeibo/kakeibo-header";
import { SectionTabs } from "@/components/kakeibo/section-tabs";
import { SettingsSection } from "@/components/kakeibo/settings-section";
import { SummaryStrip } from "@/components/kakeibo/summary-strip";
import { Toast } from "@/components/kakeibo/toast";
import { TransactionSection } from "@/components/kakeibo/transaction-section";
import { useKakeibo } from "@/hooks/use-kakeibo";

type AppShellProps = {
  kakeibo: ReturnType<typeof useKakeibo>;
};

export function AppShell({ kakeibo }: AppShellProps) {
  return (
    <main className="min-h-screen px-3 pb-6 pt-3 text-[#342820] sm:px-6 sm:py-5 lg:px-8">
      <div className="mx-auto grid w-full max-w-5xl gap-4">
        <KakeiboHeader
          exportData={kakeibo.exportData}
          fileInputRef={kakeibo.fileInputRef}
          importData={kakeibo.importData}
          setActiveSection={kakeibo.setActiveSection}
        />
        <SummaryStrip balance={kakeibo.balance} expense={kakeibo.expense} income={kakeibo.income} />
        <SectionTabs activeSection={kakeibo.activeSection} setActiveSection={kakeibo.setActiveSection} />

        {kakeibo.activeSection === "input" ? (
          <TransactionSection
            cancelEdit={kakeibo.cancelEdit}
            deleteTransaction={kakeibo.deleteTransaction}
            editTransaction={kakeibo.editTransaction}
            editingTransactionId={kakeibo.editingTransactionId}
            selectedDate={kakeibo.selectedDate}
            selectedTransactions={kakeibo.selectedTransactions}
            submitTransaction={kakeibo.submitTransaction}
            transactionForm={kakeibo.transactionForm}
            updateTransactionForm={kakeibo.updateTransactionForm}
          />
        ) : null}

        {kakeibo.activeSection === "calendar" ? (
          <CalendarSection
            calendarDays={kakeibo.calendarDays}
            currentMonth={kakeibo.currentMonth}
            moveMonth={kakeibo.moveMonth}
            selectDate={kakeibo.selectDate}
            selectedDate={kakeibo.selectedDate}
            setActiveSection={kakeibo.setActiveSection}
          />
        ) : null}

        {kakeibo.activeSection === "charts" ? (
          <ChartsSection categoryTotals={kakeibo.categoryTotals} trendData={kakeibo.trendData} />
        ) : null}

        {kakeibo.activeSection === "fixed" ? (
          <FixedCostSection
            applyFixedCosts={kakeibo.applyFixedCosts}
            deleteFixedCost={kakeibo.deleteFixedCost}
            fixedCostForm={kakeibo.fixedCostForm}
            fixedCosts={kakeibo.fixedCosts}
            setFixedCostForm={kakeibo.setFixedCostForm}
            submitFixedCost={kakeibo.submitFixedCost}
            toggleFixedCost={kakeibo.toggleFixedCost}
          />
        ) : null}

        {kakeibo.activeSection === "settings" ? (
          <SettingsSection
            exportData={kakeibo.exportData}
            fileInputRef={kakeibo.fileInputRef}
            importData={kakeibo.importData}
          />
        ) : null}
      </div>
      <Toast toast={kakeibo.toast} />
    </main>
  );
}
