import type { CourseContent } from './types';

// ---- orientation
import { codeOfConductAndReporting } from './code-of-conduct-and-reporting';

// ---- level 1
import { volunteeringFoundations } from './volunteering-foundations';
import { communicationSkills } from './communication-skills';
import { teamwork } from './teamwork';
import { workingWithChildren } from './working-with-children';
import { digitalBasics } from './digital-basics';
import { levelOneChallenge } from './level-1-challenge';

// ---- level 2
import { lifeSkills } from './life-skills';
import { documentationAndReporting } from './documentation-and-reporting';
import { fieldSafety } from './field-safety';
import { mediaAndContent } from './media-and-content';
import { firstAidBasics } from './first-aid-basics';
import { levelTwoChallenge } from './level-2-challenge';

// ---- level 3
import { teamLeadership } from './team-leadership';
import { projectManagement } from './project-management';
import { eventsManagement } from './events-management';
import { protectingVulnerable } from './protecting-vulnerable';
import { communityNeeds } from './community-needs';
import { levelThreeChallenge } from './level-3-challenge';

// ---- level 4
import { emotionalIntelligence } from './emotional-intelligence';
import { meetingsAndFacilitation } from './meetings-and-facilitation';
import { negotiationAndAdvocacy } from './negotiation-and-advocacy';
import { conflictResolution } from './conflict-resolution';
import { inclusionAndAccessibility } from './inclusion-and-accessibility';
import { levelFourChallenge } from './level-4-challenge';

// ---- level 5
import { transformationalLeadership } from './transformational-leadership';
import { publicSpeaking } from './public-speaking';
import { communityProjectManagement } from './community-project-management';
import { ethicalDecisionMaking } from './ethical-decision-making';
import { monitoringAndEvaluation } from './monitoring-and-evaluation';
import { levelFiveChallenge } from './level-5-challenge';

// ---- level 6
import { volunteerLifecycle } from './volunteer-lifecycle';
import { sustainabilityAndResources } from './sustainability-and-resources';
import { partnerships } from './partnerships';
import { trainingOfTrainers } from './training-of-trainers';
import { governanceAndAccountability } from './governance-and-accountability';
import { levelSixChallenge } from './level-6-challenge';

// ---- electives
import { professionalIdentity } from './professional-identity';
import { psychologicalFirstAid } from './psychological-first-aid';
import { environmentalVolunteering } from './environmental-volunteering';
import { ethicalFundraising } from './ethical-fundraising';

/** Courses that have drafted content. Catalogue entries without content stay in `courses.ts`. */
export const COURSE_CONTENT: Record<string, CourseContent> = {
  // orientation — gates every other course
  [codeOfConductAndReporting.slug]: codeOfConductAndReporting,

  // ---- level 1
  [volunteeringFoundations.slug]: volunteeringFoundations,
  [communicationSkills.slug]: communicationSkills,
  [teamwork.slug]: teamwork,
  [workingWithChildren.slug]: workingWithChildren,
  [digitalBasics.slug]: digitalBasics,
  [levelOneChallenge.slug]: levelOneChallenge,

  // ---- level 2
  [lifeSkills.slug]: lifeSkills,
  [documentationAndReporting.slug]: documentationAndReporting,
  [fieldSafety.slug]: fieldSafety,
  [mediaAndContent.slug]: mediaAndContent,
  [firstAidBasics.slug]: firstAidBasics,
  [levelTwoChallenge.slug]: levelTwoChallenge,

  // ---- level 3
  [teamLeadership.slug]: teamLeadership,
  [projectManagement.slug]: projectManagement,
  [eventsManagement.slug]: eventsManagement,
  [protectingVulnerable.slug]: protectingVulnerable,
  [communityNeeds.slug]: communityNeeds,
  [levelThreeChallenge.slug]: levelThreeChallenge,

  // ---- level 4
  [emotionalIntelligence.slug]: emotionalIntelligence,
  [meetingsAndFacilitation.slug]: meetingsAndFacilitation,
  [negotiationAndAdvocacy.slug]: negotiationAndAdvocacy,
  [conflictResolution.slug]: conflictResolution,
  [inclusionAndAccessibility.slug]: inclusionAndAccessibility,
  [levelFourChallenge.slug]: levelFourChallenge,

  // ---- level 5
  [transformationalLeadership.slug]: transformationalLeadership,
  [publicSpeaking.slug]: publicSpeaking,
  [communityProjectManagement.slug]: communityProjectManagement,
  [ethicalDecisionMaking.slug]: ethicalDecisionMaking,
  [monitoringAndEvaluation.slug]: monitoringAndEvaluation,
  [levelFiveChallenge.slug]: levelFiveChallenge,

  // ---- level 6
  [volunteerLifecycle.slug]: volunteerLifecycle,
  [sustainabilityAndResources.slug]: sustainabilityAndResources,
  [partnerships.slug]: partnerships,
  [trainingOfTrainers.slug]: trainingOfTrainers,
  [governanceAndAccountability.slug]: governanceAndAccountability,
  [levelSixChallenge.slug]: levelSixChallenge,

  // ---- electives
  [professionalIdentity.slug]: professionalIdentity,
  [psychologicalFirstAid.slug]: psychologicalFirstAid,
  [environmentalVolunteering.slug]: environmentalVolunteering,
  [ethicalFundraising.slug]: ethicalFundraising,
};

export type { CourseContent, Block, Module } from './types';
