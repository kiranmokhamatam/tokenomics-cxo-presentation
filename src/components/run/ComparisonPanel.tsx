/**
 * Post-run comparison of the three strategies. Shared by Explore Mode
 * and Presentation Slide 07 (where the metric toggle is presenter-driven).
 */
import { motion } from 'framer-motion'
import { useState } from 'react'
import { DISCLAIMER, STRATEGIES, STRATEGY_ORDER, type StrategyId } from '../../data/config'
import type { StrategyResult } from '../../engine/simulation'
import { fmtCost, fmtSeconds } from '../../lib/format'
import { CountUp, Disclaimer } from '../ui'

type Metric = 'cost' | 'speed' | 'quality'

const METRICS: { id: Metric; label: string; hint: string }[] = [
  { id: 'cost', label: 'Cost', hint: 'per conversation, lower is better' },
  { id: 'speed', label: 'Speed', hint: 'total response time, lower is better' },
  { id: 'quality', label: 'Quality', hint: 'weighted score, higher is better' },
]

function metricValue(r: StrategyResult, m: Metric) {
  return m === 'cost' ? r.totals.cost : m === 'speed' ? r.totals.time : r.totals.quality
}
function metricFormat(m: Metric, v: number) {
  return m === 'cost' ? fmtCost(v) : m === 'speed' ? fmtSeconds(v) : Math.round(v).toString()
}

export default function ComparisonPanel({
  results,
  visible,
}: {
  results: Record<StrategyId, StrategyResult>
  visible: boolean
}) {
  const [metric, setMetric] = useState<Metric>('cost')
  const values = STRATEGY_ORDER.map((id) => metricValue(results[id], metric))
  const max = Math.max(...values)
  const active = METRICS.find((m) => m.id === metric)!

  return (
    <motion.div
      initial={false}
      animate={{ opacity: visible ? 1 : 0.25 }}
      transition={{ duration: 0.5 }}
      className="border border-hairline bg-white"
    >
      <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-hairline flex-wrap gap-3">
        <div>
          <h4 className="text-[14px] font-semibold tracking-tight">The result</h4>
          <p className="text-[11.5px] text-gray-cool mt-0.5">{active.hint}</p>
        </div>
        <div className="inline-flex border border-hairline" role="tablist" aria-label="Metric">
          {METRICS.map((m) => (
            <button
              key={m.id}
              role="tab"
              aria-selected={metric === m.id}
              onClick={() => setMetric(m.id)}
              className={`px-3.5 py-1.5 text-[11.5px] tracking-wide transition-colors ${
                metric === m.id ? 'bg-ink text-white' : 'text-ink-soft hover:bg-pru-wash'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 py-4 flex flex-col gap-3">
        {STRATEGY_ORDER.map((id, i) => {
          const v = values[i]
          const frac = max > 0 ? v / max : 0
          const isOrch = id === 'orchestrated'
          return (
            <div key={id} className="grid grid-cols-[130px_1fr_84px] items-center gap-3">
              <span className={`text-[12.5px] ${isOrch ? 'font-semibold text-ink' : 'text-ink-soft'}`}>
                {STRATEGIES[id].name}
              </span>
              <div className="h-[18px] bg-pru-wash/70 relative overflow-hidden">
                <motion.div
                  className={`absolute inset-y-0 left-0 ${isOrch ? 'bg-pru-deep' : 'bg-gray-cool/45'}`}
                  initial={false}
                  animate={{ width: visible ? `${Math.max(frac * 100, 2)}%` : '0%' }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
              <span className={`num text-right text-[13px] ${isOrch ? 'font-semibold' : 'text-ink-soft'}`}>
                {visible ? <CountUp value={v} format={(x) => metricFormat(metric, x)} /> : '—'}
              </span>
            </div>
          )
        })}
        <div className="flex items-center justify-between pt-2 border-t border-hairline/70">
          <p className="text-[12px] text-ink-soft leading-snug max-w-[420px]">
            The Orchestrated strategy wins on the <em>combination</em> — near-frontier quality at a
            fraction of the cost, at efficient-class speed.
          </p>
          <Disclaimer text={DISCLAIMER} className="hidden md:block" />
        </div>
      </div>
    </motion.div>
  )
}
