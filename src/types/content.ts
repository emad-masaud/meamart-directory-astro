import type { CollectionEntry } from "astro:content";

export type AllContent = CollectionEntry<'ads'> | CollectionEntry<'categories'> | CollectionEntry<'blog'> | CollectionEntry<'portfolio'> | CollectionEntry<'docs'> | CollectionEntry<'changelog'> | CollectionEntry<'ads'>;