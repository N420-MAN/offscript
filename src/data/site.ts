/**
 * Single place for everything the studio still has to confirm.
 * Empty strings render as a quiet "à confirmer" note instead of a fake link.
 */
export const SITE = {
  name: 'OFFSCRIPT',
  city: 'Casablanca, Maroc',
  email: '',
  instagram: '',
  linkedin: '',
  /** Endpoint that receives the contact form. See DELIVERY.md (api/contact.ts, Resend). */
  contactEndpoint: (import.meta.env.VITE_CONTACT_ENDPOINT as string | undefined) ?? '/api/contact',
}

export const EXPERTISES = [
  { n: '01', title: 'Création web', items: ['Sites vitrines', 'Sites corporate', 'Landing pages', 'Sites e-commerce'] },
  { n: '02', title: 'Branding & Design', items: ['Identité visuelle', 'UI/UX design', 'Direction artistique', 'Design systems'] },
  { n: '03', title: 'Développement', items: ['Applications web', 'Solutions sur mesure', 'Intégrations', 'Automatisations'] },
  { n: '04', title: 'Croissance digitale', items: ['SEO', 'Optimisation des conversions', 'Stratégie digitale', 'Performance web'] },
] as const

export const PROCESS = [
  { n: '01', title: 'Discovery', text: 'Comprendre votre activité, vos objectifs et vos clients.' },
  { n: '02', title: 'Direction', text: 'Définir une vision créative et une stratégie adaptée.' },
  { n: '03', title: 'Creation', text: 'Concevoir et développer votre expérience digitale.' },
  { n: '04', title: 'Launch', text: 'Tester, optimiser et mettre votre projet en ligne.' },
] as const

export const PROJECT_TYPES = ['Création web', 'Branding & Design', 'Développement', 'Croissance digitale', 'Autre / je ne sais pas encore'] as const
export const BUDGETS = ['Moins de 15 000 MAD', '15 000 – 40 000 MAD', '40 000 – 100 000 MAD', 'Plus de 100 000 MAD', 'Je ne sais pas encore'] as const
