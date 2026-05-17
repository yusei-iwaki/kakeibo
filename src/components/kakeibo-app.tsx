"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";

type TransactionType = "income" | "expense";

type Transaction = {
  id: string;
  date: string;
  type: TransactionType;
  category: string;
  amount: number;
  memo: string;
  fixedCostId?: string;
};

type FixedCost = {
  id: string;
  name: string;
  amount: number;
  category: string;
  day: number;
  enabled: boolean;
};

type StoredData = {
  transactions: Transaction[];
  fixedCosts: FixedCost[];
};

const STORAGE_KEY = "kakeibo-data-v1";
const expenseCategories = ["食費", "日用品", "交通", "住居", "通信", "光熱費", "娯楽", "医療", "その他"];
const incomeCategories = ["給与", "副業", "臨時収入", "その他"];
const yenFormatter = new Intl.NumberFormat("ja-JP", {
  style: "currency",
  currency: "JPY",
  maximumFractionDigits: 0,
});
const weekdayLabels = ["日", "月", "火", "水", "木", "金", "土"];

function createId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function todayString() {
  const date = new Date();
  return toDateKey(date);
}

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toMonthKey(date: Date) {
  return `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, "0")}`;
}

function parseMonthKey(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);
  return new Date(year, month - 1, 1);
}

function getDaysInMonth(monthKey: string) {
  const base = parseMonthKey(monthKey);
  return new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate();
}

function clampDay(monthKey: string, day: number) {
  return Math.min(day, getDaysInMonth(monthKey));
}

function sumTransactions(transactions: Transaction[], type?: TransactionType) {
  return transactions
    .filter((transaction) => !type || transaction.type === type)
    .reduce((total, transaction) => total + transaction.amount, 0);
}

function formatYen(value: number) {
  return yenFormatter.format(value);
}

function emptyForm(selectedDate: string): Omit<Transaction, "id"> {
  return {
    date: selectedDate,
    type: "expense",
    category: "食費",
    amount: 0,
    memo: "",
  };
}

function emptyFixedCost(): Omit<FixedCost, "id"> {
  return {
    name: "",
    amount: 0,
    category: "住居",
    day: 1,
    enabled: true,
  };
}

