import type {
  CalendarDay,
  CategoryTotal,
  FixedCostFormState,
  StoredData,
  Transaction,
  TransactionFormState,
  TransactionType,
  TrendMonth,
} from "@/types/kakeibo";

export const STORAGE_KEY = "kakeibo-data-v1";
export const expenseCategories = ["食費", "日用品", "交通", "住居", "通信", "光熱費", "娯楽", "医療", "その他"];
export const incomeCategories = ["給与", "副業", "臨時収入", "その他"];
export const weekdayLabels = ["日", "月", "火", "水", "木", "金", "土"];

const yenFormatter = new Intl.NumberFormat("ja-JP", {
  style: "currency",
  currency: "JPY",
  maximumFractionDigits: 0,
});

export function createId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function todayString() {
  return toDateKey(new Date());
}

export function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function toMonthKey(date: Date) {
  return `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, "0")}`;
}

export function parseMonthKey(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);
  return new Date(year, month - 1, 1);
}

export function getDaysInMonth(monthKey: string) {
  const base = parseMonthKey(monthKey);
  return new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate();
}

export function clampDay(monthKey: string, day: number) {
  return Math.min(Math.max(day, 1), getDaysInMonth(monthKey));
}

export function sumTransactions(transactions: Transaction[], type?: TransactionType) {
  return transactions
    .filter((transaction) => !type || transaction.type === type)
    .reduce((total, transaction) => total + transaction.amount, 0);
}

export function formatYen(value: number) {
  return yenFormatter.format(value);
}

export function formatCompact(value: number) {
  if (!value) return "0";
  if (value >= 10000) return `${Math.round(value / 1000) / 10}万`;
  return value.toLocaleString("ja-JP");
}

export function emptyTransactionForm(selectedDate: string): TransactionFormState {
  return {
    date: selectedDate,
    type: "expense",
    category: "食費",
    amount: 0,
    memo: "",
  };
}

export function emptyFixedCostForm(): FixedCostFormState {
  return {
    name: "",
    amount: 0,
    category: "住居",
    day: 1,
    enabled: true,
  };
}

export function parseStoredData(rawData: string | null): StoredData {
  if (!rawData) return { transactions: [], fixedCosts: [] };

  try {
    const parsed = JSON.parse(rawData) as StoredData;
    return {
      transactions: Array.isArray(parsed.transactions) ? parsed.transactions : [],
      fixedCosts: Array.isArray(parsed.fixedCosts) ? parsed.fixedCosts : [],
    };
  } catch {
    return { transactions: [], fixedCosts: [] };
  }
}

export function buildCalendarDays(monthKey: string, transactions: Transaction[]): CalendarDay[] {
  const firstDay = parseMonthKey(monthKey).getDay();
  const blankDays = Array.from({ length: firstDay }, () => null);
  const calendarDays = Array.from({ length: getDaysInMonth(monthKey) }, (_, index) => {
    const day = index + 1;
    const dateKey = `${monthKey}-${`${day}`.padStart(2, "0")}`;
    const daily = transactions.filter((transaction) => transaction.date === dateKey);
    return {
      date: dateKey,
      day,
      income: sumTransactions(daily, "income"),
      expense: sumTransactions(daily, "expense"),
    };
  });
  return [...blankDays, ...calendarDays];
}

export function buildCategoryTotals(transactions: Transaction[]): CategoryTotal[] {
  const totals = new Map<string, number>();
  transactions
    .filter((transaction) => transaction.type === "expense")
    .forEach((transaction) => {
      totals.set(transaction.category, (totals.get(transaction.category) ?? 0) + transaction.amount);
    });
  return Array.from(totals, ([category, amount]) => ({ category, amount })).sort((a, b) => b.amount - a.amount);
}

export function buildTrendData(transactions: Transaction[], currentMonth: string): TrendMonth[] {
  const base = parseMonthKey(currentMonth);
  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date(base.getFullYear(), base.getMonth() - 5 + index, 1);
    const month = toMonthKey(date);
    const monthly = transactions.filter((transaction) => transaction.date.startsWith(month));
    const income = sumTransactions(monthly, "income");
    const expense = sumTransactions(monthly, "expense");
    return {
      month,
      income,
      expense,
      balance: income - expense,
    };
  });
}
