const fs = require('fs');
const path = require('path');

const srcDir = 'B:\\meamart-frontend-v2\\src\\pages\\[lang]';
const dstDir = 'B:\\meamart-directory-astro\\src\\pages\\[...lang]';

function copyFile(src, dst) {
    if (fs.existsSync(src)) {
        fs.mkdirSync(path.dirname(dst), { recursive: true });
        fs.copyFileSync(src, dst);
        console.log(`Copied ${src} to ${dst}`);
    } else {
        console.log(`Not found: ${src}`);
    }
}

function copyDir(src, dst) {
    if (fs.existsSync(src)) {
        fs.mkdirSync(dst, { recursive: true });
        const entries = fs.readdirSync(src, { withFileTypes: true });
        for (let entry of entries) {
            const srcPath = path.join(src, entry.name);
            const dstPath = path.join(dst, entry.name);
            if (entry.isDirectory()) {
                copyDir(srcPath, dstPath);
            } else {
                copyFile(srcPath, dstPath);
            }
        }
        console.log(`Copied dir ${src} to ${dst}`);
    } else {
        console.log(`Not found: ${src}`);
    }
}

copyFile(path.join(srcDir, 'admin/dashboard.astro'), path.join(dstDir, 'dashboard/index.astro'));
copyFile(path.join(srcDir, 'admin/ads.astro'), path.join(dstDir, 'dashboard/ads.astro'));
copyFile(path.join(srcDir, 'admin/settings.astro'), path.join(dstDir, 'dashboard/settings.astro'));
copyFile(path.join(srcDir, 'admin/users.astro'), path.join(dstDir, 'dashboard/users.astro'));
copyFile(path.join(srcDir, 'admin/security.astro'), path.join(dstDir, 'dashboard/security.astro'));
copyFile(path.join(srcDir, 'admin/database.astro'), path.join(dstDir, 'dashboard/database.astro'));

copyFile(path.join(srcDir, 'about.astro'), path.join(dstDir, 'about.astro'));
copyFile(path.join(srcDir, 'contact.astro'), path.join(dstDir, 'contact.astro'));
copyFile(path.join(srcDir, 'pricing.astro'), path.join(dstDir, 'pricing.astro'));
copyFile(path.join(srcDir, 'features.astro'), path.join(dstDir, 'features.astro'));
copyFile(path.join(srcDir, 'checkout.astro'), path.join(dstDir, 'checkout.astro'));
copyFile(path.join(srcDir, '404.astro'), path.join(dstDir, '404.astro'));
copyFile(path.join(srcDir, 'showcase.astro'), path.join(dstDir, 'showcase.astro'));
copyFile(path.join(srcDir, 'design.astro'), path.join(dstDir, 'design.astro'));
copyFile(path.join(srcDir, 'changelog.astro'), path.join(dstDir, 'changelog.astro'));

copyDir(path.join(srcDir, 'blog'), path.join(dstDir, 'blog'));
copyDir(path.join(srcDir, 'portfolio'), path.join(dstDir, 'portfolio'));
copyDir(path.join(srcDir, 'bio'), path.join(dstDir, 'bio'));
