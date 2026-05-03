"use client";

import { useState, useMemo } from "react";
import { Calculator, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface MortgageCalculatorProps {
  price: number; // in dollars
}

export function MortgageCalculator({ price }: MortgageCalculatorProps) {
  const [open, setOpen] = useState(false);
  const [downPct, setDownPct] = useState(20);
  const [rate, setRate] = useState(7.0);
  const [years, setYears] = useState(30);

  const { monthly, principal, totalInterest } = useMemo(() => {
    const principal = price * (1 - downPct / 100);
    const r = rate / 100 / 12;
    const n = years * 12;
    if (r === 0) return { monthly: principal / n, principal, totalInterest: 0 };
    const monthly = principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    return { monthly, principal, totalInterest: monthly * n - principal };
  }, [price, downPct, rate, years]);

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white shadow-card overflow-hidden">
      {/* Header toggle */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
        aria-expanded={open}
        aria-label="Toggle mortgage calculator"
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
            <Calculator className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-left">
            <div className="text-sm font-semibold text-slate-800">Mortgage Calculator</div>
            {!open && (
              <div className="text-xs text-slate-500">
                Est. <span className="font-semibold text-slate-700">{fmt(monthly)}/mo</span>
              </div>
            )}
          </div>
        </div>
        {open ? (
          <ChevronUp className="h-4 w-4 text-slate-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-slate-400" />
        )}
      </button>

      {open && (
        <div className="border-t border-[var(--border)] px-5 py-4 space-y-4">
          {/* Monthly payment hero */}
          <div className="rounded-xl bg-blue-50 p-4 text-center">
            <div className="text-3xl font-extrabold text-blue-700">{fmt(monthly)}<span className="text-base font-semibold">/mo</span></div>
            <div className="mt-1 text-xs text-blue-500">Principal &amp; Interest · {years}-yr fixed</div>
          </div>

          {/* Down payment */}
          <div>
            <div className="mb-1 flex justify-between text-xs font-medium text-slate-700">
              <label htmlFor="down-pct">Down Payment</label>
              <span>{downPct}% · {fmt(price * downPct / 100)}</span>
            </div>
            <input
              id="down-pct"
              type="range"
              min={3} max={50} step={1}
              value={downPct}
              onChange={(e) => setDownPct(Number(e.target.value))}
              className="w-full accent-blue-600"
              aria-label="Down payment percentage"
            />
            <div className="mt-0.5 flex justify-between text-xs text-slate-400">
              <span>3%</span><span>50%</span>
            </div>
          </div>

          {/* Interest rate */}
          <div>
            <div className="mb-1 flex justify-between text-xs font-medium text-slate-700">
              <label htmlFor="interest-rate">Interest Rate</label>
              <span>{rate.toFixed(1)}%</span>
            </div>
            <input
              id="interest-rate"
              type="range"
              min={3} max={12} step={0.1}
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
              className="w-full accent-blue-600"
              aria-label="Interest rate"
            />
            <div className="mt-0.5 flex justify-between text-xs text-slate-400">
              <span>3%</span><span>12%</span>
            </div>
          </div>

          {/* Loan term */}
          <div>
            <p className="mb-2 text-xs font-medium text-slate-700">Loan Term</p>
            <div className="flex gap-2">
              {[10, 15, 20, 30].map((y) => (
                <button
                  key={y}
                  onClick={() => setYears(y)}
                  className={cn(
                    "flex-1 rounded-lg border py-1.5 text-xs font-semibold transition-colors",
                    years === y
                      ? "border-blue-500 bg-blue-600 text-white"
                      : "border-[var(--border)] text-slate-600 hover:bg-slate-50"
                  )}
                >
                  {y}yr
                </button>
              ))}
            </div>
          </div>

          {/* Breakdown */}
          <div className="rounded-xl bg-slate-50 p-3 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Loan amount</span>
              <span className="font-medium text-slate-800">{fmt(principal)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Total interest</span>
              <span className="font-medium text-slate-800">{fmt(totalInterest)}</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-1.5 font-semibold text-slate-700">
              <span>Total cost</span>
              <span>{fmt(principal + totalInterest)}</span>
            </div>
          </div>

          <p className="text-center text-xs text-slate-400">
            Estimate only. Does not include taxes, insurance, or HOA fees.
          </p>
        </div>
      )}
    </div>
  );
}
