/**
 * Enterprise-scale economics — volume slider, strategy comparison at scale,
 * model utilization. Shared by Explore Mode (Chapter 03) and Presentation
 * Slide 08, where the presenter moves the slider live.
 */
import { motion } from 'framer-motion'
import { useMemo } from 'react'
import {
  DISCLAIMER_LONG,
  MODELS,
  STRATEGIES,
  STRATEGY_ORDER,
  VOLUME,
  type ModelTier,
  type ScenarioId,
  type StrategyId,
} from '../../data/config'
import { scaleEconomics } from '../../engine/simulation'
import { fmtMoney, fmtPct, fmtRuns, fmtInt } from '../../lib/format'
import { CountUp, Disclaimer, TierDots } from '../ui'

export interface ScaleState {
  runs: number
  turns: number
  strategy: StrategyId
  qualityTarget: number
}

export const DEFAULT_SCALE_STATE: ScaleState = {
  runs: VOLUME.default,
  turns: VOLUME.turnsDefault,
  strategy: 'orchestrated',
  qualityTarget: VOLUME.qualityTargetDefault,
}

/* log-scale slider mapping for runs/month */
const LOG_MIN = Math.log10(VOLUME.min)
const LOG_MAX = Math.log10(VOLUME.max)
export const runsToSlider = (runs: number) => ((Math.log10(runs) - LOG_MIN) / (LOG_MAX - LOG_MIN)) * 1000
export const sliderToRuns = (v: number) => {
  const raw = Math.pow(10, LOG_MIN + (v / 1000) * (LOG_MAX - LOG_MIN))
  // snap to tidy steps
  const mag = Math.pow(10, Math.floor(Math.log10(raw)))
  return Math.round(raw / (mag / 10)) * (mag / 10)
}

export function VolumeSlider({
  runs,
  onChange,
  className = '',
}: {
  runs: number
  onChange: (runs: number) => void
  className?: string
}) {
  return (
    <div className={className}>
      <div className="flex items-baseline justify-between mb-3">
        <p className="kicker">Agent runs / month</p>
        <p className="num text-2xl font-medium">{fmtRuns(runs)}</p>
      </div>
      <input
        type="range"
        min={0}
        max={1000}
        value={runsToSlider(runs)}
        onChange={(e) => onChange(sliderToRuns(Number(e.target.value)))}
        aria-label="Agent runs per month"
      />
      <div className="flex justify-between mt-2 font-mono text-[10px] text-gray-cool">
        <span>100K</span>
        <span>1M</span>
        <span>10M</span>
      </div>
    </div>
  )
}

