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
  setFixedCostForm: Dispatch<SetStateAction<FixedCostFormState>>;
  sharedLedgerStatus: SharedLedgerStatus;
  submitFixedCost: (event: FormEvent<HTMLFormElement>) => void;
  toggleFixedCost: (id: string) => void;
  updateSharedLedgerJoinCode: (joinCode: string) => void;
  updateMonthStartDay: (day: number) => void;
};

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
  setFixedCostForm,
  sharedLedgerStatus,
  submitFixedCost,
  toggleFixedCost,
  updateSharedLedgerJoinCode,
  updateMonthStartDay,
}: FixedCostSectionProps) {
  const isBusy = sharedLedgerStatus.syncState === "loading" || sharedLedgerStatus.syncState === "saving";

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
            <strong>{sharedLedgerStatus.mode === "shared" ? "共有中" : "ローカル保存"}</strong>
          </div>
          <p>{sharedLedgerStatus.syncState === "saving" ? "保存中" : sharedLedgerStatus.syncState === "error" ? "要確認" : "同期OK"}</p>
        </div>

        {sharedLedgerStatus.mode === "shared" ? (
          <div className="share-code-box">
            <span>共有コード</span>
            <strong>{sharedLedgerStatus.code}</strong>
          </div>
        ) : (
          <p className="share-panel-copy">
            共有コードを作ると、この家計簿を別端末や家族の端末から同じ内容で開けます。
          </p>
        )}

        <div className="share-actions">
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
          <p className="share-warning">サーバーの DATABASE_URL が未設定のため、共有はまだ使えません。</p>
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
