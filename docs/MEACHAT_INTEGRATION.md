# MeaChat Integration

## Overview
Complete WhatsApp Business integration with MeaChat API. Vendors can connect their WhatsApp Business accounts, automatically sync product listings, and receive orders directly from customers.

## Features

### 1. **Product Catalog Sync**
- Automatic sync from Google Sheets to MeaChat catalog
- One-click sync or scheduled sync (configurable)
- Real-time product updates
- Support for images, pricing, availability

### 2. **Order Management**
- Receive orders via webhook
- Order notifications via WhatsApp/Email
- Order history and tracking
- Status updates (pending, confirmed, shipped, delivered)

### 3. **WhatsApp Business Integration**
- Send product catalogs to customers
- Send personalized messages to customers
- Receive customer messages
- Automate customer support

### 4. **Analytics**
- Catalog views tracking
- Orders per catalog/product
- Customer engagement metrics
- Revenue tracking

## Architecture

### Component Flow
```
Google Sheets (vendor's product list)
        ↓ (CSV export)
MeaMart Platform (reads & validates)
        ↓ (MeaChat API)
MeaChat Platform (hosts catalog)
        ↓ (WhatsApp)
WhatsApp Business (displays to customers)
        ↓ (customer orders)
Webhook (to MeaMart)
        ↓ (notification)
Vendor (receives order)
```

### API Endpoints

#### 1. Sync Listings to MeaChat
```
POST /api/users/@{username}/sync-meachat
```

