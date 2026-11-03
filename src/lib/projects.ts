import { getCollection } from 'astro:content'

export async function getProjects() {
	return (await getCollection('projects'))
		.filter((p) => !p.data.draft)
		.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
}

// Ordre de la page d'accueil : champ `order` croissant (le premier est mis en avant),
// puis les projets sans `order`, du plus récent au plus ancien.
export async function getHomeProjects() {
	const order = (p: Awaited<ReturnType<typeof getProjects>>[number]) => p.data.order ?? Infinity
	return (await getProjects()).sort((a, b) => order(a) - order(b))
}
