import type { APIRoute } from 'astro';
import { R2Storage } from '~/lib/storage/r2';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const session = locals.userSession;
    if (!session) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), { status: 401 });
    }

    const formData = await request.formData();
    
    // Get fields
    const username = formData.get('username') as string;
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const countryCode = formData.get('countryCode') as string;
    const phoneNum = formData.get('phone') as string;
    const phone = phoneNum ? `${countryCode}${phoneNum.startsWith('0') ? phoneNum.substring(1) : phoneNum}` : '';
    
    // Get files
    const avatarFile = formData.get('avatar') as File | null;
    const headerFile = formData.get('header') as File | null;

    // R2 Configuration (using env variables)
    const accountId = import.meta.env.R2_ACCOUNT_ID || process.env.R2_ACCOUNT_ID;
    const accessKeyId = import.meta.env.R2_ACCESS_KEY_ID || process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = import.meta.env.R2_SECRET_ACCESS_KEY || process.env.R2_SECRET_ACCESS_KEY;
    const bucketName = import.meta.env.R2_BUCKET_NAME || process.env.R2_BUCKET_NAME;
    const publicDomain = import.meta.env.R2_PUBLIC_DOMAIN || process.env.R2_PUBLIC_DOMAIN;

    let avatarUrl = '';
    let headerUrl = '';

    const userId = btoa(session.email).replace(/=/g, '').toLowerCase();

    // Upload logic if R2 is configured
    if (accountId && accessKeyId && secretAccessKey && bucketName) {
      const r2 = new R2Storage({
        accountId,
        accessKeyId,
        secretAccessKey,
        bucketName,
        publicDomain,
      });

      if (avatarFile && avatarFile.size > 0) {
        const ext = avatarFile.name.split('.').pop();
        const buffer = Buffer.from(await avatarFile.arrayBuffer());
        avatarUrl = await r2.uploadFile(`users/${userId}/avatar.${ext}`, buffer, avatarFile.type);
      }

      if (headerFile && headerFile.size > 0) {
        const ext = headerFile.name.split('.').pop();
        const buffer = Buffer.from(await headerFile.arrayBuffer());
        headerUrl = await r2.uploadFile(`users/${userId}/header.${ext}`, buffer, headerFile.type);
      }
    } else {
      console.warn("R2 storage is not configured. Media files will not be uploaded.");
    }

    // Mock saving the profile data since Cloudflare Workers cannot use node:fs
    const newProfileData = {
      id: userId,
      email: session.email,
      username,
      name,
      description,
      phone,
      whatsapp: phone, // Assuming WhatsApp is same as phone
      ...(avatarUrl && { avatar: avatarUrl }),
      ...(headerUrl && { header: headerUrl }),
      updatedAt: new Date().toISOString()
    };
    
    console.log("Mock saved profile data (Cannot use node:fs in Cloudflare Worker):", newProfileData);

    return new Response(JSON.stringify({ success: true, user: newProfileData }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error("Profile submission error:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
}
