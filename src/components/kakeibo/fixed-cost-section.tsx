import { Dispatch, FormEvent, SetStateAction } from "react";
import { FixedCostForm } from "@/components/kakeibo/fixed-cost-form";
import { FixedCostListItem } from "@/components/kakeibo/fixed-cost-list-item";
import type { FixedCost, FixedCostFormState, SharedLedgerStatus } from "@/types/kakeibo";

type FixedCostSectionProps = {
  applyFixedCosts: () => void;
  createSharedBook: () => void;
  deleteFixedCost: (id: string) => void;
  fixedCostForm: FixedCostFormState;
  fixedCosts: FixedCost[];
  joinSharedBook: () => void;
  leaveSharedBook: () => void;
  monthStartDay: number;
  periodRangeLabel: string;
  refreshSharedBook: () => void;
  setFixedCostForm: Dispatch<SetStateAction<FixedCostFormState>>;
  sharedLedgerStatus: SharedLedgerStatus;
  submitFixedCost: (event: FormEvent<HTMLFormElement>) => void;
  toggleFixedCost: (id: string) => void;
  updateSharedLedgerJoinCode: (joinCode: string) => void;
  updateMonthStartDay: (day: number) => void;
};

function buildLineShareUrl(label: string, code: string) {
  const message = `kakeiboの${label}です。\n${code}`;
  return `https://line.me/R/share?text=${encodeURIComponent(message)}`;
}

export function FixedCostSection({
  applyFixedCosts,
  createSharedBook,
  deleteFixedCost,
  fixedCostForm,
  fixedCosts,
  joinSharedBook,
  leaveSharedBook,
  monthStartDay,
  periodRangeLabel,
  refreshSharedBook,
  setFixedCostForm,
  sharedLedgerStatus,
  submitFixedCost,
  toggleFixedCost,
  updateSharedLedgerJoinCode,
  updateMonthStartDay,
}: FixedCostSectionProps) {
  const isBusy =
    sharedLedgerStatus.syncState === "loading" ||
    sharedLedgerStatus.syncState === "refreshing" ||
    sharedLedgerStatus.syncState === "saving";
  const syncLabel = sharedLedgerStatus.syncState === "saving"
    ? "保存中"
    : sharedLedgerStatus.syncState === "refreshing"
      ? "更新中"
      : sharedLedgerStatus.syncState === "error"
        ? "要確認"
        : "同期OK";
  const canEditSharedBook = sharedLedgerStatus.mode !== "shared" || sharedLedgerStatus.permission === "editor";

  return (
    <section className="settings-page">
      <div className="period-setting-card">
        <div className="period-setting-head">
          <div>
            <span>集計期間</span>
            <strong>毎月{monthStartDay}日開始</strong>
          </div>
          <p>{periodRangeLabel}</p>
        </div>
        <div className="start-day-control">
          <button onClick={() => updateMonthStartDay(monthStartDay - 1)} type="button" aria-label="開始日を1日前へ">
            −
          </button>
          <input
            aria-label="月の開始日"
            max="28"
            min="1"
            onChange={(event) => updateMonthStartDay(Number(event.target.value))}
            type="range"
            value={monthStartDay}
          />
          <button onClick={() => updateMonthStartDay(monthStartDay + 1)} type="button" aria-label="開始日を1日後へ">
            +
          </button>
        </div>
        <div className="quick-start-days" aria-label="よく使う開始日">
          {[1, 10, 15, 20, 25].map((day) => (
            <button
              className={monthStartDay === day ? "active" : ""}
              key={day}
              onClick={() => updateMonthStartDay(day)}
              type="button"
            >
              {day}日
            </button>
          ))}
        </div>
      </div>

      <div className="settings-group">
        <button className="setting-row" onClick={applyFixedCosts} type="button">
          <span>固定費を今月に反映</span>
          <b>›</b>
        </button>
      </div>

      <div className="share-panel">
        <div className="share-panel-head">
          <div>
            <span>共有家計簿</span>
            <strong>
              {sharedLedgerStatus.mode === "shared"
                ? sharedLedgerStatus.permission === "editor"
                  ? "編集できます"
                  : "閲覧のみ"
                : "ローカル保存"}
            </strong>
          </div>
          <p>{syncLabel}</p>
        </div>

        {sharedLedgerStatus.mode === "shared" ? (
          <>
            <div className="share-code-box">
              <div>
                <span>閲覧コード</span>
                <strong>{sharedLedgerStatus.readCode || sharedLedgerStatus.code}</strong>
              </div>
              <a
                className="line-share-button"
                href={buildLineShareUrl("閲覧コード", sharedLedgerStatus.readCode || sharedLedgerStatus.code)}
                rel="noreferrer"
                target="_blank"
              >
                LINEで送る
              </a>
            </div>
            {sharedLedgerStatus.permission === "editor" && sharedLedgerStatus.editCode ? (
              <div className="share-code-box">
                <div>
                  <span>編集コード</span>
                  <strong>{sharedLedgerStatus.editCode}</strong>
                </div>
                <a
                  className="line-share-button"
                  href={buildLineShareUrl("編集コード", sharedLedgerStatus.editCode)}
                  rel="noreferrer"
                  target="_blank"
                >
                  LINEで送る
                </a>
              </div>
            ) : null}
            {!canEditSharedBook ? (
              <p className="share-panel-copy">閲覧コードで参加中です。追加や削除は編集コードで参加した端末だけ行えます。</p>
            ) : null}
          </>
        ) : (
          <p className="share-panel-copy">
            共有を開始すると、見るだけの閲覧コードと編集できる編集コードを発行します。
          </p>
        )}

        <div className="share-actions">
          {sharedLedgerStatus.mode === "shared" ? (
            <button className="share-refresh-button" disabled={isBusy} onClick={refreshSharedBook} type="button">
              最新に更新
            </button>
          ) : null}
          <button
            className="save-button"
            disabled={isBusy || sharedLedgerStatus.mode === "shared"}
            onClick={createSharedBook}
            type="button"
          >
            共有を開始
          </button>
          <div className="share-join-row">
            <input
              aria-label="共有コード"
              onChange={(event) => updateSharedLedgerJoinCode(event.target.value)}
              placeholder="共有コード"
              value={sharedLedgerStatus.joinCode}
            />
            <button disabled={isBusy} onClick={joinSharedBook} type="button">
              参加
            </button>
          </div>
          {sharedLedgerStatus.mode === "shared" ? (
            <button className="share-leave-button" disabled={isBusy} onClick={leaveSharedBook} type="button">
              この端末だけローカル保存に戻す
            </button>
          ) : null}
        </div>

        {!sharedLedgerStatus.configured ? (
          <p className="share-warning">
            {sharedLedgerStatus.message || "サーバーの DATABASE_URL が未設定のため、共有はまだ使えません。"}
          </p>
        ) : null}
      </div>

      <FixedCostForm fixedCostForm={fixedCostForm} setFixedCostForm={setFixedCostForm} submitFixedCost={submitFixedCost} />

      <div className="fixed-cost-list">
        {fixedCosts.length ? (
          fixedCosts.map((cost) => (
            <FixedCostListItem
              cost={cost}
              deleteFixedCost={deleteFixedCost}
              key={cost.id}
              toggleFixedCost={toggleFixedCost}
            />
          ))
        ) : (
          <p className="empty-state">固定費はまだ登録されていません。</p>
        )}
      </div>
    </section>
  );
}
