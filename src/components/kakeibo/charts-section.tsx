import { CategoryBars } from "@/components/kakeibo/category-bars";
import { MonthlyChart } from "@/components/kakeibo/monthly-chart";
import { formatYen } from "@/lib/kakeibo";
import type { CategoryTotal, TrendMonth } from "@/types/kakeibo";

type ChartsSectionProps = {
  balance: number;
  categoryTotals: CategoryTotal[];
  expense: number;
  income: number;
  trendData: TrendMonth[];
};

const colors = ["#2f6ebb", "#a9c978", "#353042", "#f6a13c", "#28a8cf", "#e94f87", "#d7893e", "#fb8b7e", "#5ab77a"];

export function ChartsSection({ balance, categoryTotals, expense, income, trendData }: ChartsSectionProps) {
  const total = Math.max(1, categoryTotals.reduce((sum, item) => sum + item.amount, 0));
  let cursor = 0;
  const gradient = categoryTotals.length
    ? categoryTotals
        .map((item, index) => {
          const start = cursor;
          cursor += (item.amount / total) * 100;
          return `${colors[index % colors.length]} ${start}% ${cursor}%`;
        })
        .join(", ")
    : "#eee5d8 0 100%";

  return (
    <section className="charts-page">
      <div className="donut-wrap">
        <div className="donut-chart" style={{ background: `conic-gradient(${gradient})` }}>
          <div>
            <span>支出</span>
            <strong>{formatYen(expense)}</strong>
          </div>
        </div>
      </div>
      <div className="chart-total-row">
        <span>合計</span>
        <strong>{formatYen(expense)}</strong>
      </div>
      <CategoryBars data={categoryTotals} colors={colors} />
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
