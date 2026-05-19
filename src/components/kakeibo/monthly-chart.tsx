import type { TrendMonth } from "@/types/kakeibo";

type MonthlyChartProps = {
  data: TrendMonth[];
};

export function MonthlyChart({ data }: MonthlyChartProps) {
  const maxValue = Math.max(1, ...data.flatMap((item) => [item.income, item.expense]));

  return (
    <div className="monthly-chart-panel">
      <h2>直近6か月</h2>
      <div>
        <svg className="h-full w-full" role="img" viewBox="0 0 600 260">
          {data.map((item, index) => {
            const groupX = 24 + index * 94;
            const incomeHeight = (item.income / maxValue) * 170;
            const expenseHeight = (item.expense / maxValue) * 170;
            return (
              <g key={item.month}>
                <rect fill="#6f8f68" height={incomeHeight} rx="8" width="26" x={groupX} y={200 - incomeHeight} />
                <rect fill="#d4825a" height={expenseHeight} rx="8" width="26" x={groupX + 32} y={200 - expenseHeight} />
                <text fill="#7b6b5f" fontSize="12" textAnchor="middle" x={groupX + 29} y="228">
                  {item.month.slice(5)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="chart-legend">
        <span><i className="income-dot" />収入</span>
        <span><i className="expense-dot" />支出</span>
      </div>
    </div>
  );
}
