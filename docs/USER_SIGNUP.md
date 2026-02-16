# User Signup System

## Overview
Complete user registration system that creates new vendor accounts with zero database. Each vendor gets their own JSON file with profile and integration settings.

## Features

### 1. **Signup Page** (`/signup`)
Public registration page with:
- Username selection with real-time availability check
- Display name and contact info
- Country/city selection
- WhatsApp number capture
- Bio/description field
- Terms & privacy acceptance
- Real-time validation feedback

### 2. **Username Validation**
- Format: 3-20 characters, lowercase letters, numbers, dash, underscore
- Real-time availability check via API
- Error messages in Arabic
- Username slug used in profile URL

### 3. **Vendor Profile Auto-Creation**
Each new signup creates a JSON file with:
```json
{
  "username": "myshop",
  "displayName": "My Shop",
  "email": "owner@shop.com",
  "country": "AE",
  "city": "Dubai",
  "phoneNumber": "+971501234567",
  "whatsappNumber": "971501234567",
  "bio": "Selling awesome products",
  "website": "",
  "avatar": "",
  "social": { "instagram": "", "twitter": "", "facebook": "" },
  "meachat": { "enabled": false, "businessAccountId": "", "catalogId": "", "apiToken": "" },
  "googleSheet": { "enabled": false, "sheetId": "", "sheetName": "Sheet1", "syncInterval": 3600 },
  "googleMerchant": { "enabled": false, "merchantId": "", "currency": "AED", "autoSync": false },
  "createdAt": "2024-01-15T10:30:00Z"
}
```

## Component Architecture

### `SignupForm.vue` (Vue Component)
**Location**: `/src/components/auth/SignupForm.vue`

**Features**:
- Real-time username validation
- Multi-step form with all fields
- Loading state with spinner
- Error and success messages
- Submit button disabled until terms accepted
- Auto-redirect to profile on success

**Validation Rules**:
- Username: 3-20 chars, lowercase + numbers + dash
- Email: Standard email format
- WhatsApp: 10-15 digits
- All fields except bio required

## API Endpoints

### 1. Check Username Availability
```
GET /api/auth/check-username?username=myshop
```

**Response**:
```json
{
  "available": true,
  "username": "myshop"
}
```

**Status Codes**:
- `200` - Query successful
- `400` - Missing username parameter
- `500` - Server error

### 2. Create Account
```
POST /api/auth/signup
```

**Request Body**:
```json
{
  "username": "myshop",
  "displayName": "My Shop",
  "email": "owner@shop.com",
  "country": "AE",
  "city": "Dubai",
  "whatsappNumber": "971501234567",
  "bio": "Selling awesome products",
  "agreeToTerms": true
}
```

**Success Response (201)**:
```json
{
  "message": "Signup successful",
  "username": "myshop",
  "profile": "/@myshop"
}
```

**Error Responses**:
- `400` - Missing/invalid fields
- `409` - Username already taken
- `405` - Wrong HTTP method
- `500` - Server error

## Implementation Details

### Username Availability Check
1. User types username
2. Debounce 500ms (avoid too many API calls)
3. Validate format locally
4. Call `/api/auth/check-username`
5. Check against existing users in collection
6. Show ✓ or ✗ indicator

### Signup Flow
```
1. User fills form
2. Client-side validation
3. POST to /api/auth/signup
4. Server validates inputs
5. Check username uniqueness against collection
6. Create user JSON file in /src/data/users/@username.json
7. Validate entire object against schema
8. Return success with profile URL
9. Auto-redirect to /@username after 2 seconds
```

### Country Selection
Includes all major countries with Arabic/English names:
- GCC countries (Preferred)
- Arab countries
- Popular international destinations
- Easy to extend with more countries

### Data Persistence
Users are stored as JSON files on the filesystem:
- **Location**: `/src/data/users/@{username}.json`
- **Format**: Pretty-printed JSON (2 spaces)
- **Validation**: Zod schema validation before save
- **Backup**: Original user collection still accessible

## User Experience

### Step 1: Visit Signup Page
- Clean, modern form design
- Explains MeaMart benefits on the right
- Shows integration capabilities
- FAQ section with common questions

### Step 2: Choose Username
- Shows live preview: "meamart.com/@username"
- Real-time availability check with status indicators
- Format validation with helpful errors
- Suggestions for similar available names (future)

### Step 3: Fill Profile Info
- Group related fields together
- Country/City in grid layout on mobile
- WhatsApp with (+) prefix in UI but stored without
- Bio accepts multiple lines

### Step 4: Agreement & Submit
- Checkbox for terms/privacy links
- Submit button disabled until checked
- Loading spinner during submission
- Clear success message with auto-redirect

## Validation

### Client-Side (Vue Component)
- Username format with regex: `/^[a-z0-9_-]{3,20}$/`
- Email format validation
- WhatsApp format: `/^[0-9]{10,15}$/`
- Required field checking

### Server-Side (Astro API)
- All client validations repeated
- Zod schema full validation
- Username uniqueness against entire collection
- Email format verification
- Error details returned to client

## File Structure

