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

export type AppSettings = {
  monthStartDay: number;
};

export type StoredData = {
  settings: AppSettings;
  transactions: Transaction[];
  fixedCosts: FixedCost[];
};

export type SharedLedger = {
  code: string;
  data: StoredData;
  editCode?: string;
  name: string;
  permission: "viewer" | "editor";
  readCode?: string;
  updatedAt: string;
};

export type SharedLedgerStatus = {
  code: string;
  configured: boolean;
  editCode: string;
  joinCode: string;
  lastSyncedAt: string;
  mode: "local" | "shared";
  permission: "viewer" | "editor";
  readCode: string;
  syncState: "idle" | "loading" | "refreshing" | "saving" | "error";
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
  muted?: boolean;
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
