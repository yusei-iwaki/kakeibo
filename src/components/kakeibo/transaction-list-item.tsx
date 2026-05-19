import { formatYen } from "@/lib/kakeibo";
import type { Transaction } from "@/types/kakeibo";

type TransactionListItemProps = {
  deleteTransaction: (id: string) => void;
  editTransaction: (transaction: Transaction) => void;
  transaction: Transaction;
};

export function TransactionListItem({ deleteTransaction, editTransaction, transaction }: TransactionListItemProps) {
  return (
    <div className="transaction-item">
      <button className="transaction-main" onClick={() => editTransaction(transaction)} type="button">
        <div>
          <p>{transaction.memo || transaction.category}</p>
          <span>{transaction.category}</span>
        </div>
        <strong className={transaction.type === "income" ? "income-text" : "expense-text"}>
          {transaction.type === "income" ? "+" : "-"}
          {formatYen(transaction.amount)}
        </strong>
      </button>
      <button className="delete-chip" onClick={() => deleteTransaction(transaction.id)} type="button">
        削除
      </button>
    </div>
  );
}
