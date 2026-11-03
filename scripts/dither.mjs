// Tramage des miniatures, dans l'esprit de solar.lowtechmagazine.com.
// Tramage ordonné de Bayer 8×8 en couleur, sur une palette de 8 couleurs
// calculée pour chaque photo : les couleurs réelles sont gardées, la trame reste visible
// et les images restent très légères.
// Une seconde version, en 4 niveaux de gris, est écrite dans public/dithers/mono :
// le site la teinte par la couleur de la catégorie (fusion « hard-light »), comme le Solar d'origine.
// Écrit pour ce projet ; il n'utilise pas le plugin GPL de Low-tech Magazine.
import { readdir, mkdir } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const SRC = 'src/content/projects'
const OUT = 'public/dithers'
const MAX = 1200
const COLORS = 8
const THRESHOLD = 64
const OUT_MONO = path.join(OUT, 'mono')
const GRAYS = [0, 85, 170, 255]

// Matrice de Bayer n×n, construite récursivement.
function bayer(n) {
	if (n === 1) return [[0]]
	const m = bayer(n / 2)
	const size = n / 2
	const out = Array.from({ length: n }, () => new Array(n))
	for (let y = 0; y < size; y++)
		for (let x = 0; x < size; x++) {
			const v = 4 * m[y][x]
			out[y][x] = v
			out[y][x + size] = v + 2
			out[y + size][x] = v + 3
			out[y + size][x + size] = v + 1
		}
	return out
}

const B = bayer(8)

// Palette adaptée : les 8 couleurs les plus représentatives de la photo,
// trouvées par regroupement k-moyennes sur une version réduite de l'image.
// (La quantification de sharp arrondit le nombre de couleurs à 16, d'où ce calcul maison.)
async function adaptivePalette(file) {
	const { data, info } = await sharp(file)
		.resize(150, 150, { fit: 'inside' })
		.removeAlpha()
		.raw()
		.toBuffer({ resolveWithObject: true })
	const pixels = []
	for (let i = 0; i < data.length; i += info.channels) pixels.push([data[i], data[i + 1], data[i + 2]])
	const dist = (a, b) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2

	// Initialisation déterministe façon k-means++ : on part de la couleur moyenne,
	// puis on ajoute à chaque fois le pixel le plus éloigné des centres déjà choisis.
	const mean = [0, 1, 2].map((c) => pixels.reduce((s, p) => s + p[c], 0) / pixels.length)
	const centers = [mean]
	while (centers.length < COLORS) {
		let far = pixels[0]
		let farD = -1
		for (const p of pixels) {
			const d = Math.min(...centers.map((c) => dist(p, c)))
			if (d > farD) {
				farD = d
				far = p
			}
		}
		centers.push([...far])
	}

	for (let iter = 0; iter < 15; iter++) {
		const sums = centers.map(() => [0, 0, 0, 0])
		for (const p of pixels) {
			let k = 0
			let kd = Infinity
			centers.forEach((c, i) => {
				const d = dist(p, c)
				if (d < kd) {
					kd = d
					k = i
				}
			})
			sums[k][0] += p[0]
			sums[k][1] += p[1]
			sums[k][2] += p[2]
			sums[k][3]++
		}
		sums.forEach((s, i) => {
			if (s[3]) centers[i] = [s[0] / s[3], s[1] / s[3], s[2] / s[3]]
		})
	}
	return centers.map((c) => c.map(Math.round))
}

function nearest(palette, r, g, b) {
	let best = palette[0]
	let bestDistance = Infinity
	for (const p of palette) {
		const d = (p[0] - r) ** 2 + (p[1] - g) ** 2 + (p[2] - b) ** 2
		if (d < bestDistance) {
			bestDistance = d
			best = p
		}
	}
	return best
}

async function ditherColorImage(src, out) {
	const palette = await adaptivePalette(src)
	const { data, info } = await sharp(src)
		.resize(MAX, MAX, { fit: 'inside', withoutEnlargement: true })
		.removeAlpha()
		.raw()
		.toBuffer({ resolveWithObject: true })

	const px = Buffer.alloc(info.width * info.height * 3)
	for (let y = 0; y < info.height; y++)
		for (let x = 0; x < info.width; x++) {
			const i = (y * info.width + x) * info.channels
			const offset = (B[y % 8][x % 8] / 64 - 0.5) * THRESHOLD
			const [r, g, b] = nearest(palette, data[i] + offset, data[i + 1] + offset, data[i + 2] + offset)
			const j = (y * info.width + x) * 3
			px[j] = r
			px[j + 1] = g
			px[j + 2] = b
		}

	await mkdir(path.dirname(out), { recursive: true })
	await sharp(px, { raw: { width: info.width, height: info.height, channels: 3 } })
		.png({ palette: true, colours: 16, dither: 0, compressionLevel: 9 })
		.toFile(out)
}

await mkdir(OUT_MONO, { recursive: true })
for (const slug of await readdir(SRC)) {
	const dir = path.join(SRC, slug)
	const file = (await readdir(dir)).find((f) => /^thumbnail\.(webp|jpe?g|png)$/i.test(f))
	if (!file) continue
	const src = path.join(dir, file)
	const out = path.join(OUT, `${slug}.png`)

	await ditherColorImage(src, out)
	const { data, info } = await sharp(src)
		.resize(MAX, MAX, { fit: 'inside', withoutEnlargement: true })
		.removeAlpha()
		.raw()
		.toBuffer({ resolveWithObject: true })

	const gray = Buffer.alloc(info.width * info.height)
	for (let y = 0; y < info.height; y++)
		for (let x = 0; x < info.width; x++) {
			const i = (y * info.width + x) * info.channels
			// Même trame, appliquée à la luminance et ramenée au niveau de gris le plus proche.
			const l = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]
			const step = 255 / (GRAYS.length - 1)
			const k = Math.round((l + (B[y % 8][x % 8] / 64 - 0.5) * step) / step)
			gray[y * info.width + x] = GRAYS[Math.max(0, Math.min(GRAYS.length - 1, k))]
		}

	await sharp(gray, { raw: { width: info.width, height: info.height, channels: 1 } })
		.png({ palette: true, colours: GRAYS.length, dither: 0, compressionLevel: 9 })
		.toFile(path.join(OUT_MONO, `${slug}.png`))
	console.log(`dither: ${out} + mono`)

	const imagesDir = path.join(dir, 'images')
	let images
	try {
		images = await readdir(imagesDir, { withFileTypes: true })
	} catch (error) {
		if (error.code === 'ENOENT') continue
		throw error
	}

	for (const image of images) {
		if (!image.isFile() || !/\.(webp|jpe?g|png)$/i.test(image.name)) continue
		const imageSrc = path.join(imagesDir, image.name)
		const imageOut = path.join(OUT, 'project-images', slug, `${path.parse(image.name).name}.png`)
		await ditherColorImage(imageSrc, imageOut)
		console.log(`dither: ${imageOut}`)
	}
}
