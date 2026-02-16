# Component Update Examples - i18n Migration Guide

This guide shows you how to update existing components to use the new i18n system.

## Example 1: Simple Text Replacement

### Before (Hardcoded English):
```astro
---
// src/components/MyComponent.astro
---
<h1>Welcome to our Directory</h1>
<p>Search through all listings</p>
```

### After (Bilingual):
```astro
---
// src/components/MyComponent.astro
import { getClientTranslations } from "@util/clientTranslations";
---

<h1 id="welcome-title">Loading...</h1>
<p id="welcome-desc">Loading...</p>

<script>
  import { getClientTranslations } from "@util/clientTranslations";
  
  const { t } = getClientTranslations();
  
  document.getElementById("welcome-title").textContent = t.directory.title;
  document.getElementById("welcome-desc").textContent = t.common.search;
</script>
```

## Example 2: Navigation Links

### Before:
```astro
---
// src/components/Nav.astro
---
<nav>
  <a href="/">Home</a>
  <a href="/blog">Blog</a>
  <a href="/tags">Tags</a>
</nav>
```

### After:
```astro
---
// src/components/Nav.astro
---
<nav>
  <a href="/" data-i18n="nav.home">Home</a>
  <a href="/blog" data-i18n="nav.blog">Blog</a>
  <a href="/tags" data-i18n="nav.tags">Tags</a>
</nav>

<script>
  import { getClientTranslations } from "@util/clientTranslations";
  
  function updateNavLinks() {
    const { t } = getClientTranslations();
    
    document.querySelectorAll('[data-i18n]').forEach((element) => {
      const key = element.getAttribute('data-i18n');
      if (key) {
        const keys = key.split('.');
        let value = t;
        for (const k of keys) {
          value = value[k];
        }
        element.textContent = value;
      }
    });
  }
  
  updateNavLinks();
</script>
```

## Example 3: With Dynamic Content (Numbers)

### Before:
```astro
---
const listingCount = 50;
---
<p>Search among {listingCount} listings</p>
```

### After:
```astro
---
const listingCount = 50;
---
<p id="listing-count">Loading...</p>

<script define:vars={{ listingCount }}>
  import { getClientTranslations } from "@util/clientTranslations";
  
  const { t, formatString } = getClientTranslations();
  
  const text = formatString(t.common.searchPlaceholder, listingCount.toString());
  document.getElementById("listing-count").textContent = text;
</script>
```

## Example 4: Vue Component

### Before:
```vue
<template>
  <div>
    <h2>Featured Items</h2>
    <button>View All</button>
  </div>
</template>
```

### After:
```vue
<script setup>
import { ref, onMounted } from 'vue';
import { getClientTranslations } from '@util/clientTranslations';

const translations = ref(null);

onMounted(() => {
  const { t } = getClientTranslations();
  translations.value = t;
});
</script>

<template>
  <div v-if="translations">
    <h2>{{ translations.common.featured }}</h2>
    <button>{{ translations.common.viewAll }}</button>
  </div>
</template>
```

## Example 5: Footer Component

### Before:
```astro
---
// src/components/Footer.astro
---
<footer>
  <p>Made with ❤️ by MeaMart</p>
</footer>
```

### After:
```astro
---
// src/components/Footer.astro
---
<footer>
  <p id="footer-text">Loading...</p>
</footer>

<script>
  import { getClientTranslations } from "@util/clientTranslations";
  
  const { t } = getClientTranslations();
  
  const footerText = `${t.footer.madeWith} ❤️ ${t.footer.by} MeaMart`;
  document.getElementById("footer-text").textContent = footerText;
</script>
```

## Example 6: Button with Action

### Before:
```astro
<button id="search-btn">Search Now</button>

<script>
  document.getElementById('search-btn').addEventListener('click', () => {
    alert('Searching...');
  });
</script>
```

### After:
```astro
<button id="search-btn">Loading...</button>

<script>
  import { getClientTranslations } from "@util/clientTranslations";
  
  const { t } = getClientTranslations();
  const btn = document.getElementById('search-btn');
  
  if (btn) {
    btn.textContent = t.common.search;
    btn.addEventListener('click', () => {
      alert(t.common.loading);
    });
  }
</script>
```

