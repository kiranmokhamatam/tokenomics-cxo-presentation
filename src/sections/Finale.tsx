import { motion } from 'framer-motion'
import { Kicker, SectionShell } from '../components/ui'

const OUTCOMES = [
  { label: 'Quality', dir: '↑', note: 'The right model matches frontier quality on the task at hand — a point or two of difference at most, often none' },
  { label: 'Speed', dir: '↑', note: 'Faster responses for agents and customers' },
  { label: 'Cost', dir: '↓', note: 'Lower spend per interaction' },
]

export default function Finale() {
  return (
    <SectionShell className="py-28 border-t border-hairline">
      <div className="max-w-[820px] mx-auto text-center">
        <Kicker>The takeaway</Kicker>
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7 }}
          className="mt-6 text-[34px] lg:text-[44px] leading-[1.1] font-semibold tracking-[-0.025em]"
        >
          At enterprise scale, model selection becomes a business lever.
        </motion.h2>

        <div className="mt-14 grid sm:grid-cols-3 gap-px bg-hairline border border-hairline max-w-[720px] mx-auto">
          {OUTCOMES.map((o, i) => (
            <motion.div
              key={o.label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="bg-white px-6 py-8"
            >
              <p className="num text-[30px] font-medium text-pru-deep leading-none">
                {o.label} {o.dir}
              </p>
              <p className="mt-3 text-[12.5px] text-gray-cool leading-relaxed">{o.note}</p>
            </motion.div>
          ))}
        </div>

        <p className="mt-16 text-[16px] leading-relaxed text-ink-soft max-w-[640px] mx-auto">
          The point is not to spend less on intelligence — it is to stop overpaying for it. When a
          task doesn’t need frontier reasoning, an efficient model delivers the same quality on that
          task. AI Tokenomics turns that selection into an enterprise control lever — quality
          preserved, responses faster, cost lower, on every agent interaction.
        </p>
      </div>
    </SectionShell>
  )
}
