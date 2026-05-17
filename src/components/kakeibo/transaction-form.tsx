import { FormEvent } from "react";
import { expenseCategories, incomeCategories } from "@/lib/kakeibo";
import type { TransactionFormState } from "@/types/kakeibo";

type TransactionFormProps = {
  cancelEdit: () => void;
  editingTransactionId: string | null;
  selectedDate: string;
  submitTransaction: (event: FormEvent<HTMLFormElement>) => void;
  transactionForm: TransactionFormState;
  updateTransactionForm: (nextForm: Partial<TransactionFormState>) => void;
};

export function TransactionForm({
  cancelEdit,
  editingTransactionId,
  selectedDate,
  submitTransaction,
  transactionForm,
  updateTransactionForm,
}: TransactionFormProps) {
  return (
    <form className="rounded-[22px] border border-[#eadfcd] bg-[#fffaf2]/90 p-4 shadow-sm" onSubmit={submitTransaction}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">{editingTransactionId ? "明細を編集" : "明細を入力"}</h2>
          <p className="text-sm text-[#78685c]">{selectedDate}</p>
        </div>
        {editingTransactionId ? (
          <button className="touch-button min-w-20" onClick={cancelEdit} type="button">
            解除
          </button>
        ) : null}
      </div>

      <div className="grid gap-3">
        <label className="grid gap-1 text-sm font-semibold">
          日付
          <input
            className="field-control"
            value={transactionForm.date}
            onChange={(event) => updateTransactionForm({ date: event.target.value })}
            type="date"
          />
        </label>

        <div className="grid grid-cols-2 gap-2 rounded-2xl bg-[#f2eadf] p-1">
          {(["expense", "income"] as const).map((type) => (
            <button
              className={`min-h-12 rounded-xl px-3 py-2 text-sm font-bold transition active:scale-[0.98] ${
                transactionForm.type === type ? "bg-white shadow-sm" : "text-[#806d5c]"
              }`}
              key={type}
              onClick={() => updateTransactionForm({ type, category: type === "expense" ? "食費" : "給与" })}
              type="button"
            >
              {type === "expense" ? "支出" : "収入"}
            </button>
          ))}
        </div>

        <label className="grid gap-1 text-sm font-semibold">
          カテゴリ
          <select
            className="field-control"
            value={transactionForm.category}
            onChange={(event) => updateTransactionForm({ category: event.target.value })}
          >
            {(transactionForm.type === "expense" ? expenseCategories : incomeCategories).map((category) => (
              <option key={category}>{category}</option>
            ))}
          </select>
        </label>

        <label className="grid gap-1 text-sm font-semibold">
          金額
          <input
            className="field-control"
            inputMode="numeric"
            min="0"
            value={transactionForm.amount || ""}
            onChange={(event) => updateTransactionForm({ amount: Number(event.target.value) })}
            placeholder="例: 1200"
            type="number"
          />
        </label>

        <label className="grid gap-1 text-sm font-semibold">
          メモ
          <input
            className="field-control"
            value={transactionForm.memo}
            onChange={(event) => updateTransactionForm({ memo: event.target.value })}
            placeholder="スーパー、家賃など"
          />
        </label>

        <button className="primary-action" type="submit">
          {editingTransactionId ? "更新する" : "追加する"}
        </button>
      </div>
    </form>
  );
}
