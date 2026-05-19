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
    <form className="fixed-form" onSubmit={submitFixedCost}>
      <label className="input-row">
        <span>名称</span>
        <input
          value={fixedCostForm.name}
          onChange={(event) => setFixedCostForm((form) => ({ ...form, name: event.target.value }))}
          placeholder="家賃、サブスクなど"
        />
      </label>
      <label className="input-row">
        <span>金額</span>
        <input
          inputMode="numeric"
          min="0"
          value={fixedCostForm.amount || ""}
          onChange={(event) => setFixedCostForm((form) => ({ ...form, amount: Number(event.target.value) }))}
          type="number"
        />
      </label>
      <label className="input-row">
        <span>カテゴリ</span>
        <select
          value={fixedCostForm.category}
          onChange={(event) => setFixedCostForm((form) => ({ ...form, category: event.target.value }))}
        >
          {expenseCategories.map((category) => (
            <option key={category}>{category}</option>
          ))}
        </select>
      </label>
      <label className="input-row">
        <span>毎月の日付</span>
        <input
          inputMode="numeric"
          max="31"
          min="1"
          value={fixedCostForm.day}
          onChange={(event) => setFixedCostForm((form) => ({ ...form, day: Number(event.target.value) }))}
          type="number"
        />
      </label>
      <button className="save-button" type="submit">
        固定費を追加
      </button>
    </form>
  );
}
