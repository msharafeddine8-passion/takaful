/**
 * Verified association details, taken from the institutional portfolio.
 * Anything not yet confirmed by the association is left null rather than invented.
 */
export const ORG = {
  phone: '+961 81 206 341',
  phoneHref: 'tel:+96181206341',
  whatsappHref: 'https://wa.me/96181206341',
  instagram: 'TAKAFUL_TRIPOLI',
  instagramHref: 'https://instagram.com/takaful_tripoli',
  facebook: 'TAKAFULTRIPOLI',
  facebookHref: 'https://facebook.com/TAKAFULTRIPOLI',
  founded: 2020,
  /** Pending confirmation from the association — never fabricate. */
  email: null as string | null,
  registrationNumber: null as string | null,
} as const;
