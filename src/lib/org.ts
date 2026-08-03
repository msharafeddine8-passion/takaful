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
   * Child safeguarding focal point — still to be named by the association.
   * The safeguarding course cannot be published as approved until this is set.
   */
  safeguardingFocalPoint: null as { name: string; phone: string } | null,
} as const;
