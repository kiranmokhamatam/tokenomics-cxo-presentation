/**
 * Presentation Mode — a full-screen 16:9 executive narrative built from the
 * exact same components, data and simulation engine as Explore Mode.
 */
import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import {
  DISCLAIMER,
  MODELS,
  SCENARIOS,
  STRATEGIES,
  STRATEGY_ORDER,
  type ModelTier,
  type ScenarioId,
} from '../data/config'
import type { Playback } from '../engine/playback'
import ComparisonPanel from '../components/run/ComparisonPanel'
import RunExperience, { RunControls, ScenarioSwitch } from '../components/run/RunExperience'
import ScalePanel, { type ScaleState } from '../components/scale/ScalePanel'
import { RoutingDiagram } from '../sections/Chapter01'
import { RoutingShowcase } from '../sections/Hero'
import { fmtRuns } from '../lib/format'
import { Disclaimer, Kicker, ModelChip } from '../components/ui'

/* ---------------------------------------------------------------- */

function Slide({ kicker, children, center = false }: { kicker?: string; children: ReactNode; center?: boolean }) {
  return (
    <div className={`w-full h-full flex flex-col px-[7vw] py-[6vh] ${center ? 'items-center justify-center text-center' : 'justify-center'}`}>
      {kicker && <Kicker className="mb-5">{kicker}</Kicker>}
      {children}
    </div>
  )
}

const H = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <h2 className={`text-[min(4.2vw,52px)] leading-[1.06] font-semibold tracking-[-0.028em] ${className}`}>{children}</h2>
)

/* ---------------------------------------------------------------- */

function Slide01() {
  return (
    <div className="w-full h-full grid grid-cols-[46fr_54fr] items-center gap-[4vw] px-[6vw]">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }}>
        <img
          src={`${import.meta.env.BASE_URL}prudential-logo.webp`}
          alt="Prudential"
          className="h-[38px] w-auto mix-blend-multiply mb-[5vh]"
        />
        <Kicker>An illustrative experience for Prudential</Kicker>
        <h1 className="mt-7 text-[min(6vw,80px)] font-semibold tracking-[-0.03em] leading-none">
          AI Tokenomics
        </h1>
        <p className="mt-6 text-[min(2vw,26px)] text-ink-soft tracking-[-0.01em]">
          The right intelligence for the right task.
        </p>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="flex justify-center"
      >
        <div className="w-[min(46vw,760px)]">
          <RoutingShowcase />
        </div>
      </motion.div>
    </div>
  )
}

function Slide02() {
  return (
    <Slide kicker="The idea">
      <H className="max-w-[900px]">AI doesn’t need to be expensive to be intelligent.</H>
      <div className="mt-[3vh] flex items-center gap-4 text-[min(1.5vw,19px)] text-ink-soft">
        <span className="font-medium text-ink">Right task</span>
        <span className="text-gray-cool">→</span>
        <span className="font-medium text-ink">Right model</span>
        <span className="text-gray-cool">→</span>
        <span className="font-medium text-ink">Right economics</span>
      </div>
      <div className="mt-[4vh] max-w-[1080px]">
        <RoutingDiagram animate />
      </div>
    </Slide>
  )
}

function Slide03() {
  const dims = [
    { label: 'Quality', after: 'Quality ↑' },
    { label: 'Latency', after: 'Speed ↑' },
    { label: 'Cost', after: 'Cost ↓' },
    { label: 'Token consumption', after: 'Under control' },
  ]
  return (
    <Slide kicker="Why it matters">
      <H className="max-w-[880px]">Every AI interaction has an economic footprint.</H>
      <div className="mt-[6vh] grid grid-cols-4 gap-px bg-hairline border border-hairline max-w-[1000px]">
        {dims.map((d, i) => (
          <div key={d.label} className="bg-white px-[2vw] py-[4vh]">
            <p className="text-[min(1.3vw,16px)] text-gray-cool">{d.label}</p>
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + i * 0.25, duration: 0.5 }}
              className="mt-[2vh] text-[min(1.9vw,24px)] font-semibold text-pru-deep num"
            >
              {d.after}
            </motion.p>
          </div>
        ))}
      </div>
      <p className="mt-[5vh] text-[min(1.3vw,17px)] text-ink-soft max-w-[720px] leading-relaxed">
        Managed deliberately, that footprint becomes a controllable business outcome — quality
        held, responses faster, cost lower.
      </p>
    </Slide>
  )
}

