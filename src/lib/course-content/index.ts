import type { CourseContent } from './types';
import { volunteeringFoundations } from './volunteering-foundations';
import { communicationSkills } from './communication-skills';
import { workingWithChildren } from './working-with-children';

/** Courses that have drafted content. Catalogue entries without content stay in `courses.ts`. */
export const COURSE_CONTENT: Record<string, CourseContent> = {
  [volunteeringFoundations.slug]: volunteeringFoundations,
  [communicationSkills.slug]: communicationSkills,
  [workingWithChildren.slug]: workingWithChildren,
};

export type { CourseContent, Block, Module } from './types';
