# MeaMart - WhatsApp Business Marketplace Platform

A complete, zero-database marketplace platform that enables vendors to manage product catalogs via Google Sheets and sell directly via WhatsApp Business through MeaChat integration.

**Demo**: Visit `/@demo` to see an example vendor profile with sample listings.

## 🚀 Quick Start

### For Vendors (End Users)

1. **Create Account**
   - Go to `/signup`
   - Choose username (3-20 characters)
   - Fill in your details
   - Accept terms and create account

2. **Setup Your Store**
   - Go to `/@yourname/settings`
   - Connect Google Sheet (your product list)
   - Connect MeaChat (WhatsApp Business)
   - Connect Google Merchant (optional)

3. **Add Products**
   - Create Google Sheet with your products
   - Use required column names (see docs)
   - Click "Sync to MeaChat"
   - Products appear on WhatsApp catalog

4. **Receive Orders**
   - Customers see your catalog on WhatsApp
   - They click products and order
   - You receive notification with order details
   - Send invoice and arrange delivery

### For Developers

```bash
# Clone repository
git clone https://github.com/yourusername/meamart-directory-astro
cd meamart-directory-astro

# Install dependencies
pnpm install

# Start development server
pnpm dev
# Open http://localhost:3000

# Build for production
pnpm build

# Deploy to Netlify/Vercel
pnpm deploy
```

## 📋 Documentation

### Getting Started
- **[Signup Guide](./docs/USER_SIGNUP.md)** - How to create vendor account
- **[Google Sheets Setup](./docs/GOOGLE_SHEETS_SETUP.md)** - How to format your product list
- **[Quick Start](./docs/IMPLEMENTATION_SUMMARY.md)** - 2-minute overview

### Integration Guides
- **[Listings Display](./docs/LISTINGS_DISPLAY.md)** - Search, filter, paginate products
- **[MeaChat Integration](./docs/MEACHAT_INTEGRATION.md)** - WhatsApp Business setup
- **[API Documentation](./docs/API.md)** - Technical API endpoints

### Advanced
- **[Full Implementation Guide](./docs/IMPLEMENTATION_SUMMARY.md)** - Complete architecture

## ✨ Features

### For Vendors
- 🆓 **100% Free** - No setup fees, no transaction fees, no hidden costs
- 📱 **WhatsApp Direct** - Customers order directly from WhatsApp Business
- 📊 **Google Sheets** - Manage products in familiar spreadsheet
- 🛒 **Catalog Sync** - Automatic sync to MeaChat and Google Shopping
- 🌍 **Global Reach** - Accessible from any country
- 🎨 **Your Brand** - Custom profile with photos and bio
- 🔐 **Secure** - Your data is yours, never shared

### For Customers
- 🔍 **Easy Search** - Search products by name or category
- 📸 **Product Photos** - See images before ordering
- 💰 **Price Filtering** - Filter by budget
- ⭐ **Featured Items** - See best sellers first
- 📱 **Direct Chat** - WhatsApp button on each product
- 🌏 **Multi-Language** - Arabic and English support

### For Developers
- 🏗️ **Open Source** - MIT licensed, fork it!
- 📚 **Well Documented** - Every component explained
- 🔧 **Extensible** - Easy to add custom features
- ⚡ **Fast** - Static site generation + API routes
- 🎯 **Scalable** - Zero database, grows with you

## 🏗️ Architecture

### Zero-Database Approach
```
User Data → JSON Files (one per vendor)
Products → Google Sheets (vendor maintains)
Orders → Webhooks from MeaChat
```

### Technology Stack
- **Frontend**: Astro 5.5.2 + Vue 3
- **Styling**: Tailwind CSS
- **Validation**: Zod
- **Icons**: Tabler Icons
- **i18n**: Arabic & English
- **APIs**: RESTful endpoints

### File Structure
```
src/
├── pages/              # Routes and API endpoints
│   ├── signup.astro
│   ├── @[username].astro
│   └── api/
├── components/         # Reusable components
│   ├── listings/
│   └── auth/
├── lib/               # Utilities
│   ├── meachat.ts
│   └── google-sheets.ts
├── validation/        # Zod schemas
│   ├── user.ts
│   └── google-sheet-listing.ts
└── data/             # User JSON files
    └── users/
        └── @demo.json
```

## 🚀 Deployment

### Option 1: Netlify (Recommended)
```bash
# Push to GitHub
git push origin main

# Connect Netlify to repo
# Production builds automatically

# Note: API routes work on Netlify Functions
```

### Option 2: Vercel
```bash
# Deploy directly
vercel deploy

# Or connect GitHub for auto-deploy
```

