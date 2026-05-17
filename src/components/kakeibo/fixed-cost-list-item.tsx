import { formatYen } from "@/lib/kakeibo";
import type { FixedCost } from "@/types/kakeibo";

type FixedCostListItemProps = {
  cost: FixedCost;
  deleteFixedCost: (id: string) => void;
  toggleFixedCost: (id: string) => void;
};

export function FixedCostListItem({ cost, deleteFixedCost, toggleFixedCost }: FixedCostListItemProps) {
  return (
    <div className="rounded-2xl border border-[#eadfcd] bg-white/80 p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-bold">{cost.name}</p>
          <p className="text-sm text-[#78685c]">
            毎月{cost.day}日 / {cost.category} / {formatYen(cost.amount)}
          </p>
        </div>
        <span className={`rounded-full px-2 py-1 text-xs font-bold ${cost.enabled ? "bg-[#edf6e9] text-[#3d6e42]" : "bg-[#eee8df] text-[#887565]"}`}>
          {cost.enabled ? "有効" : "無効"}
        </span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button className="touch-button" onClick={() => toggleFixedCost(cost.id)} type="button">
          {cost.enabled ? "無効にする" : "有効にする"}
        </button>
        <button className="danger-button" onClick={() => deleteFixedCost(cost.id)} type="button">
          削除
        </button>
      </div>
    </div>
  );
}
