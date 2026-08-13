import { useCallback, useState } from 'react'
import { type ScenarioId } from './data/config'
import { usePlayback } from './engine/playback'
import { DEFAULT_SCALE_STATE, type ScaleState } from './components/scale/ScalePanel'
import PresentationMode from './present/PresentationMode'
import Hero from './sections/Hero'
import Chapter01 from './sections/Chapter01'
import Chapter02 from './sections/Chapter02'
import Chapter03Scale from './sections/Chapter03Scale'
import Finale from './sections/Finale'

function Header({ onPresent }: { onPresent: () => void }) {
  return (
    <header className="sticky top-0 z-40 bg-paper/90 backdrop-blur-sm border-b border-hairline">
      <div className="max-w-[1180px] mx-auto px-8 lg:px-12 h-[54px] flex items-center justify-between">
        <a href="#top" className="flex items-center gap-3.5">
          <img
            src={`${import.meta.env.BASE_URL}prudential-logo.webp`}
            alt="Prudential"
            className="h-[22px] w-auto mix-blend-multiply"
          />
          <span className="w-px h-[18px] bg-hairline" aria-hidden />
          <span className="text-[13px] font-semibold tracking-tight">AI Tokenomics</span>
          <span className="hidden sm:inline font-mono text-[10px] tracking-[0.18em] text-gray-cool uppercase">
            Illustrative
          </span>
        </a>
        <nav className="flex items-center gap-6">
          {[
            ['What', '#what'],
            ['Why', '#why'],
            ['Scale', '#scale'],
          ].map(([label, href]) => (
            <a
              key={href}
              href={href}
              className="hidden md:inline text-[12px] text-ink-soft hover:text-ink transition-colors tracking-wide"
            >
              {label}
            </a>
          ))}
          <button
            onClick={onPresent}
            className="text-[12px] font-medium tracking-wide border border-ink px-3.5 py-1.5 hover:bg-ink hover:text-white transition-colors"
          >
            Present →
          </button>
        </nav>
      </div>
    </header>
  )
}

export default function App() {
  const [presenting, setPresenting] = useState(false)
  const [scenarioId, setScenarioId] = useState<ScenarioId>('claims')
  const [scaleState, setScaleState] = useState<ScaleState>(DEFAULT_SCALE_STATE)
  const playback = usePlayback(scenarioId)

  const enterPresent = useCallback(() => setPresenting(true), [])
  const exitPresent = useCallback(() => setPresenting(false), [])

  const scrollToExplore = useCallback(() => {
    document.getElementById('what')?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  if (presenting) {
    return (
      <PresentationMode
        onExit={exitPresent}
        playback={playback}
        scenarioId={scenarioId}
        onScenarioChange={setScenarioId}
        scaleState={scaleState}
        onScaleChange={setScaleState}
      />
    )
  }

  return (
    <div id="top">
      <Header onPresent={enterPresent} />
      <main>
        <Hero onExplore={scrollToExplore} onPresent={enterPresent} />
        <Chapter01 />
        <Chapter02 playback={playback} scenarioId={scenarioId} onScenarioChange={setScenarioId} />
        <Chapter03Scale scenarioId={scenarioId} state={scaleState} onChange={setScaleState} />
        <Finale />
      </main>
      <footer className="bg-ink text-white">
        <div className="max-w-[1180px] mx-auto px-8 lg:px-12 py-10 flex items-center justify-between flex-wrap gap-6">
          <div className="flex items-center gap-4">
            <img
              src={`${import.meta.env.BASE_URL}tilicho-logo.webp`}
              alt="Tilicho Labs"
              className="h-9 w-auto"
            />
            <div>
              <p className="text-[12px] font-medium tracking-wide">Done by Tilicho Labs</p>
              <a
                href="https://tilicho.in"
                target="_blank"
                rel="noreferrer"
                className="font-mono text-[10px] tracking-[0.15em] text-white/50 uppercase hover:text-white/80 transition-colors"
              >
                tilicho.in
              </a>
            </div>
          </div>
          <div className="text-right">
            <p className="font-mono text-[10px] tracking-[0.15em] text-white/50 uppercase">
              AI Tokenomics — executive demonstration for Prudential
            </p>
            <p className="font-mono text-[10px] tracking-[0.06em] text-white/35 mt-1.5">
              Illustrative simulation — assumptions can be replaced with Prudential production telemetry.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
