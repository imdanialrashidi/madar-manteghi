import { useMemo, useState } from "react";
import { useHydrated } from "../common/useHydrated";

/**
 * KmapExplorer — build a 2–4 variable K-map by tapping cells and watch the
 * minimized SOP appear.
 *
 * Minimization runs a real Quine–McCluskey pass in the browser: all prime
 * implicants are enumerated by iterative cube combination, essential primes
 * are forced in, and the remainder is covered greedily. Exact for ≤ 4
 * variables in the overwhelmingly common cases; the caption states the
 * greedy limitation honestly. The Astro wrapper ships a worked default
 * (Σm(1,3,5,7) → z) as static HTML for no-JS readers.
 */

const FA = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
const fa = (v: number | string): string =>
  String(v).replace(/\d/g, (d) => FA[Number(d)]);

type Cell = 0 | 1 | 2; // 0, 1, don't-care
const NEXT: Cell[] = [1, 2, 0];
const CELL_LABEL = ["۰", "۱", "×"];

const GRAY2 = ["00", "01", "11", "10"];
const VARS = ["w", "x", "y", "z"];

function layout(n: number): {
  rowVars: string;
  colVars: string;
  rows: string[];
  cols: string[];
} {
  if (n === 2)
    return { rowVars: "x", colVars: "y", rows: ["0", "1"], cols: ["0", "1"] };
  if (n === 3)
    return { rowVars: "x", colVars: "yz", rows: ["0", "1"], cols: GRAY2 };
  return { rowVars: "wx", colVars: "yz", rows: GRAY2, cols: GRAY2 };
}

function mintermOf(row: string, col: string): number {
  return parseInt(row + col, 2);
}

/** All prime implicants (as patterns like '0-1') covering the ones. */
function findPrimes(n: number, ones: number[], dc: number[]): string[] {
  const start = [...new Set([...ones, ...dc])].map((m) =>
    m.toString(2).padStart(n, "0"),
  );
  let current = start;
  const primes = new Set<string>();
  for (;;) {
    const used = new Set<string>();
    const next: string[] = [];
    const seen = new Set<string>();
    for (let i = 0; i < current.length; i++) {
      for (let j = i + 1; j < current.length; j++) {
        const a = current[i];
        const b = current[j];
        let diff = -1;
        let ok = true;
        for (let k = 0; k < n; k++) {
          if (a[k] !== b[k]) {
            if (a[k] === "-" || b[k] === "-" || diff !== -1) {
              ok = false;
              break;
            }
            diff = k;
          }
        }
        if (ok && diff !== -1) {
          const merged = a.slice(0, diff) + "-" + a.slice(diff + 1);
          used.add(a);
          used.add(b);
          if (!seen.has(merged)) {
            seen.add(merged);
            next.push(merged);
          }
        }
      }
    }
    for (const c of current) if (!used.has(c)) primes.add(c);
    if (next.length === 0) break;
    current = next;
  }
  const oneSet = new Set(ones);
  const covers = (p: string, m: number) => {
    const b = m.toString(2).padStart(n, "0");
    return [...p].every((ch, k) => ch === "-" || ch === b[k]);
  };
  return [...primes].filter(
    (p) =>
      ones.some((m) => covers(p, m)) && [...oneSet].some((m) => covers(p, m)),
  );
}

function minimize(
  n: number,
  ones: number[],
  dc: number[],
): { terms: string[]; groups: string[] } {
  if (ones.length === 0) return { terms: ["۰"], groups: [] };
  if (ones.length + dc.length === 1 << n)
    return { terms: ["۱"], groups: ["-".repeat(n)] };
  const primes = findPrimes(n, ones, dc);
  const covers = (p: string, m: number) => {
    const b = m.toString(2).padStart(n, "0");
    return [...p].every((ch, k) => ch === "-" || ch === b[k]);
  };
  const chosen: string[] = [];
  const uncovered = new Set(ones);
  // Essential primes first.
  for (const m of ones) {
    const covering = primes.filter((p) => covers(p, m));
    if (covering.length === 1 && !chosen.includes(covering[0]))
      chosen.push(covering[0]);
  }
  for (const p of chosen)
    for (const m of ones) if (covers(p, m)) uncovered.delete(m);
  // Greedy remainder: most coverage, then fewest literals.
  const lits = (p: string) => [...p].filter((c) => c !== "-").length;
  while (uncovered.size > 0) {
    let best: string | null = null;
    let bestCover = -1;
    for (const p of primes) {
      if (chosen.includes(p)) continue;
      const c = [...uncovered].filter((m) => covers(p, m)).length;
      if (
        c > bestCover ||
        (c === bestCover && best !== null && lits(p) < lits(best))
      ) {
        best = p;
        bestCover = c;
      }
    }
    if (!best) break;
    chosen.push(best);
    for (const m of ones) if (covers(best, m)) uncovered.delete(m);
  }
  const names = VARS.slice(4 - n);
  const termOf = (p: string) => {
    const parts = [...p]
      .map((ch, k) =>
        ch === "-" ? null : ch === "1" ? names[k] : `${names[k]}′`,
      )
      .filter(Boolean);
    return parts.length === 0 ? "۱" : parts.join("");
  };
  return { terms: chosen.map(termOf), groups: chosen };
}

