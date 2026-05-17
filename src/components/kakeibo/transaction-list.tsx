import { TransactionListItem } from "@/components/kakeibo/transaction-list-item";
import type { Transaction } from "@/types/kakeibo";

type TransactionListProps = {
  deleteTransaction: (id: string) => void;
  editTransaction: (transaction: Transaction) => void;
  selectedTransactions: Transaction[];
};

export function TransactionList({ deleteTransaction, editTransaction, selectedTransactions }: TransactionListProps) {
  return (
    <div className="rounded-[22px] border border-[#eadfcd] bg-[#fffaf2]/90 p-4 shadow-sm">
      <h2 className="text-lg font-bold">選択日の明細</h2>
      <div className="mt-3 grid gap-2">
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
          <p className="rounded-2xl border border-dashed border-[#d8c8af] p-4 text-sm text-[#78685c]">
            この日の明細はまだありません。
          </p>
        )}
      </div>
    </div>
  );
}
