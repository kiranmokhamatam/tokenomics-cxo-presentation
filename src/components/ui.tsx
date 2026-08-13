import { motion, useReducedMotion, useSpring, useTransform } from 'framer-motion'
import { useEffect, type ReactNode } from 'react'
import { MODELS, type ModelTier } from '../data/config'

export function Kicker({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <p className={`kicker ${className}`}>{children}</p>
}

export function Disclaimer({ text, className = '' }: { text: string; className?: string }) {
  return (
    <p className={`font-mono text-[10.5px] tracking-[0.06em] text-gray-cool ${className}`}>
      {text}
    </p>
  )
}

/** Small model-tier chip — the one visual code used everywhere for routing. */
export function ModelChip({
  tier,
  muted = false,
  className = '',
}: {
  tier: ModelTier
  muted?: boolean
  className?: string
}) {
  const styles: Record<ModelTier, string> = {
    efficient: 'border-hairline text-ink-soft bg-white',
    advanced: 'border-pru/40 text-pru-ink bg-pru-mist',
    frontier: 'border-pru-deep text-white bg-pru-deep',
  }
  return (
    <span
      className={`inline-flex items-center gap-1.5 border rounded-full px-2 py-[2.5px] font-mono text-[10px] tracking-[0.08em] uppercase whitespace-nowrap ${styles[tier]} ${muted ? 'opacity-40' : ''} ${className}`}
    >
      <TierDots tier={tier} />
      {MODELS[tier].shortName}
    </span>
  )
}

/** 1–3 dots signalling capability level, so tier is not communicated by color alone */
export function TierDots({ tier }: { tier: ModelTier }) {
  const n = tier === 'efficient' ? 1 : tier === 'advanced' ? 2 : 3
  return (
    <span className="inline-flex gap-[2.5px] items-center" aria-hidden>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={`w-[3.5px] h-[3.5px] rounded-full ${i < n ? 'bg-current' : 'bg-current opacity-25'}`}
        />
      ))}
    </span>
  )
}

/** Animated number that eases toward its target value. */
export function CountUp({
  value,
  format,
  className = '',
}: {
  value: number
  format: (n: number) => string
  className?: string
}) {
  const reduced = useReducedMotion()
  const spring = useSpring(value, { stiffness: 90, damping: 24 })
  useEffect(() => {
    if (reduced) spring.jump(value)
    else spring.set(value)
  }, [value, spring, reduced])
  const text = useTransform(spring, (v) => format(v))
  return <motion.span className={`num ${className}`}>{text}</motion.span>
}

export function Stat({
  label,
  children,
  size = 'md',
  className = '',
}: {
  label: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const sizes = { sm: 'text-[15px]', md: 'text-xl', lg: 'text-3xl' }
  return (
    <div className={className}>
      <p className="kicker !text-[9.5px] mb-1">{label}</p>
      <p className={`num font-medium text-ink leading-none ${sizes[size]}`}>{children}</p>
    </div>
  )
}

export function SectionShell({
  id,
  children,
  className = '',
}: {
  id?: string
  children: ReactNode
  className?: string
}) {
  return (
    <section id={id} className={`max-w-[1180px] mx-auto px-8 lg:px-12 ${className}`}>
      {children}
    </section>
  )
}