## Example 7: Form Placeholder

### Before:
```astro
<input type="text" placeholder="Search..." />
```

### After:
```astro
<input type="text" id="search-input" placeholder="Loading..." />

<script>
  import { getClientTranslations } from "@util/clientTranslations";
  
  const { t } = getClientTranslations();
  const input = document.getElementById('search-input');
  
  if (input) {
    input.placeholder = t.common.search;
  }
</script>
```

## Example 8: Conditional Text

### Before:
```astro
---
const isEmpty = true;
---
{isEmpty ? <p>No results found</p> : <p>Loading results...</p>}
```

### After:
```astro
---
const isEmpty = true;
---
<p id="status-message">Loading...</p>

<script define:vars={{ isEmpty }}>
  import { getClientTranslations } from "@util/clientTranslations";
  
  const { t } = getClientTranslations();
  const message = isEmpty ? t.common.noResults : t.common.loading;
  
  document.getElementById('status-message').textContent = message;
</script>
```

## Best Practices

### 1. Use Semantic IDs
```astro
❌ <p id="text1">...</p>
✅ <p id="welcome-message">...</p>
```

### 2. Group Related Translations
```toml
# Good structure
[pricing]
free = "Free"
premium = "Premium"
enterprise = "Enterprise"

[pricing.features]
unlimited = "Unlimited"
support = "24/7 Support"
```

### 3. Handle Loading States
```astro
<div id="content">
  <!-- Show default/loading text that gets replaced -->
  Loading...
</div>
```

### 4. Reuse Translation Functions
```typescript
// Create a utility file
// src/util/updateTranslations.ts
import { getClientTranslations } from "@util/clientTranslations";

export function updateElementText(elementId: string, translationKey: string) {
  const { t } = getClientTranslations();
  const element = document.getElementById(elementId);
  
  if (element) {
    const keys = translationKey.split('.');
    let value = t;
    for (const key of keys) {
      value = value[key];
    }
    element.textContent = value;
  }
}
```

## Common Patterns

### Pattern 1: List of Translated Items
```astro
<ul id="nav-list"></ul>

<script>
  import { getClientTranslations } from "@util/clientTranslations";
  
  const { t } = getClientTranslations();
  const navList = document.getElementById('nav-list');
  
  const items = [
    { key: 'home', link: '/' },
    { key: 'blog', link: '/blog' },
    { key: 'tags', link: '/tags' },
  ];
  
  if (navList) {
    navList.innerHTML = items
      .map(item => `<li><a href="${item.link}">${t.nav[item.key]}</a></li>`)
      .join('');
  }
</script>
```

### Pattern 2: Attributes Translation
```astro
<button id="submit-btn" aria-label="Search">Submit</button>

<script>
  import { getClientTranslations } from "@util/clientTranslations";
  
  const { t } = getClientTranslations();
  const btn = document.getElementById('submit-btn');
  
  if (btn) {
    btn.textContent = t.common.search;
    btn.setAttribute('aria-label', t.common.search);
  }
</script>
```

## Migration Checklist

- [ ] Identify all hardcoded text in component
- [ ] Add corresponding keys to translation files (ar.toml + en.toml)
- [ ] Update schema in `validation/i18n.ts`
- [ ] Replace static text with dynamic loading
- [ ] Add client script to update text
- [ ] Test in both languages
- [ ] Verify RTL layout for Arabic

## Quick Reference

### Get Translations
```javascript
import { getClientTranslations } from "@util/clientTranslations";
const { t, formatString } = getClientTranslations();
```

### Access Translation
```javascript
t.nav.home           // Navigation > Home
t.common.search      // Common > Search
t.directory.title    // Directory > Title
```

### Format with Placeholders
```javascript
formatString(t.common.searchPlaceholder, "100")
// "Search among 100 listings" or "ابحث بين 100 إدراج"
```
