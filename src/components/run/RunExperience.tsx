/**
 * The three-lane run experience — the same workload executing through
 * Frontier Only, Efficient Only and Orchestrated, side by side.
 *
 * Used verbatim by Explore Mode (Chapter 02) and Presentation Mode
 * (Slide 06). One simulation engine, one component.
 */
import { AnimatePresence, motion } from 'framer-motion'
import { useMemo } from 'react'
import {
  DISCLAIMER,
  SCENARIOS,
  STRATEGIES,
  STRATEGY_ORDER,
  type ScenarioId,
  type StrategyId,
} from '../../data/config'
import type { LaneFrame, Playback } from '../../engine/playback'
import type { StrategyResult, TaskResult } from '../../engine/simulation'
import { fmtCost, fmtSeconds, fmtTokens } from '../../lib/format'
import { Disclaimer, ModelChip } from '../ui'

/* ------------------------------------------------------------------ */

function TaskRow({
  result,
  state,
  progress,
  highlightRouting,
}: {
  result: TaskResult
  state: 'pending' | 'active' | 'done'
  progress: number
  highlightRouting: boolean
}) {
  return (
    <div
      className={`relative flex flex-col gap-1 py-[7px] px-3 border-b border-hairline/70 last:border-b-0 transition-colors duration-300 ${
        state === 'active' ? 'bg-pru-wash' : ''
      }`}
    >
      {state === 'active' && (
        <motion.div
          className="absolute left-0 bottom-0 h-[1.5px] bg-pru"
          style={{ width: `${progress * 100}%` }}
        />
      )}
      <div className="flex items-center gap-2 min-w-0">
        <span
          aria-hidden
          className={`shrink-0 w-[5px] h-[5px] rounded-full transition-colors duration-300 ${
            state === 'done' ? 'bg-pru-deep' : state === 'active' ? 'bg-pru animate-pulse' : 'bg-hairline'
          }`}
        />
        <span
          className={`truncate text-[12.5px] leading-tight transition-colors duration-300 ${
            state === 'pending' ? 'text-gray-cool' : 'text-ink'
          }`}
        >
          {result.task.name}
        </span>
      </div>
      <div className="flex items-center justify-between gap-2 pl-[13px]">
        <ModelChip
          tier={result.model}
          muted={state === 'pending'}
          className={highlightRouting && state === 'active' ? 'ring-2 ring-pru/30' : ''}
        />
        <AnimatePresence>
          {state === 'done' && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="num text-[10.5px] text-gray-cool"
            >
              {fmtCost(result.cost)}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function LaneTotals({ frame, done }: { frame: LaneFrame; done: boolean }) {
  return (
    <div className="grid grid-cols-4 gap-2 px-3 py-2.5 bg-pru-wash/60 border-t border-hairline">
      {(
        [
          ['Tokens', fmtTokens(frame.inputTokens + frame.outputTokens)],
          ['Time', fmtSeconds(frame.time)],
          ['Cost', fmtCost(frame.cost)],
        ] as const
      ).map(([label, value]) => (
        <div key={label}>
          <p className="kicker !text-[8.5px]">{label}</p>
          <p className="num text-[12.5px] font-medium text-ink mt-0.5">{value}</p>
        </div>
      ))}
      <div>
        <p className="kicker !text-[8.5px]">Status</p>
        <p className={`text-[11px] mt-0.5 ${done ? 'text-pru-deep font-medium' : 'text-gray-cool'}`}>
          {done ? 'Complete' : frame.completed > 0 || frame.activeIndex >= 0 ? 'Running' : '—'}
        </p>
      </div>
    </div>
  )
}

export function StrategyLane({
  strategyId,
  result,
  frame,
  emphasized,
}: {
  strategyId: StrategyId
  result: StrategyResult
  frame: LaneFrame
  emphasized: boolean
}) {
  const strategy = STRATEGIES[strategyId]
  return (
    <div
      className={`flex flex-col border bg-white transition-shadow duration-500 ${
        emphasized ? 'border-pru-deep/50 shadow-[0_1px_18px_rgba(61,96,118,0.10)]' : 'border-hairline'
      }`}
    >
      <div className="px-3 pt-3 pb-2.5 border-b border-hairline flex items-baseline justify-between gap-2">
        <div>
          <h4 className="text-[13px] font-semibold tracking-tight">{strategy.name}</h4>
          <p className="text-[11px] text-gray-cool leading-tight mt-0.5">{strategy.tagline}</p>
        </div>
        {emphasized && (
          <span className="kicker !text-[8.5px] !text-pru-deep whitespace-nowrap">Orchestrator</span>
        )}
      </div>
      <div className="flex-1">
        {result.tasks.map((t, i) => (
          <TaskRow
            key={t.task.id}
            result={t}
            state={i < frame.completed ? 'done' : i === frame.activeIndex ? 'active' : 'pending'}
            progress={i === frame.activeIndex ? frame.activeProgress : 0}
            highlightRouting={emphasized}
          />
        ))}
      </div>
      <LaneTotals frame={frame} done={frame.done} />
    </div>
  )
}

/* ------------------------------------------------------------------ */

function OrchestratorDecision({ playback, scenarioId }: { playback: Playback; scenarioId: ScenarioId }) {
  const lane = playback.lanes.orchestrated
  const result = playback.results.orchestrated
  const idx = lane.activeIndex >= 0 ? lane.activeIndex : lane.completed - 1
  const current = idx >= 0 ? result.tasks[idx] : null
  const scenario = SCENARIOS[scenarioId]

  return (
    <div className="border border-hairline bg-white px-4 py-3 min-h-[74px] flex items-center">
      {playback.status === 'idle' ? (
        <p className="text-[12.5px] text-gray-cool leading-snug">
          The Orchestrator will assess each task and select the appropriate model — not always the
          most powerful one.
        </p>
      ) : current ? (
        <AnimatePresence mode="wait">
          <motion.div
            key={current.task.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="flex items-center justify-between gap-4 w-full"
          >
            <div className="min-w-0">
              <p className="kicker !text-[8.5px] mb-1">Orchestrator decision</p>
              <p className="text-[13px] text-ink leading-tight truncate">
                {current.task.action}
                <span className="text-gray-cool"> · {current.task.complexity}</span>
              </p>
            </div>
            <div className="shrink-0 flex items-center gap-2">
              <span className="text-[11px] text-gray-cool">selected</span>
              <ModelChip tier={current.model} />
            </div>
          </motion.div>
        </AnimatePresence>
      ) : (
        <p className="text-[12.5px] text-gray-cool">Reading the case… {scenario.shortName}</p>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */

function Conversation({ playback, scenarioId }: { playback: Playback; scenarioId: ScenarioId }) {
  const scenario = SCENARIOS[scenarioId]
  const revealed = useMemo(() => {
    if (playback.status === 'idle') return scenario.conversation.slice(0, 1)
    const completed = playback.lanes.orchestrated.completed
    return scenario.conversation.filter((b) => b.afterTask < completed)
  }, [playback.status, playback.lanes.orchestrated.completed, scenario])

  return (
    <div className="flex flex-col gap-2.5">
      <AnimatePresence initial={false}>
        {revealed.map((beat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className={`max-w-[92%] px-3.5 py-2.5 text-[12.5px] leading-relaxed border ${
              beat.role === 'agent'
                ? 'self-start bg-white border-hairline text-ink'
                : 'self-end bg-pru-wash border-pru/20 text-ink-soft'
            }`}
          >
            <p className="kicker !text-[8px] mb-1">
              {beat.role === 'agent' ? 'Insurance agent' : 'Assistant'}
            </p>
            {beat.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

/* ------------------------------------------------------------------ */

export interface RunExperienceProps {
  playback: Playback
  scenarioId: ScenarioId
  onScenarioChange?: (id: ScenarioId) => void
  /** compact = presentation slide; full = explore chapter */
  variant?: 'full' | 'compact'
  showConversation?: boolean
}

export function RunControls({ playback, dark = false }: { playback: Playback; dark?: boolean }) {
  const base = `px-4 py-2 text-[12px] font-medium tracking-wide border transition-colors ${
    dark ? 'border-white/25 text-white hover:bg-white/10' : 'border-ink text-ink hover:bg-ink hover:text-white'
  }`
  const primary = `px-5 py-2 text-[12px] font-medium tracking-wide transition-colors ${
    dark ? 'bg-white text-ink hover:bg-white/90' : 'bg-ink text-white hover:bg-pru-deep'
  }`
  return (
    <div className="flex items-center gap-2">
      {playback.status === 'idle' && (
        <button className={primary} onClick={playback.start}>
          Run scenario
        </button>
      )}
      {playback.status === 'running' && (
        <button className={base} onClick={playback.pause}>
          Pause
        </button>
      )}
      {playback.status === 'paused' && (
        <button className={primary} onClick={playback.resume}>
          Resume
        </button>
      )}
      {(playback.status === 'done' || playback.status === 'paused') && (
        <button className={base} onClick={playback.replay}>
          Replay
        </button>
      )}
    </div>
  )
}

export function ScenarioSwitch({
  scenarioId,
  onChange,
  disabled,
}: {
  scenarioId: ScenarioId
  onChange: (id: ScenarioId) => void
  disabled?: boolean
}) {
  return (
    <div className="inline-flex border border-hairline bg-white" role="tablist" aria-label="Scenario">
      {(Object.values(SCENARIOS)).map((s) => (
        <button
          key={s.id}
          role="tab"
          aria-selected={scenarioId === s.id}
          disabled={disabled}
          onClick={() => onChange(s.id)}
          className={`px-4 py-2 text-[12px] tracking-wide transition-colors disabled:opacity-40 ${
            scenarioId === s.id
              ? 'bg-ink text-white'
              : 'text-ink-soft hover:bg-pru-wash'
          }`}
        >
          {s.name}
        </button>
      ))}
    </div>
  )
}

export default function RunExperience({
  playback,
  scenarioId,
  variant = 'full',
  showConversation = true,
}: RunExperienceProps) {
  const compact = variant === 'compact'
  return (
    <div className={compact ? '' : ''}>
      <div className={`grid gap-4 ${showConversation ? 'lg:grid-cols-[minmax(0,30fr)_minmax(0,70fr)]' : ''}`}>
        {showConversation && (
          <div className="hidden lg:flex flex-col gap-3">
            <p className="kicker">Agent conversation</p>
            <Conversation playback={playback} scenarioId={scenarioId} />
          </div>
        )}
        <div className="flex flex-col gap-3">
          <OrchestratorDecision playback={playback} scenarioId={scenarioId} />
          <div className="grid md:grid-cols-3 gap-3">
            {STRATEGY_ORDER.map((id) => (
              <StrategyLane
                key={id}
                strategyId={id}
                result={playback.results[id]}
                frame={playback.lanes[id]}
                emphasized={id === 'orchestrated'}
              />
            ))}
          </div>
          <Disclaimer text={DISCLAIMER} className="text-right" />
        </div>
      </div>
    </div>
  )
}
