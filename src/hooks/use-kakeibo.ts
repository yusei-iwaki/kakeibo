"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  buildCalendarDays,
  buildCategoryTotals,
  buildTrendData,
  clampDay,
  clampMonthStartDay,
  createId,
  defaultSettings,
  emptyFixedCostForm,
  emptyTransactionForm,
  formatPeriodRange,
  getPeriodMonthKeyForDate,
  parseMonthKey,
  parseStoredData,
  STORAGE_KEY,
  sumTransactions,
  todayString,
  toMonthKey,
} from "@/lib/kakeibo";
import type { AppSection, FixedCost, StoredData, ToastState, Transaction, TransactionFormState } from "@/types/kakeibo";

export function useKakeibo() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [fixedCosts, setFixedCosts] = useState<FixedCost[]>([]);
  const [settings, setSettings] = useState(() => defaultSettings);
  const [currentMonth, setCurrentMonth] = useState(() => toMonthKey(new Date()));
  const [selectedDate, setSelectedDate] = useState(() => todayString());
  const [transactionForm, setTransactionForm] = useState(() => emptyTransactionForm(todayString()));
  const [fixedCostForm, setFixedCostForm] = useState(() => emptyFixedCostForm());
  const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<AppSection>("input");
  const [toast, setToast] = useState<ToastState>(null);
  const [hydrated, setHydrated] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const rawData = localStorage.getItem(STORAGE_KEY);
    queueMicrotask(() => {
      const parsed = parseStoredData(rawData);
      setTransactions(parsed.transactions);
      setFixedCosts(parsed.fixedCosts);
      setSettings(parsed.settings);
      setCurrentMonth(getPeriodMonthKeyForDate(todayString(), parsed.settings.monthStartDay));
      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const data: StoredData = { transactions, fixedCosts, settings };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [fixedCosts, hydrated, settings, transactions]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const monthTransactions = useMemo(
    () =>
      transactions.filter(
        (transaction) => getPeriodMonthKeyForDate(transaction.date, settings.monthStartDay) === currentMonth,
      ),
    [currentMonth, settings.monthStartDay, transactions],
  );
  const groupedMonthTransactions = useMemo(
    () =>
      [...monthTransactions].sort((a, b) => {
        if (a.date === b.date) return b.id.localeCompare(a.id);
        return b.date.localeCompare(a.date);
      }),
    [monthTransactions],
  );
  const selectedTransactions = useMemo(
    () =>
      transactions
        .filter((transaction) => transaction.date === selectedDate)
        .sort((a, b) => b.id.localeCompare(a.id)),
    [selectedDate, transactions],
  );
  const income = sumTransactions(monthTransactions, "income");
  const expense = sumTransactions(monthTransactions, "expense");
  const balance = income - expense;
  const calendarDays = buildCalendarDays(currentMonth, monthTransactions, settings.monthStartDay);
  const expenseCategoryTotals = buildCategoryTotals(monthTransactions, "expense");
  const incomeCategoryTotals = buildCategoryTotals(monthTransactions, "income");
  const periodRangeLabel = formatPeriodRange(currentMonth, settings.monthStartDay);
  const trendData = buildTrendData(transactions, currentMonth, settings.monthStartDay);

  function notify(message: string, tone: NonNullable<ToastState>["tone"] = "success") {
    setToast({ message, tone });
  }

  function setSection(section: AppSection) {
    setActiveSection(section);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function moveMonth(offset: number) {
    const date = parseMonthKey(currentMonth);
    date.setMonth(date.getMonth() + offset);
    const nextMonth = toMonthKey(date);
    setCurrentMonth(nextMonth);
  }

  function selectDate(date: string) {
    setSelectedDate(date);
    setTransactionForm((form) => ({ ...form, date }));
  }

  function updateTransactionForm(nextForm: Partial<TransactionFormState>) {
    setTransactionForm((form) => ({ ...form, ...nextForm }));
    if (nextForm.date) {
      setSelectedDate(nextForm.date);
      setCurrentMonth(getPeriodMonthKeyForDate(nextForm.date, settings.monthStartDay));
    }
  }

  function submitTransaction(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!transactionForm.amount || transactionForm.amount < 1) {
      notify("金額を入力してください。", "warning");
      return;
    }

    if (editingTransactionId) {
      setTransactions((items) =>
        items.map((item) =>
          item.id === editingTransactionId ? { ...item, ...transactionForm, amount: Number(transactionForm.amount) } : item,
        ),
      );
      setEditingTransactionId(null);
      notify("明細を更新しました。");
    } else {
      setTransactions((items) => [
        { id: createId(), ...transactionForm, amount: Number(transactionForm.amount) },
        ...items,
      ]);
      notify("明細を追加しました。");
    }

    const today = todayString();
    setSelectedDate(today);
    setCurrentMonth(getPeriodMonthKeyForDate(today, settings.monthStartDay));
    setTransactionForm(emptyTransactionForm(today));
  }

  function editTransaction(transaction: Transaction) {
    setEditingTransactionId(transaction.id);
    selectDate(transaction.date);
    setCurrentMonth(getPeriodMonthKeyForDate(transaction.date, settings.monthStartDay));
    setActiveSection("input");
    setTransactionForm({
      date: transaction.date,
      type: transaction.type,
      category: transaction.category,
      amount: transaction.amount,
      memo: transaction.memo,
      fixedCostId: transaction.fixedCostId,
    });
  }

  function cancelEdit() {
    setEditingTransactionId(null);
    setTransactionForm(emptyTransactionForm(selectedDate));
  }

  function deleteTransaction(id: string) {
    setTransactions((items) => items.filter((item) => item.id !== id));
    if (editingTransactionId === id) cancelEdit();
    notify("明細を削除しました。", "info");
  }

  function submitFixedCost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!fixedCostForm.name.trim() || !fixedCostForm.amount || fixedCostForm.amount < 1) {
      notify("固定費の名称と金額を入力してください。", "warning");
      return;
    }
    setFixedCosts((items) => [{ id: createId(), ...fixedCostForm, amount: Number(fixedCostForm.amount) }, ...items]);
    setFixedCostForm(emptyFixedCostForm());
    notify("固定費を追加しました。");
  }

  function toggleFixedCost(id: string) {
    setFixedCosts((items) => items.map((item) => (item.id === id ? { ...item, enabled: !item.enabled } : item)));
  }

  function deleteFixedCost(id: string) {
    setFixedCosts((items) => items.filter((item) => item.id !== id));
    notify("固定費を削除しました。", "info");
  }

  function applyFixedCosts() {
    const enabledCosts = fixedCosts.filter((cost) => cost.enabled);

    if (!enabledCosts.length) {
      notify("反映できる固定費がありません。", "warning");
      return;
    }

    let applied = 0;
    setTransactions((items) => {
      const nextItems = [...items];
      enabledCosts.forEach((cost) => {
        const targetMonth = cost.day < settings.monthStartDay
          ? toMonthKey(new Date(parseMonthKey(currentMonth).getFullYear(), parseMonthKey(currentMonth).getMonth() + 1, 1))
          : currentMonth;
        const date = `${targetMonth}-${`${clampDay(targetMonth, cost.day)}`.padStart(2, "0")}`;
        const existingIndex = nextItems.findIndex(
          (transaction) =>
            transaction.fixedCostId === cost.id &&
            getPeriodMonthKeyForDate(transaction.date, settings.monthStartDay) === currentMonth,
        );
        const nextTransaction: Transaction = {
          id: existingIndex >= 0 ? nextItems[existingIndex].id : createId(),
          date,
          type: "expense",
          category: cost.category,
          amount: cost.amount,
          memo: cost.name,
          fixedCostId: cost.id,
        };

        if (existingIndex >= 0) {
          nextItems[existingIndex] = nextTransaction;
        } else {
          nextItems.unshift(nextTransaction);
        }
        applied += 1;
      });
      return nextItems;
    });
    notify(`${applied}件の固定費を今月へ反映しました。`);
    setActiveSection("calendar");
  }

  function updateMonthStartDay(day: number) {
    const monthStartDay = clampMonthStartDay(day);
    setSettings((current) => ({ ...current, monthStartDay }));
    setCurrentMonth(getPeriodMonthKeyForDate(selectedDate, monthStartDay));
  }

  function exportData() {
    const blob = new Blob([JSON.stringify({ transactions, fixedCosts, settings }, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `kakeibo-${currentMonth}.json`;
    link.click();
    URL.revokeObjectURL(url);
    notify("JSONを書き出しました。");
  }

  function importData(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      const parsed = parseStoredData(String(reader.result));
      setTransactions(parsed.transactions);
      setFixedCosts(parsed.fixedCosts);
      setSettings(parsed.settings);
      setCurrentMonth(getPeriodMonthKeyForDate(selectedDate, parsed.settings.monthStartDay));
      if (fileInputRef.current) fileInputRef.current.value = "";
      notify("JSONを読み込みました。");
    });
    reader.readAsText(file);
  }

  return {
    activeSection,
    applyFixedCosts,
    balance,
    calendarDays,
    cancelEdit,
    expenseCategoryTotals,
    currentMonth,
    deleteFixedCost,
    deleteTransaction,
    editTransaction,
    editingTransactionId,
    expense,
    exportData,
    fileInputRef,
    fixedCostForm,
    fixedCosts,
    importData,
    income,
    incomeCategoryTotals,
    monthTransactions: groupedMonthTransactions,
    monthStartDay: settings.monthStartDay,
    moveMonth,
    periodRangeLabel,
    selectDate,
    selectedDate,
    selectedTransactions,
    setActiveSection: setSection,
    setFixedCostForm,
    submitFixedCost,
    submitTransaction,
    toast,
    toggleFixedCost,
    transactionForm,
    trendData,
    updateTransactionForm,
    updateMonthStartDay,
  };
}
