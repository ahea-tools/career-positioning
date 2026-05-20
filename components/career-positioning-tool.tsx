"use client";

import { FormEvent, useEffect, useState } from "react";
import { careerInputSchema } from "@/lib/schema";
import type { BackendMeResponse, CareerPositioningInput, CareerPositioningOutput } from "@/types/career-positioning";

type Errors = Partial<Record<keyof CareerPositioningInput, string>> & { form?: string };

const backendUrl = process.env.NEXT_PUBLIC_AHEA_BACKEND_URL ?? "https://api.americanhealthequity.org";
const toolId = process.env.NEXT_PUBLIC_AHEA_TOOL_ID ?? "career-positioning";

const initialInput: CareerPositioningInput = {
  outputType: "resume_summary",
  currentLanguage: "",
  currentWork: "public_health_programs",
  desiredDirection: "similar_field",
  emphasis: [],
  professionalContext: "balanced_broadly_accessible",
  additionalContext: ""
};

export function CareerPositioningTool() {
  const [input, setInput] = useState(initialInput);
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CareerPositioningOutput | null>(null);
  const [me, setMe] = useState<BackendMeResponse | null>(null);
  const [serverMessage, setServerMessage] = useState<string>("");
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchMe = async () => {
      try {
        const response = await fetch(`${backendUrl}/api/me`);
        const json = (await response.json().catch(() => ({}))) as BackendMeResponse;
        if (isMounted) {
          setMe(json);
        }
      } catch {
        if (isMounted) {
          setServerMessage("We couldn’t refresh your access status right now.");
        }
      }
    };

    void fetchMe();

    return () => {
      isMounted = false;
    };
  }, []);

  const setField = <K extends keyof CareerPositioningInput>(key: K, value: CareerPositioningInput[K]) => {
    setInput((prev) => ({ ...prev, [key]: value }));
  };

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setErrors({});
    setServerMessage("");
    const parsed = careerInputSchema.safeParse({ ...input, additionalContext: input.additionalContext || undefined });

    if (!parsed.success) {
      const nextErrors: Errors = { form: "Please review the highlighted fields before generating your positioning language." };
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as keyof CareerPositioningInput;
        nextErrors[field] = issue.message;
      }
      setErrors(nextErrors);
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(`${backendUrl}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toolId, input: parsed.data })
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        setServerMessage(payload?.message ?? "We couldn’t generate your results just now. Please try again in a moment.");
        if (payload) setMe((prev) => ({ ...(prev ?? {}), ...payload }));
        return;
      }

      setResult(payload.output as CareerPositioningOutput);
      if (payload?.message) setServerMessage(payload.message as string);
      if (payload?.me) setMe(payload.me as BackendMeResponse);
    } catch {
      setServerMessage("We couldn’t generate your results just now. Please try again in a moment.");
    } finally {
      setLoading(false);
    }
  }

  const blocked = me?.accessState === "blocked";
  const generationsUsed = me?.generationsUsed ?? "—";
  const freeLimit = me?.freeGenerationsLimit ?? "—";
  const remaining = me?.remainingFreeGenerations ?? me?.freeGenerationsRemaining ?? "—";
  const accessStatus = me?.accessStatus ?? me?.status ?? me?.accessState ?? "—";
  
  async function copyCard(key: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 1200);
    } catch {
      setServerMessage("Copy is unavailable in this browser right now.");
    }
  }

  return (
    <main className="min-h-screen bg-[#E5E3DC] px-6 py-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="space-y-2 border-b border-[#D4967D] pb-4">
          <p className="text-sm uppercase tracking-wide text-[#495A58]">American Health Equity Association</p>
          <h1 className="text-3xl font-semibold">Career Positioning Tool</h1>
          <p className="max-w-4xl text-[#495A58]">Reframe your experience and communicate your value for evolving roles, sectors, and opportunities in a rapidly changing public health and health equity landscape.</p>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          <form onSubmit={onSubmit} className="space-y-4 rounded border border-[#E5E3DC] bg-[#FFFFFF] p-6">
            <div className="rounded border border-[#E5E3DC] bg-[#FAF9F6] p-3 text-sm text-[#495A58]">
              <p>{me?.message ?? "Please sign in or verify your email to use AHEA tools. Verified users receive two complimentary generations total across AHEA tools."}</p>
              <p className="mt-1">Generations used: {generationsUsed} • Free limit: {freeLimit} • Remaining free generations: {remaining} • Access status: {accessStatus}.</p>
            </div>
            {blocked && <p className="text-sm text-[#495A58]">Access is currently restricted by the AHEA shared backend.</p>}
            {errors.form && <p role="alert" className="rounded border border-[#D4967D] bg-[#FAF9F6] p-3 text-sm text-red-700">{errors.form}</p>}

            <label className="block text-sm font-medium">What are you working on? *<select className="mt-1 w-full rounded border border-[#E5E3DC] bg-[#FFFFFF] p-2" value={input.outputType} onChange={(e) => setField("outputType", e.target.value as CareerPositioningInput["outputType"])}><option value="resume_summary">Resume summary</option><option value="linkedin_about">LinkedIn About section</option><option value="professional_bio">Professional bio</option><option value="interview_networking">Interview or networking language</option><option value="career_transition">Career transition language</option><option value="consulting_independent">Consulting or independent practice language</option></select></label>
            <label className="block text-sm font-medium">Paste your current language or rough notes *<textarea className="mt-1 h-44 w-full rounded border border-[#E5E3DC] bg-[#FFFFFF] p-3" value={input.currentLanguage} onChange={(e) => setField("currentLanguage", e.target.value)} />{errors.currentLanguage && <p className="mt-1 text-sm text-red-700">{errors.currentLanguage}</p>}</label>
            <label className="block text-sm font-medium">What best describes your current or recent work? *<select className="mt-1 w-full rounded border border-[#E5E3DC] bg-[#FFFFFF] p-2" value={input.currentWork} onChange={(e) => setField("currentWork", e.target.value as CareerPositioningInput["currentWork"])}><option value="public_health_programs">Public health programs</option><option value="health_equity_community_health">Health equity or community health</option><option value="research_data_evaluation">Research, data, or evaluation</option><option value="policy_advocacy_systems_change">Policy, advocacy, or systems change</option><option value="communications_strategy_public_affairs">Communications, strategy, or public affairs</option><option value="healthcare_population_health_social_care">Healthcare, population health, or social care</option><option value="nonprofit_philanthropy_community_based">Nonprofit, philanthropy, or community-based work</option><option value="other_mixed">Other or mixed background</option></select></label>
            <label className="block text-sm font-medium">What are you trying to move toward? *<select className="mt-1 w-full rounded border border-[#E5E3DC] bg-[#FFFFFF] p-2" value={input.desiredDirection} onChange={(e) => setField("desiredDirection", e.target.value as CareerPositioningInput["desiredDirection"])}><option value="similar_field">A new role in a similar field</option><option value="different_sector">A role in a different sector</option><option value="leadership_role">A leadership role</option><option value="consulting_independent">Consulting or independent work</option><option value="broader_public_health_strategy_systems">Broader public health, strategy, or systems work</option><option value="not_sure">I’m not sure yet</option></select></label>
            <fieldset><legend className="text-sm font-medium">What do you want the language to emphasize? *</legend>{([ ["leadership_decision_making","Leadership and decision-making"],["transferable_skills","Transferable skills"],["program_project_results","Program or project results"],["community_partnership_trust","Community partnership and trust-building"],["strategy_policy_systems","Strategy, policy, or systems thinking"],["communication_stakeholder_engagement","Communication and stakeholder engagement"],["adaptability_during_change","Adaptability during change"]] as const).map(([value, label]) => <label key={value} className="mt-2 flex items-center gap-2"><input type="checkbox" checked={input.emphasis.includes(value)} onChange={(e) => { const next = e.target.checked ? [...input.emphasis, value] : input.emphasis.filter((x) => x !== value); if (next.length <= 3) setField("emphasis", next as CareerPositioningInput["emphasis"]); }} />{label}</label>)}{errors.emphasis && <p className="mt-1 text-sm text-red-700">{errors.emphasis}</p>}</fieldset>
            <label className="block text-sm font-medium">What kind of professional context are you preparing for? *<select className="mt-1 w-full rounded border border-[#E5E3DC] bg-[#FFFFFF] p-2" value={input.professionalContext} onChange={(e) => setField("professionalContext", e.target.value as CareerPositioningInput["professionalContext"])}><option value="direct_values_forward">Direct and values-forward</option><option value="balanced_broadly_accessible">Balanced and broadly accessible</option><option value="careful_institutionally_appropriate">Careful and institutionally appropriate</option><option value="cross_sector_unfamiliar_audience">Cross-sector or unfamiliar audience</option><option value="recommend_best_fit">I’m not sure — recommend the best fit</option></select></label>
            <label className="block text-sm font-medium">Anything to emphasize, avoid, or explain?<textarea className="mt-1 h-32 w-full rounded border border-[#E5E3DC] bg-[#FFFFFF] p-3" value={input.additionalContext} onChange={(e) => setField("additionalContext", e.target.value)} />{errors.additionalContext && <p className="mt-1 text-sm text-red-700">{errors.additionalContext}</p>}</label>
            <button disabled={loading || blocked} className="rounded bg-[#D4967D] px-4 py-2 text-[#303636] disabled:opacity-50">{loading ? "Generating your career positioning language…" : "Generate career positioning language"}</button>
            {serverMessage && <p className="text-sm text-[#495A58]">{serverMessage}</p>}
          </form>

          <div className="space-y-3">
            {!result && <div className="rounded border border-[#E5E3DC] bg-[#FFFFFF] p-6 text-sm">You will receive: Career Positioning Summary, Transferable Value Map, Experience Reframe, Role and Opportunity Fit, Interview / Networking Talking Points, and Suggested Next Step.</div>}
            {result && <div className="flex flex-wrap gap-2"><CopyPill label="Copy Summary" onClick={() => copyCard("summary", result.careerPositioningSummary)} copied={copied === "summary"} /><CopyPill label="Copy Full Output" onClick={() => copyCard("all", formatAll(result))} copied={copied === "all"} /></div>}
            {result && (
              <section className="space-y-5 rounded border border-[#E5E3DC] bg-[#FFFFFF] p-6">
                <OutputSection title="Career Positioning Summary"><p className="whitespace-pre-wrap text-sm">{result.careerPositioningSummary}</p></OutputSection>
                <OutputSection title="Transferable Value Map"><ul className="list-disc space-y-1 pl-5 text-sm">{result.transferableValueMap.map((x, i) => <li key={i}>{x.experience} → {x.transferableValue} ({x.whereItApplies})</li>)}</ul></OutputSection>
                <OutputSection title="Experience Reframe"><ul className="list-disc space-y-1 pl-5 text-sm">{result.experienceReframe.map((x, i) => <li key={i}>{x.currentFraming} → {x.strongerPositioning} ({x.whyItWorks})</li>)}</ul></OutputSection>
                <OutputSection title="Role and Opportunity Fit"><ul className="list-disc space-y-1 pl-5 text-sm">{result.roleAndOpportunityFit.map((x, i) => <li key={i}>{x.potentialDirection}: {x.whyItFits}</li>)}</ul></OutputSection>
                <OutputSection title="Interview / Networking Talking Points"><p className="text-sm"><strong>Short version:</strong> {result.talkingPoints.shortVersion}</p><p className="mt-2 text-sm"><strong>30-second version:</strong> {result.talkingPoints.thirtySecondVersion}</p><p className="mt-2 text-sm"><strong>Interview-ready version:</strong> {result.talkingPoints.interviewReadyVersion}</p></OutputSection>
                <OutputSection title="Suggested Next Step"><ul className="list-disc pl-5 text-sm">{result.suggestedNextStep.slice(0, 3).map((item, i) => <li key={i}>{item}</li>)}</ul></OutputSection>
              </section>
            )}
          </div>
        </div>

        <footer className="text-xs text-[#495A58]"><a className="underline" href="https://www.americanhealthequity.org/tools">Return to AHEA tools</a></footer>
      </div>
    </main>
  );
}

function CopyPill({ label, onClick, copied }: { label: string; onClick: () => void; copied: boolean }) {
  return <button type="button" onClick={onClick} className="rounded border border-[#E5E3DC] bg-[#FFFFFF] px-3 py-1.5 text-sm hover:bg-[#E5E3DC]">{copied ? "Copied" : label}</button>;
}

function OutputSection({ title, children }: { title: string; children: React.ReactNode }) {
  return <section><h3 className="font-semibold">{title}</h3><div className="mt-2">{children}</div></section>;
}

function formatAll(output: CareerPositioningOutput): string {
  return [
    `Career Positioning Summary\n${output.careerPositioningSummary}`,
    `Transferable Value Map\n${output.transferableValueMap.map((x) => `- ${x.experience} | ${x.transferableValue} | ${x.whereItApplies}`).join("\n")}`,
    `Experience Reframe\n${output.experienceReframe.map((x) => `- ${x.currentFraming} | ${x.strongerPositioning} | ${x.whyItWorks}`).join("\n")}`,
    `Role and Opportunity Fit\n${output.roleAndOpportunityFit.map((x) => `- ${x.potentialDirection} | ${x.whyItFits} | ${x.howToPositionExperience} | ${x.gapOrCaution}`).join("\n")}`,
    `Interview / Networking Talking Points\nShort version: ${output.talkingPoints.shortVersion}\n30-second version: ${output.talkingPoints.thirtySecondVersion}\nInterview-ready version: ${output.talkingPoints.interviewReadyVersion}`,
    `Suggested Next Step\n${output.suggestedNextStep.map((x) => `- ${x}`).join("\n")}`
  ].join("\n\n");
}
