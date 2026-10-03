import os
import re
from pathlib import Path
import hashlib

def get_files(directory):
    files = []
    for ext in ['*.astro', '*.tsx', '*.jsx']:
        files.extend(list(Path(directory).rglob(ext)))
    return files

def slugify(text):
    text = text.lower()
    text = re.sub(r'[^a-z0-9]+', '_', text)
    return text.strip('_')[:20]

def process_files():
    base_dir = r'c:\Users\just-\OneDrive\Documents\GitHub\meamart-directory-astro'
    src_dir = os.path.join(base_dir, 'src')
    
    files = get_files(src_dir)
    
    # Matches {lang === 'ar' ? 'arabic' : 'english'}
    # Group 1: arabic string
    # Group 2: english string
    pattern = re.compile(r'\{lang === [\'"]ar[\'"]\s*\?\s*[\'"](.*?)[\'"]\s*:\s*[\'"](.*?)[\'"]\}')
    
    translations = {}
    
    for file_path in files:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
            
        def replacer(match):
            ar_text = match.group(1)
            en_text = match.group(2)
            
            # Generate a key based on english text
            base_key = slugify(en_text)
            if not base_key:
                base_key = "text_" + hashlib.md5(en_text.encode()).hexdigest()[:6]
                
            key = f"auto.{base_key}"
            translations[key] = (ar_text, en_text)
            
            return f"{{t('{key}')}}"
            
        new_content, count = pattern.subn(replacer, content)
        
        # also replace without {} when it's passed as prop, e.g., title={lang === 'ar' ? "x" : "y"}
        # Wait, the above pattern included the { and }, which handles both JSX text and prop={...}
        
        if count > 0:
            print(f"Replaced {count} in {file_path.name}")
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
                
    # Now append to ar.properties and en.properties
    if translations:
        ar_props = os.path.join(base_dir, 'src', 'i18n', 'locales', 'ar.properties')
        en_props = os.path.join(base_dir, 'src', 'i18n', 'locales', 'en.properties')
        
        with open(ar_props, 'a', encoding='utf-8') as f:
            for k, (ar, en) in translations.items():
                f.write(f"\n{k}={ar}")
                
        with open(en_props, 'a', encoding='utf-8') as f:
            for k, (ar, en) in translations.items():
                f.write(f"\n{k}={en}")
                
        print(f"Added {len(translations)} keys to properties files.")

if __name__ == '__main__':
    process_files()