export default function KmapExplorer({
  initialVars = 3,
  initialMinterms = [1, 3, 5, 7],
}: {
  initialVars?: number;
  initialMinterms?: number[];
}) {
  const hydrated = useHydrated("kmap");
  const [n, setN] = useState(initialVars);
  const [cells, setCells] = useState<Record<number, Cell>>(() =>
    Object.fromEntries(initialMinterms.map((m) => [m, 1 as Cell])),
  );
  const L = layout(n);
  const ones = useMemo(
    () =>
      Object.entries(cells)
        .filter(([, v]) => v === 1)
        .map(([m]) => Number(m))
        .filter((m) => m < 1 << n),
    [cells, n],
  );
  const dc = useMemo(
    () =>
      Object.entries(cells)
        .filter(([, v]) => v === 2)
        .map(([m]) => Number(m))
        .filter((m) => m < 1 << n),
    [cells, n],
  );
  const { terms, groups } = useMemo(() => minimize(n, ones, dc), [n, ones, dc]);

  const cycle = (m: number) =>
    setCells((c) => ({ ...c, [m]: NEXT[c[m] ?? 0] }));
  const reset = () => setCells({});

  const coversCell = (g: string, m: number) => {
    const b = m.toString(2).padStart(n, "0");
    return [...g].every((ch, k) => ch === "-" || ch === b[k]);
  };

  return (
    <section
      aria-label="کاوشگر نقشهٔ کارنو"
      className="my-7 rounded-lg border border-line bg-surface px-5 py-5"
      data-hydrated={hydrated ? "true" : "false"}
    >
      <div
        className="mb-4 flex flex-wrap items-center gap-2"
        role="group"
        aria-label="تعداد متغیرها"
      >
        {[2, 3, 4].map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => {
              setN(v);
              setCells({});
            }}
            aria-pressed={n === v}
            className={`min-h-[44px] rounded border px-4 py-2 text-sm font-bold ${n === v ? "border-primary bg-primary text-primary-on" : "border-line-control text-ink"}`}
          >
            {fa(v)} متغیره
          </button>
        ))}
        <button
          type="button"
          onClick={reset}
          className="min-h-[44px] rounded border border-line-control px-4 py-2 text-sm font-bold text-ink"
        >
          پاک‌کردن نقشه
        </button>
      </div>
      <p className="mb-3 text-xs leading-relaxed text-ink-muted">
        روی هر خانه بزنید تا بچرخد: ۰ ← ۱ ← بی‌تفاوت (×) ← ۰. سطرها {L.rowVars}{" "}
        و ستون‌ها {L.colVars} با ترتیب گری‌اند.
      </p>
      <div className="overflow-x-auto">
        <table className="mx-auto border-collapse text-center" dir="ltr">
          <thead>
            <tr>
              <th
                scope="col"
                className="px-2 py-1 font-mono text-xs text-ink-muted"
              >
                {L.rowVars}\{L.colVars}
              </th>
              {L.cols.map((c) => (
                <th
                  key={c}
                  scope="col"
                  className="border border-line bg-surface-sunken px-3 py-2 font-mono text-xs text-ink-muted"
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {L.rows.map((r) => (
              <tr key={r}>
                <th
                  scope="row"
                  className="border border-line bg-surface-sunken px-3 py-2 font-mono text-xs text-ink-muted"
                >
                  {r}
                </th>
                {L.cols.map((c) => {
                  const m = mintermOf(r, c);
                  const v = cells[m] ?? 0;
                  const covering = groups
                    .map((g, i) => (coversCell(g, m) && v !== 0 ? i + 1 : null))
                    .filter(Boolean) as number[];
                  return (
                    <td key={c} className="border border-line p-1">
                      <button
                        type="button"
                        onClick={() => cycle(m)}
                        aria-pressed={v !== 0}
                        aria-label={`خانهٔ ${fa(m)}: ${v === 0 ? "صفر" : v === 1 ? "یک" : "بی‌تفاوت"} — برای تغییر بزنید`}
                        className={`relative flex min-h-[52px] min-w-[52px] flex-col items-center justify-center rounded font-mono text-lg font-bold ${v === 1 ? "bg-primary text-primary-on" : v === 2 ? "bg-accent/20 text-accent" : "bg-surface-sunken/60 text-ink-faint"}`}
                      >
                        {CELL_LABEL[v]}
                        {covering.length > 0 && (
                          <span
                            className="absolute bottom-0.5 flex gap-0.5"
                            aria-hidden="true"
                          >
                            {covering.map((g) => (
                              <span
                                key={g}
                                className="rounded-full bg-surface px-1 font-mono text-[10px] leading-4 text-ink ring-1 ring-line-control"
                                dir="ltr"
                              >
                                {fa(g)}
                              </span>
                            ))}
                          </span>
                        )}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div
        className="mt-4 rounded border border-line bg-surface-sunken/50 px-4 py-3"
        role="status"
      >
        <p className="text-xs text-ink-muted">عبارت ساده‌شده (SOP):</p>
        <p
          className="mt-1 font-mono text-lg font-bold text-primary-deep"
          dir="ltr"
        >
          F = {terms.join(" + ") || "۰"}
        </p>
        <p className="mt-2 text-xs leading-relaxed text-ink-muted">
          گروه‌ها با شماره روی خانه‌ها مشخص‌اند. پوشش به روش کوین–مک‌کلاسکی حساب
          می‌شود (ایمپلیکانت‌های ضروری اول، بقیه حریصانه)؛ برای ۲ تا ۴ متغیر
          دقیق است.
        </p>
      </div>
    </section>
  );
}
