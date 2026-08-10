const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.astro')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk(path.join(__dirname, 'src/pages'));
for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    if (content.match(/export\s+(async\s+)?function\s+getStaticPaths/) && !content.match(/export\s+const\s+prerender/)) {
        content = content.replace('---', '---\nexport const prerender = true;\n');
        fs.writeFileSync(file, content);
        console.log(`Added prerender to ${file}`);
    }
}
