const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if(file.endsWith('.ts') || file.endsWith('.astro') || file.endsWith('.tsx') || file.endsWith('.md') || file.endsWith('.mdx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('./src');
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let newContent = content
    .replace(/getCollection\('businesses'/g, "getCollection('ads'")
    .replace(/getCollection\("businesses"/g, 'getCollection("ads")')
    .replace(/CollectionEntry\<'businesses'\>/g, "CollectionEntry<'ads'>")
    .replace(/CollectionEntry\<"businesses"\>/g, 'CollectionEntry<"ads">');
  
  if (content !== newContent) {
    fs.writeFileSync(f, newContent);
    console.log('Updated ' + f);
  }
});
