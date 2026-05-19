import { Dispatch, FormEvent, SetStateAction } from "react";
import { FixedCostForm } from "@/components/kakeibo/fixed-cost-form";
import { FixedCostListItem } from "@/components/kakeibo/fixed-cost-list-item";
import type { FixedCost, FixedCostFormState } from "@/types/kakeibo";

type FixedCostSectionProps = {
  applyFixedCosts: () => void;
  deleteFixedCost: (id: string) => void;
  fixedCostForm: FixedCostFormState;
  fixedCosts: FixedCost[];
  monthStartDay: number;
  periodRangeLabel: string;
  setFixedCostForm: Dispatch<SetStateAction<FixedCostFormState>>;
  submitFixedCost: (event: FormEvent<HTMLFormElement>) => void;
  toggleFixedCost: (id: string) => void;
  updateMonthStartDay: (day: number) => void;
};

export function FixedCostSection({
  applyFixedCosts,
  deleteFixedCost,
  fixedCostForm,
  fixedCosts,
  monthStartDay,
  periodRangeLabel,
  setFixedCostForm,
  submitFixedCost,
  toggleFixedCost,
  updateMonthStartDay,
}: FixedCostSectionProps) {
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
