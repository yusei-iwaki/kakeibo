import { formatYen } from "@/lib/kakeibo";
import type { CategoryTotal } from "@/types/kakeibo";

type CategoryBarsProps = {
  data: CategoryTotal[];
};

export function CategoryBars({ data }: CategoryBarsProps) {
  const maxValue = Math.max(1, ...data.map((item) => item.amount));

  if (!data.length) {
    return <p className="rounded-2xl border border-dashed border-[#d8c8af] p-4 text-sm text-[#78685c]">今月の支出はまだありません。</p>;
  }

  return (
    <div className="grid gap-3">
      {data.map((item) => (
        <div key={item.category}>
          <div className="mb-1 flex justify-between gap-3 text-sm">
            <span className="font-bold">{item.category}</span>
            <span className="text-[#78685c]">{formatYen(item.amount)}</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-[#eadfcd]">
            <div className="h-full rounded-full bg-[#d4825a]" style={{ width: `${Math.max(4, (item.amount / maxValue) * 100)}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