export function KakeiboApp() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [fixedCosts, setFixedCosts] = useState<FixedCost[]>([]);
  const [currentMonth, setCurrentMonth] = useState(() => toMonthKey(new Date()));
  const [selectedDate, setSelectedDate] = useState(() => todayString());
  const [transactionForm, setTransactionForm] = useState(() => emptyForm(todayString()));
  const [fixedCostForm, setFixedCostForm] = useState(() => emptyFixedCost());
  const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const rawData = localStorage.getItem(STORAGE_KEY);
    queueMicrotask(() => {
      if (rawData) {
        try {
          const parsed = JSON.parse(rawData) as StoredData;
          setTransactions(Array.isArray(parsed.transactions) ? parsed.transactions : []);
          setFixedCosts(Array.isArray(parsed.fixedCosts) ? parsed.fixedCosts : []);
        } catch {
          setTransactions([]);
          setFixedCosts([]);
        }
      }
      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const data: StoredData = { transactions, fixedCosts };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [fixedCosts, hydrated, transactions]);

  const monthTransactions = useMemo(
    () => transactions.filter((transaction) => transaction.date.startsWith(currentMonth)),
    [currentMonth, transactions],
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
  const days = buildCalendarDays(currentMonth, monthTransactions);
  const categoryTotals = buildCategoryTotals(monthTransactions);
  const trendData = buildTrendData(transactions, currentMonth);

  function moveMonth(offset: number) {
    const date = parseMonthKey(currentMonth);
    date.setMonth(date.getMonth() + offset);
    const nextMonth = toMonthKey(date);
    setCurrentMonth(nextMonth);
    selectDate(`${nextMonth}-01`);
  }

  function selectDate(date: string) {
    setSelectedDate(date);
    setTransactionForm((form) => ({ ...form, date }));
  }

  function submitTransaction(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!transactionForm.amount || transactionForm.amount < 1) return;

    if (editingTransactionId) {
      setTransactions((items) =>
        items.map((item) =>
          item.id === editingTransactionId ? { ...item, ...transactionForm, amount: Number(transactionForm.amount) } : item,
        ),
      );
      setEditingTransactionId(null);
    } else {
      setTransactions((items) => [
        { id: createId(), ...transactionForm, amount: Number(transactionForm.amount) },
        ...items,
      ]);
    }

    setTransactionForm(emptyForm(selectedDate));
  }

  function editTransaction(transaction: Transaction) {
    setEditingTransactionId(transaction.id);
    selectDate(transaction.date);
    setTransactionForm({
      date: transaction.date,
      type: transaction.type,
      category: transaction.category,
      amount: transaction.amount,
      memo: transaction.memo,
      fixedCostId: transaction.fixedCostId,
    });
  }

  function deleteTransaction(id: string) {
    setTransactions((items) => items.filter((item) => item.id !== id));
    if (editingTransactionId === id) {
      setEditingTransactionId(null);
      setTransactionForm(emptyForm(selectedDate));
    }
  }

  function submitFixedCost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!fixedCostForm.name.trim() || !fixedCostForm.amount || fixedCostForm.amount < 1) return;
    setFixedCosts((items) => [{ id: createId(), ...fixedCostForm, amount: Number(fixedCostForm.amount) }, ...items]);
    setFixedCostForm(emptyFixedCost());
  }

  function toggleFixedCost(id: string) {
    setFixedCosts((items) => items.map((item) => (item.id === id ? { ...item, enabled: !item.enabled } : item)));
  }

  function deleteFixedCost(id: string) {
    setFixedCosts((items) => items.filter((item) => item.id !== id));
  }

  function applyFixedCosts() {
    const additions = fixedCosts
      .filter((cost) => cost.enabled)
      .filter((cost) => !transactions.some((transaction) => transaction.fixedCostId === cost.id && transaction.date.startsWith(currentMonth)))
      .map((cost) => ({
        id: createId(),
        date: `${currentMonth}-${`${clampDay(currentMonth, cost.day)}`.padStart(2, "0")}`,
        type: "expense" as const,
        category: cost.category,
        amount: cost.amount,
        memo: cost.name,
        fixedCostId: cost.id,
      }));

    if (additions.length) {
      setTransactions((items) => [...additions, ...items]);
    }
  }

  function exportData() {
    const blob = new Blob([JSON.stringify({ transactions, fixedCosts }, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `kakeibo-${currentMonth}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function importData(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as StoredData;
        setTransactions(Array.isArray(parsed.transactions) ? parsed.transactions : []);
        setFixedCosts(Array.isArray(parsed.fixedCosts) ? parsed.fixedCosts : []);
      } catch {
        alert("読み込めないJSONファイルです。");
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    });
    reader.readAsText(file);
  }

  return (
    <main className="min-h-screen px-3 pb-24 pt-3 text-[#342820] sm:px-6 sm:py-5 lg:px-8">
      <div className="mx-auto grid w-full max-w-7xl gap-4 sm:gap-5">
        <header className="rounded-[22px] border border-[#eadfcd] bg-[#fffaf2]/92 p-4 shadow-[0_18px_60px_rgba(83,60,36,0.10)] backdrop-blur sm:rounded-[28px] sm:p-5 md:flex md:items-end md:justify-between md:gap-4">
          <div>
            <p className="text-xs font-semibold text-[#b36b35] sm:text-sm">ひとり用の家計簿</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-5xl">暮らしのお金</h1>
            <p className="mt-2 max-w-2xl text-xs leading-5 text-[#78685c] sm:mt-3 sm:text-sm sm:leading-6">
              カレンダーで日々の収支を入力し、月ごとの流れと固定費をまとめて確認できます。データはこのブラウザに保存されます。
            </p>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 md:mt-0 md:flex md:flex-wrap">
            <button className="min-h-11 rounded-full border border-[#d8c8af] bg-white px-3 py-2 text-xs font-semibold text-[#5b4a3c] shadow-sm hover:bg-[#fff4df] sm:px-4 sm:text-sm" onClick={exportData} type="button">
              JSON書き出し
            </button>
            <button className="min-h-11 rounded-full border border-[#d8c8af] bg-white px-3 py-2 text-xs font-semibold text-[#5b4a3c] shadow-sm hover:bg-[#fff4df] sm:px-4 sm:text-sm" onClick={() => fileInputRef.current?.click()} type="button">
              JSON読み込み
            </button>
            <input ref={fileInputRef} className="hidden" accept="application/json" onChange={importData} type="file" />
          </div>
        </header>

        <nav className="fixed inset-x-3 bottom-3 z-20 grid grid-cols-4 gap-1 rounded-full border border-[#e4d5bf] bg-[#fffaf2]/95 p-1 shadow-[0_16px_40px_rgba(83,60,36,0.20)] backdrop-blur sm:hidden" aria-label="主要メニュー">
          <a className="rounded-full px-2 py-2 text-center text-xs font-bold text-[#6d5a4a]" href="#input">入力</a>
          <a className="rounded-full px-2 py-2 text-center text-xs font-bold text-[#6d5a4a]" href="#calendar">暦</a>
          <a className="rounded-full px-2 py-2 text-center text-xs font-bold text-[#6d5a4a]" href="#charts">分析</a>
          <a className="rounded-full px-2 py-2 text-center text-xs font-bold text-[#6d5a4a]" href="#fixed">固定</a>
        </nav>

        <section className="-mx-3 flex snap-x gap-3 overflow-x-auto px-3 pb-1 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 md:pb-0">
          <SummaryCard label="収入" value={income} tone="income" />
          <SummaryCard label="支出" value={expense} tone="expense" />
          <SummaryCard label="差額" value={balance} tone={balance >= 0 ? "income" : "expense"} />
        </section>

        <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
          <div id="calendar" className="order-2 rounded-[22px] border border-[#eadfcd] bg-[#fffaf2]/90 p-3 shadow-sm sm:rounded-[24px] sm:p-4 xl:order-1">
            <div className="mb-3 grid gap-3 sm:mb-4 sm:flex sm:flex-wrap sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold sm:text-xl">カレンダー</h2>
                <p className="text-xs text-[#78685c] sm:text-sm">日付を選ぶと、その日の入力と明細を確認できます。</p>
              </div>
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                <button className="min-h-11 rounded-full border border-[#d8c8af] bg-white px-3 text-sm font-bold hover:bg-[#fff4df] sm:px-4" onClick={() => moveMonth(-1)} type="button">
                  前月
                </button>
                <strong className="min-w-24 text-center text-base sm:min-w-28 sm:text-lg">{currentMonth}</strong>
                <button className="min-h-11 rounded-full border border-[#d8c8af] bg-white px-3 text-sm font-bold hover:bg-[#fff4df] sm:px-4" onClick={() => moveMonth(1)} type="button">
                  翌月
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-[#9a7d5d] sm:gap-2 sm:text-xs">
              {weekdayLabels.map((label) => (
                <span key={label}>{label}</span>
              ))}
            </div>
            <div className="mt-2 grid grid-cols-7 gap-1 sm:gap-2">
              {days.map((day, index) =>
                day ? (
                  <button
                    className={`min-h-14 rounded-xl border p-1.5 text-left transition hover:-translate-y-0.5 hover:shadow-md sm:min-h-24 sm:rounded-2xl sm:p-2 ${
                      day.date === selectedDate
                        ? "border-[#c77a3d] bg-[#fff0d7]"
                        : "border-[#eadfcd] bg-white/80 hover:bg-[#fff8eb]"
                    }`}
                    key={day.date}
                    onClick={() => selectDate(day.date)}
                    type="button"
                  >
                    <span className="block text-xs font-bold sm:text-sm">{day.day}</span>
                    <span className="mt-1 flex gap-1 sm:hidden">
                      {day.income ? <i className="h-1.5 w-1.5 rounded-full bg-[#5c9278]" /> : null}
                      {day.expense ? <i className="h-1.5 w-1.5 rounded-full bg-[#d4825a]" /> : null}
                    </span>
                    <span className="mt-2 hidden truncate text-[11px] text-[#38755f] sm:block">+{formatCompact(day.income)}</span>
                    <span className="hidden truncate text-[11px] text-[#ba5a45] sm:block">-{formatCompact(day.expense)}</span>
                  </button>
                ) : (
                  <div key={`blank-${index}`} />
                ),
              )}
            </div>
          </div>

          <div id="input" className="order-1 grid gap-4 xl:order-2">
            <form className="rounded-[22px] border border-[#eadfcd] bg-[#fffaf2]/90 p-4 shadow-sm sm:rounded-[24px]" onSubmit={submitTransaction}>
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold sm:text-xl">{editingTransactionId ? "明細を編集" : "明細を入力"}</h2>
                  <p className="text-sm text-[#78685c]">{selectedDate}</p>
                </div>
                {editingTransactionId ? (
                  <button
                    className="min-h-10 rounded-full border border-[#d8c8af] px-3 py-1.5 text-sm font-semibold"
                    onClick={() => {
                      setEditingTransactionId(null);
                      setTransactionForm(emptyForm(selectedDate));
                    }}
                    type="button"
                  >
                    解除
                  </button>
                ) : null}
              </div>

              <div className="grid gap-3">
                <label className="grid gap-1 text-sm font-semibold">
                  日付
                  <input className="min-h-12 rounded-xl border border-[#d8c8af] bg-white px-3 py-2 text-base" value={transactionForm.date} onChange={(event) => setTransactionForm((form) => ({ ...form, date: event.target.value }))} type="date" />
                </label>
                <div className="grid grid-cols-2 gap-2 rounded-2xl bg-[#f2eadf] p-1">
                  {(["expense", "income"] as const).map((type) => (
                    <button
                      className={`min-h-11 rounded-xl px-3 py-2 text-sm font-bold ${transactionForm.type === type ? "bg-white shadow-sm" : "text-[#806d5c]"}`}
                      key={type}
                      onClick={() =>
                        setTransactionForm((form) => ({
                          ...form,
                          type,
                          category: type === "expense" ? "食費" : "給与",
                        }))
                      }
                      type="button"
                    >
                      {type === "expense" ? "支出" : "収入"}
                    </button>
                  ))}
                </div>
                <label className="grid gap-1 text-sm font-semibold">
                  カテゴリ
                  <select className="min-h-12 rounded-xl border border-[#d8c8af] bg-white px-3 py-2 text-base" value={transactionForm.category} onChange={(event) => setTransactionForm((form) => ({ ...form, category: event.target.value }))}>
                    {(transactionForm.type === "expense" ? expenseCategories : incomeCategories).map((category) => (
                      <option key={category}>{category}</option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-1 text-sm font-semibold">
                  金額
                  <input className="min-h-12 rounded-xl border border-[#d8c8af] bg-white px-3 py-2 text-base" inputMode="numeric" min="0" value={transactionForm.amount || ""} onChange={(event) => setTransactionForm((form) => ({ ...form, amount: Number(event.target.value) }))} placeholder="例: 1200" type="number" />
                </label>
                <label className="grid gap-1 text-sm font-semibold">
                  メモ
                  <input className="min-h-12 rounded-xl border border-[#d8c8af] bg-white px-3 py-2 text-base" value={transactionForm.memo} onChange={(event) => setTransactionForm((form) => ({ ...form, memo: event.target.value }))} placeholder="スーパー、家賃など" />
                </label>
                <button className="min-h-12 rounded-xl bg-[#c77a3d] px-4 py-3 font-bold text-white shadow-sm hover:bg-[#ad6631]" type="submit">
                  {editingTransactionId ? "更新する" : "追加する"}
                </button>
              </div>
            </form>

            <div className="rounded-[22px] border border-[#eadfcd] bg-[#fffaf2]/90 p-4 shadow-sm sm:rounded-[24px]">
              <h2 className="text-lg font-bold sm:text-xl">選択日の明細</h2>
              <div className="mt-3 grid gap-2">
                {selectedTransactions.length ? (
                  selectedTransactions.map((transaction) => (
                    <div className="rounded-2xl border border-[#eadfcd] bg-white/80 p-3" key={transaction.id}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-bold">{transaction.memo || transaction.category}</p>
                          <p className="text-sm text-[#78685c]">{transaction.category}</p>
                        </div>
                        <strong className={transaction.type === "income" ? "text-[#33745f]" : "text-[#b8523e]"}>
                          {transaction.type === "income" ? "+" : "-"}
                          {formatYen(transaction.amount)}
                        </strong>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2 sm:flex">
                        <button className="min-h-9 rounded-full border border-[#d8c8af] px-3 py-1 text-xs font-bold" onClick={() => editTransaction(transaction)} type="button">
                          編集
                        </button>
                        <button className="min-h-9 rounded-full border border-[#e4b5a7] px-3 py-1 text-xs font-bold text-[#a94631]" onClick={() => deleteTransaction(transaction.id)} type="button">
                          削除
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="rounded-2xl border border-dashed border-[#d8c8af] p-4 text-sm text-[#78685c]">この日の明細はまだありません。</p>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
          <div id="fixed" className="rounded-[22px] border border-[#eadfcd] bg-[#fffaf2]/90 p-4 shadow-sm sm:rounded-[24px]">
            <div className="mb-4 grid gap-3 sm:flex sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold sm:text-xl">固定費</h2>
                <p className="text-sm text-[#78685c]">毎月発生する支出を登録して、今月分へまとめて反映できます。</p>
              </div>
              <button className="min-h-11 rounded-full bg-[#6f8f68] px-4 py-2 text-sm font-bold text-white hover:bg-[#5d7d56]" onClick={applyFixedCosts} type="button">
                今月に反映
              </button>
            </div>

            <form className="grid gap-3 rounded-2xl bg-[#f7efe3] p-3" onSubmit={submitFixedCost}>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1 text-sm font-semibold">
                  名称
                  <input className="min-h-12 rounded-xl border border-[#d8c8af] bg-white px-3 py-2 text-base" value={fixedCostForm.name} onChange={(event) => setFixedCostForm((form) => ({ ...form, name: event.target.value }))} placeholder="家賃、サブスクなど" />
                </label>
                <label className="grid gap-1 text-sm font-semibold">
                  金額
                  <input className="min-h-12 rounded-xl border border-[#d8c8af] bg-white px-3 py-2 text-base" inputMode="numeric" min="0" value={fixedCostForm.amount || ""} onChange={(event) => setFixedCostForm((form) => ({ ...form, amount: Number(event.target.value) }))} type="number" />
                </label>
                <label className="grid gap-1 text-sm font-semibold">
                  カテゴリ
                  <select className="min-h-12 rounded-xl border border-[#d8c8af] bg-white px-3 py-2 text-base" value={fixedCostForm.category} onChange={(event) => setFixedCostForm((form) => ({ ...form, category: event.target.value }))}>
                    {expenseCategories.map((category) => (
                      <option key={category}>{category}</option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-1 text-sm font-semibold">
                  毎月の日付
                  <input className="min-h-12 rounded-xl border border-[#d8c8af] bg-white px-3 py-2 text-base" inputMode="numeric" max="31" min="1" value={fixedCostForm.day} onChange={(event) => setFixedCostForm((form) => ({ ...form, day: Number(event.target.value) }))} type="number" />
                </label>
              </div>
              <button className="min-h-12 rounded-xl bg-[#342820] px-4 py-3 font-bold text-white hover:bg-[#514034]" type="submit">
                固定費を追加
              </button>
            </form>

            <div className="mt-4 grid gap-2">
              {fixedCosts.length ? (
                fixedCosts.map((cost) => (
                  <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#eadfcd] bg-white/80 p-3" key={cost.id}>
                    <div>
                      <p className="font-bold">{cost.name}</p>
                      <p className="text-sm text-[#78685c]">
                        毎月{cost.day}日 / {cost.category} / {formatYen(cost.amount)}
                      </p>
                    </div>
                    <div className="grid gap-2 sm:flex">
                      <button className="min-h-9 rounded-full border border-[#d8c8af] px-3 py-1 text-xs font-bold" onClick={() => toggleFixedCost(cost.id)} type="button">
                        {cost.enabled ? "有効" : "無効"}
                      </button>
                      <button className="min-h-9 rounded-full border border-[#e4b5a7] px-3 py-1 text-xs font-bold text-[#a94631]" onClick={() => deleteFixedCost(cost.id)} type="button">
                        削除
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="rounded-2xl border border-dashed border-[#d8c8af] p-4 text-sm text-[#78685c]">固定費はまだ登録されていません。</p>
              )}
            </div>
          </div>

          <div id="charts" className="grid gap-5">
            <ChartPanel title="直近6か月の収支" subtitle="収入・支出・差額を月ごとに比較します。">
              <MonthlyChart data={trendData} />
            </ChartPanel>
            <ChartPanel title="今月の支出カテゴリ" subtitle="支出が大きいカテゴリから表示します。">
              <CategoryBars data={categoryTotals} />
            </ChartPanel>
          </div>
        </section>
      </div>
    </main>
  );
}

function SummaryCard({ label, value, tone }: { label: string; value: number; tone: "income" | "expense" }) {
  return (
    <div className="min-w-[72vw] snap-start rounded-[22px] border border-[#eadfcd] bg-[#fffaf2]/90 p-4 shadow-sm sm:min-w-0 sm:rounded-[24px] sm:p-5">
      <p className="text-sm font-bold text-[#78685c]">{label}</p>
      <strong className={`mt-2 block text-2xl sm:mt-3 sm:text-3xl ${tone === "income" ? "text-[#33745f]" : "text-[#b8523e]"}`}>{formatYen(value)}</strong>
    </div>
  );
}

function ChartPanel({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[22px] border border-[#eadfcd] bg-[#fffaf2]/90 p-4 shadow-sm sm:rounded-[24px]">
      <h2 className="text-lg font-bold sm:text-xl">{title}</h2>
      <p className="text-sm text-[#78685c]">{subtitle}</p>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function MonthlyChart({ data }: { data: ReturnType<typeof buildTrendData> }) {
  const maxValue = Math.max(1, ...data.flatMap((item) => [item.income, item.expense]));
  return (
    <div className="grid gap-3">
      <div className="h-56 rounded-2xl bg-white/80 p-3 sm:h-72">
        <svg className="h-full w-full" role="img" viewBox="0 0 600 260">
          {data.map((item, index) => {
            const groupX = 24 + index * 94;
            const incomeHeight = (item.income / maxValue) * 170;
            const expenseHeight = (item.expense / maxValue) * 170;
            return (
              <g key={item.month}>
                <rect fill="#6f8f68" height={incomeHeight} rx="8" width="26" x={groupX} y={200 - incomeHeight} />
                <rect fill="#d4825a" height={expenseHeight} rx="8" width="26" x={groupX + 32} y={200 - expenseHeight} />
                <text fill="#7b6b5f" fontSize="12" textAnchor="middle" x={groupX + 29} y="228">
                  {item.month.slice(5)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="flex gap-4 text-sm font-semibold text-[#78685c]">
        <span className="inline-flex items-center gap-2"><i className="h-3 w-3 rounded-full bg-[#6f8f68]" />収入</span>
        <span className="inline-flex items-center gap-2"><i className="h-3 w-3 rounded-full bg-[#d4825a]" />支出</span>
      </div>
    </div>
  );
}

function CategoryBars({ data }: { data: { category: string; amount: number }[] }) {
  const maxValue = Math.max(1, ...data.map((item) => item.amount));
  if (!data.length) {
    return <p className="rounded-2xl border border-dashed border-[#d8c8af] p-4 text-sm text-[#78685c]">今月の支出はまだありません。</p>;
  }
  return (
    <div className="grid gap-3">
      {data.map((item) => (
        <div key={item.category}>
          <div className="mb-1 flex justify-between gap-3 text-sm">
            <span className="font-bold">{item.category}</span>
            <span className="text-[#78685c]">{formatYen(item.amount)}</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-[#eadfcd]">
            <div className="h-full rounded-full bg-[#d4825a]" style={{ width: `${Math.max(4, (item.amount / maxValue) * 100)}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function buildCalendarDays(monthKey: string, transactions: Transaction[]) {
  const date = parseMonthKey(monthKey);
  const firstDay = date.getDay();
  const daysInMonth = getDaysInMonth(monthKey);
  const blankDays = Array.from({ length: firstDay }, () => null);
  const calendarDays = Array.from({ length: daysInMonth }, (_, index) => {
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

function buildCategoryTotals(transactions: Transaction[]) {
  const totals = new Map<string, number>();
  transactions
    .filter((transaction) => transaction.type === "expense")
    .forEach((transaction) => {
      totals.set(transaction.category, (totals.get(transaction.category) ?? 0) + transaction.amount);
    });
  return Array.from(totals, ([category, amount]) => ({ category, amount })).sort((a, b) => b.amount - a.amount);
}

function buildTrendData(transactions: Transaction[], currentMonth: string) {
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

function formatCompact(value: number) {
  if (!value) return "0";
  if (value >= 10000) return `${Math.round(value / 1000) / 10}万`;
  return value.toLocaleString("ja-JP");
}
