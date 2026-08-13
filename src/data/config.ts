/**
 * Central configuration for the AI Tokenomics experience.
 *
 * Every number in the product — model economics, task shapes, latency,
 * quality, volume — lives here. All values are ILLUSTRATIVE and are
 * designed to be replaced with Prudential production telemetry.
 */

export type Complexity = 'simple' | 'moderate' | 'complex'
export type ModelTier = 'efficient' | 'advanced' | 'frontier'
export type StrategyId = 'frontier' | 'efficient' | 'orchestrated'
export type ScenarioId = 'claims' | 'policy'

export interface ModelSpec {
  tier: ModelTier
  name: string
  shortName: string
  descriptor: string
  /** USD per 1M tokens — illustrative list-style pricing */
  inputCostPerM: number
  outputCostPerM: number
  /** seconds to first token */
  ttft: number
  /** output tokens per second */
  tokensPerSecond: number
  /** quality score (0–100) the model achieves at each task complexity */
  quality: Record<Complexity, number>
  /** representative commercial models in this capability class (illustrative, not an endorsement) */
  examples: string[]
}

export const MODELS: Record<ModelTier, ModelSpec> = {
  efficient: {
    tier: 'efficient',
    name: 'Efficient Model',
    shortName: 'Efficient',
    descriptor: 'Fast, low-cost. Excellent at well-defined tasks.',
    inputCostPerM: 0.4,
    outputCostPerM: 1.6,
    ttft: 0.25,
    tokensPerSecond: 120,
    quality: { simple: 96, moderate: 85, complex: 63 },
    examples: ['Gemini 3.5 Flash-Lite', 'Claude Haiku 4.5'],
  },
  advanced: {
    tier: 'advanced',
    name: 'Advanced Model',
    shortName: 'Advanced',
    descriptor: 'Strong general capability at moderate cost.',
    inputCostPerM: 2.5,
    outputCostPerM: 10,
    ttft: 0.5,
    tokensPerSecond: 72,
    quality: { simple: 97, moderate: 93, complex: 83 },
    examples: ['Gemini 3.6 Flash', 'Claude Sonnet 4.6'],
  },
  frontier: {
    tier: 'frontier',
    name: 'Frontier Model',
    shortName: 'Frontier',
    descriptor: 'Maximum reasoning capability. Premium economics.',
    inputCostPerM: 10,
    outputCostPerM: 40,
    ttft: 0.9,
    tokensPerSecond: 38,
    quality: { simple: 98, moderate: 96, complex: 95 },
    examples: ['Gemini 3.1 Pro', 'Claude Opus 4.8'],
  },
}

export interface StrategySpec {
  id: StrategyId
  name: string
  tagline: string
  /** returns the model used for a task of the given complexity */
  route: (complexity: Complexity) => ModelTier
}

export const STRATEGIES: Record<StrategyId, StrategySpec> = {
  frontier: {
    id: 'frontier',
    name: 'Frontier Only',
    tagline: 'Maximum capability at every step',
    route: () => 'frontier',
  },
  efficient: {
    id: 'efficient',
    name: 'Efficient Only',
    tagline: 'Lowest-cost model at every step',
    route: () => 'efficient',
  },
  orchestrated: {
    id: 'orchestrated',
    name: 'Orchestrated',
    tagline: 'The appropriate model for every step',
    route: (c) => (c === 'simple' ? 'efficient' : c === 'moderate' ? 'advanced' : 'frontier'),
  },
}

export const STRATEGY_ORDER: StrategyId[] = ['frontier', 'efficient', 'orchestrated']

export interface TaskSpec {
  id: string
  name: string
  /** short verb phrase shown in the orchestrator feed */
  action: string
  complexity: Complexity
  inputTokens: number
  outputTokens: number
}

export interface ConversationBeat {
  /** index of the task after which this message appears */
  afterTask: number
  role: 'agent' | 'assistant'
  text: string
}

export interface ScenarioSpec {
  id: ScenarioId
  name: string
  shortName: string
  summary: string
  prompt: string
  tasks: TaskSpec[]
  conversation: ConversationBeat[]
}