**Request**: No body required (uses user's Google Sheet and MeaChat config)

**Response**:
```json
{
  "ok": true,
  "username": "demo",
  "synced": 25,
  "totalListings": 25,
  "message": "Listings synced to MeaChat successfully",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Status Codes**:
- `200` - Sync successful
- `400` - Missing configuration
- `401` - Invalid MeaChat API token
- `404` - User not found
- `502` - Failed to read Google Sheet

#### 2. Check MeaChat Status
```
GET /api/users/@{username}/meachat-status
```

**Response**:
```json
{
  "ok": true,
  "username": "demo",
  "meachat": {
    "enabled": true,
    "configured": true,
    "catalogId": "catalog_123456",
    "hasApiToken": true
  },
  "googleSheet": {
    "enabled": true,
    "configured": true
  }
}
```

#### 3. Webhook Receiver
```
POST /api/webhooks/meachat
```

**Receives Events**:
- `order_received` - New order from customer
- `order_updated` - Order status changed
- `order_cancelled` - Customer cancelled order

**Event Payload**:
```json
{
  "event": "order_received",
  "order_id": "order_123456",
  "phone_number": "+971501234567",
  "customer_name": "أحمد",
  "products": [
    {
      "id": "prod_1",
      "title": "iPhone 15 Pro",
      "quantity": 1,
      "price": 5000
    }
  ],
  "total_price": 5000,
  "currency": "AED",
  "status": "pending",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Configuration

### Setup Steps

#### Step 1: Get MeaChat Account
1. Visit https://meachat.com
2. Create account with WhatsApp business phone
3. Get Business Account ID and API token

#### Step 2: Configure in MeaMart
1. Go to `/@username/settings`
2. Click "Integrations" tab
3. Enable "MeaChat Integration"
4. Enter Business Account ID
5. Enter API Token
6. Optionally create new catalog or use existing

#### Step 3: Configure Google Sheet
1. Create Google Sheet with products
2. Use required column names (see GOOGLE_SHEETS_SETUP.md)
3. Make sheet publicly viewable
4. Copy Sheet ID and name

#### Step 4: Enable Google Sheet Integration
1. Go to `/@username/settings`
2. Click "Integrations" tab
3. Enable "Google Sheets"
4. Enter Sheet ID and name

#### Step 5: First Sync
1. Click "Sync to MeaChat" button (in settings)
2. Wait for confirmation
3. Check MeaChat catalog for products
4. Share catalog link with customers

## MeaChat Client Library

### Location
`/src/lib/meachat.ts`

### Functions

#### `sendWhatsAppMessage(config, phoneNumber, message)`
Send a text message via WhatsApp Application

```typescript
const result = await sendWhatsAppMessage(
  {
    businessAccountId: "ba_123456",
    apiToken: "token_abc123"
  },
  "+971501234567",
  "مرحبا! هل تريد عرض (الكتالوج)"
);

if (result.success) {
  console.log("Message sent:", result.messageId);
} else {
  console.error("Error:", result.error);
}
```

#### `createCatalog(config, catalogName, description)`
Create new catalog on MeaChat

```typescript
const result = await createCatalog(
  config,
  "My Shop Catalog",
  "All products available"
);

if (result.success) {
  console.log("Catalog created:", result.catalogId);
}
```

#### `addProductsToCatalog(config, catalogId, products)`
Add products to catalog

```typescript
const result = await addProductsToCatalog(
  config,
  "catalog_123456",
  [
    {
      name: "iPhone 15 Pro",
      description: "Latest model",
      price: 5000,
      currency: "AED",
      image_url: "https://...",
      sku: "iphone15"
    }
  ]
);

console.log(result.productsAdded);
```

#### `sendCatalog(config, catalogId, phoneNumber, message)`
Send catalog to customer

```typescript
const result = await sendCatalog(
  config,
  "catalog_123456",
  "+971501234567",
  "اختر منتجاتك:"
);
```

#### `syncListingsToCatalog(config, listings, catalogId)`
Sync listings from array

```typescript
const listings = [
  {
    id: "1",
    title: "Product Name",
    price: 100,
    currency: "AED",
    availability: "in_stock"
  }
];

const result = await syncListingsToCatalog(
  config,
  listings,
  "catalog_123456"
);
```

#### `handleOrderWebhook(payload)`
Process incoming order webhook

```typescript
const { vendorNotification, orderDetails } = handleOrderWebhook(payload);

console.log(vendorNotification);  // Formatted message for vendor
console.log(orderDetails);         // Structured order data
```

#### `testConnection(config)`
Test MeaChat API connection

```typescript
const result = await testConnection(config);

if (result.success) {
  console.log("API token is valid");
} else {
  console.error("Invalid token:", result.error);
}
```

## Webhook Configuration

### 1. Get Webhook URL
Your webhook endpoint is:
```
https://yourdomain.com/api/webhooks/meachat
```

### 2. Register Webhook in MeaChat
1. Log in to MeaChat Dashboard
2. Go to API Settings
3. Add webhook URL
4. Select events:
   - `order_received`
   - `order_updated`
   - `order_cancelled`
5. Save configuration

### 3. Test Webhook
```bash
# Send test webhook
curl -X POST https://yourdomain.com/api/webhooks/meachat \
  -H "Content-Type: application/json" \
  -d '{
    "event": "order_received",
    "order_id": "test_123",
    "phone_number": "+971501234567",
    "customer_name": "Test Customer",
    "products": [{
      "id": "1",
      "title": "Test Product",
      "quantity": 1,
      "price": 100
    }],
    "total_price": 100,
    "currency": "AED",
    "status": "pending",
    "timestamp": "2024-01-15T10:30:00Z"
  }'
```

## Order Notifications

### Notification Types

#### When Order is Received
**Vendor sees**:
```
📦 طلب جديد من MeaChat!

👤 العميل: أحمد علي
📱 الهاتف: +971501234567
🆔 رقم الطلب: order_123456

📋 المنتجات:
  • iPhone 15 Pro (1x) = 5000.00 AED
  • AirPods Pro (1x) = 1500.00 AED

💰 الإجمالي: 6500.00 AED
⏰ الوقت: 15/01/2024، 10:30 AM

✅ الحالة: pending
```

### Notification Channels (Future)
- Email notification to vendor
- SMS via WhatsApp
- In-app dashboard notification
- Webhook forward to vendor's system

## Syncing Strategy

### Manual Sync
1. User goes to settings
2. Clicks "Sync to MeaChat" button
3. System fetches Google Sheet
4. System uploads to MeaChat catalog
5. User sees confirmation

### Automatic Sync (Future)
1. Google Sheet trigger on update
2. Detects row changes
3. Only syncs changed products
4. Reduces API calls
5. Near real-time updates

### Sync Interval
Currently: Manual only
Planned: Configurable intervals (30 min, 1 hour, 4 hour options)

## Error Handling

### Common Errors

#### "Invalid API Token"
- Solution: Regenerate token in MeaChat dashboard
- Update token in MeaMart settings
- Test connection again

#### "Sheet not found"
- Solution: Verify sheet ID is correct
- Check sheet is publicly viewable
- Copy Sheet ID from URL: `docs.google.com/spreadsheets/d/{SHEET_ID}/`

#### "No listings found"
- Solution: Add products to Google Sheet
- Use correct column names
- Fill at least one row with data
- Make sure headers are in row 1

#### "Failed to sync to MeaChat"
- Solution: Check your MeaChat subscription is active
- Verify catalog ID is correct
- Check account has available quota
- Try manual sync again

## Security Considerations

### API Token Security
- Tokens stored in user JSON files (local only)
- Never expose token in API responses
- Never log token in errors
- Consider encryption at rest (future)

### Webhook Security
- Implement webhook signature verification (future)
- Use HTTPS only for webhook URLs
- Validate webhook payload structure
- Rate limit webhook receiver

### Data Privacy
- No customer data stored on MeaMart
- Order webhooks logged to local files only
- Email/phone never shared with MeaChat
- Only product catalog data shared

## Limits & Quotas

### MeaChat Limits
- Product per catalog: 5000
- Images per product: 1
- Catalog size: 50MB
- Monthly API calls: Depends on plan

### MeaMart Limits
- Sheet rows: 10,000 (practical limit)
- Sync requests: 100/hour
- Webhook deliveries: 1000/hour

## Troubleshooting

### Sync Status

#### Check Current Status
```bash
curl https://yourdomain.com/api/users/@demo/meachat-status
```

#### Test Configuration
```bash
# Test in browser console
fetch('/api/users/@demo/meachat-status')
  .then(r => r.json())
  .then(d => console.table(d))
```

### Debug Sync Process

1. **Check Google Sheet**
   - Go to Google Sheet URL directly
   - Verify data is there
   - Check column headers match

2. **Check MeaChat Config**
   - Go to settings
   - Verify API token is set
   - Verify Business Account ID is set
   - Verify Catalog ID is set

3. **Manual Sync Test**
   ```bash
   curl -X POST https://yourdomain.com/api/users/@demo/sync-meachat
   ```

4. **Check Logs**
   - Server console for errors
   - Browser console for API errors
   - Check `/src/data/webhooks/meachat-orders.jsonl`

### Performance Tuning

#### Reduce Sync Time
- Remove unused columns from Google Sheet
- Use fewer products (start with 100, scale up)
- Schedule syncs during low traffic times

#### Reduce API Calls
- Sync only when products change
- Use scheduled sync (not manual)
- Batch product updates

## Analytics & Monitoring

### Metrics to Track (Future)
- Products synced per day
- Sync failures rate
- Orders received per day
- Revenue per vendor
- Customer satisfaction

### Current Logging
- Webhook events log: `/src/data/webhooks/meachat-orders.jsonl`
- API errors in server console
- Validation errors logged

## Integration Examples

### Example 1: Auto-Sync on Settings Update
```typescript
// In settings page, after user saves:
const syncResult = await fetch(`/api/users/@${username}/sync-meachat`, {
  method: 'POST'
});

if (syncResult.ok) {
  showNotification('Synced to MeaChat!');
} else {
  showError('Sync failed. Check settings.');
}
```

### Example 2: Display Sync Status
```astro
// In profile page
const meachatStatus = await fetch(
  `/api/users/@${username}/meachat-status`
).then(r => r.json());

{meachatStatus.meachat.configured && (
  <div class="sync-button">
    <button @click="syncToMeaChat">
      ✓ Sync Listings to WhatsApp
    </button>
  </div>
)}
```

### Example 3: Order Notification Handler
```typescript
// Process incoming webhook
const { vendorNotification, orderDetails } = handleOrderWebhook(payload);

// Send to vendor (implement email/SMS)
await sendEmail({
  to: vendor.email,
  subject: 'New Order from WhatsApp',
  body: vendorNotification
});

// Log for analytics
await logOrder(orderDetails);
```

## Files

- **MeaChat Client**: `/src/lib/meachat.ts`
- **Sync Endpoint**: `/src/pages/api/users/[username]/sync-meachat.ts`
- **Webhook Receiver**: `/src/pages/api/webhooks/meachat.ts`
- **Order Logs**: `/src/data/webhooks/meachat-orders.jsonl`

## Related Documentation

- **API Documentation**: `/docs/API.md`
- **Google Sheets Setup**: `/docs/GOOGLE_SHEETS_SETUP.md`
- **Listings Display**: `/docs/LISTINGS_DISPLAY.md`
- **User Signup**: `/docs/USER_SIGNUP.md`

## Next Steps

1. **Production Deployment**
   - Implement webhook signature verification
   - Encrypt API tokens at rest
   - Setup monitoring and alerting
   - Configure log aggregation

2. **User Features**
   - Order dashboard showing all orders
   - Automatic email notifications
   - WhatsApp status updates for customers
   - Customer analytics per vendor

3. **Platform Features**
   - Multi-catalog support
   - Bulk product import/export
   - Price synchronization
   - Inventory management

4. **Advanced**
   - Scheduled syncs
   - Webhook retries
   - Rate limiting
   - Revenue sharing/commissions
