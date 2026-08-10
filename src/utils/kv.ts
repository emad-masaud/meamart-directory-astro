export async function kvGet(context: any, key: string): Promise<string | null> {
  const KV = context.locals?.runtime?.env?.SESSION;
  if (!KV) {
    console.warn("KV binding 'SESSION' not found. Ensure Wrangler is running in dev mode or KV is configured.");
    return null;
  }
  return await KV.get(key);
}

export async function kvPut(context: any, key: string, value: string): Promise<void> {
  const KV = context.locals?.runtime?.env?.SESSION;
  if (!KV) {
    console.warn("KV binding 'SESSION' not found. Cannot save data.");
    return;
  }
  await KV.put(key, value);
}

export async function kvList(context: any, prefix: string): Promise<string[]> {
  const KV = context.locals?.runtime?.env?.SESSION;
  if (!KV) {
    return [];
  }
  const listed = await KV.list({ prefix });
  return listed.keys.map((k: any) => k.name);
}