### Option 3: Self-Hosted
```bash
# Build static site
pnpm build

# Deploy dist/ to any static host
# For API routes, use serverless functions or Node.js

# Option: Docker
docker build -t meamart .
docker run -p 3000:3000 meamart
```

## 📊 API Endpoints

### User Management
- `POST /api/auth/signup` - Create vendor account
- `GET /api/auth/check-username` - Check username availability

### Listings
- `GET /api/users/@{username}/listings` - Get products (JSON)
- `GET /api/merchants/@{username}/feed.xml` - Google Merchant feed

### MeaChat Integration
- `POST /api/users/@{username}/sync-meachat` - Sync to WhatsApp
- `GET /api/users/@{username}/meachat-status` - Check status
- `POST /api/webhooks/meachat` - Receive orders

**Full API Docs**: See [API.md](./docs/API.md)

## 💾 Database Backup

Since no database is used, backups are simple:
```bash
# Backup all user data
cp -r src/data/users/ backup/

# Restore
cp -r backup/users/ src/data/

# Or use Git for version control
git commit -m "User data backup"
```

## 🔧 Configuration

### Environment Variables (Optional)
```bash
# No required env vars for basic functionality!

# Optional for production:
vite.define.SITE_URL = "https://yourdomain.com"
```

### Adding Countries
Edit `/src/components/auth/SignupForm.vue`:
```vue
<option value="BN">Brunei</option>
<option value="MV">Maldives</option>
```

### Customizing Listings
Edit `/docs/GOOGLE_SHEETS_SETUP.md` to add/remove fields supported by Google Sheets integration.

## 🧪 Testing

### Manual Testing
```bash
# Start dev server
pnpm dev

# Test signup flow
# 1. Visit http://localhost:3000/signup
# 2. Create account with username "testuser"
# 3. Verify redirect to /@testuser
# 4. Check file: src/data/users/@testuser.json

# Test listings display
# 1. Visit /@demo
# 2. Try search, filter, sort
# 3. Test pagination

# Test MeaChat sync (with real config)
# 1. Setup MeaChat API token in settings
# 2. Configure Google Sheet
# 3. Click sync button
# 4. Verify in MeaChat dashboard
```

### API Testing
```bash
# Check username availability
curl http://localhost:3000/api/auth/check-username?username=myshop

# Get listings
curl http://localhost:3000/api/users/@demo/listings

# Get Merchant feed
curl http://localhost:3000/api/merchants/@demo/feed.xml
```

## 🐛 Troubleshooting

### "Username Already Taken"
- This means someone already created that username
- Choose a different username
- Check at `/api/auth/check-username?username=yourname`

### "Google Sheet Not Found"
- Make sure sheet is publicly viewable (not private)
- Copy Sheet ID from URL: `docs.google.com/spreadsheets/d/{SHEET_ID}`
- Verify sheet name matches (default is "Sheet1")

### "MeaChat Sync Failed"
- Verify API token is correct (regenerate if needed)
- Check MeaChat subscription is active
- Ensure Google Sheet has data
- See [MeaChat Integration](./docs/MEACHAT_INTEGRATION.md) guide

### "Listings Not Showing"
- Check Google Sheet has rows with data
- Column headers must be lowercase (id, title, price, etc.)
- Make sure sheet is publicly viewable

## 🤝 Contributing

Want to improve MeaMart? Great!

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

MIT License - feel free to use commercially!

## 🙋 Support

### For Vendors
- Check `/docs` for guides
- Visit `/@yourname/settings` for help
- Email us at support@example.com

### For Developers
- See documentation in `/docs`
- Open issues on GitHub
- Check existing issues first

## 🎯 Roadmap

### v1.0 (Current) ✅
- ✅ Vendor signup
- ✅ Product listing
- ✅ MeaChat integration
- ✅ Order webhooks

### v1.1 (Next)
- 📊 Analytics dashboard
- 🔄 Scheduled syncs
- 📧 Email notifications
- 📱 Mobile app

### v2.0 (Future)
- 💰 Payment processing
- 👥 Customer accounts
- 📦 Order tracking
- 🌍 Marketplace
- 🏪 Store ratings

## 🌟 Show Your Support

If you find MeaMart useful, please:
- ⭐ Star the repository
- 🔗 Share with friends
- 📣 Tell others about it
- 🐛 Report bugs
- 💡 Suggest features

## 📧 Get in Touch

- Website: https://meamart.com
- Email: hello@meamart.com
- Twitter: @meamartplatform
- WhatsApp: [Coming soon]

---

**Made with ❤️ for SMEs and small businesses in the Middle East**

Built with Astro, Vue, Tailwind, and ☕
