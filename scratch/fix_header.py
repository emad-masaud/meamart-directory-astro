import os

p = r'c:\Users\just-\OneDrive\Documents\GitHub\meamart-directory-astro\src\components\layout\Header.astro'
with open(p, 'r', encoding='utf-8', errors='ignore') as f:
    t = f.read()

import re
# Find {lang === "ar" ... }
pattern = re.compile(r'\{lang === "ar"\s*\?\s*"[^"]+"\s*:\s*"Please complete your profile details to easily create ads\."\}', re.DOTALL)
t = pattern.sub('{t["header.complete_profile"]}', t)

with open(p, 'w', encoding='utf-8') as f:
    f.write(t)
