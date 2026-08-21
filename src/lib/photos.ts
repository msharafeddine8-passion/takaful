/**
 * Photographs extracted from the association's own portfolio.
 * Mapped to the section each one actually depicts — not decoratively.
 *
 * ── A standing rule about the hero ──────────────────────────────────────────
 *
 * The homepage photograph is the most exposed image the association owns: it
 * is what a search engine caches, what a link preview copies, and what anybody
 * sees without asking. Three times now it has had to change because a
 * volunteer who appears in it — recognisable, close, posed — has since started
 * wearing hijab, and a photograph taken years ago was still introducing her to
 * strangers.
 *
 * Swapping one posed group for another does not fix that; it moves it onto
 * somebody else, and nobody choosing the picture can know who is affected.
 *
 * So the hero is chosen on a rule instead of a judgement: **it may not be a
 * photograph in which individual faces are posed, close and identifiable.**
 * A room at work, seen from the doorway, says more about the association than
 * sixty people lined up against a wall, and it does not put anybody's past on
 * the front page. Inner-page photographs are a smaller exposure and a separate
 * question, but the same instinct applies.
 */
export const HERO_PHOTO = '/photos/img-025.webp'; // a working session, nobody posed for the camera
export const JOIN_PHOTO = '/photos/img-020.webp'; // community kitchen team
export const ABOUT_PHOTO = '/photos/img-026.webp'; // large group, heritage site

export const AREA_PHOTOS: Record<string, string> = {
  training: '/photos/img-008.webp', // first-aid training with certificates
  sports: '/photos/img-010.webp', // sports team with medals
  psychosocial: '/photos/img-017.webp', // children's activity
  humanitarian: '/photos/img-019.webp', // community kitchen, Takaful banner
  ramadan: '/photos/img-023.webp', // Ramadan arch event
  volunteering: '/photos/img-031.webp', // volunteers in Takaful vests
  partnerships: '/photos/img-027.webp', // award / partnership moment
};

export const GALLERY_PHOTOS: { src: string; key: string }[] = [
  { src: '/photos/img-013.webp', key: 'cycling' },
  { src: '/photos/img-018.webp', key: 'children-circle' },
  { src: '/photos/img-020.webp', key: 'kitchen-team' },
  { src: '/photos/img-030.webp', key: 'first-aid' },
  { src: '/photos/img-039.webp', key: 'volunteers-vests' },
  { src: '/photos/img-025.webp', key: 'distribution' },
  { src: '/photos/img-004.webp', key: 'evening-gathering' },
  { src: '/photos/img-012.webp', key: 'field' },
  { src: '/photos/img-016.webp', key: 'children-field' },
  { src: '/photos/img-021.webp', key: 'group-seated' },
  { src: '/photos/img-024.webp', key: 'workshop' },
  { src: '/photos/img-006.webp', key: 'football' },
];
