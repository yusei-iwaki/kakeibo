import { CategoryBars } from "@/components/kakeibo/category-bars";
import { ChartPanel } from "@/components/kakeibo/chart-panel";
import { MonthlyChart } from "@/components/kakeibo/monthly-chart";
import type { CategoryTotal, TrendMonth } from "@/types/kakeibo";

type ChartsSectionProps = {
  categoryTotals: CategoryTotal[];
  trendData: TrendMonth[];
};

export function ChartsSection({ categoryTotals, trendData }: ChartsSectionProps) {
  return (
    <section className="grid gap-4">
      <ChartPanel title="直近6か月の収支" subtitle="収入・支出を月ごとに比較します。">
        <MonthlyChart data={trendData} />
      </ChartPanel>
      <ChartPanel title="今月の支出カテゴリ" subtitle="支出が大きいカテゴリから表示します。">
        <CategoryBars data={categoryTotals} />
      </ChartPanel>
    </section>
  );
}
