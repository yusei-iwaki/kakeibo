import type {
  AppSettings,
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
export const defaultSettings: AppSettings = {
  monthStartDay: 1,
};
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

export function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function getDaysInMonth(monthKey: string) {
  const base = parseMonthKey(monthKey);
  return new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate();
}

export function clampDay(monthKey: string, day: number) {
  return Math.min(Math.max(day, 1), getDaysInMonth(monthKey));
}

export function clampMonthStartDay(day: number) {
  return Math.min(Math.max(Math.round(day || 1), 1), 28);
}

function addDays(date: Date, days: number) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

export function getPeriodRange(monthKey: string, monthStartDay: number) {
  const startDay = clampMonthStartDay(monthStartDay);
  const base = parseMonthKey(monthKey);
  const start = new Date(base.getFullYear(), base.getMonth(), startDay);
  const nextStart = new Date(base.getFullYear(), base.getMonth() + 1, startDay);
  return {
    end: addDays(nextStart, -1),
    nextStart,
    start,
  };
}

export function getPeriodMonthKeyForDate(dateKey: string, monthStartDay: number) {
  const startDay = clampMonthStartDay(monthStartDay);
  const date = parseDateKey(dateKey);
  const periodMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  if (date.getDate() < startDay) {
    periodMonth.setMonth(periodMonth.getMonth() - 1);
  }
  return toMonthKey(periodMonth);
}

export function isDateInPeriod(dateKey: string, monthKey: string, monthStartDay: number) {
  const date = parseDateKey(dateKey);
  const { end, start } = getPeriodRange(monthKey, monthStartDay);
  return date >= start && date <= end;
}

export function formatPeriodRange(monthKey: string, monthStartDay: number) {
  const { end, start } = getPeriodRange(monthKey, monthStartDay);
  return `${start.getMonth() + 1}/${start.getDate()}〜${end.getMonth() + 1}/${end.getDate()}`;
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
  if (!rawData) return { settings: defaultSettings, transactions: [], fixedCosts: [] };

  try {
    const parsed = JSON.parse(rawData) as Partial<StoredData>;
    return {
      settings: {
        ...defaultSettings,
        ...(parsed.settings ?? {}),
        monthStartDay: clampMonthStartDay(parsed.settings?.monthStartDay ?? defaultSettings.monthStartDay),
      },
      transactions: Array.isArray(parsed.transactions) ? parsed.transactions : [],
      fixedCosts: Array.isArray(parsed.fixedCosts) ? parsed.fixedCosts : [],
    };
  } catch {
    return { settings: defaultSettings, transactions: [], fixedCosts: [] };
  }
}

export function buildCalendarDays(monthKey: string, transactions: Transaction[], monthStartDay: number): CalendarDay[] {
  const { end, start } = getPeriodRange(monthKey, monthStartDay);
  const firstDay = start.getDay();
  const blankDays = Array.from({ length: firstDay }, () => null);
  const dayCount = Math.round((end.getTime() - start.getTime()) / 86400000) + 1;
  const calendarDays = Array.from({ length: dayCount }, (_, index) => {
    const date = addDays(start, index);
    const dateKey = toDateKey(date);
    const daily = transactions.filter((transaction) => transaction.date === dateKey);
    return {
      date: dateKey,
      day: date.getDate(),
      muted: date.getMonth() !== parseMonthKey(monthKey).getMonth(),
      income: sumTransactions(daily, "income"),
      expense: sumTransactions(daily, "expense"),
    };
  });
  const days = [...blankDays, ...calendarDays];
  const trailingBlankCount = (7 - (days.length % 7)) % 7;
  return [...days, ...Array.from({ length: trailingBlankCount }, () => null)];
}

export function buildCategoryTotals(transactions: Transaction[], type: TransactionType = "expense"): CategoryTotal[] {
  const totals = new Map<string, number>();
  transactions
    .filter((transaction) => transaction.type === type)
    .forEach((transaction) => {
      totals.set(transaction.category, (totals.get(transaction.category) ?? 0) + transaction.amount);
    });
  return Array.from(totals, ([category, amount]) => ({ category, amount })).sort((a, b) => b.amount - a.amount);
}

export function buildTrendData(transactions: Transaction[], currentMonth: string, monthStartDay: number): TrendMonth[] {
  const base = parseMonthKey(currentMonth);
  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date(base.getFullYear(), base.getMonth() - 5 + index, 1);
    const month = toMonthKey(date);
    const monthly = transactions.filter((transaction) => isDateInPeriod(transaction.date, month, monthStartDay));
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
