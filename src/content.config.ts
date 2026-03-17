import { defineCollection } from 'astro:content';
import { z } from 'zod';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    excerpt: z.string(),
    date: z.string(),
    dateDisplay: z.string(),
    readTime: z.number(),
    category: z.enum(['bcg', 'ai', 'hw', 'hc', 'ml']),
    tag: z.string(),
    featured: z.boolean().default(false),
  }),
});

export const collections = { blog };
