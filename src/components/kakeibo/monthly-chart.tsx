import type { TrendMonth } from "@/types/kakeibo";

type MonthlyChartProps = {
  data: TrendMonth[];
};

export function MonthlyChart({ data }: MonthlyChartProps) {
  const maxValue = Math.max(1, ...data.flatMap((item) => [item.income, item.expense]));

  return (
    <div className="grid gap-3">
      <div className="h-56 rounded-2xl bg-white/80 p-3">
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
      <div className="flex gap-4 text-sm font-semibold text-[#78685c]">
        <span className="inline-flex items-center gap-2"><i className="h-3 w-3 rounded-full bg-[#6f8f68]" />収入</span>
        <span className="inline-flex items-center gap-2"><i className="h-3 w-3 rounded-full bg-[#d4825a]" />支出</span>
      </div>
    </div>
  );
}
