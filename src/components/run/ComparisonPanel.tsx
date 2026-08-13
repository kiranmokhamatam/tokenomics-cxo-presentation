/**
 * Post-run comparison of the three strategies. Shared by Explore Mode
 * and Presentation Slide 07. All three metrics are shown at once —
 * quality first, then speed, then cost.
 */
import { motion } from 'framer-motion'
import { DISCLAIMER, STRATEGIES, STRATEGY_ORDER, type StrategyId } from '../../data/config'
import type { StrategyResult } from '../../engine/simulation'
import { fmtCost, fmtSeconds } from '../../lib/format'
import { CountUp, Disclaimer } from '../ui'

type Metric = 'quality' | 'speed' | 'cost'

const METRICS: { id: Metric; label: string; hint: string }[] = [
  { id: 'quality', label: 'Quality', hint: 'weighted score · higher is better' },
  { id: 'speed', label: 'Speed', hint: 'total response time · lower is better' },
  { id: 'cost', label: 'Cost', hint: 'per conversation · lower is better' },
]

function metricValue(r: StrategyResult, m: Metric) {
  return m === 'cost' ? r.totals.cost : m === 'speed' ? r.totals.time : r.totals.quality
}
function metricFormat(m: Metric, v: number) {
  return m === 'cost' ? fmtCost(v) : m === 'speed' ? fmtSeconds(v) : Math.round(v).toString()
}

function MetricColumn({
  metric,
  results,
  visible,
}: {
  metric: (typeof METRICS)[number]
  results: Record<StrategyId, StrategyResult>
  visible: boolean
}) {
  const values = STRATEGY_ORDER.map((id) => metricValue(results[id], metric.id))
  const max = Math.max(...values)

  return (
    <div className="px-5 py-4">
      <div className="mb-4">
        <h5 className="text-[13px] font-semibold tracking-tight">{metric.label}</h5>
        <p className="text-[10.5px] text-gray-cool mt-0.5">{metric.hint}</p>
      </div>
      <div className="flex flex-col gap-3">
        {STRATEGY_ORDER.map((id, i) => {
          const v = values[i]
          const frac = max > 0 ? v / max : 0
          const isOrch = id === 'orchestrated'
          return (
            <div key={id}>
              <div className="flex items-baseline justify-between mb-1">
                <span
                  className={`text-[11.5px] ${isOrch ? 'font-semibold text-ink' : 'text-ink-soft'}`}
                >
                  {STRATEGIES[id].name}
                </span>
                <span
                  className={`num text-[12.5px] ${isOrch ? 'font-semibold' : 'text-ink-soft'}`}
                >
                  {visible ? <CountUp value={v} format={(x) => metricFormat(metric.id, x)} /> : '—'}
                </span>
              </div>
              <div className="h-[13px] bg-pru-wash/70 relative overflow-hidden">
                <motion.div
                  className={`absolute inset-y-0 left-0 ${isOrch ? 'bg-pru-deep' : 'bg-gray-cool/45'}`}
                  initial={false}
                  animate={{ width: visible ? `${Math.max(frac * 100, 2)}%` : '0%' }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function ComparisonPanel({
  results,
  visible,
}: {
  results: Record<StrategyId, StrategyResult>
  visible: boolean
}) {
  return (
    <motion.div
      initial={false}
      animate={{ opacity: visible ? 1 : 0.25 }}
      transition={{ duration: 0.5 }}
      className="border border-hairline bg-white"
    >
      <div className="px-5 pt-4 pb-3 border-b border-hairline">
        <h4 className="text-[14px] font-semibold tracking-tight">The result</h4>
      </div>

      <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-hairline">
        {METRICS.map((m) => (
          <MetricColumn key={m.id} metric={m} results={results} visible={visible} />
        ))}
      </div>

      <div className="flex items-center justify-between gap-4 px-5 py-3 border-t border-hairline/70 flex-wrap">
        <p className="text-[12px] text-ink-soft leading-snug max-w-[520px]">
          The Orchestrated strategy holds within a point or two of frontier quality — at
          efficient-class speed and a fraction of the cost.
        </p>
        <Disclaimer text={DISCLAIMER} className="hidden md:block" />
      </div>
    </motion.div>
  )
}
