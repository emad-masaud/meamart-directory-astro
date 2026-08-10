import type { CollectionEntry } from "astro:content";

export type AllContent = CollectionEntry<'businesses'> | CollectionEntry<'categories'> | CollectionEntry<'blog'> | CollectionEntry<'portfolio'> | CollectionEntry<'docs'> | CollectionEntry<'changelog'> | CollectionEntry<'ads'>;