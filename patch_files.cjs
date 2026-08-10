const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let isModified = false;

  if (content.includes("import Layout from \"~/layouts/Layout.astro\"") === false && content.includes("import Layout from '~/layouts/Layout.astro'") === false) {
    if (content.match(/import Layout from ['"](.*)Layout\.astro['"]/)) {
      content = content.replace(/import Layout from ['"](.*)Layout\.astro['"]/, "import Layout from '~/layouts/Layout.astro'");
      isModified = true;
    }
  }

  // Check getStaticPaths
  if (!content.includes('getStaticPaths')) {
    const staticPathsCode = `\nexport function getStaticPaths() {
  return [
    { params: { lang: undefined } },
    { params: { lang: "ar" } },
    { params: { lang: "en" } }
  ];
}\n`;

    if (content.startsWith('---')) {
      content = content.replace('---\n', '---\n' + staticPathsCode);
      isModified = true;
    } else {
      content = '---\n' + staticPathsCode + '---\n' + content;
      isModified = true;
    }
  }

  // Update lang extraction
  if (content.includes("const { lang } = Astro.params;")) {
    content = content.replace("const { lang } = Astro.params;", "const lang = Astro.params.lang || 'ar';");
    isModified = true;
  }
  
  if (content.includes("const { lang = 'ar' } = Astro.params;")) {
      content = content.replace("const { lang = 'ar' } = Astro.params;", "const lang = Astro.params.lang || 'ar';");
      isModified = true;
  }

  if (isModified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

function traverseDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      traverseDir(fullPath);
    } else if (fullPath.endsWith('.astro')) {
      processFile(fullPath);
    }
  }
}

traverseDir(path.join(__dirname, 'src/pages/[...lang]'));
