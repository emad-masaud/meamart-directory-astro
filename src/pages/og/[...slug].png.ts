import { getCollection, getEntry } from 'astro:content';
import { getRootPages } from '@lib/getRootPages';
import config from '@util/themeConfig';
import { type AllContent } from '../../types/content';
 
interface Props {
  params: { slug: string };
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
 
export async function GET({ params }: Props) {
  const title = config.general.title;
  console.log(params);
  const { slug } = params;

  let entry: AllContent | undefined;
  const allListings = (await getCollection("directory")).map(e => e.id);
  if (allListings.includes(slug)){
    entry = await getEntry('directory', slug);
  } else {
    entry = await getEntry('pages', slug);
  }

  if (!entry) {
    throw new Error("Unable to find " + slug);
  }

  const safeTitle = escapeXml(entry.data.title ?? 'Page');
  const subtitle = entry.collection === 'directory'
    ? escapeXml(entry.data.description ?? '')
    : safeTitle;
  const safeSite = escapeXml(title ?? 'Site');
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="600" viewBox="0 0 1200 600">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f8fafc" />
      <stop offset="100%" stop-color="#e2e8f0" />
    </linearGradient>
  </defs>
  <rect width="1200" height="600" fill="url(#bg)" />
  <rect x="120" y="140" width="200" height="200" rx="32" fill="#e2e8f0" />
  <text x="360" y="230" font-family="Arial, sans-serif" font-size="48" fill="#0f172a">${safeTitle}</text>
  <text x="360" y="280" font-family="Arial, sans-serif" font-size="20" fill="#475569">${subtitle}</text>
  <text x="120" y="520" font-family="Arial, sans-serif" font-size="28" fill="#0f172a">${safeSite}</text>
</svg>`;

  return new Response(svg, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}

export async function getStaticPaths() {
  return await getRootPages(false);
}