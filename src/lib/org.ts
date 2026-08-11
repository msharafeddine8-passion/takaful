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
} as const;
