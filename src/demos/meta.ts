export type DemoSlug = 'medical' | 'hotel' | 'residence' | 'restaurant' | 'shop' | 'ev' | 'ai' | 'rental' | 'festival' | 'school'

export interface DemoMeta {
  slug: DemoSlug
  name: string
  kind: string
  tagline: string
  /** Dominant colours, used for the studio's floating screens and transitions. */
  colors: [string, string]
}

export const DEMOS: DemoMeta[] = [
  { slug: 'medical', name: 'Centre Aurèle', kind: 'Centre médical', tagline: 'Votre médecin, aujourd’hui.', colors: ['#f7f4ef', '#0f766e'] },
  { slug: 'hotel', name: 'Riad Zéphyr', kind: 'Riad & maison d’hôtes', tagline: 'Sept chambres, un bassin.', colors: ['#f6efe4', '#b4552d'] },
  { slug: 'residence', name: 'Verticale', kind: 'Promotion immobilière', tagline: 'Étage par étage.', colors: ['#f5f1e9', '#a67c45'] },
  { slug: 'restaurant', name: 'Maison Safran', kind: 'Restaurant', tagline: 'La table, revisitée.', colors: ['#14110e', '#e2a23b'] },
  { slug: 'shop', name: 'Fragment', kind: 'Objets de collection', tagline: 'Faites tourner le monde.', colors: ['#ff5ea8', '#ffe14d'] },
  { slug: 'ev', name: 'Volta', kind: 'Voitures électriques', tagline: 'Le silence a une puissance.', colors: ['#06080b', '#3de0ff'] },
  { slug: 'ai', name: 'Synapse', kind: 'Intelligence documentaire', tagline: 'L’intelligence qui relie.', colors: ['#05070d', '#8b6cff'] },
  { slug: 'rental', name: 'Rihla', kind: 'Location de voitures', tagline: 'Les clés à l’arrivée.', colors: ['#f7f5f0', '#d7261e'] },
  { slug: 'festival', name: 'Pulse', kind: 'Festival électronique', tagline: 'Trois nuits. Zéro silence.', colors: ['#050008', '#ff2fb4'] },
  { slug: 'school', name: 'Les Cèdres', kind: 'École privée', tagline: 'Apprendre à penser.', colors: ['#fbf8f1', '#12372a'] },
]
