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
    <section className="rounded-[22px] border border-[#eadfcd] bg-[#fffaf2]/90 p-4 shadow-sm">
      <div className="mb-4 grid gap-3">
        <div>
          <h2 className="text-lg font-bold">固定費</h2>
          <p className="text-sm text-[#78685c]">登録済みの固定費は、今月分に反映すると既存分も更新されます。</p>
        </div>
        <button className="primary-action bg-[#6f8f68] hover:bg-[#5d7d56]" onClick={applyFixedCosts} type="button">
          今月に反映
        </button>
      </div>

      <FixedCostForm fixedCostForm={fixedCostForm} setFixedCostForm={setFixedCostForm} submitFixedCost={submitFixedCost} />

      <div className="mt-4 grid gap-2">
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
          <p className="rounded-2xl border border-dashed border-[#d8c8af] p-4 text-sm text-[#78685c]">
            固定費はまだ登録されていません。
          </p>
        )}
      </div>
    </section>
  );
}