```
src/
├── pages/
│   ├── signup.astro              # Signup page
│   └── api/
│       └── auth/
│           ├── check-username.ts  # Username availability
│           └── signup.ts          # Create account
├── components/
│   └── auth/
│       └── SignupForm.vue         # Signup form
├── pages/
│   ├── terms.astro                # Terms of service
│   └── privacy.astro              # Privacy policy
└── data/
    └── users/
        └── @{username}.json       # User data files
```

## Security Considerations

### Input Validation
- Username: Whitelist allowed characters
- Email: RFC validation
- Phone: Digits only, length check
- All inputs trimmed and sanitized

### Authentication
- Currently no password (URL-based access)
- Future: Email verification for password reset
- Rate limiting recommended on signup endpoint
- CSRF protection via astro:headers

### Data Storage
- JSON files stored on server filesystem
- No exposure of sensitive fields in responses
- Email only stored in JSON (not returned to client)
- Integration tokens encrypted at rest (future)

### Privacy
- No cookies used
- No tracking or analytics
- Email not shared with third parties
- Compliant with privacy policy

## Customization

### Change Country List
**File**: `/src/components/auth/SignupForm.vue`

```vue
<option value="AE">الإمارات العربية المتحدة</option>
<!-- Add more options -->
<option value="XX">Country Name</option>
```

### Change Username Validation Rules
**File**: `/src/pages/api/auth/signup.ts`

```typescript
// Change pattern in regex
if (!/^[a-z0-9_-]{3,20}$/.test(data.username)) {
  // Pattern validation
}
```

### Change Default User Settings
**File**: `/src/pages/api/auth/signup.ts`

```typescript
const newUser = {
  // ...
  meachat: {
    enabled: true, // Default to enabled
    // ...
  },
};
```

### Add Additional Fields
1. Add to HTML form in SignupForm.vue
2. Add to TypeScript interface in SignupForm.vue
3. Add to SignupRequest interface in signup.ts
4. Add to user schema in user.ts
5. Add to default newUser object

## Testing

### Manual Test Cases

1. **Valid Signup**
   - Fill all required fields
   - Use unique username
   - Accept terms
   - Should redirect to profile

2. **Duplicate Username**
   - Try signing up with existing username
   - Should show "already taken" error
   - Form should remain accessible

3. **Invalid Username Format**
   - Try uppercase letters
   - Try special characters
   - Try less than 3 characters
   - Should show format error

4. **Invalid Email**
   - Try text without @
   - Should show invalid format error

5. **Invalid WhatsApp**
   - Try letters in phone number
   - Try too short number
   - Should show format error

6. **Missing Required Fields**
   - Try submitting with blank fields
   - Should show field-specific errors

7. **Responsive Design**
   - Test on mobile (1 column)
   - Test on tablet (2 columns)
   - Test on desktop
   - Check form is readable on all sizes

8. **Dark Mode**
   - Toggle dark mode
   - Verify text contrast
   - Check form accessibility

### Automated Tests (Future)
```typescript
// Example test
describe("Signup", () => {
  test("creates user with valid data", async () => {
    const response = await POST(fetch("/api/auth/signup"), {
      username: "testuser",
      displayName: "Test User",
      email: "test@example.com",
      country: "AE",
      whatsappNumber: "971501234567",
    });
    expect(response.status).toBe(201);
  });
});
```

## Performance

### Optimization
- Client-side validation prevents unnecessary API calls
- Username check debounced (500ms)
- Async file writing doesn't block response
- JSON parsing cached in collection loader

### Scalability
- File-based storage scales to thousands of users
- For millions of users, migrate to database
- No N+1 queries (collection pre-loaded)

## Monitoring & Analytics

### Metrics to Track (Future)
- Signups per day/week/month
- Most popular usernames
- Countries with most signups
- Form abandonment rate
- Error rates by field

### Logging (Current)
- Server logs errors with context
- Validation errors captured
- File write errors logged

## Integration with Platform

### What Happens After Signup

1. **Immediate**
   - User redirected to `/@username` profile
   - Profile visible to public
   - User can access settings

2. **Soon After**
   - User receives welcome email (future)
   - User sees onboarding guide
   - User can configure Google integrations

3. **Optional**
   - User connects WhatsApp Business
   - User connects Google Merchant
   - User uploads first products via Google Sheets

## Troubleshooting

### "Username Not Available" Despite Being New
- Clear browser cache and try again
- Check if username exists in collection by checking `/data/users/`
- Verify collection is reloading properly

### Signup Form Hangs
- Check network tab for API errors
- Verify `/api/auth/signup` endpoint is responding
- Check server logs for errors

### Redirect Doesn't Work
- Verify browser allows redirects
- Check if `/@username` page is generated
- Check for JavaScript errors in console

### User Data Not Saved
- Check `/src/data/users/@username.json` file exists
- Verify file permissions allow writing
- Check server logs for file write errors

## Links

- **User Schema**: `/src/validation/user.ts`
- **User Profile Page**: `/src/pages/@[username].astro`
- **User Settings Page**: `/src/pages/@[username]/settings.astro`
- **Terms of Service**: `/pages/terms.astro`
- **Privacy Policy**: `/pages/privacy.astro`
- **API Documentation**: `/docs/API.md`

## Related Features

- **Listings Display**: `/@username` shows products from Google Sheets
- **User Settings**: `/@username/settings` to manage integrations
- **Profile Page**: Public profile with integration status
- **API Endpoints**: RESTful APIs for listings and merchant feeds
