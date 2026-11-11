import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const guides = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/guides' }),
  schema: z.object({
    title: z.string(),
    metaTitle: z.string().optional(),
    description: z.string().max(170),
    published: z.coerce.date(),
    updated: z.coerce.date().optional(),
    category: z.enum(['Création', 'Fiscalité', 'Juridique', 'Gestion']),
    readingTime: z.number(),
    related: z.array(z.string()).default([]),
    cta: z
      .object({ label: z.string(), href: z.string() })
      .optional(),
  }),
});

export const collections = { guides };
