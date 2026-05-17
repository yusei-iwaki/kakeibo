import { formatYen } from "@/lib/kakeibo";
import type { Transaction } from "@/types/kakeibo";

type TransactionListItemProps = {
  deleteTransaction: (id: string) => void;
  editTransaction: (transaction: Transaction) => void;
  transaction: Transaction;
};

export function TransactionListItem({ deleteTransaction, editTransaction, transaction }: TransactionListItemProps) {
  return (
    <div className="rounded-2xl border border-[#eadfcd] bg-white/80 p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-bold">{transaction.memo || transaction.category}</p>
          <p className="text-sm text-[#78685c]">{transaction.category}</p>
        </div>
        <strong className={transaction.type === "income" ? "text-[#33745f]" : "text-[#b8523e]"}>
          {transaction.type === "income" ? "+" : "-"}
          {formatYen(transaction.amount)}
        </strong>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button className="touch-button" onClick={() => editTransaction(transaction)} type="button">
          編集
        </button>
        <button className="danger-button" onClick={() => deleteTransaction(transaction.id)} type="button">
          削除
        </button>
      </div>
    </div>
  );
}
