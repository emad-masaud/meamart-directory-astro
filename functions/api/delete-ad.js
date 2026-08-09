export async function onRequestPost(context) {
  try {
    const data = await context.request.json();
    const slug = data.slug;
    
    if (!slug) {
      return new Response(JSON.stringify({ success: false, error: "Missing slug" }), { status: 400 });
    }
    
    const githubToken = context.env.GITHUB_TOKEN;
    const githubRepo = "emad-masaud/meamart-directory-astro";
    const filePath = `src/data/businesses/${slug}.json`;
    
    // First, get the file SHA
    const getResponse = await fetch(`https://api.github.com/repos/${githubRepo}/contents/${filePath}`, {
      headers: {
        "Authorization": `Bearer ${githubToken}`,
        "User-Agent": "MeaMart-Website",
        "Accept": "application/vnd.github.v3+json"
      }
    });
    
    if (!getResponse.ok) {
      return new Response(JSON.stringify({ success: false, error: "Ad not found" }), { status: 404 });
    }
    
    const fileData = await getResponse.json();
    const fileSha = fileData.sha;
    
    // Then delete the file
    const delResponse = await fetch(`https://api.github.com/repos/${githubRepo}/contents/${filePath}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${githubToken}`,
        "User-Agent": "MeaMart-Website",
        "Accept": "application/vnd.github.v3+json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: `Delete ad: ${slug} via Dashboard`,
        sha: fileSha,
        branch: "main"
      })
    });
    
    if (!delResponse.ok) {
      const errorText = await delResponse.text();
      return new Response(JSON.stringify({ success: false, error: "Failed to delete from GitHub", details: errorText }), { status: 500 });
    }
    
    return new Response(JSON.stringify({ success: true, message: "تم حذف الإعلان بنجاح" }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
}
