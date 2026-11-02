export type DemoSlug = 'medical' | 'hotel' | 'residence' | 'finance' | 'shop' | 'ev' | 'ai' | 'atelier' | 'festival' | 'watch'

export interface DemoMeta {
  slug: DemoSlug
  name: string
  kind: string
  tagline: string
  /** Dominant colours, used for the studio's floating screens and transitions. */
  colors: [string, string]
}

export const DEMOS: DemoMeta[] = [
  { slug: 'medical', name: 'Aurèle', kind: 'Dermatologie esthétique', tagline: 'Une peau qui respire.', colors: ['#f4efe8', '#e8c4b8'] },
  { slug: 'hotel', name: 'Maison Zéphyr', kind: 'Hôtel & spa', tagline: 'Une journée, six lumières.', colors: ['#e8844a', '#3a2a5c'] },
  { slug: 'residence', name: 'Verticale', kind: 'Résidences', tagline: 'Étage par étage.', colors: ['#f2f1ec', '#2438ff'] },
  { slug: 'finance', name: 'Nordal', kind: 'Gestion d’actifs', tagline: 'Le relief des marchés.', colors: ['#0a0a0a', '#d4ff3a'] },
  { slug: 'shop', name: 'Fragment', kind: 'Objets de collection', tagline: 'Faites tourner le monde.', colors: ['#ff5ea8', '#ffe14d'] },
  { slug: 'ev', name: 'Volta', kind: 'Voitures électriques', tagline: 'Le silence a une puissance.', colors: ['#06080b', '#3de0ff'] },
  { slug: 'ai', name: 'Synapse', kind: 'Intelligence documentaire', tagline: 'L’intelligence qui relie.', colors: ['#05070d', '#8b6cff'] },
  { slug: 'atelier', name: 'Atelier Null', kind: 'Architecture', tagline: 'Construire le silence.', colors: ['#f6f6f4', '#111111'] },
  { slug: 'festival', name: 'Pulse', kind: 'Festival électronique', tagline: 'Trois nuits. Zéro silence.', colors: ['#050008', '#ff2fb4'] },
  { slug: 'watch', name: 'Onyx', kind: 'Haute horlogerie', tagline: 'Le temps, ciselé.', colors: ['#07070a', '#c9b27c'] },
]
