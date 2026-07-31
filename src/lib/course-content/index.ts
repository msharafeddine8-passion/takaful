import type { CourseContent } from './types';
import { volunteeringFoundations } from './volunteering-foundations';

/** Courses that have drafted content. Catalogue entries without content stay in `courses.ts`. */
export const COURSE_CONTENT: Record<string, CourseContent> = {
  [volunteeringFoundations.slug]: volunteeringFoundations,
};

export type { CourseContent, Block, Module } from './types';
