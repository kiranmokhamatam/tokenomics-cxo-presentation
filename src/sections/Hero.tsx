import { motion, useReducedMotion } from 'framer-motion'
import { MODELS, type ModelTier } from '../data/config'
import { Kicker, SectionShell } from '../components/ui'

/**
 * Hero routing showcase — insurance-agent tasks streaming from a single
 * request and being routed live to the appropriate model tier.
 */

const LANE_Y: Record<ModelTier, number> = { frontier: 96, advanced: 250, efficient: 404 }

const TIER_STYLE: Record<ModelTier, { fill: string; stroke: string; text: string; sub: string; path: string }> = {
  frontier: {
    fill: 'var(--color-pru-deep)',
    stroke: 'var(--color-pru-deep)',
    text: 'white',
    sub: 'rgba(255,255,255,0.65)',
    path: 'var(--color-pru-deep)',
  },
  advanced: {
    fill: 'var(--color-pru-mist)',
    stroke: 'rgba(83,125,147,0.45)',
    text: 'var(--color-pru-ink)',
    sub: 'var(--color-gray-cool)',
    path: 'var(--color-pru)',
  },
  efficient: {
    fill: 'white',
    stroke: 'var(--color-hairline)',
    text: 'var(--color-ink)',
    sub: 'var(--color-gray-cool)',
    path: 'var(--color-gray-cool)',
  },
}

interface FlowTask {
  name: string
  tier: ModelTier
}

const FLOW_TASKS: FlowTask[] = [
  { name: 'Extract policy number', tier: 'efficient' },
  { name: 'Interpret policy language', tier: 'frontier' },
  { name: 'Classify the request', tier: 'efficient' },
  { name: 'Retrieve coverage details', tier: 'advanced' },
  { name: 'Reason about the case', tier: 'frontier' },
  { name: 'Draft the response', tier: 'advanced' },
]

const CYCLE = 9 // seconds for one full task cycle
const STAGGER = CYCLE / FLOW_TASKS.length

const ORIGIN = { x: 78, y: 250 }
const LANE_START = 400
const BLOCK_X = 412

function lanePath(tier: ModelTier) {
  const y = LANE_Y[tier]
  return `M ${ORIGIN.x} ${ORIGIN.y} C 230 ${ORIGIN.y} 260 ${y} ${LANE_START} ${y}`
}

