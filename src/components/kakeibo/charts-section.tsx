import { useState } from "react";
import { CategoryBars } from "@/components/kakeibo/category-bars";
import { MonthlyChart } from "@/components/kakeibo/monthly-chart";
import { formatYen } from "@/lib/kakeibo";
import type { CategoryTotal, TransactionType, TrendMonth } from "@/types/kakeibo";

type ChartsSectionProps = {
  balance: number;
  expenseCategoryTotals: CategoryTotal[];
  expense: number;
  income: number;
  incomeCategoryTotals: CategoryTotal[];
  trendData: TrendMonth[];
};

const colors = ["#2f6ebb", "#a9c978", "#353042", "#f6a13c", "#28a8cf", "#e94f87", "#d7893e", "#fb8b7e", "#5ab77a"];
const incomeColors = ["#2f8f70", "#63b476", "#9bc86e", "#46a6a5", "#357ec7", "#8aa1d9"];

export function ChartsSection({ balance, expenseCategoryTotals, expense, income, incomeCategoryTotals, trendData }: ChartsSectionProps) {
  const [chartType, setChartType] = useState<TransactionType>("expense");
  const categoryTotals = chartType === "expense" ? expenseCategoryTotals : incomeCategoryTotals;
  const activeTotal = chartType === "expense" ? expense : income;
  const activeColors = chartType === "expense" ? colors : incomeColors;
  const total = Math.max(1, categoryTotals.reduce((sum, item) => sum + item.amount, 0));
  let cursor = 0;
  const gradient = categoryTotals.length
    ? categoryTotals
        .map((item, index) => {
          const start = cursor;
          cursor += (item.amount / total) * 100;
          return `${activeColors[index % activeColors.length]} ${start}% ${cursor}%`;
        })
        .join(", ")
    : "#eee5d8 0 100%";

  return (
    <section className="charts-page">
      <div className="chart-mode-control">
        {(["expense", "income"] as const).map((type) => (
          <button
            className={chartType === type ? "active" : ""}
            key={type}
            onClick={() => setChartType(type)}
            type="button"
          >
            {type === "expense" ? "支出" : "収入"}
          </button>
        ))}
      </div>
      <div className="donut-wrap">
        <div className="donut-chart" style={{ background: `conic-gradient(${gradient})` }}>
          <div>
            <span>{chartType === "expense" ? "支出" : "収入"}</span>
            <strong>{formatYen(activeTotal)}</strong>
          </div>
        </div>
      </div>
      <div className="chart-total-row">
        <span>合計</span>
        <strong>{formatYen(activeTotal)}</strong>
      </div>
      <CategoryBars
        data={categoryTotals}
        colors={activeColors}
        emptyMessage={chartType === "expense" ? "今月の支出はまだありません。" : "今月の収入はまだありません。"}
      />
      <div className="mini-summary-grid">
        <div>
          <span>収入</span>
          <strong>{formatYen(income)}</strong>
        </div>
        <div>
          <span>残高</span>
          <strong>{formatYen(balance)}</strong>
        </div>
      </div>
      <MonthlyChart data={trendData} />
    </section>
  );
}
