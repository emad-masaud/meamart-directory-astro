import fs from 'node:fs/promises';
import path from 'node:path';

export async function GET() {
  const dataDir = path.join(process.cwd(), 'src/data/businesses');
  let ads = [];
  
  try {
    const files = await fs.readdir(dataDir);
    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(dataDir, file);
        const fileData = await fs.readFile(filePath, 'utf-8');
        try {
          const ad = JSON.parse(fileData);
          if (ad.published) {
            ads.push(ad);
          }
        } catch (e) {
          console.error(`Error parsing ${file}:`, e);
        }
      }
    }
    
    // Sort ads by id (timestamp) descending (newest first)
    ads.sort((a, b) => {
      const idA = parseInt(a.id) || 0;
      const idB = parseInt(b.id) || 0;
      return idB - idA;
    });

  } catch (error) {
    console.error('Error reading ads directory:', error);
    return new Response(JSON.stringify({ error: 'Failed to load ads' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify(ads), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=60'
    }
  });
}
