export type TransactionType = "income" | "expense";

export type Transaction = {
  id: string;
  date: string;
  type: TransactionType;
  category: string;
  amount: number;
  memo: string;
  fixedCostId?: string;
};

export type FixedCost = {
  id: string;
  name: string;
  amount: number;
  category: string;
  day: number;
  enabled: boolean;
};

export type StoredData = {
  transactions: Transaction[];
  fixedCosts: FixedCost[];
};

export type TransactionFormState = Omit<Transaction, "id">;

export type FixedCostFormState = Omit<FixedCost, "id">;

export type AppSection = "input" | "calendar" | "charts" | "settings";

export type ToastState = {
  message: string;
  tone: "success" | "info" | "warning";
} | null;

export type CalendarDay = {
  date: string;
  day: number;
  income: number;
  expense: number;
} | null;

export type CategoryTotal = {
  category: string;
  amount: number;
};

export type TrendMonth = {
  month: string;
  income: number;
  expense: number;
  balance: number;
};
