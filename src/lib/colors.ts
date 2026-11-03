// Solar colore chaque article selon sa catégorie (bleu, rouge, vert).
// Ici, chaque projet choisit sa couleur dans son frontmatter (`color`), noir en plus,
// ou « multicolor » pour afficher son image en couleur plutôt que teintée.
// Chaque visiteur peut aussi changer la couleur d'un projet depuis l'accueil (voir Swatches.astro).
export const CLASSES = { blue: 'low', red: 'hig', green: 'obs', black: 'blk', multicolor: 'mul' } as const
export type Color = keyof typeof CLASSES
export const colorClass = (color: Color) => CLASSES[color]

export const COLORS_KEY = 'solar-colors'
// Affiche les pastilles sur l'accueil et applique les choix des visiteurs.
// Sur false, chaque projet garde la couleur de son frontmatter.
export const SHOW_SWATCHES = false

// Les deux versions tramées d'une image, lues par le CSS selon le mode choisi.
export const imgVars = (id: string) => `--img: url('/dithers/${id}.png'); --img-mono: url('/dithers/mono/${id}.png')`

export const monthYear = (d: Date) =>
	d.toLocaleString('fr-FR', { month: 'long', year: 'numeric', timeZone: 'UTC' })

export const longDate = (d: Date) =>
	d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