function UtilizationBar({ mix }: { mix: Record<ModelTier, number> }) {
  const tiers: ModelTier[] = ['efficient', 'advanced', 'frontier']
  const colors: Record<ModelTier, string> = {
    efficient: 'bg-gray-cool/35',
    advanced: 'bg-pru/55',
    frontier: 'bg-pru-deep',
  }
  return (
    <div>
      <div className="flex h-[10px] overflow-hidden">
        {tiers.map((t) => (
          <motion.div
            key={t}
            className={colors[t]}
            initial={false}
            animate={{ width: `${mix[t] * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        ))}
      </div>
      <div className="flex gap-4 mt-2 flex-wrap">
        {tiers.map(
          (t) =>
            mix[t] > 0 && (
              <span key={t} className="inline-flex items-center gap-1.5 text-[10.5px] text-ink-soft">
                <span className={`w-2 h-2 inline-block ${colors[t]}`} aria-hidden />
                <TierDots tier={t} />
                {MODELS[t].shortName} {fmtPct(mix[t])}
              </span>
            ),
        )}
      </div>
    </div>
  )
}

export default function ScalePanel({
  scenarioId,
  state,
  onChange,
  showControls = true,
}: {
  scenarioId: ScenarioId
  state: ScaleState
  onChange: (s: ScaleState) => void
  showControls?: boolean
}) {
  const econ = useMemo(
    () => scaleEconomics(scenarioId, state.runs, state.turns),
    [scenarioId, state.runs, state.turns],
  )
  const sel = econ[state.strategy]
  const orch = econ.orchestrated

  return (
    <div className="grid lg:grid-cols-[minmax(0,34fr)_minmax(0,66fr)] gap-8">
      {/* Controls */}
      <div className="flex flex-col gap-7">
        <VolumeSlider runs={state.runs} onChange={(runs) => onChange({ ...state, runs })} />

        {showControls && (
          <>
            <div>
              <p className="kicker mb-3">Model strategy</p>
              <div className="flex flex-col border border-hairline bg-white">
                {STRATEGY_ORDER.map((id) => (
                  <button
                    key={id}
                    onClick={() => onChange({ ...state, strategy: id })}
                    aria-pressed={state.strategy === id}
                    className={`flex items-center justify-between px-4 py-2.5 text-left text-[12.5px] border-b border-hairline last:border-b-0 transition-colors ${
                      state.strategy === id ? 'bg-ink text-white' : 'text-ink-soft hover:bg-pru-wash'
                    }`}
                  >
                    <span>{STRATEGIES[id].name}</span>
                    <span
                      className={`num text-[11px] ${state.strategy === id ? 'text-white/70' : 'text-gray-cool'}`}
                    >
                      {fmtMoney(econ[id].monthlyCost)}/mo
                    </span>
                  </button>
                ))}
              </div>
            </div>

          </>
        )}
      </div>

      {/* Readout */}
      <div className="flex flex-col gap-4">
        <div className="grid sm:grid-cols-3 border border-hairline bg-white divide-x divide-hairline">
          <div className="px-5 py-4">
            <p className="kicker !text-[9px] mb-2">Monthly AI cost — {STRATEGIES[state.strategy].name}</p>
            <p className="num text-[26px] font-medium leading-none">
              <CountUp value={sel.monthlyCost} format={fmtMoney} />
            </p>
            <p className="text-[11px] text-gray-cool mt-2">
              <CountUp value={sel.annualCost} format={fmtMoney} className="!font-sans" /> annualized
            </p>
          </div>
          <div className="px-5 py-4">
            <p className="kicker !text-[9px] mb-2">vs. Frontier Only</p>
            <p className={`num text-[26px] font-medium leading-none ${sel.monthlySavings > 0 ? 'text-pru-deep' : 'text-ink'}`}>
              {sel.monthlySavings >= 0 ? '−' : '+'}
              <CountUp value={Math.abs(sel.monthlySavings)} format={fmtMoney} />
            </p>
            <p className="text-[11px] text-gray-cool mt-2">
              {sel.monthlySavings >= 0 ? `${fmtPct(sel.savingsPct)} lower spend` : 'above baseline'}
            </p>
          </div>
          <div className="px-5 py-4">
            <p className="kicker !text-[9px] mb-2">Processing time</p>
            <p className="num text-[26px] font-medium leading-none">
              <CountUp value={sel.processingHours} format={(v) => `${fmtInt(v)}h`} />
            </p>
            <p className="text-[11px] text-gray-cool mt-2">total model time / month</p>
          </div>
        </div>

        <div className="border border-hairline bg-white px-5 py-4">
          <div className="flex items-baseline justify-between mb-3 flex-wrap gap-2">
            <p className="kicker !text-[9px]">Model utilization — {STRATEGIES[state.strategy].name}</p>
            <p className="text-[11.5px]">
              <span className="text-gray-cool">Quality </span>
              <span className="num font-medium text-ink">{Math.round(sel.quality)}</span>
            </p>
          </div>
          <UtilizationBar mix={sel.mix} />
        </div>

        <div className="border border-hairline bg-pru-wash/60 px-5 py-4 flex items-baseline justify-between flex-wrap gap-2">
          <p className="text-[13px] text-ink leading-snug">
            Orchestrated at {fmtRuns(state.runs)} runs/month:{' '}
            <span className="num font-semibold">{fmtMoney(orch.monthlySavings)}</span> lower monthly
            spend than Frontier Only, at quality {Math.round(orch.quality)}.
          </p>
        </div>

        <Disclaimer text={DISCLAIMER_LONG} />
      </div>
    </div>
  )
}
