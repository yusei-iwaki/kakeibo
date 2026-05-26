import { FormEvent } from "react";
import { TransactionForm } from "@/components/kakeibo/transaction-form";
import { TransactionList } from "@/components/kakeibo/transaction-list";
import type { SharedLedgerStatus, Transaction, TransactionFormState } from "@/types/kakeibo";

type TransactionSectionProps = {
  cancelEdit: () => void;
  deleteTransaction: (id: string) => void;
  editTransaction: (transaction: Transaction) => void;
  editingTransactionId: string | null;
  selectedTransactions: Transaction[];
  sharedLedgerStatus: SharedLedgerStatus;
  submitTransaction: (event: FormEvent<HTMLFormElement>) => void;
  transactionForm: TransactionFormState;
  updateTransactionForm: (nextForm: Partial<TransactionFormState>) => void;
};

function getModeBanner(status: SharedLedgerStatus) {
  if (status.mode !== "shared") {
    return {
      className: "local",
      label: "ローカル保存",
      text: "この端末だけで編集",
    };
  }

  if (status.permission === "editor") {
    return {
      className: "editor",
      label: "編集モード",
      text: "共有家計簿を編集できます",
    };
  }

  return {
    className: "viewer",
    label: "閲覧モード",
    text: "閲覧コードで参加中。入力と削除はできません",
  };
}

export function TransactionSection(props: TransactionSectionProps) {
  const modeBanner = getModeBanner(props.sharedLedgerStatus);

  return (
    <section className="input-page">
      <div className={`ledger-mode-banner ${modeBanner.className}`}>
        <span>{modeBanner.label}</span>
        <strong>{modeBanner.text}</strong>
      </div>
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
