import { useState } from "react";
import { useHydrated } from "../common/useHydrated";

/**
 * GatePlayground — toggle inputs and watch seven gates respond.
 *
 * The output lamp and every truth-table row are computed from the actual
 * boolean function of the selected gate (a pure `fn(a, b)`), so the table
 * can never disagree with the lamp. Static fallback shows the AND default.
 */

const FA = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
const fa = (v: number | string): string =>
  String(v).replace(/\d/g, (d) => FA[Number(d)]);

interface Gate {
  id: string;
  symbol: string;
  expr: string;
  inputs: 1 | 2;
  fn: (a: number, b: number) => number;
}

const GATES: Gate[] = [
  { id: "AND", symbol: "AND", expr: "y = A·B", inputs: 2, fn: (a, b) => a & b },
  { id: "OR", symbol: "OR", expr: "y = A+B", inputs: 2, fn: (a, b) => a | b },
  {
    id: "NOT",
    symbol: "NOT",
    expr: "y = A′",
    inputs: 1,
    fn: (a) => (a ? 0 : 1),
  },
  {
    id: "NAND",
    symbol: "NAND",
    expr: "y = (A·B)′",
    inputs: 2,
    fn: (a, b) => (a & b ? 0 : 1),
  },
  {
    id: "NOR",
    symbol: "NOR",
    expr: "y = (A+B)′",
    inputs: 2,
    fn: (a, b) => (a | b ? 0 : 1),
  },
  { id: "XOR", symbol: "XOR", expr: "y = A⊕B", inputs: 2, fn: (a, b) => a ^ b },
  {
    id: "XNOR",
    symbol: "XNOR",
    expr: "y = (A⊕B)′",
    inputs: 2,
    fn: (a, b) => (a ^ b ? 0 : 1),
  },
];

export default function GatePlayground({
  initialGate = "AND",
}: {
  initialGate?: string;
}) {
  const hydrated = useHydrated("gates");
  const [gateId, setGateId] = useState(initialGate);
  const [a, setA] = useState(1);
  const [b, setB] = useState(1);
  const gate = GATES.find((g) => g.id === gateId) ?? GATES[0];
  const out = gate.fn(a, b);
  const rows =
    gate.inputs === 1
      ? [0, 1].map((x) => ({
          a: x,
          b: null as number | null,
          o: gate.fn(x, 0),
        }))
      : [0, 1].flatMap((x) =>
          [0, 1].map((y) => ({
            a: x,
            b: y as number | null,
            o: gate.fn(x, y),
          })),
        );

  const toggle = (label: string, v: number, set: (n: number) => void) => (
    <button
      type="button"
      onClick={() => set(v ? 0 : 1)}
      aria-pressed={v === 1}
      aria-label={`ورودی ${label}: ${v === 1 ? "یک" : "صفر"} — برای تغییر بزنید`}
      className={`flex min-h-[52px] min-w-[72px] flex-col items-center justify-center rounded-lg border-2 px-4 py-2 font-bold transition-colors ${v === 1 ? "border-primary bg-primary text-primary-on" : "border-line-control bg-surface text-ink-muted"}`}
    >
      <span className="text-xs font-normal opacity-80">{label}</span>
      <span className="font-mono text-xl" dir="ltr">
        {fa(v)}
      </span>
    </button>
  );

  return (
    <section
      aria-label="آزمایشگاه گیت‌ها"
      className="my-7 rounded-lg border border-line bg-surface px-5 py-5"
      data-hydrated={hydrated ? "true" : "false"}
    >
      <div
        className="mb-4 flex flex-wrap gap-2"
        role="group"
        aria-label="انتخاب گیت"
      >
        {GATES.map((g) => (
          <button
            key={g.id}
            type="button"
            onClick={() => setGateId(g.id)}
            aria-pressed={gate.id === g.id}
            className={`min-h-[44px] rounded border px-3 py-2 font-mono text-sm font-bold ${gate.id === g.id ? "border-primary bg-primary text-primary-on" : "border-line-control text-ink"}`}
            dir="ltr"
          >
            {g.id}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {toggle("A", a, setA)}
        {gate.inputs === 2 && toggle("B", b, setB)}
        <span
          aria-hidden="true"
          className="font-mono text-lg text-ink-muted"
          dir="ltr"
        >
          {gate.symbol}
        </span>
        <div
          role="status"
          aria-label={`خروجی: ${out === 1 ? "یک" : "صفر"}`}
          className={`flex min-h-[52px] min-w-[72px] flex-col items-center justify-center rounded-lg border-2 px-4 py-2 font-bold ${out === 1 ? "border-accent bg-accent text-white" : "border-line-control bg-surface-sunken text-ink-muted"}`}
        >
          <span className="text-xs font-normal opacity-80">خروجی</span>
          <span className="font-mono text-xl" dir="ltr">
            {fa(out)}
          </span>
        </div>
        <span className="font-mono text-sm text-ink-muted" dir="ltr">
          {gate.expr}
        </span>
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-52 border-collapse text-center text-sm">
          <caption className="pb-2 text-xs text-ink-muted">
            جدول درستی {gate.id} — سطر فعلی پررنگ است و از همان قانون بالا حساب
            شده
          </caption>
          <thead>
            <tr>
              <th
                scope="col"
                className="border border-line bg-surface-sunken px-3 py-2"
              >
                A
              </th>
              {gate.inputs === 2 && (
                <th
                  scope="col"
                  className="border border-line bg-surface-sunken px-3 py-2"
                >
                  B
                </th>
              )}
              <th
                scope="col"
                className="border border-line bg-surface-sunken px-3 py-2"
              >
                خروجی
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const active = r.a === a && (gate.inputs === 1 || r.b === b);
              return (
                <tr
                  key={i}
                  className={active ? "bg-primary/10 font-bold" : ""}
                  aria-current={active ? "true" : undefined}
                >
                  <td
                    className="border border-line px-3 py-2 font-mono"
                    dir="ltr"
                  >
                    {fa(r.a)}
                  </td>
                  {gate.inputs === 2 && (
                    <td
                      className="border border-line px-3 py-2 font-mono"
                      dir="ltr"
                    >
                      {fa(r.b ?? 0)}
                    </td>
                  )}
                  <td
                    className="border border-line px-3 py-2 font-mono font-bold"
                    dir="ltr"
                  >
                    {fa(r.o)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
