import type { APIRoute } from 'astro';
import { R2Storage } from '~/lib/storage/r2';
import fs from 'node:fs/promises';
import path from 'node:path';

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

    // Upload logic if R2 is configured
    if (accountId && accessKeyId && secretAccessKey && bucketName) {
      const r2 = new R2Storage({
        accountId,
        accessKeyId,
        secretAccessKey,
        bucketName,
        publicDomain,
      });

      const userId = btoa(session.email).replace(/=/g, '').toLowerCase();

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

    // Save profile data locally (for development/static build)
    const userId = btoa(session.email).replace(/=/g, '').toLowerCase();
    const userFilePath = path.join(process.cwd(), 'src', 'data', 'users', `${userId}.json`);
    
    let existingData = {};
    try {
      const fileContent = await fs.readFile(userFilePath, 'utf-8');
      existingData = JSON.parse(fileContent);
    } catch (e) {
      // File doesn't exist, create new
    }

    const newProfileData = {
      ...existingData,
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

    await fs.mkdir(path.dirname(userFilePath), { recursive: true });
    await fs.writeFile(userFilePath, JSON.stringify(newProfileData, null, 2));

    return new Response(JSON.stringify({ success: true, user: newProfileData }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error("Profile submission error:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
}
