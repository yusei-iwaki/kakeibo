import { FormEvent } from "react";
import { TransactionForm } from "@/components/kakeibo/transaction-form";
import { TransactionList } from "@/components/kakeibo/transaction-list";
import type { Transaction, TransactionFormState } from "@/types/kakeibo";

type TransactionSectionProps = {
  cancelEdit: () => void;
  deleteTransaction: (id: string) => void;
  editTransaction: (transaction: Transaction) => void;
  editingTransactionId: string | null;
  selectedTransactions: Transaction[];
  submitTransaction: (event: FormEvent<HTMLFormElement>) => void;
  transactionForm: TransactionFormState;
  updateTransactionForm: (nextForm: Partial<TransactionFormState>) => void;
};

export function TransactionSection(props: TransactionSectionProps) {
  return (
    <section className="page-stack">
      <TransactionForm
        cancelEdit={props.cancelEdit}
        editingTransactionId={props.editingTransactionId}
        submitTransaction={props.submitTransaction}
        transactionForm={props.transactionForm}
        updateTransactionForm={props.updateTransactionForm}
      />
      <TransactionList
        deleteTransaction={props.deleteTransaction}
        editTransaction={props.editTransaction}
        selectedTransactions={props.selectedTransactions}
      />
    </section>
  );
}
