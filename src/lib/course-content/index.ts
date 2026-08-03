import type { CourseContent } from './types';
import { volunteeringFoundations } from './volunteering-foundations';
import { communicationSkills } from './communication-skills';
import { teamwork } from './teamwork';
import { workingWithChildren } from './working-with-children';
import { digitalBasics } from './digital-basics';

/** Courses that have drafted content. Catalogue entries without content stay in `courses.ts`. */
export const COURSE_CONTENT: Record<string, CourseContent> = {
  [volunteeringFoundations.slug]: volunteeringFoundations,
  [communicationSkills.slug]: communicationSkills,
  [teamwork.slug]: teamwork,
  [workingWithChildren.slug]: workingWithChildren,
  [digitalBasics.slug]: digitalBasics,
};

export type { CourseContent, Block, Module } from './types';
