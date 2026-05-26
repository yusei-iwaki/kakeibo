"use client";

import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  SHARED_LEDGER_CODE_KEY,
  STORAGE_KEY,
  sumTransactions,
  todayString,
  toMonthKey,
} from "@/lib/kakeibo";
import {
  createSharedLedger,
  fetchSharedLedgerConfig,
  loadSharedLedger,
  saveSharedLedger,
} from "@/lib/shared-ledger-api";
import type {
  AppSection,
  FixedCost,
  SharedLedgerStatus,
  StoredData,
  ToastState,
  Transaction,
  TransactionFormState,
} from "@/types/kakeibo";

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
  const [sharedLedgerStatus, setSharedLedgerStatus] = useState<SharedLedgerStatus>({
    code: "",
    configured: false,
    editCode: "",
    joinCode: "",
    lastSyncedAt: "",
    mode: "local",
    permission: "editor",
    readCode: "",
    syncState: "loading",
  });
  const skipNextSharedSaveRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function applyStoredData(data: StoredData, options: { resetMonthToToday?: boolean } = {}) {
    setTransactions(data.transactions);
    setFixedCosts(data.fixedCosts);
    setSettings(data.settings);
    if (options.resetMonthToToday ?? true) {
      setCurrentMonth(getPeriodMonthKeyForDate(todayString(), data.settings.monthStartDay));
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function hydrateData() {
      const localData = parseStoredData(localStorage.getItem(STORAGE_KEY));
      const savedCode = localStorage.getItem(SHARED_LEDGER_CODE_KEY) ?? "";

      try {
        const config = await fetchSharedLedgerConfig();
        if (cancelled) return;

        if (savedCode && config.configured) {
          setSharedLedgerStatus((status) => ({
            ...status,
            code: savedCode,
            configured: true,
            editCode: "",
            joinCode: savedCode,
            lastSyncedAt: status.lastSyncedAt,
            mode: "shared",
            permission: "viewer",
            readCode: "",
            syncState: "loading",
          }));
          const { ledger } = await loadSharedLedger(savedCode);
          if (cancelled) return;
          applyStoredData(ledger.data);
          setSharedLedgerStatus({
            code: ledger.code,
            configured: true,
            editCode: ledger.editCode ?? "",
            joinCode: ledger.code,
            lastSyncedAt: ledger.updatedAt,
            mode: "shared",
            permission: ledger.permission,
            readCode: ledger.readCode ?? ledger.code,
            syncState: "idle",
          });
        } else {
          applyStoredData(localData);
          setSharedLedgerStatus({
            code: "",
            configured: config.configured,
            editCode: "",
            joinCode: savedCode,
            lastSyncedAt: "",
            mode: "local",
            permission: "editor",
            readCode: "",
            syncState: "idle",
          });
        }
      } catch {
        if (cancelled) return;
        applyStoredData(localData);
        setSharedLedgerStatus({
          code: "",
          configured: false,
          editCode: "",
          joinCode: savedCode,
          lastSyncedAt: "",
          mode: "local",
          permission: "editor",
          readCode: "",
          syncState: "idle",
        });
      } finally {
        if (!cancelled) setHydrated(true);
      }
    }

    hydrateData();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const data: StoredData = { transactions, fixedCosts, settings };

    if (
      sharedLedgerStatus.mode !== "shared" ||
      !sharedLedgerStatus.code ||
      sharedLedgerStatus.permission !== "editor"
    ) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    if (skipNextSharedSaveRef.current) {
      skipNextSharedSaveRef.current = false;
      return;
    }

    const timer = window.setTimeout(() => {
      setSharedLedgerStatus((status) => ({ ...status, syncState: "saving" }));
      saveSharedLedger(sharedLedgerStatus.code, data)
        .then(({ ledger }) => {
          setSharedLedgerStatus((status) => ({
            ...status,
            code: ledger.code,
            editCode: ledger.editCode ?? status.editCode,
            joinCode: ledger.code,
            lastSyncedAt: ledger.updatedAt,
            permission: ledger.permission,
            readCode: ledger.readCode ?? status.readCode,
            syncState: "idle",
          }));
        })
        .catch(() => {
          setSharedLedgerStatus((status) => ({ ...status, syncState: "error" }));
          notify("共有家計簿への保存に失敗しました。", "warning");
        });
    }, 450);

    return () => window.clearTimeout(timer);
  }, [
    fixedCosts,
    hydrated,
    settings,
    sharedLedgerStatus.code,
    sharedLedgerStatus.mode,
    sharedLedgerStatus.permission,
    transactions,
  ]);

  const refreshSharedBook = useCallback(
    async (silent = false) => {
      if (sharedLedgerStatus.mode !== "shared" || !sharedLedgerStatus.code) {
        if (!silent) setToast({ message: "共有家計簿に参加していません。", tone: "warning" });
        return;
      }

      if (sharedLedgerStatus.syncState === "loading" || sharedLedgerStatus.syncState === "saving") return;

      setSharedLedgerStatus((status) => ({ ...status, syncState: "refreshing" }));
      try {
        const { ledger } = await loadSharedLedger(sharedLedgerStatus.code);
        skipNextSharedSaveRef.current = true;
        setTransactions(ledger.data.transactions);
        setFixedCosts(ledger.data.fixedCosts);
        setSettings(ledger.data.settings);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(ledger.data));
        setSharedLedgerStatus((status) => ({
          ...status,
          code: ledger.code,
          editCode: ledger.editCode ?? status.editCode,
          joinCode: ledger.code,
          lastSyncedAt: ledger.updatedAt,
          permission: ledger.permission,
          readCode: ledger.readCode ?? status.readCode,
          syncState: "idle",
        }));
        if (!silent) setToast({ message: "共有家計簿を最新にしました。", tone: "info" });
      } catch {
        setSharedLedgerStatus((status) => ({ ...status, syncState: "error" }));
        if (!silent) setToast({ message: "共有家計簿を更新できませんでした。", tone: "warning" });
      }
    },
    [sharedLedgerStatus.code, sharedLedgerStatus.mode, sharedLedgerStatus.syncState],
  );

  useEffect(() => {
    if (!hydrated || sharedLedgerStatus.mode !== "shared" || !sharedLedgerStatus.code) return;

    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        refreshSharedBook(true);
      }
    }, 30000);

    function refreshOnVisible() {
      if (document.visibilityState === "visible") {
        refreshSharedBook(true);
      }
    }

    window.addEventListener("focus", refreshOnVisible);
    document.addEventListener("visibilitychange", refreshOnVisible);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", refreshOnVisible);
      document.removeEventListener("visibilitychange", refreshOnVisible);
    };
  }, [hydrated, refreshSharedBook, sharedLedgerStatus.code, sharedLedgerStatus.mode, sharedLedgerStatus.syncState]);

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

  function canEditSharedBook() {
    return sharedLedgerStatus.mode !== "shared" || sharedLedgerStatus.permission === "editor";
  }

  function blockReadOnlyEdit() {
    if (canEditSharedBook()) return false;
    notify("閲覧コードで参加中のため、この端末からは編集できません。", "warning");
    return true;
  }

  function updateSharedLedgerJoinCode(joinCode: string) {
    setSharedLedgerStatus((status) => ({ ...status, joinCode: joinCode.toUpperCase() }));
  }

  async function createSharedBook() {
    if (!sharedLedgerStatus.configured) {
      notify("DATABASE_URLを設定すると共有を開始できます。", "warning");
      return;
    }

    setSharedLedgerStatus((status) => ({ ...status, syncState: "loading" }));
    try {
      const data: StoredData = { transactions, fixedCosts, settings };
      const { ledger } = await createSharedLedger(data);
      localStorage.setItem(SHARED_LEDGER_CODE_KEY, ledger.code);
      applyStoredData(ledger.data);
      setSharedLedgerStatus({
        code: ledger.code,
        configured: true,
        editCode: ledger.editCode ?? ledger.code,
        joinCode: ledger.code,
        lastSyncedAt: ledger.updatedAt,
        mode: "shared",
        permission: ledger.permission,
        readCode: ledger.readCode ?? ledger.code,
        syncState: "idle",
      });
      notify("共有コードを作成しました。");
    } catch {
      setSharedLedgerStatus((status) => ({ ...status, syncState: "error" }));
      notify("共有家計簿を作成できませんでした。", "warning");
    }
  }

  async function joinSharedBook() {
    const code = sharedLedgerStatus.joinCode.trim().toUpperCase();
    if (!code) {
      notify("共有コードを入力してください。", "warning");
      return;
    }

    setSharedLedgerStatus((status) => ({ ...status, syncState: "loading" }));
    try {
      const { ledger } = await loadSharedLedger(code);
      localStorage.setItem(SHARED_LEDGER_CODE_KEY, ledger.code);
      applyStoredData(ledger.data);
      setSharedLedgerStatus({
        code: ledger.code,
        configured: true,
        editCode: ledger.editCode ?? "",
        joinCode: ledger.code,
        lastSyncedAt: ledger.updatedAt,
        mode: "shared",
        permission: ledger.permission,
        readCode: ledger.readCode ?? ledger.code,
        syncState: "idle",
      });
      notify("共有家計簿に参加しました。");
    } catch {
      setSharedLedgerStatus((status) => ({ ...status, syncState: "error" }));
      notify("共有コードが見つかりませんでした。", "warning");
    }
  }

  function leaveSharedBook() {
    const data: StoredData = { transactions, fixedCosts, settings };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    localStorage.removeItem(SHARED_LEDGER_CODE_KEY);
    setSharedLedgerStatus((status) => ({
      ...status,
      code: "",
      editCode: "",
      joinCode: "",
      lastSyncedAt: "",
      mode: "local",
      permission: "editor",
      readCode: "",
      syncState: "idle",
    }));
    notify("この端末をローカル保存に戻しました。", "info");
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
    if (blockReadOnlyEdit()) return;
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
    if (blockReadOnlyEdit()) return;
    setTransactions((items) => items.filter((item) => item.id !== id));
    if (editingTransactionId === id) cancelEdit();
    notify("明細を削除しました。", "info");
  }

  function submitFixedCost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (blockReadOnlyEdit()) return;
    if (!fixedCostForm.name.trim() || !fixedCostForm.amount || fixedCostForm.amount < 1) {
      notify("固定費の名称と金額を入力してください。", "warning");
      return;
    }
    setFixedCosts((items) => [{ id: createId(), ...fixedCostForm, amount: Number(fixedCostForm.amount) }, ...items]);
    setFixedCostForm(emptyFixedCostForm());
    notify("固定費を追加しました。");
  }

  function toggleFixedCost(id: string) {
    if (blockReadOnlyEdit()) return;
    setFixedCosts((items) => items.map((item) => (item.id === id ? { ...item, enabled: !item.enabled } : item)));
  }

  function deleteFixedCost(id: string) {
    if (blockReadOnlyEdit()) return;
    setFixedCosts((items) => items.filter((item) => item.id !== id));
    notify("固定費を削除しました。", "info");
  }

  function applyFixedCosts() {
    if (blockReadOnlyEdit()) return;
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
    if (blockReadOnlyEdit()) return;
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
    if (blockReadOnlyEdit()) {
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
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
    createSharedBook,
    refreshSharedBook,
    submitFixedCost,
    submitTransaction,
    joinSharedBook,
    leaveSharedBook,
    sharedLedgerStatus,
    toast,
    toggleFixedCost,
    transactionForm,
    trendData,
    updateSharedLedgerJoinCode,
    updateTransactionForm,
    updateMonthStartDay,
  };
}
