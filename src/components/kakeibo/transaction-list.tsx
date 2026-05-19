import { TransactionListItem } from "@/components/kakeibo/transaction-list-item";
import type { Transaction } from "@/types/kakeibo";

type TransactionListProps = {
  deleteTransaction: (id: string) => void;
  editTransaction: (transaction: Transaction) => void;
  selectedTransactions: Transaction[];
};

export function TransactionList({ deleteTransaction, editTransaction, selectedTransactions }: TransactionListProps) {
  return (
    <div className="plain-list-panel">
      <h2>選択日の明細</h2>
      <div className="list-stack">
        {selectedTransactions.length ? (
          selectedTransactions.map((transaction) => (
            <TransactionListItem
              deleteTransaction={deleteTransaction}
              editTransaction={editTransaction}
              key={transaction.id}
              transaction={transaction}
            />
          ))
        ) : (
          <p className="empty-state">この日の明細はまだありません。</p>
        )}
      </div>
    </div>
  );
}
