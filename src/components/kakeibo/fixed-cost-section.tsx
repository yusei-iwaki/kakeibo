import { Dispatch, FormEvent, SetStateAction } from "react";
import { FixedCostForm } from "@/components/kakeibo/fixed-cost-form";
import { FixedCostListItem } from "@/components/kakeibo/fixed-cost-list-item";
import type { FixedCost, FixedCostFormState } from "@/types/kakeibo";

type FixedCostSectionProps = {
  applyFixedCosts: () => void;
  deleteFixedCost: (id: string) => void;
  fixedCostForm: FixedCostFormState;
  fixedCosts: FixedCost[];
  setFixedCostForm: Dispatch<SetStateAction<FixedCostFormState>>;
  submitFixedCost: (event: FormEvent<HTMLFormElement>) => void;
  toggleFixedCost: (id: string) => void;
};

export function FixedCostSection({
  applyFixedCosts,
  deleteFixedCost,
  fixedCostForm,
  fixedCosts,
  setFixedCostForm,
  submitFixedCost,
  toggleFixedCost,
}: FixedCostSectionProps) {
  return (
    <section className="settings-page">
      <div className="settings-group">
        <button className="setting-row" onClick={applyFixedCosts} type="button">
          <span>固定費を今月に反映</span>
          <b>›</b>
        </button>
      </div>

      <FixedCostForm fixedCostForm={fixedCostForm} setFixedCostForm={setFixedCostForm} submitFixedCost={submitFixedCost} />

      <div className="fixed-cost-list">
        {fixedCosts.length ? (
          fixedCosts.map((cost) => (
            <FixedCostListItem
              cost={cost}
              deleteFixedCost={deleteFixedCost}
              key={cost.id}
              toggleFixedCost={toggleFixedCost}
            />
          ))
        ) : (
          <p className="empty-state">固定費はまだ登録されていません。</p>
        )}
      </div>
    </section>
  );
}
