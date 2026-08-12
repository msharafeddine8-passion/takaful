/**
 * Verified association details.
 * Sources: the institutional portfolio, and details confirmed directly by
 * the association. Anything still unconfirmed stays null rather than invented.
 */
export const ORG = {
  phone: '+961 81 206 341',
  phoneHref: 'tel:+96181206341',
  whatsappHref: 'https://wa.me/96181206341',
  email: 'info@takafullb.com',
  emailHref: 'mailto:info@takafullb.com',
  instagram: 'TAKAFUL_TRIPOLI',
  instagramHref: 'https://instagram.com/takaful_tripoli',
  facebook: 'TAKAFULTRIPOLI',
  facebookHref: 'https://facebook.com/TAKAFULTRIPOLI',
  founded: 2020,
  /** Lebanese "علم وخبر" registration number, confirmed by the association. */
  registrationNumber: '898',
  /**
   * Child safeguarding focal point, named by the association.
   *
   * The name is kept in Arabic script in both languages: it belongs to a real
   * person and guessing at a Latin spelling would be worse than not offering
   * one. Replace it with their own preferred spelling if they have one.
   *
   * The number is the association's main line, not a direct one. A disclosure
   * routed through a shared line can be overheard, so a direct number for the
   * focal point should replace this as soon as there is one.
   */
  safeguardingFocalPoint: {
    name: 'ريم باشات',
    phone: '+961 81 206 341',
    phoneHref: 'tel:+96181206341',
  } as { name: string; phone: string; phoneHref: string } | null,

  /**
   * Who a volunteer reports to, per kind of concern.
   *
   * The orientation course is mandatory and its whole point is that a
   * volunteer leaves knowing exactly who to call. That makes these the most
   * consequential strings in the codebase: a wrong number here is worse than
   * no course at all, because it is trusted.
   *
   * The association has named ريم باشات for every role for now. That is
   * recorded honestly rather than spread across four invented names, and the
   * shape is per-role so each can be reassigned independently without a
   * change to any course.
   *
   * TWO LIMITATIONS THE COURSES MUST STATE, NOT HIDE:
   *
   * 1. The number is the association's main line, not a direct one. A
   *    disclosure made through a shared line can be overheard. A direct number
   *    should replace it as soon as one exists.
   * 2. One person holds every role, so there is no separate route for a
   *    concern *about* that person. The international standards this material
   *    is built on all require an alternative. Until the association names a
   *    second contact, `escalation` stays null and the safeguarding courses
   *    say plainly that the volunteer should go to whoever is above the focal
   *    point — rather than pretending a second channel exists.
   */
  reporting: {
    safeguarding: 'safeguardingFocalPoint',
    psea: 'safeguardingFocalPoint',
    harassment: 'safeguardingFocalPoint',
    complaints: 'safeguardingFocalPoint',
    dataProtection: 'safeguardingFocalPoint',

    /** No second route yet. See limitation 2 above. */
    escalation: null as { name: string; phone: string; phoneHref: string } | null,
  },
} as const;

/**
 * The contact for a kind of concern. Every role currently resolves to the same
 * person; call sites should still ask by role, so that naming a second officer
 * is a change to this file alone.
 */
export function reportingContact(
  kind: keyof Omit<typeof ORG.reporting, 'escalation'>,
): { name: string; phone: string; phoneHref: string } | null {
  const key = ORG.reporting[kind];
  return key === 'safeguardingFocalPoint' ? ORG.safeguardingFocalPoint : null;
}
