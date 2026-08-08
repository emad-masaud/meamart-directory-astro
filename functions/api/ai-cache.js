export async function onRequest(context) {
    const { request, env } = context;
    const githubToken = env.GITHUB_TOKEN;
    const githubRepo = "emad-masaud/meamart-directory-astro";
    const cachePath = "src/data/ai-cache.json";

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
        return new Response(null, {
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type"
            }
        });
    }

    const url = new URL(request.url);
    const query = url.searchParams.get("q");

    // Helper to get cache from GitHub
    async function getCache() {
        const res = await fetch(`https://api.github.com/repos/${githubRepo}/contents/${cachePath}`, {
            headers: {
                "Authorization": `Bearer ${githubToken}`,
                "User-Agent": "MeaMart-Webhook",
                "Accept": "application/vnd.github.v3+json"
            }
        });
        if (!res.ok) return { cache: {}, sha: null };
        const data = await res.json();
        const content = decodeURIComponent(escape(atob(data.content)));
        try {
            return { cache: JSON.parse(content), sha: data.sha };
        } catch(e) {
            return { cache: {}, sha: data.sha };
        }
    }

    // 1. Search for a cached answer
    if (request.method === "GET") {
        if (!query) return new Response(JSON.stringify({ error: "Missing query parameter 'q'" }), { status: 400 });
        
        const { cache } = await getCache();
        const cleanQuery = query.trim();
        const answer = cache[cleanQuery];
        
        return new Response(JSON.stringify({ found: !!answer, answer: answer || null }), {
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
        });
    }

    // 2. Save a new answer to the cache
    if (request.method === "POST") {
        try {
            const body = await request.json();
            const { question, answer } = body;
            
            if (!question || !answer) {
                return new Response(JSON.stringify({ error: "Missing question or answer" }), { status: 400 });
            }

            const { cache, sha } = await getCache();
            const cleanQuestion = question.trim();
            
            // If it already exists, no need to save again
            if (cache[cleanQuestion] === answer) {
                return new Response(JSON.stringify({ success: true, message: "Already cached" }), {
                    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
                });
            }

            cache[cleanQuestion] = answer;

            // Save back to GitHub (encode UTF-8 to Base64)
            const base64Content = btoa(unescape(encodeURIComponent(JSON.stringify(cache, null, 2))));
            
            const updateRes = await fetch(`https://api.github.com/repos/${githubRepo}/contents/${cachePath}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${githubToken}`,
                    "User-Agent": "MeaMart-Webhook",
                    "Accept": "application/vnd.github.v3+json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    message: `Cache AI response for: ${cleanQuestion.substring(0, 20)}...`,
                    content: base64Content,
                    branch: "main",
                    ...(sha && { sha: sha })
                })
            });

            if (!updateRes.ok) {
                const errText = await updateRes.text();
                return new Response(JSON.stringify({ error: "Failed to save cache to GitHub", details: errText }), { status: 500 });
            }

            return new Response(JSON.stringify({ success: true }), {
                headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
            });
        } catch (e) {
            return new Response(JSON.stringify({ error: e.message }), { status: 500 });
        }
    }

    return new Response("Method not allowed", { status: 405 });
}
