import { useState } from "react";
import { useHydrated } from "../common/useHydrated";

/**
 * BinaryPlayground — decimal ↔ binary/hex/octal explorer with signed modes.
 *
 * All values are computed from deterministic integer arithmetic (no lookup
 * tables): the displayed binary, hex, complements and signed interpretations
 * always agree with each other by construction. The static fallback in the
 * Astro wrapper shows the same default state (47, 8 bits) for no-JS readers.
 */

const FA = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
const fa = (v: number | string): string =>
  String(v).replace(/\d/g, (d) => FA[Number(d)]);

type Mode = "unsigned" | "ones" | "twos";

const MODES: { id: Mode; label: string }[] = [
  { id: "unsigned", label: "بدون علامت" },
  { id: "ones", label: "مکمل یک" },
  { id: "twos", label: "مکمل دو" },
];

function toBits(value: number, bits: number): string {
  const mask = (1 << bits) - 1;
  return (value & mask).toString(2).padStart(bits, "0");
}

function interpret(bits: string, mode: Mode): number {
  const unsigned = parseInt(bits, 2);
  if (mode === "unsigned" || bits[0] === "0") return unsigned;
  if (mode === "ones") return -parseInt(onesOf(bits), 2);
  const n = bits.length;
  return unsigned - (1 << n);
}

function onesOf(bits: string): string {
  return bits
    .split("")
    .map((b) => (b === "0" ? "1" : "0"))
    .join("");
}

export default function BinaryPlayground({
  initial = 47,
}: {
  initial?: number;
}) {
  const hydrated = useHydrated("binary");
  const [value, setValue] = useState(initial);
  const [bits, setBits] = useState(8);
  const [mode, setMode] = useState<Mode>("twos");

  const max = (1 << bits) - 1;
  const clamped = ((value % (max + 1)) + (max + 1)) % (max + 1);
  const raw = toBits(clamped, bits);
  const ones = onesOf(raw);
  const twos = toBits(
    clamped + 1 > max ? clamped + 1 - (max + 1) : clamped + 1,
    bits,
  );
  const signed = interpret(raw, mode);
  const hex = clamped
    .toString(16)
    .toUpperCase()
    .padStart(Math.ceil(bits / 4), "0");
  const oct = clamped.toString(8).padStart(Math.ceil(bits / 3), "0");

  return (
    <section
      aria-label="آزمایشگاه دودویی"
      className="my-7 rounded-lg border border-line bg-surface px-5 py-5"
      data-hydrated={hydrated ? "true" : "false"}
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <label htmlFor="bin-dec" className="text-sm font-bold text-ink">
          عدد دهدهی:
        </label>
        <input
          id="bin-dec"
          type="number"
          min={0}
          max={max}
          value={value}
          onChange={(e) => setValue(Number(e.target.value) || 0)}
          className="w-28 rounded border border-line-control bg-surface px-2 py-2 text-center text-sm text-ink"
          dir="ltr"
        />
        <input
          type="range"
          min={0}
          max={max}
          value={Math.min(Math.max(value, 0), max)}
          onChange={(e) => setValue(Number(e.target.value))}
          aria-label="انتخاب عدد با لغزنده"
          className="h-[44px] min-w-32 flex-1 accent-[rgb(var(--rgb-primary))]"
          dir="ltr"
        />
      </div>
      <div
        className="mb-4 flex flex-wrap gap-2"
        role="group"
        aria-label="طول کلمه"
      >
        {[4, 8].map((b) => (
          <button
            key={b}
            type="button"
            onClick={() => setBits(b)}
            aria-pressed={bits === b}
            className={`min-h-[44px] rounded border px-4 py-2 text-sm font-bold ${bits === b ? "border-primary bg-primary text-primary-on" : "border-line-control text-ink"}`}
          >
            <span dir="ltr">{fa(b)} بیت</span>
          </button>
        ))}
        <span
          className="mx-1 inline-block w-px self-stretch bg-line"
          aria-hidden="true"
        />
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setMode(m.id)}
            aria-pressed={mode === m.id}
            className={`min-h-[44px] rounded border px-4 py-2 text-sm font-bold ${mode === m.id ? "border-primary bg-primary text-primary-on" : "border-line-control text-ink"}`}
          >
            {m.label}
          </button>
        ))}
      </div>
      <dl className="grid gap-2 sm:grid-cols-2">
        <div className="rounded border border-line bg-surface-sunken/50 px-3 py-2.5">
          <dt className="text-xs text-ink-muted">دودویی ({fa(bits)} بیت)</dt>
          <dd
            className="mt-1 font-mono text-base font-bold tracking-wider text-ink"
            dir="ltr"
          >
            {raw}
          </dd>
        </div>
        <div className="rounded border border-line bg-surface-sunken/50 px-3 py-2.5">
          <dt className="text-xs text-ink-muted">هگز / مبنای هشت</dt>
          <dd className="mt-1 font-mono text-base font-bold text-ink" dir="ltr">
            {hex} / {oct}
          </dd>
        </div>
        <div className="rounded border border-line bg-surface-sunken/50 px-3 py-2.5">
          <dt className="text-xs text-ink-muted">مکمل یک / مکمل دو</dt>
          <dd
            className="mt-1 font-mono text-sm font-bold tracking-wider text-ink"
            dir="ltr"
          >
            {ones} / {twos}
          </dd>
        </div>
        <div className="rounded border border-line bg-surface-sunken/50 px-3 py-2.5">
          <dt className="text-xs text-ink-muted">
            تفسیر علامت‌دار ({MODES.find((m) => m.id === mode)?.label})
          </dt>
          <dd
            className="mt-1 font-mono text-base font-bold text-primary-deep"
            dir="ltr"
          >
            {fa(signed)}
          </dd>
        </div>
      </dl>
      <p className="mt-3 text-xs leading-relaxed text-ink-muted" role="status">
        {raw} در حالت {MODES.find((m) => m.id === mode)?.label} یعنی{" "}
        {fa(signed)}؛ مکمل دوی آن {twos} است.
      </p>
    </section>
  );
}
