export type CareerPositioningInput = {
  outputType:
    | "resume_summary"
    | "linkedin_about"
    | "professional_bio"
    | "interview_networking"
    | "career_transition"
    | "consulting_independent";
  currentLanguage: string;
  currentWork:
    | "public_health_programs"
    | "health_equity_community_health"
    | "research_data_evaluation"
    | "policy_advocacy_systems_change"
    | "communications_strategy_public_affairs"
    | "healthcare_population_health_social_care"
    | "nonprofit_philanthropy_community_based"
    | "other_mixed";
  desiredDirection:
    | "similar_field"
    | "different_sector"
    | "leadership_role"
    | "consulting_independent"
    | "broader_public_health_strategy_systems"
    | "not_sure";
  emphasis: Array<
    | "leadership_decision_making"
    | "transferable_skills"
    | "program_project_results"
    | "community_partnership_trust"
    | "strategy_policy_systems"
    | "communication_stakeholder_engagement"
    | "adaptability_during_change"
  >;
  professionalContext:
    | "direct_values_forward"
    | "balanced_broadly_accessible"
    | "careful_institutionally_appropriate"
    | "cross_sector_unfamiliar_audience"
    | "recommend_best_fit";
  additionalContext?: string;
};

export type CareerPositioningOutput = {
  careerPositioningSummary: string;
  transferableValueMap: {
    experience: string;
    transferableValue: string;
    whereItApplies: string;
  }[];
  experienceReframe: {
    currentFraming: string;
    strongerPositioning: string;
    whyItWorks: string;
  }[];
  roleAndOpportunityFit: {
    potentialDirection: string;
    whyItFits: string;
    howToPositionExperience: string;
    gapOrCaution: string;
  }[];
  talkingPoints: {
    shortVersion: string;
    thirtySecondVersion: string;
    interviewReadyVersion: string;
  };
  suggestedNextStep: string[];
};

export type BackendMeResponse = {
  message?: string;
  status?: string;
  accessState?: "allowed" | "blocked";
  accessStatus?: string;
  isAuthenticated?: boolean;
  authenticated?: boolean;
  isVerified?: boolean;
  verified?: boolean;
  isMember?: boolean;
  generationsUsed?: number;
  freeGenerationsLimit?: number;
  remainingFreeGenerations?: number;
  freeGenerationsRemaining?: number;
  paywallUrl?: string;
};
