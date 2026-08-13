/**
 * Chapter 02 — WHY it matters. The hero section: the live three-lane run.
 */
import { SCENARIOS, type ScenarioId } from '../data/config'
import type { Playback } from '../engine/playback'
import RunExperience, { RunControls, ScenarioSwitch } from '../components/run/RunExperience'
import ComparisonPanel from '../components/run/ComparisonPanel'
import { Kicker, SectionShell } from '../components/ui'

export default function Chapter02({
  playback,
  scenarioId,
  onScenarioChange,
}: {
  playback: Playback
  scenarioId: ScenarioId
  onScenarioChange: (id: ScenarioId) => void
}) {
  const scenario = SCENARIOS[scenarioId]
  return (
    <SectionShell id="why" className="py-24 border-t border-hairline">
      <div className="max-w-[760px]">
        <Kicker>02 — Why</Kicker>
        <h2 className="mt-5 text-[34px] lg:text-[40px] leading-[1.08] font-semibold tracking-[-0.025em]">
          What happens when every AI task gets the model it actually needs?
        </h2>
        <p className="mt-6 text-[15px] leading-relaxed text-ink-soft">
          Consider an illustrative insurance-agent scenario. The same workload runs three ways —
          every task on the frontier model, every task on the efficient model, and orchestrated,
          where the system selects the appropriate model for each step.
        </p>
      </div>

      <div className="mt-10 flex items-end justify-between flex-wrap gap-4">
        <div>
          <p className="kicker mb-2">Illustrative insurance-agent scenario</p>
          <ScenarioSwitch
            scenarioId={scenarioId}
            onChange={onScenarioChange}
            disabled={playback.status === 'running'}
          />
          <p className="mt-3 text-[13px] text-gray-cool max-w-[520px] leading-relaxed">{scenario.summary}</p>
          <p className="mt-2 text-[13px] text-ink-soft italic max-w-[520px] leading-relaxed">{scenario.prompt}</p>
        </div>
        <RunControls playback={playback} />
      </div>

      <div className="mt-8">
        <RunExperience playback={playback} scenarioId={scenarioId} />
      </div>

      <div className="mt-8">
        <ComparisonPanel results={playback.results} visible={playback.status === 'done'} />
      </div>
    </SectionShell>
  )
}
