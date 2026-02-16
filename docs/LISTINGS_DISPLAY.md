# Listings Display & Management

## Overview
The user profile now displays a complete listings management interface with pagination, filtering, and sorting capabilities. All listings are fetched from the vendor's Google Sheet and displayed in a responsive grid.

## Features

### 1. **Real-Time Listing Display**
- Fetches listings from `/api/users/@{username}/listings` on page load
- Displays 12 items per page by default
- Shows loading state while fetching
- Handles empty states gracefully

### 2. **Search & Filtering**
- **Text Search**: Search by title or description
- **Category Filter**: Filter by product category
- **Price Range Filter**: 0-1K, 1K-5K, 5K-10K, 10K+
- All filters work simultaneously (AND logic)
- Results updated in real-time

### 3. **Sorting Options**
- **Newest First**: Display order from Google Sheet (default)
- **Price Low to High**: Sort by price ascending
- **Price High to Low**: Sort by price descending
- **Featured First**: Show featured listings first, rest below

### 4. **Pagination**
- 12 items per page
- Smart page number display (max 5 pages shown at once)
- Previous/Next navigation buttons
- Current page indicator
- Pagination resets when filters change

### 5. **Responsive Design**
- Mobile: 1 column listing grid
- Tablet: 2 columns
- Desktop: 3 columns
- Touch-friendly controls

## Component Architecture

### `UserListingsDisplay.vue` (Vue Component)
**Location**: `/src/components/listings/UserListingsDisplay.vue`

**Props**:
```typescript
username: string  // The vendor's username
```

**Features**:
- Reactive search, category, price range, and sort controls
- Client-side pagination (no API calls for page changes)
- Computed properties for filtering and sorting
- Watch watchers to reset pagination on filter changes

**Event Flow**:
```
1. Component mounts
2. Fetch listings from `/api/users/{username}/listings`
3. Store in reactive `listings` ref
4. Apply filters via computed properties
5. Apply sort
6. Paginate results
7. Render grid with UserListingCard components
```

### `UserListingCard.astro` (Astro Component)
**Location**: `/src/components/listings/UserListingCard.astro`

**Props**:
```typescript
listing: Listing    // Individual listing object
username: string    // For WhatsApp contact link
```

**Displays**:
- Thumbnail image with fallback
- Title and brand/model/year
- Description (2-line clamp)
- Category and color tags
- Price with currency
- Location
- WhatsApp contact button
- Featured/Condition badges

## Implementation Details

### Search Logic
```typescript
// Case-insensitive search in title and description
const query = searchQuery.value.toLowerCase();
const matches = l.title?.toLowerCase().includes(query) || 
                l.description?.toLowerCase().includes(query);
```

### Price Range Parsing
```typescript
// Format: "min-max" or "min+"
"0-1000" → [0, 1000]
"10000+" → [10000, 0] → l.price >= 10000
```

### Sorting Implementation
```typescript
// Featured: Sort boolean to bring true values first
if (sortBy.value === "featured") {
  filtered.sort((a, b) => 
    (b.featured ? 1 : 0) - (a.featured ? 1 : 0)
  );
}
```

### Page Number Display
Smart calculation shows max 5 page numbers, always keeping current page visible:
```
1 2 3 4 5 (when on page 1-5)
4 5 6 7 8 (when on page 6, not showing 1,2,3)
```

## API Integration

### Fetch Endpoint
```
GET /api/users/@{username}/listings
```

**Response**:
```json
{
  "ok": true,
  "username": "demo",
  "count": 25,
  "listings": [
    {
      "id": "1",
      "title": "iPhone 15 Pro",
      "description": "...",
      "category": "Electronics",
      "price": 5000,
      "currency": "AED",
      "location": "Dubai",
      "image_url": "https://...",
      "featured": true,
      "brand": "Apple",
      "phone_number": "+971501234567"
    },
    ...
  ]
}
```

**Caching**: 1 hour (Cache-Control header)

## User Experience Flow

### 1. **Initial Load**
```
User visits /@username
↓
Page loads profile header (static)
↓
UserListingsDisplay mounts (hydrated with @client directive)
↓
Component fetches `/api/users/@username/listings`
↓
Display loading spinner while fetching
↓
Show grid of listings (12 per page)
```

### 2. **Search & Filter**
```
User types in search box
↓ (v-model binding)
Re-compute filteredListings
↓
Show matching results
↓
Reset to page 1
```

### 3. **Pagination**
```
User clicks "Next" button
↓
currentPage += 1
↓
Computed paginatedListings slice changes
↓
Grid re-renders with new 12 items
← No API call needed (client-side)
```

### 4. **Sort Change**
```
User selects "Price Low to High"
↓
sortBy = "price-asc"
↓
filteredListings re-computed with sort applied
↓
Reset to page 1
↓
Grid shows sorted results
```

## Data Flow Diagram

