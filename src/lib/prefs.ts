export type Preset = { background: string; foreground: string; accent: string }

export const PRESET_KEY = 'solar-preset'
export const SKY_KEY = 'solar-sky'
export const HEADER_COLOR_KEY = 'solar-header-color'

export const HEADER_COLORS = {
	parchment: 'Light parchment',
	roseParchment: 'Rose-tinted parchment',
	sageParchment: 'Sage-tinted parchment',
	blueGrayParchment: 'Blue-gray parchment',
	softOchre: 'Soft ochre',
	paperOchre: 'Paper ochre',
	warmParchment: 'Warm parchment',
	linen: 'Aged linen',
	creamPaper: 'Cream paper',
	blushPaper: 'Blush paper',
	dustyRose: 'Dusty rose',
	peachPaper: 'Peach paper',
	honeyPaper: 'Pale honey',
	goldenParchment: 'Golden parchment',
	paleSage: 'Pale sage',
	olivePaper: 'Olive paper',
	mistBlue: 'Mist blue',
	grayParchment: 'Gray parchment',
} as const

export function applyPreset(preset: Preset | null) {
	const root = document.documentElement
	if (!preset) {
		;['--preset-bg', '--preset-fg', '--preset-accent'].forEach((v) => root.style.removeProperty(v))
		root.removeAttribute('data-preset')
		return
	}
	root.style.setProperty('--preset-bg', preset.background)
	root.style.setProperty('--preset-fg', preset.foreground)
	root.style.setProperty('--preset-accent', preset.accent)
	root.setAttribute('data-preset', '')
}

export function applySky(on: boolean) {
	if (on) document.documentElement.removeAttribute('data-sky')
	else document.documentElement.setAttribute('data-sky', 'off')
}

export function applyHeaderColor(name: string | null) {
	const root = document.documentElement
	const colorName = name ? Object.keys(HEADER_COLORS).find((key) => key === name) : undefined
	if (!colorName) {
		root.removeAttribute('data-header-color')
		return
	}
	root.setAttribute('data-header-color', colorName)
}

export function read(key: string): string | null {
	try {
		return localStorage.getItem(key)
	} catch {
		return null
	}
}

export function save(key: string, value: string | null) {
	try {
		if (value) localStorage.setItem(key, value)
		else localStorage.removeItem(key)
	} catch {
		// Stockage indisponible (navigation privée) : le réglage reste actif pour la page en cours.
	}
}
