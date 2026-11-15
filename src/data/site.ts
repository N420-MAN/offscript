/**
 * Single place for the studio's facts and contact details.
 * Anything left empty is simply not shown: no placeholder link, no "à confirmer" note on the live site.
 */
export const SITE = {
  name: 'OFFSCRIPT',
  city: 'Casablanca, Maroc',
  /** Public contact address, shown in the contact section and footer when set. */
  email: '',
  /** WhatsApp number in international format without spaces or "+", e.g. "2126XXXXXXXX". Shown only when set. */
  whatsapp: '',
  instagram: '',
  linkedin: '',
  /** Endpoint that receives the inquiry form (api/contact.ts, sent through Resend). */
  contactEndpoint: (import.meta.env.VITE_CONTACT_ENDPOINT as string | undefined) ?? '/api/contact',
}

export const SERVICES = [
  {
    n: '01',
    title: 'Web design',
    text: 'Une interface pensée pour votre marque et vos clients, du premier écran au dernier clic.',
    items: ['UI/UX design', 'Direction artistique', 'Interfaces responsives', 'Design systems', 'Parcours utilisateur'],
  },
  {
    n: '02',
    title: 'Développement web',
    text: 'Des sites rapides, solides et faciles à faire vivre, développés sur mesure.',
    items: ['Sites corporate', 'Sites sur mesure', 'Développement responsive', 'Optimisation des performances', 'Intégration CMS'],
  },
  {
    n: '03',
    title: 'E-commerce',
    text: 'Des boutiques en ligne qui donnent envie d’acheter et rendent l’achat simple.',
    items: ['Boutiques en ligne', 'Fiches produit', 'Parcours d’achat', 'Intégration des paiements', 'Optimisation e-commerce'],
  },
  {
    n: '04',
    title: 'Expériences sur mesure',
    text: 'Applications web, outils métier et interactions qu’aucun modèle ne propose.',
    items: ['Applications web', 'Expériences interactives', 'Outils métier', 'Intégrations API', 'Fonctionnalités sur mesure'],
  },
] as const

/** Complementary capabilities, offered alongside a web project rather than on their own. */
export const ALSO = ['Identité visuelle', 'Branding'] as const

export const PROCESS = [
  { n: '01', title: 'Discovery', text: 'Comprendre votre activité, vos objectifs et les besoins de vos utilisateurs.' },
  { n: '02', title: 'Direction', text: 'Définir l’identité visuelle, l’expérience et l’architecture du projet.' },
  { n: '03', title: 'Development', text: 'Transformer la vision en une expérience web fonctionnelle, rapide et responsive.' },
  { n: '04', title: 'Launch', text: 'Tester, optimiser et mettre votre projet en ligne.' },
] as const

export const PROJECT_TYPES = ['Site vitrine', 'E-commerce', 'Landing page', 'Application web', 'Autre'] as const
/** Indicative budget ranges offered in the form. Edit freely: the form and the e-mail follow this list. */
export const BUDGETS = ['Moins de 5 000 MAD', '5 000 – 10 000 MAD', '10 000 – 20 000 MAD', '20 000 – 30 000 MAD', '30 000+ MAD', 'À discuter'] as const

export const NAV = [
  ['Accueil', '#top'],
  ['Projets', '#travaux'],
  ['Services', '#services'],
  ['Studio', '#studio'],
] as const
