import { z } from "zod";

export const careerInputSchema = z.object({
  outputType: z.enum([
    "resume_summary",
    "linkedin_about",
    "professional_bio",
    "interview_networking",
    "career_transition",
    "consulting_independent"
  ]),
  currentLanguage: z
    .string()
    .min(50, "Please add a little more detail so the tool can generate useful positioning language.")
    .max(6000, "Please shorten this field to 6,000 characters or fewer."),
  currentWork: z.enum([
    "public_health_programs",
    "health_equity_community_health",
    "research_data_evaluation",
    "policy_advocacy_systems_change",
    "communications_strategy_public_affairs",
    "healthcare_population_health_social_care",
    "nonprofit_philanthropy_community_based",
    "other_mixed"
  ]),
  desiredDirection: z.enum([
    "similar_field",
    "different_sector",
    "leadership_role",
    "consulting_independent",
    "broader_public_health_strategy_systems",
    "not_sure"
  ]),
  emphasis: z
    .array(
      z.enum([
        "leadership_decision_making",
        "transferable_skills",
        "program_project_results",
        "community_partnership_trust",
        "strategy_policy_systems",
        "communication_stakeholder_engagement",
        "adaptability_during_change"
      ])
    )
    .min(1, "Please select at least one emphasis area.")
    .max(3, "Please select up to three emphasis areas."),
  professionalContext: z.enum([
    "direct_values_forward",
    "balanced_broadly_accessible",
    "careful_institutionally_appropriate",
    "cross_sector_unfamiliar_audience",
    "recommend_best_fit"
  ]),
  additionalContext: z.string().max(2000, "Please shorten this field to 2,000 characters or fewer.").optional()
});


export const careerOutputSchema = z.object({
  careerPositioningSummary: z.string(),
  transferableValueMap: z.array(
    z.object({
      experience: z.string(),
      transferableValue: z.string(),
      whereItApplies: z.string()
    })
  ),
  experienceReframe: z.array(
    z.object({
      currentFraming: z.string(),
      strongerPositioning: z.string(),
      whyItWorks: z.string()
    })
  ),
  roleAndOpportunityFit: z.array(
    z.object({
      potentialDirection: z.string(),
      whyItFits: z.string(),
      howToPositionExperience: z.string(),
      gapOrCaution: z.string()
    })
  ),
  talkingPoints: z.object({
    shortVersion: z.string(),
    thirtySecondVersion: z.string(),
    interviewReadyVersion: z.string()
  }),
  suggestedNextStep: z.array(z.string())
});