export const SCENARIOS: Record<ScenarioId, ScenarioSpec> = {
  claims: {
    id: 'claims',
    name: 'Claims Intake & Triage',
    shortName: 'Claims intake',
    summary:
      'An agent receives a new claim with supporting documents. The system reads, classifies and triages the case.',
    prompt:
      '“A customer has submitted a claim with these documents. Help me understand the case and determine what’s needed next.”',
    tasks: [
      { id: 'ingest', name: 'Read submitted documents', action: 'Document OCR & ingestion', complexity: 'simple', inputTokens: 3200, outputTokens: 380 },
      { id: 'extract', name: 'Extract claim details', action: 'Structured extraction', complexity: 'simple', inputTokens: 1800, outputTokens: 340 },
      { id: 'identify', name: 'Identify the policy', action: 'Policy lookup', complexity: 'simple', inputTokens: 900, outputTokens: 120 },
      { id: 'classify', name: 'Classify the claim', action: 'Claim classification', complexity: 'moderate', inputTokens: 1400, outputTokens: 190 },
      { id: 'gaps', name: 'Find missing information', action: 'Coverage & completeness check', complexity: 'moderate', inputTokens: 2600, outputTokens: 430 },
      { id: 'reason', name: 'Reason about next action', action: 'Case reasoning', complexity: 'complex', inputTokens: 3400, outputTokens: 700 },
      { id: 'respond', name: 'Draft the agent response', action: 'Response generation', complexity: 'moderate', inputTokens: 1200, outputTokens: 540 },
    ],
    conversation: [
      { afterTask: -1, role: 'agent', text: 'I’ve received a new claim from a customer — water damage, with photos and a contractor estimate attached. Can you help me understand the case?' },
      { afterTask: 1, role: 'assistant', text: 'I’ve read the submission. The claim references water damage to a finished basement, with a contractor estimate of $18,400 and six photos.' },
      { afterTask: 3, role: 'assistant', text: 'This maps to homeowner policy HO-4471-2209 and classifies as a Category 2 water-damage claim — sudden discharge, not gradual seepage.' },
      { afterTask: 4, role: 'agent', text: 'Is anything missing before I can move it forward?' },
      { afterTask: 5, role: 'assistant', text: 'Two items: a plumber’s report identifying the failure point, and the date of loss isn’t stated on the intake form. Coverage looks applicable, subject to the $1,000 deductible.' },
      { afterTask: 6, role: 'assistant', text: 'Recommended next action: request the plumber’s report and date of loss, then route to fast-track review. I’ve drafted the customer message for you.' },
    ],
  },
  policy: {
    id: 'policy',
    name: 'Policy Case Resolution',
    shortName: 'Policy resolution',
    summary:
      'An agent asks whether a customer’s policy covers a specific situation — a reasoning-heavy interpretation case.',
    prompt:
      '“The customer wants to know whether their policy covers this situation. What do I need, and what should I do next?”',
    tasks: [
      { id: 'understand', name: 'Understand the question', action: 'Intent analysis', complexity: 'simple', inputTokens: 700, outputTokens: 150 },
      { id: 'retrieve', name: 'Retrieve policy documents', action: 'Policy retrieval', complexity: 'simple', inputTokens: 2400, outputTokens: 290 },
      { id: 'context', name: 'Check customer context', action: 'Customer record lookup', complexity: 'simple', inputTokens: 1100, outputTokens: 180 },
      { id: 'interpret', name: 'Interpret policy language', action: 'Policy interpretation', complexity: 'complex', inputTokens: 3800, outputTokens: 640 },
      { id: 'apply', name: 'Reason about applicability', action: 'Case reasoning', complexity: 'complex', inputTokens: 2900, outputTokens: 710 },
      { id: 'respond', name: 'Formulate the response', action: 'Response generation', complexity: 'moderate', inputTokens: 1500, outputTokens: 560 },
    ],
    conversation: [
      { afterTask: -1, role: 'agent', text: 'A customer is asking whether their term life policy still covers them after moving abroad for a two-year work assignment. What do I tell them?' },
      { afterTask: 1, role: 'assistant', text: 'I’ve pulled the customer’s policy — a 20-year term life contract issued in 2019 — and the current residency and travel provisions.' },
      { afterTask: 2, role: 'assistant', text: 'The customer’s record shows premiums current and no prior amendments. The assignment is to Singapore, starting in March.' },
      { afterTask: 3, role: 'agent', text: 'Does the policy language actually address foreign residency?' },
      { afterTask: 4, role: 'assistant', text: 'Yes — coverage continues for residency changes after issue, provided premiums are maintained. The exclusion applies only to residence in a sanctioned jurisdiction, which doesn’t apply here.' },
      { afterTask: 5, role: 'assistant', text: 'Coverage continues uninterrupted. I’ve drafted a response confirming this, with the two policy provisions cited so the customer has it in writing.' },
    ],
  },
}

export const SCENARIO_ORDER: ScenarioId[] = ['claims', 'policy']

/** Enterprise-scale assumptions */
export const VOLUME = {
  min: 100_000,
  max: 10_000_000,
  default: 1_000_000,
  turnsMin: 2,
  turnsMax: 16,
  turnsDefault: 6,
  /** tasks in the reference scenario correspond to this many conversation turns */
  baselineTurns: 6,
  qualityTargetDefault: 90,
}

export const DISCLAIMER = 'Illustrative simulation — not Prudential production data'
export const DISCLAIMER_LONG =
  'Illustrative simulation. All assumptions are configurable and can be replaced with Prudential production telemetry.'

/** Playback pacing: 1 simulated second renders in this many real ms */
export const PLAYBACK_MS_PER_SIM_SECOND = 320
export const PLAYBACK_MIN_TASK_MS = 420
