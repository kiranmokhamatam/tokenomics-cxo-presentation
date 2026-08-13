/**
 * Chapter 01 — WHAT is tokenomics.
 * Task → Intelligence → Outcome, readable in ~10 seconds.
 */
import { motion } from 'framer-motion'
import { MODELS, type Complexity, type ModelTier } from '../data/config'
import { Kicker, SectionShell, TierDots } from '../components/ui'

interface MappedTask {
  name: string
  complexity: Complexity
  tier: ModelTier
}

export const REPRESENTATIVE_TASKS: MappedTask[] = [
  { name: 'Extract information', complexity: 'simple', tier: 'efficient' },
  { name: 'Classify a request', complexity: 'simple', tier: 'efficient' },
  { name: 'Summarize a document', complexity: 'simple', tier: 'efficient' },
  { name: 'Retrieve & assemble context', complexity: 'moderate', tier: 'advanced' },
  { name: 'Interpret policy language', complexity: 'complex', tier: 'frontier' },
  { name: 'Generate a recommendation', complexity: 'moderate', tier: 'advanced' },
]

const TIER_Y: Record<ModelTier, number> = { efficient: 52, advanced: 150, frontier: 248 }
const TIER_STYLE: Record<ModelTier, { fill: string; stroke: string; text: string }> = {
  efficient: { fill: 'white', stroke: 'var(--color-hairline)', text: 'var(--color-ink)' },
  advanced: { fill: 'var(--color-pru-mist)', stroke: 'rgba(83,125,147,0.4)', text: 'var(--color-pru-ink)' },
  frontier: { fill: 'var(--color-pru-deep)', stroke: 'var(--color-pru-deep)', text: 'white' },
}

export function RoutingDiagram({ animate = true }: { animate?: boolean }) {
  const taskYs = REPRESENTATIVE_TASKS.map((_, i) => 34 + i * 47)
  return (
    <svg viewBox="0 0 900 300" className="w-full" role="img" aria-label="Tasks routed to the appropriate model tier">
      {/* column labels */}
      {[
        ['TASK', 10],
        ['INTELLIGENCE', 700],
      ].map(([label, x]) => (
        <text key={label as string} x={x as number} y={14} fontSize="9.5" letterSpacing="0.2em" fill="var(--color-gray-cool)" className="font-mono">
          {label}
        </text>
      ))}

      {/* connecting paths */}
      {REPRESENTATIVE_TASKS.map((t, i) => {
        const y1 = taskYs[i]
        const y2 = TIER_Y[t.tier]
        return (
          <motion.path
            key={t.name}
            d={`M 262 ${y1} C 460 ${y1} 480 ${y2} 690 ${y2}`}
            fill="none"
            stroke={t.tier === 'frontier' ? 'var(--color-pru-deep)' : t.tier === 'advanced' ? 'var(--color-pru)' : 'var(--color-gray-cool)'}
            strokeOpacity={0.55}
            strokeWidth={1.2}
            initial={animate ? { pathLength: 0 } : false}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.9, delay: 0.15 + i * 0.08, ease: 'easeInOut' }}
          />
        )
      })}

      {/* task pills */}
      {REPRESENTATIVE_TASKS.map((t, i) => (
        <motion.g
          key={t.name}
          initial={animate ? { opacity: 0, x: -8 } : false}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, delay: i * 0.07 }}
        >
          <rect x={10} y={taskYs[i] - 14} width={252} height={28} fill="white" stroke="var(--color-hairline)" />
          <text x={24} y={taskYs[i] + 4} fontSize="12.5" fill="var(--color-ink)">
            {t.name}
          </text>
          <circle cx={250} cy={taskYs[i]} r={2.2} fill="var(--color-gray-cool)" />
        </motion.g>
      ))}

      {/* model tier blocks */}
      {(['efficient', 'advanced', 'frontier'] as ModelTier[]).map((tier, i) => {
        const s = TIER_STYLE[tier]
        const y = TIER_Y[tier]
        return (
          <motion.g
            key={tier}
            initial={animate ? { opacity: 0, x: 8 } : false}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
          >
            <rect x={690} y={y - 24} width={200} height={48} fill={s.fill} stroke={s.stroke} />
            <text x={708} y={y - 2} fontSize="13" fontWeight="600" fill={s.text}>
              {MODELS[tier].name}
            </text>
            <text x={708} y={y + 15} fontSize="9.5" fill={tier === 'frontier' ? 'rgba(255,255,255,0.65)' : 'var(--color-gray-cool)'} className="font-mono" letterSpacing="0.08em">
              {tier === 'efficient' ? 'FAST · LOW COST' : tier === 'advanced' ? 'BALANCED' : 'DEEP REASONING'}
            </text>
          </motion.g>
        )
      })}
    </svg>
  )
}

export default function Chapter01() {
  return (
    <SectionShell id="what" className="py-24 border-t border-hairline">
      <div className="grid lg:grid-cols-[minmax(0,38fr)_minmax(0,62fr)] gap-12 items-start">
        <div className="lg:sticky lg:top-24">
          <Kicker>01 — What</Kicker>
          <h2 className="mt-5 text-[34px] lg:text-[40px] leading-[1.08] font-semibold tracking-[-0.025em]">
            The right intelligence for the right task.
          </h2>
          <p className="mt-6 text-[15px] leading-relaxed text-ink-soft max-w-[420px]">
            Not every AI task requires the same level of intelligence. Tokenomics is about matching
            each task to the right model — balancing cost, speed and quality.
          </p>
          <p className="mt-4 text-[13.5px] leading-relaxed text-gray-cool max-w-[420px]">
            No model is “good” or “bad.” The principle is to use the capability appropriate to the
            task — and to do it automatically, on every interaction.
          </p>
        </div>
        <div className="pt-2">
          <RoutingDiagram />
          <div className="mt-6 flex items-center gap-6 flex-wrap">
            {(['efficient', 'advanced', 'frontier'] as ModelTier[]).map((t) => (
              <span key={t} className="inline-flex items-center gap-2 text-[11.5px] text-ink-soft">
                <TierDots tier={t} />
                <span className="font-medium">{MODELS[t].shortName}</span>
                <span className="text-gray-cool">{MODELS[t].descriptor}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </SectionShell>
  )
}
