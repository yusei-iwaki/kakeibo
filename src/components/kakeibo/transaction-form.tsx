import { FormEvent } from "react";
import { expenseCategories, incomeCategories } from "@/lib/kakeibo";
import type { TransactionFormState } from "@/types/kakeibo";

type TransactionFormProps = {
  cancelEdit: () => void;
  editingTransactionId: string | null;
  submitTransaction: (event: FormEvent<HTMLFormElement>) => void;
  transactionForm: TransactionFormState;
  updateTransactionForm: (nextForm: Partial<TransactionFormState>) => void;
};

export function TransactionForm({
  cancelEdit,
  editingTransactionId,
  submitTransaction,
  transactionForm,
  updateTransactionForm,
}: TransactionFormProps) {
  return (
    <form className="entry-form" onSubmit={submitTransaction}>
      {editingTransactionId ? (
        <div className="form-status-row">
          <span>編集中</span>
          {editingTransactionId ? (
            <button className="mini-button" onClick={cancelEdit} type="button">
              解除
            </button>
          ) : null}
        </div>
      ) : null}

      <div className="input-list">
        <label className="input-row">
          <span>金額</span>
          <input
            className="amount-input"
            inputMode="numeric"
            min="0"
            value={transactionForm.amount || ""}
            onChange={(event) => updateTransactionForm({ amount: Number(event.target.value) })}
            placeholder="0"
            type="number"
          />
          <b>円</b>
        </label>

        <label className="input-row">
          <span>カテゴリー</span>
          <select
            value={transactionForm.category}
            onChange={(event) => updateTransactionForm({ category: event.target.value })}
          >
            {(transactionForm.type === "expense" ? expenseCategories : incomeCategories).map((category) => (
              <option key={category}>{category}</option>
            ))}
          </select>
        </label>

        <label className="input-row">
          <span>メモ</span>
          <input
            value={transactionForm.memo}
            onChange={(event) => updateTransactionForm({ memo: event.target.value })}
            placeholder="品目やお店"
          />
        </label>

        <label className="input-row">
          <span>日付</span>
          <input
            value={transactionForm.date}
            onChange={(event) => updateTransactionForm({ date: event.target.value })}
            type="date"
          />
        </label>
      </div>

      <button className="save-button" type="submit">
        {editingTransactionId ? "更新" : "保存"}
      </button>
    </form>
  );
}
