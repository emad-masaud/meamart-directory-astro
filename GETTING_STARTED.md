# MeaMart - Getting Started Guide

## What is MeaMart?

MeaMart is a free platform for vendors who want to sell products directly through WhatsApp Business. Think of it as:
- **Like Instagram** but for products (you can see any vendor's store)
- **Like a mobile app** but it's a website (works on any phone)
- **Like WhatsApp** but with a catalog (organized shopping)

## For Vendors - How to Use MeaMart

### Step 1: Create Your Store (5 minutes)

1. Go to **meamart.com/signup**

2. Fill in few details:
   - **Username**: Your store name on MeaMart (like @myshop)
   - **Store Name**: Display name (e.g., "Ali's Phone Shop")
   - **Email**: Your contact email
   - **WhatsApp**: Your WhatsApp Business number
   - **Country**: Where you're located
   - **City**: Your city
   - **Bio**: Brief description (optional)

3. Click **"Create Store"**

4. You're done! Store is live at: `meamart.com/@your-username`

### Step 2: Connect Your Products (10 minutes)

#### Option A: Using Google Sheets (Recommended)

1. Create a Google Sheet with your products:
   - Open Google Docs at docs.google.com
   - Create new spreadsheet
   - Add these columns (in row 1):
     ```
     id, title, description, price, currency, category, image_url, location
     ```

2. Add your products (one per row):
   ```
   1, iPhone 15 Pro, Latest model A17 Pro, 5000, AED, Electronics, https://example.com/iphone.jpg, Dubai
   2, Samsung S24, 6.8 inch display, 4500, AED, Electronics, https://example.com/samsung.jpg, Dubai
   ```

3. Make it public:
   - Click Share button (top right)
   - Change to "Anyone with link can view"
   - Copy the Sheet ID from URL: `docs.google.com/spreadsheets/d/{THIS_IS_YOUR_ID}/...`

4. Go to your settings:
   - Visit `meamart.com/@yourname/settings`
   - Click "Integrations" tab
   - Enable "Google Sheets"
   - Paste Sheet ID and name
   - Click "Save"

5. Your products appear!
   - Visit `meamart.com/@yourname`
   - See all your products displayed
   - Click "Sync to MeaChat" to send to WhatsApp

#### Option B: Using CSV File

1. Create CSV file with your products:
   ```csv
   id,title,price,currency,location
   1,iPhone 15,5000,AED,Dubai
   2,Samsung S24,4500,AED,Dubai
   ```

2. Upload to Google Sheets:
   - Go to docs.google.com
   - Create new spreadsheet
   - File > Import > Upload > Choose CSV
   - Proceed with Option A above

### Step 3: Connect to WhatsApp Business (5 minutes)

1. Get MeaChat Account:
   - Go to meachat.com
   - Sign up with your WhatsApp Business number
   - Verify your number
   - Complete verification

2. In MeaChat, get:
   - **Business Account ID** (shown in dashboard)
   - **API Token** (generate in API settings)
   - **Catalog ID** (create a catalog or copy existing)

3. Add to MeaMart:
   - Visit `meamart.com/@yourname/settings`
   - Click "Integrations" tab
   - Enable "MeaChat"
   - Paste Business Account ID, API Token, Catalog ID
   - Click "Save"

4. Sync your products:
   - Click "Sync to MeaChat" button
   - Wait for confirmation
   - Your catalog appears in MeaChat!

### Step 4: Start Selling (Ongoing)

1. **Customers see your store**:
   - They visit `meamart.com/@yourname`
   - They see all your products
   - They can search and filter

2. **Customers buy**:
   - They click product
   - They click "Contact on WhatsApp"
   - They open WhatsApp chat with you
   - They can ask questions

3. **You make the sale**:
   - You discuss price/quantity
   - You send invoice
   - Customer pays
   - You arrange delivery

4. **Keep products updated**:
   - Edit your Google Sheet anytime
   - Products update automatically
   - Click "Sync to MeaChat" periodically
   - Catalog always shows what you sell

## For Developers - How MeaMart Works

### Architecture

```
Frontend (Astro + Vue)       API Endpoints              External
   ↓                             ↓                          ↓
/@[username]          /api/users/@username/listings   Google Sheets
  ├─ Profile                  (fetch from Sheet)
  ├─ Listings Grid      @username/sync-meachat         MeaChat
  ├─ Search/Filter          (send to MeaChat)         API
  └─ WhatsApp Button    @username/meachat-status
                        @webhooksp/meachat            Orders
                            (receive webhooks)
```

### Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Astro 5.5.2 | Static site generation |
| **Components** | Vue 3 | Interactive UI |
| **Styling** | Tailwind CSS | Responsive design |
| **API** | Astro Routes | Backend endpoints |
| **Data** | JSON files | No database |
| **Validation** | Zod | Schema validation |
| **External** | Google Sheets API | Product backend |
| **External** | MeaChat API | WhatsApp integration |

### Data Flow

#### 1. Vendor Signup
```
Form submit
   ↓
POST /api/auth/signup
   ↓
Validate input (Zod)
   ↓
Check username unique (collection)
   ↓
Create /src/data/users/@username.json
   ↓
Redirect to /@username
```

#### 2. Product Listing
```
Visit /@username
   ↓
Client loads UserListingsDisplay.vue
   ↓
Fetch GET /api/users/@username/listings
   ↓
Read from Google Sheet (CSV export)
   ↓
Transform to listing objects
   ↓
Return JSON array
   ↓
Display in responsive grid
```

#### 3. MeaChat Sync
```
Click "Sync to MeaChat"
   ↓
POST /api/users/@username/sync-meachat
   ↓
Get user config (businessAccountId, apiToken)
   ↓
Fetch Google Sheet (same CSV endpoint)
   ↓
Transform to MeaChat format
   ↓
Call MeaChat API: addProductsToCatalog()
   ↓
Products appear in WhatsApp catalog
```

#### 4. Order Reception
```
Customer orders on WhatsApp
   ↓
MeaChat triggers webhook
   ↓
POST /api/webhooks/meachat
   ↓
Validate payload
   ↓
Parse order details
   ↓
Generate vendor notification
   ↓
Log to /src/data/webhooks/meachat-orders.jsonl
   ↓
(Future) Send email/SMS to vendor
```

### Key Files

#### Frontend Pages
- `src/pages/signup.astro` - Registration page
- `src/pages/@[username].astro` - Vendor profile (dynamic route)
- `src/pages/@[username]/settings.astro` - Vendor settings

#### Components
- `src/components/auth/SignupForm.vue` - Signup form with validation
- `src/components/listings/UserListingsDisplay.vue` - Listings grid with search/filter
- `src/components/listings/UserListingCard.astro` - Individual listing card

#### API Endpoints
- `src/pages/api/auth/signup.ts` - User creation
- `src/pages/api/auth/check-username.ts` - Check availability
- `src/pages/api/users/[username]/listings.ts` - Get products
- `src/pages/api/users/[username]/sync-meachat.ts` - Sync to WhatsApp
- `src/pages/api/webhooks/meachat.ts` - Receive orders

#### Libraries
- `src/lib/meachat.ts` - MeaChat API client
- `src/lib/google-sheets.ts` - Google Sheets CSV reader
- `src/validation/user.ts` - Zod schema for vendors
- `src/validation/google-sheet-listing.ts` - Zod schema for products

#### Data
- `src/data/users/@demo.json` - Example vendor
- `src/data/users/@[username].json` - Vendor profiles (created on signup)

### Extending MeaMart

#### Add New Field to Vendor Profile
1. Edit `src/validation/user.ts` - Add field to schema
2. Edit `src/components/auth/SignupForm.vue` - Add input field
3. Edit `src/pages/@[username]/settings.astro` - Add to settings UI
4. Field automatically persists in user JSON

#### Add New Listing Filter
1. Edit `src/components/listings/UserListingsDisplay.vue`
2. Add `<select>` for new filter
3. Update `filteredListings` computed property
4. Add to filter logic:
   ```typescript
   if (selectedMyNewFilter.value) {
     filtered = filtered.filter(l => l.myNewField === selectedMyNewFilter.value);
   }
   ```

#### Add New API Endpoint
1. Create new file: `src/pages/api/my-endpoint.ts`
2. Export `GET` or `POST` function:
   ```typescript
   export async function POST(request) {
     const data = await request.json();
     // Process
     return new Response(JSON.stringify({...}));
   }
   ```
3. Automatically available at `/api/my-endpoint`

#### Connect New External Service
1. Create client lib: `src/lib/myservice.ts`
2. Export functions for API calls
3. Use in API endpoints
4. Add configuration to user schema
5. Add UI inputs in settings

## Common Tasks

### How to: Backup User Data
```bash
# Copy all user data
cp -r src/data/users/ backup-$(date +%Y%m%d)/

# Check in Git
git add src/data/users/
git commit -m "Backup user data"
```

### How to: Add New Country (for vendors)
1. Edit `src/components/auth/SignupForm.vue`
2. Find the `<select>` with country options
3. Add line:
   ```vue
   <option value="BN">Brunei</option>
   ```
4. Done! Next vendor can select it

### How to: Debug Listings Display
```javascript
// In browser console
// 1. Check if component loaded
console.log(Vue.__VUE_INSTANCE__)

// 2. Fetch listings API
fetch('/api/users/@demo/listings')
  .then(r => r.json())
  .then(d => console.log('Listings:', d))

// 3. Check filters
console.log('Search query:', searchQuery.value)
console.log('Filtered count:', filteredListings.value.length)
```

### How to: Test MeaChat API Connection
```bash
# First, get your token and business ID

# Then test:
curl -X GET https://api.meachat.com/v1/account/info \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# If successful, returns 200 with account info
# If failed, returns 401 (invalid token)
```

## Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| "Username taken" | Already registered | Choose different username |
| "Sheet not found" | Wrong Sheet ID or private | Make sheet public, copy ID from URL |
| "Invalid MeaChat token" | Wrong API token | Regenerate token in MeaChat dashboard |
| "No listings" | Empty Google Sheet | Add products to sheet rows |
| "404 Not Found" | Endpoint doesn't exist | Check route path and method |

## Performance Tips

### For Vendors
- ✅ Keep product images under 2MB
- ✅ Use descriptive titles and descriptions
- ✅ Add prices in same currency
- ✅ Update products regularly
- ❌ Don't add 10,000+ products (sync will be slow)

### For Developers
- ✅ Cache API responses (already 1-hour TTL)
- ✅ Lazy load images
- ✅ Use computed properties (auto-memoized)
- ✅ Batch webhook processing
- ❌ Don't fetch all users for every request

## Security Best Practices

- ✅ Validate all inputs (client + server)
- ✅ Use HTTPS only (for production)
- ✅ Rotate API tokens regularly
- ✅ Don't commit tokens to Git
- ✅ Make Google Sheets view-only
- ❌ Don't store passwords (not needed)
- ❌ Don't expose user emails publicly

## Support Resources

- 📖 **Full Docs**: `/docs` folder
- 🎯 **API Ref**: `/docs/API.md`
- 🔧 **Setup Guides**: Each doc file
- 💬 **Issues**: GitHub issues
- 📧 **Contact**: support@meamart.com

---

That's it! You're ready to start using MeaMart. Happy selling! 🚀
