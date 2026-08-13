import { motion } from 'framer-motion'
import { Kicker, SectionShell } from '../components/ui'

/** Quiet animated routing motif — three lanes, pulses routed to each. */
function RoutingMotif() {
  const lanes = [36, 68, 100]
  return (
    <svg viewBox="0 0 560 136" className="w-full max-w-[560px]" aria-hidden>
      <line x1="0" y1="68" x2="200" y2="68" stroke="var(--color-hairline)" strokeWidth="1" />
      {lanes.map((y) => (
        <path
          key={y}
          d={`M200 68 C 260 68 280 ${y} 340 ${y} L 560 ${y}`}
          fill="none"
          stroke="var(--color-hairline)"
          strokeWidth="1"
        />
      ))}
      <circle cx="200" cy="68" r="3" fill="var(--color-pru-deep)" />
      {lanes.map((y, i) => (
        <motion.circle
          key={y}
          r="2.5"
          fill={i === 2 ? 'var(--color-pru-deep)' : 'var(--color-pru)'}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 1, 0] }}
          transition={{ duration: 3.6, delay: i * 1.2, repeat: Infinity, ease: 'linear', times: [0, 0.1, 0.9, 1] }}
        >
          <animateMotion
            dur="3.6s"
            begin={`${i * 1.2}s`}
            repeatCount="indefinite"
            path={`M0 68 L200 68 C 260 68 280 ${y} 340 ${y} L 560 ${y}`}
          />
        </motion.circle>
      ))}
      {(['Frontier', 'Advanced', 'Efficient'] as const).map((label, i) => (
        <text
          key={label}
          x="560"
          y={lanes[i] - 7}
          textAnchor="end"
          className="font-mono"
          fontSize="9"
          letterSpacing="0.15em"
          fill="var(--color-gray-cool)"
        >
          {label.toUpperCase()}
        </text>
      ))}
    </svg>
  )
}

export default function Hero({ onExplore, onPresent }: { onExplore: () => void; onPresent: () => void }) {
  return (
    <SectionShell className="pt-28 pb-24 min-h-[86vh] flex flex-col justify-center">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <img
          src="/prudential-logo.webp"
          alt="Prudential"
          className="h-[30px] w-auto mix-blend-multiply mb-7"
        />
        <Kicker>An illustrative experience for Prudential</Kicker>
        <h1 className="mt-6 text-[52px] lg:text-[64px] leading-[1.04] font-semibold tracking-[-0.03em] max-w-[820px]">
          AI Tokenomics
        </h1>
        <p className="mt-4 text-[22px] lg:text-[26px] leading-snug text-ink-soft tracking-[-0.01em] max-w-[640px]">
          The right intelligence for the right task.
        </p>
        <p className="mt-6 text-[15px] leading-relaxed text-gray-cool max-w-[560px]">
          The economics of intelligently allocating AI capability across tasks — lower cost, faster
          response, better quality, at enterprise scale.
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
        className="mt-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, delay: 0.4 }}
      >
        <RoutingMotif />
      </motion.div>
    </SectionShell>
  )
}
