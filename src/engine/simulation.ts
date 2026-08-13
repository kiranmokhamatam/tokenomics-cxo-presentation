/**
 * Deterministic simulation engine.
 *
 * Given a scenario and a strategy, produces per-task and aggregate
 * economics. Pure functions of the config — no randomness, so Explore
 * and Presentation modes always agree.
 */
import {
  MODELS,
  STRATEGIES,
  SCENARIOS,
  VOLUME,
  type Complexity,
  type ModelTier,
  type ScenarioId,
  type StrategyId,
  type TaskSpec,
} from '../data/config'

export interface TaskResult {
  task: TaskSpec
  model: ModelTier
  inputTokens: number
  outputTokens: number
  /** seconds */
  ttft: number
  /** seconds, including ttft */
  latency: number
  /** USD */
  cost: number
  quality: number
}

export interface StrategyResult {
  strategy: StrategyId
  scenario: ScenarioId
  tasks: TaskResult[]
  totals: {
    inputTokens: number
    outputTokens: number
    cost: number
    /** seconds, sequential execution */
    time: number
    /** weighted 0–100 */
    quality: number
    ttft: number
  }
  /** share of tasks by model tier, for utilization views */
  mix: Record<ModelTier, number>
}

const COMPLEXITY_WEIGHT: Record<Complexity, number> = { simple: 1, moderate: 2, complex: 3 }

export function simulateTask(task: TaskSpec, model: ModelTier): TaskResult {
  const spec = MODELS[model]
  const cost =
    (task.inputTokens / 1_000_000) * spec.inputCostPerM +
    (task.outputTokens / 1_000_000) * spec.outputCostPerM
  const latency = spec.ttft + task.outputTokens / spec.tokensPerSecond
  return {
    task,
    model,
    inputTokens: task.inputTokens,
    outputTokens: task.outputTokens,
    ttft: spec.ttft,
    latency,
    cost,
    quality: spec.quality[task.complexity],
  }
}

export function simulateStrategy(scenarioId: ScenarioId, strategyId: StrategyId): StrategyResult {
  const scenario = SCENARIOS[scenarioId]
  const strategy = STRATEGIES[strategyId]
  const tasks = scenario.tasks.map((t) => simulateTask(t, strategy.route(t.complexity)))

  let weightSum = 0
  let qualitySum = 0
  const mix: Record<ModelTier, number> = { efficient: 0, advanced: 0, frontier: 0 }
  for (const r of tasks) {
    const w = COMPLEXITY_WEIGHT[r.task.complexity]
    weightSum += w
    qualitySum += r.quality * w
    mix[r.model] += 1
  }
  ;(Object.keys(mix) as ModelTier[]).forEach((k) => (mix[k] = mix[k] / tasks.length))

  return {
    strategy: strategyId,
    scenario: scenarioId,
    tasks,
    mix,
    totals: {
      inputTokens: tasks.reduce((s, r) => s + r.inputTokens, 0),
      outputTokens: tasks.reduce((s, r) => s + r.outputTokens, 0),
      cost: tasks.reduce((s, r) => s + r.cost, 0),
      time: tasks.reduce((s, r) => s + r.latency, 0),
      quality: qualitySum / weightSum,
      ttft: tasks[0]?.ttft ?? 0,
    },
  }
}

export function simulateAll(scenarioId: ScenarioId): Record<StrategyId, StrategyResult> {
  return {
    frontier: simulateStrategy(scenarioId, 'frontier'),
    efficient: simulateStrategy(scenarioId, 'efficient'),
    orchestrated: simulateStrategy(scenarioId, 'orchestrated'),
  }
}

export interface ScaleResult {
  strategy: StrategyId
  monthlyCost: number
  annualCost: number
  /** vs frontier-only baseline */
  monthlySavings: number
  savingsPct: number
  /** total compute-hours of model time per month */
  processingHours: number
  quality: number
  mix: Record<ModelTier, number>
  costPerRun: number
  timePerRun: number
}

/**
 * Enterprise-scale projection. Conversation length scales token volume
 * (and therefore cost and time) linearly against the baseline scenario.
 */
export function scaleEconomics(
  scenarioId: ScenarioId,
  runsPerMonth: number,
  turns: number = VOLUME.baselineTurns,
): Record<StrategyId, ScaleResult> {
  const results = simulateAll(scenarioId)
  const turnFactor = turns / VOLUME.baselineTurns
  const baselineCost = results.frontier.totals.cost * turnFactor * runsPerMonth

  const out = {} as Record<StrategyId, ScaleResult>
  for (const id of ['frontier', 'efficient', 'orchestrated'] as StrategyId[]) {
    const r = results[id]
    const costPerRun = r.totals.cost * turnFactor
    const timePerRun = r.totals.time * turnFactor
    const monthlyCost = costPerRun * runsPerMonth
    out[id] = {
      strategy: id,
      monthlyCost,
      annualCost: monthlyCost * 12,
      monthlySavings: baselineCost - monthlyCost,
      savingsPct: baselineCost > 0 ? (baselineCost - monthlyCost) / baselineCost : 0,
      processingHours: (timePerRun * runsPerMonth) / 3600,
      quality: r.totals.quality,
      mix: r.mix,
      costPerRun,
      timePerRun,
    }
  }
  return out
}