function RoutingShowcase() {
  const reduced = useReducedMotion()

  return (
    <svg
      viewBox="0 0 640 500"
      className="w-full max-w-[640px]"
      role="img"
      aria-label="Insurance-agent tasks being routed to the appropriate model tier"
    >
      {/* lane paths */}
      {(Object.keys(LANE_Y) as ModelTier[]).map((tier) => (
        <path
          key={tier}
          d={lanePath(tier)}
          fill="none"
          stroke={TIER_STYLE[tier].path}
          strokeOpacity={0.38}
          strokeWidth={1.6}
        />
      ))}

      {/* origin node */}
      <circle cx={ORIGIN.x} cy={ORIGIN.y} r={5} fill="var(--color-pru-deep)" />
      <circle cx={ORIGIN.x} cy={ORIGIN.y} r={11} fill="none" stroke="var(--color-pru-deep)" strokeOpacity={0.35} strokeWidth={1.2}>
        {!reduced && <animate attributeName="r" values="7;14;7" dur="2.8s" repeatCount="indefinite" />}
        {!reduced && <animate attributeName="stroke-opacity" values="0.4;0.08;0.4" dur="2.8s" repeatCount="indefinite" />}
      </circle>
      <text x={ORIGIN.x - 8} y={ORIGIN.y + 34} fontSize="10" letterSpacing="0.18em" fill="var(--color-gray-cool)" className="font-mono">
        AGENT
      </text>
      <text x={ORIGIN.x - 8} y={ORIGIN.y + 48} fontSize="10" letterSpacing="0.18em" fill="var(--color-gray-cool)" className="font-mono">
        REQUEST
      </text>

      {/* tier blocks */}
      {(Object.keys(LANE_Y) as ModelTier[]).map((tier) => {
        const s = TIER_STYLE[tier]
        const y = LANE_Y[tier]
        return (
          <g key={tier}>
            <rect x={BLOCK_X} y={y - 44} width={214} height={88} fill={s.fill} stroke={s.stroke} />
            <text x={BLOCK_X + 18} y={y - 20} fontSize="14.5" fontWeight="600" fill={s.text}>
              {MODELS[tier].name}
            </text>
            <text x={BLOCK_X + 18} y={y - 4} fontSize="9" letterSpacing="0.1em" fill={s.sub} className="font-mono">
              {tier === 'efficient' ? 'FAST · LOW COST' : tier === 'advanced' ? 'BALANCED' : 'DEEP REASONING'}
            </text>
            {MODELS[tier].examples.map((ex, j) => (
              <text key={ex} x={BLOCK_X + 18} y={y + 14 + j * 15} fontSize="10" fill={s.sub}>
                {j === 0 ? 'e.g. ' : ''}{ex}
              </text>
            ))}
            {/* receive pulse at lane entry */}
            {!reduced && (
              <circle cx={BLOCK_X} cy={y} r={3} fill={s.path}>
                <animate attributeName="opacity" values="0.9;0.25;0.9" dur="2.8s" repeatCount="indefinite" />
              </circle>
            )}
          </g>
        )
      })}

      {/* traveling task pills */}
      {FLOW_TASKS.map((task, i) => {
        const s = TIER_STYLE[task.tier]
        const w = task.name.length * 6 + 36
        if (reduced) return null
        return (
          <g key={task.name} opacity={0}>
            <animate
              attributeName="opacity"
              values="0;1;1;0;0"
              keyTimes="0;0.04;0.42;0.52;1"
              dur={`${CYCLE}s`}
              begin={`${i * STAGGER}s`}
              repeatCount="indefinite"
            />
            <animateMotion
              dur={`${CYCLE}s`}
              begin={`${i * STAGGER}s`}
              repeatCount="indefinite"
              calcMode="linear"
              keyPoints="0;1;1"
              keyTimes="0;0.42;1"
              path={lanePath(task.tier)}
            />
            <rect x={-w / 2} y={-14} width={w} height={28} rx={14} fill="white" stroke={s.path} strokeOpacity={0.75} strokeWidth={1.2} />
            <circle cx={-w / 2 + 14} cy={0} r={3} fill={s.path} />
            <text x={-w / 2 + 24} y={4} fontSize="11" fill="var(--color-ink)">
              {task.name}
            </text>
          </g>
        )
      })}

      {/* static pills for reduced motion */}
      {reduced &&
        FLOW_TASKS.slice(0, 3).map((task, i) => {
          const s = TIER_STYLE[task.tier]
          const w = task.name.length * 6 + 36
          const y = LANE_Y[task.tier]
          return (
            <g key={task.name} transform={`translate(${240 + i * 10}, ${y})`}>
              <rect x={-w / 2} y={-14} width={w} height={28} rx={14} fill="white" stroke={s.path} strokeOpacity={0.75} strokeWidth={1.2} />
              <circle cx={-w / 2 + 14} cy={0} r={3} fill={s.path} />
              <text x={-w / 2 + 24} y={4} fontSize="11" fill="var(--color-ink)">
                {task.name}
              </text>
            </g>
          )
        })}
    </svg>
  )
}

export default function Hero({ onExplore, onPresent }: { onExplore: () => void; onPresent: () => void }) {
  return (
    <SectionShell className="pt-20 pb-20 min-h-[86vh] flex items-center">
      <div className="grid lg:grid-cols-[minmax(0,46fr)_minmax(0,54fr)] gap-12 lg:gap-16 items-center w-full">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <img
            src={`${import.meta.env.BASE_URL}prudential-logo.webp`}
            alt="Prudential"
            className="h-[30px] w-auto mix-blend-multiply mb-7"
          />
          <Kicker>An illustrative experience for Prudential</Kicker>
          <h1 className="mt-6 text-[48px] lg:text-[60px] leading-[1.04] font-semibold tracking-[-0.03em]">
            AI Tokenomics
          </h1>
          <p className="mt-4 text-[21px] lg:text-[24px] leading-snug text-ink-soft tracking-[-0.01em]">
            The right intelligence for the right task.
          </p>
          <p className="mt-6 text-[15px] leading-relaxed text-gray-cool max-w-[460px]">
            The economics of intelligently allocating AI capability across tasks — lower cost,
            faster response, better quality, at enterprise scale.
          </p>

          <div className="mt-10 flex items-center gap-3">
            <button
              onClick={onExplore}
              className="px-6 py-3 bg-ink text-white text-[13px] font-medium tracking-wide hover:bg-pru-deep transition-colors"
            >
              Explore
            </button>
            <button
              onClick={onPresent}
              className="px-6 py-3 border border-ink text-ink text-[13px] font-medium tracking-wide hover:bg-ink hover:text-white transition-colors"
            >
              Present →
            </button>
          </div>
        </motion.div>

        <motion.div
          className="hidden lg:block"
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          <RoutingShowcase />
        </motion.div>
      </div>
    </SectionShell>
  )
}
