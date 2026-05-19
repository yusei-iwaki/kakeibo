import { formatYen } from "@/lib/kakeibo";
import type { CategoryTotal } from "@/types/kakeibo";

type CategoryBarsProps = {
  colors?: string[];
  data: CategoryTotal[];
  emptyMessage?: string;
};

export function CategoryBars({ colors = ["#d4825a"], data, emptyMessage = "今月の支出はまだありません。" }: CategoryBarsProps) {
  const maxValue = Math.max(1, ...data.map((item) => item.amount));

  if (!data.length) {
    return <p className="empty-state">{emptyMessage}</p>;
  }

  return (
    <div className="category-list">
      {data.map((item, index) => (
        <div className="category-row" key={item.category}>
          <i style={{ background: colors[index % colors.length] }} />
          <span>{item.category}</span>
          <div>
            <b style={{ width: `${Math.max(4, (item.amount / maxValue) * 100)}%`, background: colors[index % colors.length] }} />
          </div>
          <strong>{formatYen(item.amount)}</strong>
        </div>
      ))}
    </div>
  );
}