function Slide04({ scenarioId }: { scenarioId: ScenarioId }) {
  const scenario = SCENARIOS[scenarioId]
  const steps = scenario.tasks.map((t) => t.name)
  return (
    <Slide kicker="Illustrative insurance-agent scenario">
      <H className="max-w-[880px]">Consider one insurance-agent interaction.</H>
      <p className="mt-[3vh] text-[min(1.5vw,19px)] text-ink-soft italic max-w-[820px] leading-relaxed">
        {scenario.prompt}
      </p>
      <div className="mt-[5vh] flex items-stretch gap-0 flex-wrap max-w-[1150px]">
        {steps.map((s, i) => (
          <motion.div
            key={s}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + i * 0.15 }}
            className="flex items-center"
          >
            <div className="border border-hairline bg-white px-[1.2vw] py-[1.6vh] text-[min(1.1vw,14px)] text-ink whitespace-nowrap">
              {s}
            </div>
            {i < steps.length - 1 && <span className="px-[0.6vw] text-gray-cool">→</span>}
          </motion.div>
        ))}
      </div>
      <p className="mt-[4vh] text-[min(1.2vw,15px)] text-gray-cool max-w-[720px] leading-relaxed">
        Each step is a task — and each task requires a different level of intelligence.
      </p>
    </Slide>
  )
}