```
Google Sheet (vendor's data)
        ↓
/api/users/@username/listings (fetch CSV, transform, validate)
        ↓
listings[] (Vue reactive ref) 
        ↓
filteredListings[] (compute: search + category + price)
        ↓
sortedListings[] (compute: apply sort)
        ↓
paginatedListings[] (compute: slice for current page)
        ↓
<UserListingCard> components (render grid)
```

## Performance Considerations

### Optimization
1. **Lazy Fetch**: API call only on component mount (not on every render)
2. **Client-Side Filtering**: Pagination changes don't trigger API calls
3. **Computed Properties**: Vue memoizes computed values (recomputed only when deps change)
4. **API Caching**: Server caches listings for 1 hour (Cache-Control header)
5. **Grid Layout**: Responsive CSS grid (no JS layout calculations)

### Limits
- Currently loads all listings into memory (OK for <1000 items)
- For 10K+ items, consider server-side pagination in future

## Customization

### Change Items Per Page
**File**: `/src/components/listings/UserListingsDisplay.vue`

```typescript
const itemsPerPage = 20;  // Change from 12 to 20
```

### Change Default Sort
```typescript
const sortBy = ref("featured");  // Was "newest"
```

### Change Price Ranges
```typescript
<!-- Filter -->
<option value="0-5000">0 - 5,000</option>
<option value="5000-20000">5,000 - 20,000</option>
```

### Disable Filtering
Remove the filter `<select>` elements from template.

### Add More Filters
```typescript
const selectedCondition = ref("");  // Add this

// In filteredListings computed:
if (selectedCondition.value) {
  filtered = filtered.filter((l) => l.condition === selectedCondition.value);
}
```

## Troubleshooting

### "404 Not Found" when fetching listings
- ✅ Verify username is correct
- ✅ Check `/api/users/@username/listings` endpoint exists
- ✅ Verify user JSON file exists in `/src/data/users/@{username}.json`

### Listings not showing
- ✅ Check browser console for fetch errors
- ✅ Verify Google Sheet is set to public (view only)
- ✅ Check sheet name matches `googleSheet.sheetName` in user JSON
- ✅ Check Google Sheet has required columns (see GOOGLE_SHEETS_SETUP.md)

### Filters not working
- ✅ Inspect `filteredListings` in Vue DevTools
- ✅ Check listing data has correct field names (case-sensitive)
- ✅ Verify price values are numbers (not strings)

### Pagination showing wrong page count
- ✅ Check `itemsPerPage` constant
- ✅ Inspect `totalPages` in Vue DevTools
- ✅ Verify `filteredListings.length` is correct

## Future Enhancements

### Proposed Features
1. **Server-Side Pagination**: For vendors with 10K+ listings
2. **Advanced Filters**: Color, condition, brand multi-select
3. **Saved Searches**: Save favorite filter combinations
4. **Wishlist**: Users can save listings to personal list
5. **Quick View Modal**: Preview listing details without page load
6. **Share Buttons**: Share individual listings to social media
7. **Price History**: Show price trends (if Google Sheet has history)
8. **Bulk Filters**: "Show only featured in Dubai under 5000 AED"

### Backend Enhancements
1. Full-text search index for vendor listings (Algolia/MeiliSearch)
2. Faceted search (count of results per category)
3. Elasticsearch for large-scale deployments
4. Listing analytics (views, clicks, contact attempts)
5. Automated price comparison across vendors

## Files Modified

1. **`/src/pages/@[username].astro`**
   - Imported `UserListingsDisplay.vue`
   - Replaced static "no listings" message with dynamic component
   - Added `client:load` hydration directive

2. **`/src/components/listings/UserListingCard.astro`** (created previously)
   - Used in UserListingsDisplay grid

3. **`/src/components/listings/UserListingsDisplay.vue`** (new)
   - Complete listings management interface
   - Search, filter, sort, pagination

## Testing

### Manual Test Cases

1. **Empty Listings**
   - Create vendor with no Google Sheet
   - Verify "لا توجد إعلانات" message shows

2. **Search Functionality**
   - Add listings to Google Sheet
   - Search for text in title/description
   - Verify results filter correctly

3. **Price Range**
   - Add listings with various prices
   - Test each price range filter
   - Verify correct listings appear

4. **Pagination**
   - Add 30+ listings
   - Click through pages
   - Verify correct 12 items per page
   - Check page buttons are correct count

5. **Category Filter**
   - Add listings with multiple categories
   - Verify category dropdown populated
   - Test filtering by category

6. **Sort Options**
   - Test sort by price ascending/descending
   - Test featured first
   - Test newest first

7. **Responsive**
   - Test on mobile (1 column)
   - Test on tablet (2 columns)
   - Test on desktop (3 columns)

8. **Dark Mode**
   - Toggle dark mode
   - Verify colors are correct
   - Check readability

## Links

- **Google Sheets Setup Guide**: `/docs/GOOGLE_SHEETS_SETUP.md`
- **API Documentation**: `/docs/API.md`
- **User Schema**: `/src/validation/user.ts`
- **Listings API Endpoint**: `/src/pages/api/users/[username]/listings.ts`
