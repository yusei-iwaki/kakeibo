import { SummaryCard } from "@/components/kakeibo/summary-card";

type SummaryStripProps = {
  balance: number;
  expense: number;
  income: number;
};

export function SummaryStrip({ balance, expense, income }: SummaryStripProps) {
  return (
    <section className="-mx-3 flex snap-x gap-3 overflow-x-auto px-3 pb-1 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 md:pb-0">
      <SummaryCard label="収入" value={income} tone="income" />
      <SummaryCard label="支出" value={expense} tone="expense" />
      <SummaryCard label="差額" value={balance} tone={balance >= 0 ? "income" : "expense"} />
    </section>
  );
}
