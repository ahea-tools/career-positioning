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

const card = "rounded-xl border border-[#495A58]/20 bg-white shadow-sm";

export function CareerPositioningTool() {
  const [input, setInput] = useState(initialInput);
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CareerPositioningOutput | null>(null);
  const [me, setMe] = useState<BackendMeResponse | null>(null);
  const [serverMessage, setServerMessage] = useState<string>("");
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
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
  const auth = me?.authenticated ?? me?.isAuthenticated;
  const verified = me?.verified ?? me?.isVerified;

  async function copyCard(key: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      setServerMessage("Copy is unavailable in this browser right now.");
    }
  }

  return (
    <main className="min-h-screen bg-[#E5E3DC] text-[#303636]">
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
        <header className={`${card} mb-6 p-6 md:p-8`}>
          <p className="font-ui text-sm text-[#495A58]">American Health Equity Association · AI Tools</p>
          <h1 className="font-heading mt-3 text-3xl md:text-4xl">Career Positioning Tool</h1>
          <p className="mt-4 max-w-4xl text-base md:text-lg">Reframe your experience and communicate your value for evolving roles, sectors, and opportunities in a rapidly changing public health and health equity landscape.</p>
        </header>

        <section className={`${card} mb-6 p-5 md:p-6`}>
          <h2 className="font-heading text-2xl">Access and usage</h2>
          <p className="mt-2 text-sm text-[#303636]">{me?.message ?? "Please sign in or verify your email to use AHEA tools. Verified users receive two complimentary generations total across AHEA tools."}</p>
          <p className="mt-2 font-ui text-sm text-[#495A58]">Generations used: {generationsUsed} • Free limit: {freeLimit} • Remaining free generations: {remaining} • Access status: {accessStatus}.</p>
          {(auth === false || verified === false) && <p className="mt-2 text-sm">Please sign in or verify your email to continue.</p>}
          {blocked && (
            <div className="mt-4 rounded-lg border border-[#D4967D] bg-[#E5E3DC] p-4">
              <p>{me?.message ?? "You’ve used your two complimentary AHEA tool generations. Membership unlocks continued access across all AHEA tools."}</p>
              {me?.paywallUrl && <a className="mt-3 inline-block font-ui underline" href={me.paywallUrl}>Continue to membership options</a>}
            </div>
          )}
        </section>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <form onSubmit={onSubmit} className={`${card} p-5 md:p-6`}>
            {errors.form && <p role="alert" className="mb-4 rounded-md border border-[#D4967D] bg-[#E5E3DC] p-3 text-sm">{errors.form}</p>}
            <div className="grid gap-4">
              <label><span className="block">What are you working on? *</span><select className="mt-1 w-full rounded-md border border-[#495A58]/30 bg-white p-2" value={input.outputType} onChange={(e) => setField("outputType", e.target.value as CareerPositioningInput["outputType"])}><option value="resume_summary">Resume summary</option><option value="linkedin_about">LinkedIn About section</option><option value="professional_bio">Professional bio</option><option value="interview_networking">Interview or networking language</option><option value="career_transition">Career transition language</option><option value="consulting_independent">Consulting or independent practice language</option></select></label>
              <label><span className="block">Paste your current language or rough notes *</span><textarea className="mt-1 min-h-40 w-full rounded-md border border-[#495A58]/30 bg-white p-2" value={input.currentLanguage} onChange={(e) => setField("currentLanguage", e.target.value)} />{errors.currentLanguage && <p className="text-sm text-red-700">{errors.currentLanguage}</p>}</label>
              <label><span className="block">What best describes your current or recent work? *</span><select className="mt-1 w-full rounded-md border border-[#495A58]/30 bg-white p-2" value={input.currentWork} onChange={(e) => setField("currentWork", e.target.value as CareerPositioningInput["currentWork"])}><option value="public_health_programs">Public health programs</option><option value="health_equity_community_health">Health equity or community health</option><option value="research_data_evaluation">Research, data, or evaluation</option><option value="policy_advocacy_systems_change">Policy, advocacy, or systems change</option><option value="communications_strategy_public_affairs">Communications, strategy, or public affairs</option><option value="healthcare_population_health_social_care">Healthcare, population health, or social care</option><option value="nonprofit_philanthropy_community_based">Nonprofit, philanthropy, or community-based work</option><option value="other_mixed">Other or mixed background</option></select></label>
              <label><span className="block">What are you trying to move toward? *</span><select className="mt-1 w-full rounded-md border border-[#495A58]/30 bg-white p-2" value={input.desiredDirection} onChange={(e) => setField("desiredDirection", e.target.value as CareerPositioningInput["desiredDirection"])}><option value="similar_field">A new role in a similar field</option><option value="different_sector">A role in a different sector</option><option value="leadership_role">A leadership role</option><option value="consulting_independent">Consulting or independent work</option><option value="broader_public_health_strategy_systems">Broader public health, strategy, or systems work</option><option value="not_sure">I’m not sure yet</option></select></label>
              <fieldset><legend>What do you want the language to emphasize? *</legend>{([ ["leadership_decision_making","Leadership and decision-making"],["transferable_skills","Transferable skills"],["program_project_results","Program or project results"],["community_partnership_trust","Community partnership and trust-building"],["strategy_policy_systems","Strategy, policy, or systems thinking"],["communication_stakeholder_engagement","Communication and stakeholder engagement"],["adaptability_during_change","Adaptability during change"]] as const).map(([value, label]) => <label key={value} className="mt-2 flex items-center gap-2"><input type="checkbox" checked={input.emphasis.includes(value)} onChange={(e) => { const next = e.target.checked ? [...input.emphasis, value] : input.emphasis.filter((x) => x !== value); if (next.length <= 3) setField("emphasis", next as CareerPositioningInput["emphasis"]); }} />{label}</label>)}{errors.emphasis && <p className="text-sm text-red-700">{errors.emphasis}</p>}</fieldset>
              <label><span className="block">What kind of professional context are you preparing for? *</span><select className="mt-1 w-full rounded-md border border-[#495A58]/30 bg-white p-2" value={input.professionalContext} onChange={(e) => setField("professionalContext", e.target.value as CareerPositioningInput["professionalContext"])}><option value="direct_values_forward">Direct and values-forward</option><option value="balanced_broadly_accessible">Balanced and broadly accessible</option><option value="careful_institutionally_appropriate">Careful and institutionally appropriate</option><option value="cross_sector_unfamiliar_audience">Cross-sector or unfamiliar audience</option><option value="recommend_best_fit">I’m not sure — recommend the best fit</option></select></label>
              <label><span className="block">Anything to emphasize, avoid, or explain?</span><textarea className="mt-1 min-h-28 w-full rounded-md border border-[#495A58]/30 bg-white p-2" value={input.additionalContext} onChange={(e) => setField("additionalContext", e.target.value)} />{errors.additionalContext && <p className="text-sm text-red-700">{errors.additionalContext}</p>}</label>
            </div>
            <button disabled={loading || blocked} className="mt-6 rounded-md bg-[#D4967D] px-5 py-2 font-ui text-[#303636] disabled:opacity-60">{loading ? "Generating your career positioning language…" : "Generate career positioning language"}</button>
            {serverMessage && <p className="mt-3 text-sm" role="status">{serverMessage}</p>}
          </form>

          <aside className={`${card} h-fit p-5 md:p-6`}>
            <h3 className="font-heading text-2xl">You will receive:</h3>
            <ul className="mt-3 space-y-2">
              <li>Career Positioning Summary</li>
              <li>Transferable Value Map</li>
              <li>Experience Reframe</li>
              <li>Role and Opportunity Fit</li>
              <li>Interview / Networking Talking Points</li>
              <li>Suggested Next Step</li>
            </ul>
          </aside>
        </section>

        {result && (
          <section className="mt-6 grid gap-4">
            <OutputCard title="Career Positioning Summary" copied={copied === "summary"} onCopy={() => copyCard("summary", result.careerPositioningSummary)}>{result.careerPositioningSummary}</OutputCard>
            <OutputCard title="Transferable Value Map" copied={copied === "value"} onCopy={() => copyCard("value", result.transferableValueMap.map((x) => `Your Experience: ${x.experience}\nTransferable Value: ${x.transferableValue}\nWhere It Applies: ${x.whereItApplies}`).join("\n\n"))}>{result.transferableValueMap.map((x, i) => <div key={i} className="mb-3 rounded border p-3"><p><strong>Your Experience:</strong> {x.experience}</p><p><strong>Transferable Value:</strong> {x.transferableValue}</p><p><strong>Where It Applies:</strong> {x.whereItApplies}</p></div>)}</OutputCard>
            <OutputCard title="Experience Reframe" copied={copied === "reframe"} onCopy={() => copyCard("reframe", result.experienceReframe.map((x) => `Current Framing: ${x.currentFraming}\nStronger Positioning: ${x.strongerPositioning}\nWhy It Works: ${x.whyItWorks}`).join("\n\n"))}>{result.experienceReframe.map((x, i) => <div key={i} className="mb-3 rounded border p-3"><p><strong>Current Framing:</strong> {x.currentFraming}</p><p><strong>Stronger Positioning:</strong> {x.strongerPositioning}</p><p><strong>Why It Works:</strong> {x.whyItWorks}</p></div>)}</OutputCard>
            <OutputCard title="Role and Opportunity Fit" copied={copied === "fit"} onCopy={() => copyCard("fit", result.roleAndOpportunityFit.map((x) => `Potential direction: ${x.potentialDirection}\nWhy it fits: ${x.whyItFits}\nHow to position your experience: ${x.howToPositionExperience}\nGap or caution: ${x.gapOrCaution}`).join("\n\n"))}>{result.roleAndOpportunityFit.map((x, i) => <div key={i} className="mb-3 rounded border p-3"><p><strong>Potential direction:</strong> {x.potentialDirection}</p><p><strong>Why it fits:</strong> {x.whyItFits}</p><p><strong>How to position your experience:</strong> {x.howToPositionExperience}</p><p><strong>Gap or caution:</strong> {x.gapOrCaution}</p></div>)}</OutputCard>
            <OutputCard title="Interview / Networking Talking Points" copied={copied === "talking"} onCopy={() => copyCard("talking", `Short version: ${result.talkingPoints.shortVersion}\n\n30-second version: ${result.talkingPoints.thirtySecondVersion}\n\nInterview-ready version: ${result.talkingPoints.interviewReadyVersion}`)}><p><strong>Short version:</strong> {result.talkingPoints.shortVersion}</p><p><strong>30-second version:</strong> {result.talkingPoints.thirtySecondVersion}</p><p><strong>Interview-ready version:</strong> {result.talkingPoints.interviewReadyVersion}</p></OutputCard>
            <OutputCard title="Suggested Next Step" copied={copied === "next"} onCopy={() => copyCard("next", result.suggestedNextStep.join("\n"))}><ul>{result.suggestedNextStep.slice(0, 3).map((item, i) => <li key={i}>• {item}</li>)}</ul></OutputCard>
          </section>
        )}

        <footer className="py-8 text-center"><a className="font-ui underline" href="https://www.americanhealthequity.org/tools">Return to AHEA tools</a></footer>
      </div>
    </main>
  );
}

function OutputCard({ title, children, onCopy, copied }: { title: string; children: React.ReactNode; onCopy: () => void; copied: boolean }) {
  return <article className={`${card} p-5`}><div className="mb-3 flex items-center justify-between gap-3"><h3 className="font-heading text-2xl">{title}</h3><button onClick={onCopy} className="rounded-md border border-[#495A58]/40 px-3 py-1 font-ui" aria-label={`Copy ${title}`}>{copied ? "Copied" : "Copy"}</button></div><div className="space-y-3">{children}</div></article>;
}
