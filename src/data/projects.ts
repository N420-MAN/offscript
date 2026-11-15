import type { DemoSlug } from '../demos/meta'

/**
 * The portfolio's case studies. Every project here is an independent concept made by the studio, not commissioned
 * work: the copy describes a hypothetical brief and what the concept explores, never clients, results or figures.
 */
export interface Project {
  slug: DemoSlug
  category: string
  /** One sentence for the card. */
  summary: string
  overview: string
  vision: string
  direction: { identity: string; type: string; palette: [string, string][]; decisions: string; ux: string }
  development: string[]
}

export const PROJECTS: Project[] = [
  {
    slug: 'medical',
    category: 'Santé',
    summary: 'Un centre médical où l’on choisit sa spécialité, son médecin et son créneau en trois gestes.',
    overview: 'Le site d’un centre médical pluridisciplinaire à Casablanca, pensé autour d’une seule question : quand puis-je voir un médecin ?',
    vision:
      'Dans la santé, la confiance se joue avant la consultation. Le concept explore un site qui rassure par la clarté plutôt que par l’accumulation d’informations : les spécialités, les médecins et leurs disponibilités sont visibles tout de suite, et la prise de rendez-vous ne demande ni compte ni appel.',
    direction: {
      identity: 'Un blanc chaud et un vert profond, loin du bleu hospitalier : un lieu de soin, pas une administration.',
      type: 'Instrument Serif pour les titres, d’une élégance calme ; Inter pour tout ce qui doit se lire vite.',
      palette: [['Lin', '#f7f4ef'], ['Sauge profonde', '#0f766e'], ['Encre', '#0f2b33']],
      decisions: 'Des médecins présentés par leurs initiales plutôt que par des photos génériques, des créneaux réels plutôt qu’un formulaire de contact.',
      ux: 'Un parcours en trois étapes, spécialité puis médecin puis créneau, toujours réversible et lisible sur téléphone.',
    },
    development: [
      'Prise de rendez-vous complète : choix du jour, des créneaux disponibles et confirmation, sans rechargement.',
      'Créneaux déjà pris générés de façon stable, pour un calendrier crédible sans base de données.',
      'Mise en page fluide du téléphone au grand écran, contrastes vérifiés pour la lecture.',
    ],
  },
  {
    slug: 'hotel',
    category: 'Hôtellerie',
    summary: 'Un riad de la médina qui se visite avant d’arriver et se réserve en direct, sans plateforme.',
    overview: 'Le site d’une maison d’hôtes de sept chambres dans la médina de Marrakech, conçu pour la réservation directe.',
    vision:
      'Les riads dépendent souvent des plateformes de réservation et de leurs commissions. Le concept imagine un site qui donne envie de réserver en direct : il fait ressentir le lieu, présente chaque chambre avec son prix et rend la réservation aussi simple que sur une grande plateforme.',
    direction: {
      identity: 'La terre cuite, le plâtre et l’ombre des patios : une palette qui sent la médina sans tomber dans le folklore.',
      type: 'Cormorant Garamond, fin et lumineux, pour l’atmosphère ; Inter pour les prix et les détails pratiques.',
      palette: [['Plâtre', '#f6efe4'], ['Terre cuite', '#b4552d'], ['Encre', '#2a1d16']],
      decisions: 'La transition d’ouverture dessine des arches, le motif qui structure toute l’architecture du lieu.',
      ux: 'Chambres, expériences et réservation sur une seule page, avec un total qui se met à jour à chaque choix.',
    },
    development: [
      'Moteur de réservation : dates, chambre, nombre de nuits et total en direct.',
      'Galeries et sections révélées au défilement, sans alourdir le chargement.',
      'Images chargées à la demande pour rester rapide sur les connexions mobiles.',
    ],
  },
  {
    slug: 'residence',
    category: 'Immobilier',
    summary: 'Une résidence vendue sur plan, que l’on parcourt étage par étage avant qu’elle existe.',
    overview: 'Le site de commercialisation d’une tour résidentielle de six niveaux à Casablanca, vendue avant livraison.',
    vision:
      'Vendre un appartement qui n’existe pas encore demande de rendre le projet tangible. Le concept fait de la structure même de l’immeuble le fil conducteur : on l’ouvre étage par étage, on filtre les lots disponibles et l’on simule sa mensualité sans quitter la page.',
    direction: {
      identity: 'Pierre claire, laiton et vert profond : le registre des adresses résidentielles haut de gamme.',
      type: 'Bodoni Moda pour une verticalité élégante, Hanken Grotesk pour les données et les plans.',
      palette: [['Pierre', '#f5f1e9'], ['Laiton', '#a67c45'], ['Vert profond', '#18231e']],
      decisions: 'Le nom VERTICALE court le long de la page, les photographies sont hautes, les règles sont verticales.',
      ux: 'Une recherche de lots par nombre de chambres et disponibilité, puis une demande de brochure ou de visite, y compris en vidéo depuis l’étranger.',
    },
    development: [
      'Immeuble en volumes 3D CSS qui s’ouvre au défilement, étage par étage.',
      'Recherche de lots filtrable et simulateur de crédit immobilier en temps réel.',
      'Section épinglée au défilement, optimisée pour rester fluide sur mobile.',
    ],
  },
  {
    slug: 'restaurant',
    category: 'Restauration',
    summary: 'Une table marocaine contemporaine, sa carte et une réservation en quelques secondes.',
    overview: 'Le site d’un restaurant de cuisine marocaine revisitée, à Casablanca, pensé pour remplir la salle.',
    vision:
      'Pour un restaurant, le site doit répondre en un coup d’œil à trois questions : que mange-t-on, dans quelle ambiance, et peut-on réserver ce soir ? Le concept met la carte et la réservation au premier plan, portées par une photographie chaude.',
    direction: {
      identity: 'Le noir d’une salle le soir et l’or du safran : une ambiance de dîner plutôt qu’un catalogue.',
      type: 'Fraunces, une serif généreuse et gourmande ; Inter pour la carte et les horaires.',
      palette: [['Nuit', '#14110e'], ['Safran', '#e2a23b'], ['Crème', '#f4ece0']],
      decisions: 'La transition d’ouverture fait glisser des colonnes, comme les pages d’une carte.',
      ux: 'Une carte par catégories, des plats signatures, puis une réservation par jour, service et nombre de couverts.',
    },
    development: [
      'Réservation interactive avec créneaux par service et jours de fermeture.',
      'Carte filtrable par catégorie, sans rechargement de page.',
      'Image d’ouverture qui se dévoile au défilement, animée par le GPU.',
    ],
  },
  {
    slug: 'shop',
    category: 'E-commerce',
    summary: 'Une boutique d’objets de collection où le catalogue tourne comme un manège sous les doigts.',
    overview: 'Le site d’une marque d’objets de design en éditions limitées, où parcourir le catalogue devient un jeu.',
    vision:
      'Une petite marque doit se faire remarquer face aux grandes plateformes. Le concept explore une boutique qui se manipule plutôt qu’elle ne se fait défiler : les produits tournent en anneau, on les attrape, on les lance, et l’ajout au panier reste à un geste.',
    direction: {
      identity: 'Des couleurs franches et des formes pures : une identité pop qui assume son caractère.',
      type: 'Syne, large et expressive, pour les titres ; Inter pour la lisibilité des prix et des descriptions.',
      palette: [['Rose', '#ff5ea8'], ['Jaune', '#ffe14d'], ['Bleu', '#4d7bff']],
      decisions: 'Chaque objet porte sa propre couleur de fond, la page change d’ambiance avec le produit au centre.',
      ux: 'Un carrousel 3D que l’on fait tourner au glisser, qui se cale tout seul sur le produit le plus proche.',
    },
    development: [
      'Carrousel 3D avec inertie physique et accroche automatique, au doigt comme à la souris.',
      'Panier réactif avec retour visuel à chaque ajout.',
      'Animations calculées image par image pour rester fluides sur mobile.',
    ],
  },
  {
    slug: 'ev',
    category: 'Automobile',
    summary: 'Le lancement d’une voiture électrique, porté par la vitesse et le silence.',
    overview: 'Le site de lancement d’une marque de voitures électriques, conçu comme une expérience plutôt qu’une fiche technique.',
    vision:
      'Une voiture électrique se vend aussi sur une sensation. Le concept cherche à traduire en ligne la vitesse silencieuse : des traînées de lumière qui accélèrent avec le défilement, des chiffres clés mis en scène et une précommande au bout du parcours.',
    direction: {
      identity: 'Un noir profond traversé de cyan électrique : la nuit, la route, l’énergie.',
      type: 'Space Grotesk pour une esthétique technique et précise, DM Mono pour les données.',
      palette: [['Nuit', '#06080b'], ['Cyan', '#3de0ff']],
      decisions: 'La vitesse du défilement pilote la vitesse de la lumière : la page réagit au rythme du visiteur.',
      ux: 'Un récit en sections plein écran, des caractéristiques lisibles d’un regard, une action finale claire.',
    },
    development: [
      'Traînées lumineuses dessinées en canvas, dont la vitesse suit celle du défilement.',
      'Section épinglée et cartes qui s’inclinent au survol.',
      'Rendu ajusté à la puissance de l’appareil pour rester fluide.',
    ],
  },
  {
    slug: 'ai',
    category: 'Technologie',
    summary: 'Un logiciel d’intelligence documentaire qui montre ce qu’il fait au lieu de le promettre.',
    overview: 'Le site d’un logiciel SaaS qui répond aux questions à partir des documents d’une entreprise.',
    vision:
      'Les produits d’intelligence artificielle se ressemblent tous en ligne. Le concept montre le produit au travail : une démonstration où la réponse s’écrit avec ses sources citées, une tarification claire en dirhams et une demande de démo en fin de page.',
    direction: {
      identity: 'Un fond presque noir et un violet lumineux, sobre plutôt que futuriste.',
      type: 'Inter pour l’interface et le texte, DM Mono pour les éléments techniques.',
      palette: [['Nuit', '#05070d'], ['Violet', '#8b6cff'], ['Menthe', '#5cffc8']],
      decisions: 'Un réseau en 3D, des nœuds reliés par des signaux, illustre l’idée de documents connectés.',
      ux: 'Comprendre le produit en voyant une vraie réponse, avant de lire la moindre promesse.',
    },
    development: [
      'Réseau 3D animé en canvas, que le curseur sonde et perturbe.',
      'Interface de démonstration avec réponse écrite en direct et sources citées.',
      'Tableau de tarifs et formulaire de demande de démo.',
    ],
  },
  {
    slug: 'rental',
    category: 'Automobile',
    summary: 'Une agence de location de voitures où l’on conduit la route du Tichka en faisant défiler la page.',
    overview: 'Le site d’une agence de location de voitures à Marrakech et Casablanca, avec livraison aux aéroports.',
    vision:
      'Les agences de location se distinguent rarement en ligne. Le concept fait commencer le site sur la route elle-même : le visiteur conduit le col du Tichka au crépuscule en faisant défiler la page, avant de choisir sa voiture et de réserver sans carte de crédit.',
    direction: {
      identity: 'Le crépuscule sur l’Atlas, indigo et abricot, et le rouge et blanc des bornes kilométriques marocaines.',
      type: 'Big Shoulders Display, inspirée de la signalisation routière ; Instrument Sans pour le texte ; Noto Kufi Arabic pour l’arabe.',
      palette: [['Indigo', '#1c1838'], ['Abricot', '#ff9a62'], ['Rouge borne', '#d8261c']],
      decisions: 'La flotte est présentée comme le tableau à clés d’une agence : on prend une clé, la voiture arrive à l’écran.',
      ux: 'Recherche par lieu et dates, prix dégressifs visibles, total en direct, paiement à la livraison.',
    },
    development: [
      'Scène 3D en three.js : route de montagne, bornes en arabe et en français, voiture, tableau de bord kilométrique.',
      'Réservation avec options, frais de retour dans une autre ville et total calculé en direct.',
      'Rendu 3D adapté à l’appareil et mis en pause hors de l’écran.',
    ],
  },
  {
    slug: 'festival',
    category: 'Événementiel',
    summary: 'Un festival électronique dont la page bat au rythme de la musique.',
    overview: 'Le site d’un festival de musique électronique de trois nuits, pensé pour donner envie d’y être.',
    vision:
      'Un festival vend une émotion avant de vendre un billet. Le concept fait battre toute la page à 128 BPM : un fond qui pulse, une programmation mise en scène et une billetterie qui garde l’énergie jusqu’au bout.',
    direction: {
      identity: 'Le noir d’une nuit de festival, le violet et le magenta des lumières de scène.',
      type: 'Syne pour une typographie large et sonore, DM Mono pour les horaires et les informations.',
      palette: [['Nuit', '#050008'], ['Magenta', '#ff2fb4'], ['Violet', '#8a3cff']],
      decisions: 'Le visuel principal est un shader qui pulse sur le tempo ; un clic déclenche un « kick ».',
      ux: 'Programmation, dates et billets accessibles rapidement malgré une mise en scène très présente.',
    },
    development: [
      'Fond animé par un shader WebGL calé sur 128 battements par minute.',
      'Distorsion du texte selon la vitesse du curseur.',
      'Sections révélées au défilement et billetterie par catégorie.',
    ],
  },
  {
    slug: 'school',
    category: 'Éducation',
    summary: 'Une école privée bilingue qui répond aux questions des parents avant même qu’ils les posent.',
    overview: 'Le site d’un groupe scolaire privé de la maternelle au lycée, à Casablanca.',
    vision:
      'Les parents comparent les écoles sur trois points : la pédagogie, le cadre et les frais. Le concept répond à chacun d’eux directement : les cycles présentés un à un, un estimateur de frais de scolarité et la réservation d’une visite de l’établissement.',
    direction: {
      identity: 'Un vert profond et un papier clair, une touche de corail : sérieux, chaleureux, jamais austère.',
      type: 'Archivo en largeur variable pour des titres affirmés, Inter pour le reste.',
      palette: [['Papier', '#fbf8f1'], ['Vert cèdre', '#12372a'], ['Corail', '#e8664a']],
      decisions: 'La transition d’ouverture balaie l’écran comme l’aiguille d’une horloge : le temps d’une journée d’école.',
      ux: 'Des cycles clairs, des frais estimés selon le nombre d’enfants, puis une visite réservée en quelques clics.',
    },
    development: [
      'Estimateur de frais de scolarité avec réduction fratrie.',
      'Réservation de visite par jour et créneau.',
      'Mise en page responsive pensée d’abord pour le téléphone, où cherchent la plupart des parents.',
    ],
  },
]

export const projectOf = (slug: string) => PROJECTS.find((p) => p.slug === slug)
