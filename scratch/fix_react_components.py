import os
import re

base_dir = r'c:\Users\just-\OneDrive\Documents\GitHub\meamart-directory-astro'

files = [
    os.path.join(base_dir, 'src', 'components', 'dashboard', 'SellerQrManagerClient.tsx'),
    os.path.join(base_dir, 'src', 'components', 'islands', 'MobileMenu.jsx'),
    os.path.join(base_dir, 'src', 'components', 'react', 'HeroChatAssistant.tsx'),
]

for file_path in files:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Make sure ui is imported
    if "from '~/i18n/ui'" not in content:
        # insert after first import
        content = re.sub(r'(import .*?;?\n)', r'\1import { ui } from "~/i18n/ui";\n', content, count=1)
        
    # Replace existing const t = ... if present
    content = re.sub(
        r'const t = ui\[lang as keyof typeof ui\] \|\| ui\[\'en\'\];',
        r'',
        content
    )
    
    # Insert const t = ... inside the component
    # We need to find the main component declaration
    # e.g., export default function MobileMenu({ lang = 'ar', ... }) {
    # or export function SellerQrManagerClient({ lang }) {
    
    t_func = r"""
  const t = (key) => {
    const l = lang || 'en';
    const translations = ui[l] || ui['en'];
    return translations[key] || `{${key}}`;
  };
"""
    
    if "const t = (key) => {" not in content:
        # find the function definition and {
        content = re.sub(
            r'(export (?:default )?function [^{]+\{\n)',
            r'\1' + t_func,
            content
        )
        
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
        
print("Fixed React components.")
