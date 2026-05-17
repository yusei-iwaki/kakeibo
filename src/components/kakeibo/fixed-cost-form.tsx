import { Dispatch, FormEvent, SetStateAction } from "react";
import { expenseCategories } from "@/lib/kakeibo";
import type { FixedCostFormState } from "@/types/kakeibo";

type FixedCostFormProps = {
  fixedCostForm: FixedCostFormState;
  setFixedCostForm: Dispatch<SetStateAction<FixedCostFormState>>;
  submitFixedCost: (event: FormEvent<HTMLFormElement>) => void;
};

export function FixedCostForm({ fixedCostForm, setFixedCostForm, submitFixedCost }: FixedCostFormProps) {
  return (
    <form className="grid gap-3 rounded-2xl bg-[#f7efe3] p-3" onSubmit={submitFixedCost}>
      <label className="grid gap-1 text-sm font-semibold">
        名称
        <input
          className="field-control"
          value={fixedCostForm.name}
          onChange={(event) => setFixedCostForm((form) => ({ ...form, name: event.target.value }))}
          placeholder="家賃、サブスクなど"
        />
      </label>
      <label className="grid gap-1 text-sm font-semibold">
        金額
        <input
          className="field-control"
          inputMode="numeric"
          min="0"
          value={fixedCostForm.amount || ""}
          onChange={(event) => setFixedCostForm((form) => ({ ...form, amount: Number(event.target.value) }))}
          type="number"
        />
      </label>
      <label className="grid gap-1 text-sm font-semibold">
        カテゴリ
        <select
          className="field-control"
          value={fixedCostForm.category}
          onChange={(event) => setFixedCostForm((form) => ({ ...form, category: event.target.value }))}
        >
          {expenseCategories.map((category) => (
            <option key={category}>{category}</option>
          ))}
        </select>
      </label>
      <label className="grid gap-1 text-sm font-semibold">
        毎月の日付
        <input
          className="field-control"
          inputMode="numeric"
          max="31"
          min="1"
          value={fixedCostForm.day}
          onChange={(event) => setFixedCostForm((form) => ({ ...form, day: Number(event.target.value) }))}
          type="number"
        />
      </label>
      <button className="primary-action bg-[#342820] hover:bg-[#514034]" type="submit">
        固定費を追加
      </button>
    </form>
  );
}
