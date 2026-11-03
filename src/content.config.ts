import { defineCollection } from 'astro:content'
import { z } from 'astro/zod'
import { glob } from 'astro/loaders'

const projects = defineCollection({
	loader: glob({
		base: 'src/content/projects',
		pattern: '*/index.{md,mdx}',
		generateId: ({ entry }) => entry.split('/')[0],
	}),
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			date: z.coerce.date(),
			draft: z.boolean().optional(),
			order: z.number().optional(),
			color: z.enum(['blue', 'red', 'green', 'black', 'multicolor']).default('blue'),
			thumbnail: image().optional(),
			thumbnailAlt: z.string().optional(),
			demoURL: z.string().optional(),
			repoURL: z.string().optional(),
		}),
})

export const collections = { projects }