function Slide05() {
  return (
    <Slide kicker="Three strategies">
      <H className="max-w-[880px]">Three ways to run the same workload.</H>
      <div className="mt-[6vh] grid grid-cols-3 gap-px bg-hairline border border-hairline max-w-[1100px]">
        {STRATEGY_ORDER.map((id, i) => {
          const s = STRATEGIES[id]
          const isOrch = id === 'orchestrated'
          return (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.2 }}
              className={`px-[2vw] py-[5vh] ${isOrch ? 'bg-pru-wash' : 'bg-white'}`}
            >
              <h3 className={`text-[min(1.8vw,23px)] font-semibold tracking-tight ${isOrch ? 'text-pru-ink' : ''}`}>
                {s.name}
              </h3>
              <p className="mt-[1.5vh] text-[min(1.2vw,15px)] text-ink-soft leading-relaxed">{s.tagline}.</p>
              <div className="mt-[3vh] flex flex-col gap-2">
                {id === 'orchestrated' ? (
                  (['efficient', 'advanced', 'frontier'] as ModelTier[]).map((t) => (
                    <div key={t} className="flex items-center gap-2 text-[min(1vw,13px)] text-gray-cool">
                      <ModelChip tier={t} />
                      <span>
                        {t === 'efficient' ? 'simple tasks' : t === 'advanced' ? 'moderate tasks' : 'complex reasoning'}
                      </span>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="flex items-center gap-2 text-[min(1vw,13px)] text-gray-cool">
                      <ModelChip tier={id === 'frontier' ? 'frontier' : 'efficient'} />
                      <span>every task</span>
                    </div>
                    <p className="text-[min(0.9vw,12px)] text-gray-cool">
                      e.g. {MODELS[id === 'frontier' ? 'frontier' : 'efficient'].examples.join(' · ')}
                    </p>
                  </>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
    </Slide>
  )
}

function Slide06({ playback, scenarioId }: { playback: Playback; scenarioId: ScenarioId }) {
  // auto-start when the slide mounts
  const started = useRef(false)
  useEffect(() => {
    if (!started.current && playback.status === 'idle') {
      started.current = true
      const t = setTimeout(playback.start, 900)
      return () => clearTimeout(t)
    }
  }, [playback])

  return (
    <div className="w-full h-full flex flex-col px-[4.5vw] py-[5vh] justify-center">
      <div className="flex items-end justify-between mb-[3vh]">
        <div>
          <Kicker>The run — {SCENARIOS[scenarioId].name}</Kicker>
          <h2 className="mt-3 text-[min(2.8vw,36px)] font-semibold tracking-[-0.025em]">
            Watch the economics unfold.
          </h2>
        </div>
        <RunControls playback={playback} />
      </div>
      <RunExperience playback={playback} scenarioId={scenarioId} variant="compact" showConversation={false} />
    </div>
  )
}

function Slide07({ playback }: { playback: Playback }) {
  return (
    <div className="w-full h-full flex flex-col px-[7vw] py-[6vh] justify-center">
      <Kicker className="mb-5">The result</Kicker>
      <H className="max-w-[880px]">The right model at the right moment.</H>
      <div className="mt-[4vh] max-w-[1000px]">
        <ComparisonPanel results={playback.results} visible />
      </div>
    </div>
  )
}

function Slide08({
  scenarioId,
  scaleState,
  onScaleChange,
}: {
  scenarioId: ScenarioId
  scaleState: ScaleState
  onScaleChange: (s: ScaleState) => void
}) {
  return (
    <div className="w-full h-full flex flex-col px-[5vw] py-[5vh] justify-center">
      <Kicker className="mb-4">Scale</Kicker>
      <h2 className="text-[min(2.8vw,36px)] font-semibold tracking-[-0.025em] max-w-[880px]">
        What happens at {fmtRuns(scaleState.runs)} agent interactions a month?
      </h2>
      <div className="mt-[4vh]">
        <ScalePanel scenarioId={scenarioId} state={scaleState} onChange={onScaleChange} showControls={false} />
      </div>
    </div>
  )
}

function Slide09() {
  return (
    <Slide center>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
        <H className="max-w-[900px] mx-auto">
          At enterprise scale, model selection becomes a business lever.
        </H>
        <div className="mt-[6vh] flex items-center justify-center gap-[4vw]">
          {['Consistent quality', 'Faster responses', 'Lower cost'].map((t, i) => (
            <motion.p
              key={t}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 + i * 0.3 }}
              className="text-[min(1.7vw,22px)] font-medium text-pru-deep"
            >
              {t}
            </motion.p>
          ))}
        </div>
        <div className="mt-[9vh]">
          <p className="kicker">AI Tokenomics</p>
          <p className="mt-3 text-[min(1.5vw,19px)] text-ink-soft">
            The right intelligence for the right task.
          </p>
        </div>
      </motion.div>
    </Slide>
  )
}

/* ---------------------------------------------------------------- */

export default function PresentationMode({
  onExit,
  playback,
  scenarioId,
  onScenarioChange,
  scaleState,
  onScaleChange,
}: {
  onExit: () => void
  playback: Playback
  scenarioId: ScenarioId
  onScenarioChange: (id: ScenarioId) => void
  scaleState: ScaleState
  onScaleChange: (s: ScaleState) => void
}) {
  const [index, setIndex] = useState(0)
  const [controlsVisible, setControlsVisible] = useState(true)
  const hideTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const total = 9

  const go = useCallback(
    (delta: number) => setIndex((i) => Math.min(Math.max(i + delta, 0), total - 1)),
    [],
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onExit()
      else if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault()
        go(1)
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault()
        go(-1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go, onExit])

  const poke = useCallback(() => {
    setControlsVisible(true)
    clearTimeout(hideTimer.current)
    hideTimer.current = setTimeout(() => setControlsVisible(false), 2600)
  }, [])
  useEffect(() => {
    poke()
    return () => clearTimeout(hideTimer.current)
  }, [poke, index])

  // click to advance (ignore interactive elements)
  const onBackgroundClick = (e: React.MouseEvent) => {
    const el = e.target as HTMLElement
    if (el.closest('button, input, a, [role="tab"]')) return
    go(1)
  }

  const slides = [
    <Slide01 key={0} />,
    <Slide02 key={1} />,
    <Slide03 key={2} />,
    <Slide04 key={3} scenarioId={scenarioId} />,
    <Slide05 key={4} />,
    <Slide06 key={5} playback={playback} scenarioId={scenarioId} />,
    <Slide07 key={6} playback={playback} />,
    <Slide08 key={7} scenarioId={scenarioId} scaleState={scaleState} onScaleChange={onScaleChange} />,
    <Slide09 key={8} />,
  ]

  return (
    <div
      className="fixed inset-0 z-50 bg-paper cursor-default select-none"
      onMouseMove={poke}
      onClick={onBackgroundClick}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          {slides[index]}
        </motion.div>
      </AnimatePresence>

      {/* scenario switch on the run slide */}
      {index === 5 && (
        <motion.div
          className="absolute top-[4vh] right-[4.5vw]"
          animate={{ opacity: controlsVisible ? 1 : 0 }}
        >
          <ScenarioSwitch
            scenarioId={scenarioId}
            onChange={onScenarioChange}
            disabled={playback.status === 'running'}
          />
        </motion.div>
      )}

      {/* chrome */}
      <motion.div
        className="absolute bottom-6 left-8 font-mono text-[11px] tracking-[0.2em] text-gray-cool"
        animate={{ opacity: controlsVisible ? 1 : 0 }}
        transition={{ duration: 0.4 }}
      >
        {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
      </motion.div>

      <motion.div
        className="absolute bottom-5 right-8 flex items-center gap-1"
        animate={{ opacity: controlsVisible ? 1 : 0 }}
        transition={{ duration: 0.4 }}
      >
        <button
          onClick={(e) => {
            e.stopPropagation()
            go(-1)
          }}
          aria-label="Previous slide"
          className="px-3 py-1.5 text-[13px] text-gray-cool hover:text-ink transition-colors"
        >
          ←
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            go(1)
          }}
          aria-label="Next slide"
          className="px-3 py-1.5 text-[13px] text-gray-cool hover:text-ink transition-colors"
        >
          →
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onExit()
          }}
          className="ml-3 px-3 py-1.5 text-[11px] font-mono tracking-[0.15em] text-gray-cool hover:text-ink transition-colors"
        >
          ESC
        </button>
      </motion.div>

      <motion.div
        className="absolute bottom-6 left-1/2 -translate-x-1/2"
        animate={{ opacity: controlsVisible ? 0.8 : 0 }}
        transition={{ duration: 0.4 }}
      >
        <Disclaimer text={DISCLAIMER} />
      </motion.div>
    </div>
  )
}
