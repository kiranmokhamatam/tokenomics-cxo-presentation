/**
 * Chapter 03 — HOW it compounds. Enterprise scale + executive simulator.
 */
import type { ScenarioId } from '../data/config'
import ScalePanel, { type ScaleState } from '../components/scale/ScalePanel'
import { Kicker, SectionShell } from '../components/ui'

export default function Chapter03Scale({
  scenarioId,
  state,
  onChange,
}: {
  scenarioId: ScenarioId
  state: ScaleState
  onChange: (s: ScaleState) => void
}) {
  return (
    <SectionShell id="scale" className="py-24 border-t border-hairline">
      <div className="max-w-[760px]">
        <Kicker>03 — At scale</Kicker>
        <h2 className="mt-5 text-[34px] lg:text-[40px] leading-[1.08] font-semibold tracking-[-0.025em]">
          Small decisions compound at scale.
        </h2>
        <p className="mt-6 text-[15px] leading-relaxed text-ink-soft">
          One conversation costs cents. Across millions of agent interactions a month, model
          selection becomes a line item — and a lever. Adjust the assumptions and watch the
          economics respond.
        </p>
      </div>
      <div className="mt-12">
        <ScalePanel scenarioId={scenarioId} state={state} onChange={onChange} />
      </div>
    </SectionShell>
  )
}
