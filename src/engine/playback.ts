/**
 * Shared playback clock for the three-lane run experience.
 *
 * Drives a compressed real-time animation of the deterministic
 * simulation. Both Explore Mode and Presentation Mode consume this hook,
 * so the run behaves identically in both.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  PLAYBACK_MIN_TASK_MS,
  PLAYBACK_MS_PER_SIM_SECOND,
  type ScenarioId,
  type StrategyId,
} from '../data/config'
import { simulateAll, type StrategyResult } from './simulation'

export type PlaybackStatus = 'idle' | 'running' | 'paused' | 'done'

export interface LaneFrame {
  /** tasks fully completed */
  completed: number
  /** 0–1 progress of the currently executing task (if any) */
  activeProgress: number
  /** index of currently executing task, or -1 */
  activeIndex: number
  done: boolean
  /** accumulated metrics over completed tasks (+ pro-rated active task) */
  cost: number
  inputTokens: number
  outputTokens: number
  time: number
}

export interface Playback {
  status: PlaybackStatus
  results: Record<StrategyId, StrategyResult>
  lanes: Record<StrategyId, LaneFrame>
  /** conversation beats revealed so far (index into scenario.conversation) */
  start: () => void
  pause: () => void
  resume: () => void
  replay: () => void
  reset: () => void
  /** overall 0–1 progress of the slowest lane */
  progress: number
}

const STRATEGY_IDS: StrategyId[] = ['frontier', 'efficient', 'orchestrated']

function taskDurationMs(latencySeconds: number): number {
  return Math.max(latencySeconds * PLAYBACK_MS_PER_SIM_SECOND, PLAYBACK_MIN_TASK_MS)
}

function laneFrameAt(result: StrategyResult, elapsedMs: number): LaneFrame {
  let acc = 0
  let completed = 0
  let activeProgress = 0
  let activeIndex = -1
  let cost = 0
  let inputTokens = 0
  let outputTokens = 0
  let time = 0

  for (let i = 0; i < result.tasks.length; i++) {
    const t = result.tasks[i]
    const dur = taskDurationMs(t.latency)
    if (elapsedMs >= acc + dur) {
      completed++
      cost += t.cost
      inputTokens += t.inputTokens
      outputTokens += t.outputTokens
      time += t.latency
      acc += dur
    } else if (elapsedMs > acc) {
      activeIndex = i
      activeProgress = (elapsedMs - acc) / dur
      cost += t.cost * activeProgress
      inputTokens += t.inputTokens * activeProgress
      outputTokens += t.outputTokens * activeProgress
      time += t.latency * activeProgress
      break
    } else {
      break
    }
  }

  return {
    completed,
    activeProgress,
    activeIndex,
    done: completed === result.tasks.length,
    cost,
    inputTokens,
    outputTokens,
    time,
  }
}

export function usePlayback(scenarioId: ScenarioId): Playback {
  const results = useMemo(() => simulateAll(scenarioId), [scenarioId])
  const [status, setStatus] = useState<PlaybackStatus>('idle')
  const [elapsed, setElapsed] = useState(0)
  const rafRef = useRef(0)
  const lastTickRef = useRef(0)

  const totalMs = useMemo(
    () =>
      Math.max(
        ...STRATEGY_IDS.map((id) =>
          results[id].tasks.reduce((s, t) => s + taskDurationMs(t.latency), 0),
        ),
      ),
    [results],
  )

  // reset when the scenario changes
  useEffect(() => {
    setStatus('idle')
    setElapsed(0)
  }, [scenarioId])

  useEffect(() => {
    if (status !== 'running') return
    lastTickRef.current = performance.now()
    const tick = (now: number) => {
      const dt = now - lastTickRef.current
      lastTickRef.current = now
      setElapsed((e) => {
        const next = e + dt
        if (next >= totalMs) {
          setStatus('done')
          return totalMs
        }
        return next
      })
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [status, totalMs])

  const lanes = useMemo(() => {
    const out = {} as Record<StrategyId, LaneFrame>
    for (const id of STRATEGY_IDS) out[id] = laneFrameAt(results[id], elapsed)
    return out
  }, [results, elapsed])

  const start = useCallback(() => {
    setElapsed(0)
    setStatus('running')
  }, [])
  const pause = useCallback(() => setStatus((s) => (s === 'running' ? 'paused' : s)), [])
  const resume = useCallback(() => setStatus((s) => (s === 'paused' ? 'running' : s)), [])
  const replay = start
  const reset = useCallback(() => {
    setStatus('idle')
    setElapsed(0)
  }, [])

  return {
    status,
    results,
    lanes,
    start,
    pause,
    resume,
    replay,
    reset,
    progress: totalMs > 0 ? elapsed / totalMs : 0,
  }
}
