const fs = require('fs');
const path = require('path');
function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('from \'lucide-react\'')) {
        console.log('Processing', filePath);
        content = content.replace(/import\s+\{[^}]+\}\s+from\s+'lucide-react';?/, 'import { Icon } from \'astro-icon/components\';');
        
        const tags = ['MapPin', 'Tag', 'User', 'CheckCircle', 'Check', 'Send', 'Globe', 'ExternalLink', 'MessageSquare', 'QrCode', 'Eye', 'ChevronLeft', 'ChevronRight', 'Home', 'Sun', 'Moon', 'Copy', 'X', 'Menu', 'Github', 'LogOut', 'LayoutGrid', 'LogIn', 'ShoppingBag'];
        
        tags.forEach(tag => {
            let iconName = 'lucide:' + tag.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
            
            // Replace <Tag>
            const regexOpen = new RegExp('<' + tag + '(\\s*|\\s+[^>]*?)>', 'g');
            content = content.replace(regexOpen, (match, p1) => {
                if (p1.endsWith('/')) return match; // Handle self-closing next
                let attrs = p1;
                attrs = attrs.replace(/className=/g, 'class=');
                return '<Icon name=\"' + iconName + '\"' + attrs + '>';
            });
            // Replace </Tag>
            const regexClose = new RegExp('</' + tag + '>', 'g');
            content = content.replace(regexClose, '</Icon>');
            
            // Replace <Tag />
            const regexSelfClose = new RegExp('<' + tag + '(\\s*|\\s+[^>]*?)/>', 'g');
            content = content.replace(regexSelfClose, (match, p1) => {
                let attrs = p1;
                attrs = attrs.replace(/className=/g, 'class=');
                return '<Icon name=\"' + iconName + '\"' + attrs + '/>';
            });
        });
        fs.writeFileSync(filePath, content, 'utf8');
    }
}

function walk(dir) {
    fs.readdirSync(dir).forEach(file => {
        let fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walk(fullPath);
        } else if (fullPath.endsWith('.astro')) {
            replaceInFile(fullPath);
        }
    });
}
walk('b:/meamart-directory-astro/src');
