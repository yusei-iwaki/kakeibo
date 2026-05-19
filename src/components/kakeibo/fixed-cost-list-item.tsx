import { formatYen } from "@/lib/kakeibo";
import type { FixedCost } from "@/types/kakeibo";

type FixedCostListItemProps = {
  cost: FixedCost;
  deleteFixedCost: (id: string) => void;
  toggleFixedCost: (id: string) => void;
};

export function FixedCostListItem({ cost, deleteFixedCost, toggleFixedCost }: FixedCostListItemProps) {
  return (
    <div className="fixed-cost-item">
      <div>
        <div>
          <p>{cost.name}</p>
          <span>
            毎月{cost.day}日 / {cost.category} / {formatYen(cost.amount)}
          </span>
        </div>
        <button className={`toggle-pill ${cost.enabled ? "active" : ""}`} onClick={() => toggleFixedCost(cost.id)} type="button">
          {cost.enabled ? "有効" : "無効"}
        </button>
      </div>
      <button className="delete-chip" onClick={() => deleteFixedCost(cost.id)} type="button">
        削除
      </button>
    </div>
  );
}
