# Authentication System Documentation

## Features Implemented

### 1. Password Visibility Toggle
- **Location**: Login and Signup forms
- **Feature**: Eye icon button to show/hide passwords
- **Files Modified**:
  - `src/components/auth/LoginForm.vue`
  - `src/components/auth/SignupForm.vue`

### 2. Password Reset Flow
- **Pages**:
  - Forgot Password Form: `/forgot-password`
  - Login form now has "Forgot password?" link

- **API Endpoints**:
  - `POST /api/auth/forgot-password` - Request reset code
  - `POST /api/auth/verify-reset-code` - Verify code
  - `POST /api/auth/reset-password` - Set new password

- **Process Flow**:
  1. User enters email
  2. System generates 6-digit code (15-minute expiration)
  3. Code sent via email
  4. User verifies code
  5. User sets new password
  6. Confirmation email sent

- **Files Created**:
  - `src/components/auth/ForgotPasswordForm.vue`
  - `src/pages/forgot-password.astro`
  - `src/pages/api/auth/forgot-password.ts`
  - `src/pages/api/auth/verify-reset-code.ts`
  - `src/pages/api/auth/reset-password.ts`
  - `src/lib/passwordReset.ts`

### 3. Email Service
- **Supported Providers**:
  - Cloudflare Email Routing (primary)
  - SendGrid (alternative)
  - Mailgun (alternative)

- **Email Types**:
  - Password reset code
  - Password reset confirmation

- **Configuration**: Set in `.env` file
  ```env
  CLOUDFLARE_API_TOKEN=your_token_here
  CLOUDFLARE_ACCOUNT_ID=your_account_id_here
  FROM_EMAIL=noreply@meamart.com
  ```

- **Files Created**:
  - `src/lib/email.ts` - Multi-provider email utility

### 4. Google OAuth Integration
- **Features**:
  - Sign in/Sign up with Google
  - Automatic account creation
  - Automatic account linking
  - Profile picture from Google

- **Configuration** (Already Set):
  ```env
  GOOGLE_CLIENT_ID=1087979039854-haa33086opu7q165qrpoac1s6anso15a.apps.googleusercontent.com
  GOOGLE_CLIENT_SECRET=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
  ```

- **Valid Redirect URIs**:
  - For local dev: `http://localhost:4321/api/auth/google/callback`
  - For production: `https://bot.meachat.com/login/google/callback`

- **API Endpoints**:
  - `POST /api/auth/google/url` - Generate auth URL
  - `GET /api/auth/google/callback` - Handle OAuth callback

- **Files Created**:
  - `src/lib/googleOAuth.ts` - OAuth utilities
  - `src/components/auth/GoogleLoginButton.vue` - Login button
  - `src/pages/api/auth/google/url.ts` - Auth URL generator
  - `src/pages/api/auth/google/callback.ts` - OAuth callback handler

### 5. Security Features
- **Password Hashing**: bcrypt with 10 salt rounds
- **JWT Tokens**: 7-day expiration
- **Code Expiration**: Reset codes expire in 15 minutes
- **One-time Codes**: Reset codes can only be used once
- **HTTPS Required**: OAuth requires secure connections

## Setup Instructions

### 1. Install Dependencies
All dependencies are already installed:
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT generation
- `@types/jsonwebtoken` - TypeScript types

### 2. Configure Environment Variables
Update `.env` file with your Cloudflare credentials:
```bash
# Get these from Cloudflare Dashboard > Account > API Tokens
CLOUDFLARE_API_TOKEN=your_token_here
CLOUDFLARE_ACCOUNT_ID=your_account_id_here
```

### 3. Configure Google Console
Your Google OAuth is already configured. Valid redirect URIs:
- Development: `http://localhost:4321/api/auth/google/callback`
- Production: `https://bot.meachat.com/login/google/callback`
- Additional: `https://bot.meachat.com/google/import/account/callback`

### 4. Run Development Server
```bash
pnpm run dev
```

### 5. Test Features
Test pages:
- Login: `http://localhost:4321/login`
- Signup: `http://localhost:4321/signup`
- Forgot Password: `http://localhost:4321/forgot-password`
- Test Auth: `http://localhost:4321/test-auth`

## API Reference

### Authentication Endpoints

#### Sign Up
```
POST /api/auth/signup
Content-Type: application/json

{
  "username": "johndoe",
  "displayName": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "country": "AE",
  "whatsappNumber": "971501234567",
  "bio": "Optional bio"
}

Response 201:
{
  "message": "Signup successful",
  "username": "johndoe",
  "profile": {...},
  "token": "jwt_token_here"
}
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "username": "johndoe",
  "password": "password123"
}

Response 200:
{
  "message": "Login successful",
  "username": "johndoe",
  "displayName": "John Doe",
  "profile": {...},
  "token": "jwt_token_here"
}
```

#### Forgot Password
```
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}

Response 200:
{
  "message": "Verification code sent to your email",
  "email": "john@example.com"
}
```

#### Verify Reset Code
```
POST /api/auth/verify-reset-code
Content-Type: application/json

{
  "email": "john@example.com",
  "code": "123456"
}

Response 200:
{
  "message": "Code verified successfully",
  "email": "john@example.com"
}
```

#### Reset Password
```
POST /api/auth/reset-password
Content-Type: application/json

{
  "email": "john@example.com",
  "code": "123456",
  "newPassword": "newpassword123"
}

Response 200:
{
  "message": "Password reset successfully",
  "email": "john@example.com"
}
```

#### Google OAuth URL
```
POST /api/auth/google/url
Content-Type: application/json

{
  "redirectUri": "http://localhost:4321/api/auth/google/callback"
}

Response 200:
{
  "authUrl": "https://accounts.google.com/o/oauth2/v2/auth?...",
  "message": "Auth URL generated successfully"
}
```

#### Google OAuth Callback
```
GET /api/auth/google/callback?code=GOOGLE_AUTH_CODE

Response: 302 Redirect to /login with token and username
```

## Data Storage

### Users
Location: `src/data/users/@{username}.json`

Structure:
```json
{
  "username": "johndoe",
  "displayName": "John Doe",
  "email": "john@example.com",
  "password": "$2a$10$...",
  "country": "AE",
  "city": "Dubai",
  "whatsappNumber": "971501234567",
  "bio": "Bio text",
  "avatar": "url_to_avatar",
  "provider": "google",
  "googleId": "google_user_id",
  "createdAt": "2026-02-17T...",
  "lastLoginAt": "2026-02-17T...",
  "passwordResetAt": "2026-02-17T..."
}
```

### Reset Codes
Location: `src/data/reset-codes/@{email}.json`

Structure:
```json
{
  "email": "john@example.com",
  "code": "123456",
  "createdAt": "2026-02-17T...",
  "expiresAt": "2026-02-17T...",
  "used": false,
  "usedAt": "2026-02-17T..."
}
```

## UI Components

### LoginForm.vue
Features:
- Username/password login
- Password visibility toggle
- "Forgot password?" link
- Google OAuth button
- Error/success messages
- Loading states

### SignupForm.vue
Features:
- Full registration form
- Password visibility toggle (both fields)
- Username availability check
- Country/city selector
- WhatsApp number validation
- Google OAuth button
- Terms agreement checkbox

### ForgotPasswordForm.vue
Features:
- Email input
- Code verification (6 digits)
- New password input (with toggle)
- Resend code countdown (60 seconds)
- Step-by-step UI

### GoogleLoginButton.vue
Features:
- Google branding
- Loading states
- Automatic redirect to Google OAuth
- Callback handling

## Security Considerations

### Production Checklist
- [ ] Change `JWT_SECRET` in `.env`
- [ ] Set up proper Cloudflare Email Routing
- [ ] Update `SITE_URL` for production domain
- [ ] Enable HTTPS for OAuth
- [ ] Add rate limiting to auth endpoints
- [ ] Set secure cookie flags in production
- [ ] Monitor failed login attempts
- [ ] Implement CSRF protection
- [ ] Add email verification on signup
- [ ] Set up proper error logging

### Password Security
- Minimum 8 characters
- bcrypt with 10 salt rounds
- Auto-upgrade from SHA-256 to bcrypt
- No plaintext storage

### OAuth Security
- State parameter validation (recommended)
- ID token verification (recommended)
- Email verification required
- Automatic account linking

## Troubleshooting

### Email Not Sending
1. Check Cloudflare credentials in `.env`
2. Verify Email Routing is enabled in Cloudflare
3. Check console logs for error messages
4. Test with alternative provider (SendGrid/Mailgun)

### Google OAuth Errors
1. Verify redirect URI matches exactly
2. Check Google Cloud Console credentials
3. Ensure OAuth consent screen is configured
4. Verify client ID and secret are correct

### Password Reset Issues
1. Check reset code expiration (15 minutes)
2. Verify email exists in system
3. Ensure code hasn't been used already
4. Check file permissions on `src/data/reset-codes/`

## Next Steps (Optional)

1. **Email Verification on Signup**: Add verification code for new accounts
2. **Two-Factor Authentication**: Add 2FA support
3. **Rate Limiting**: Prevent brute force attacks
4. **Session Management**: Track active sessions
5. **Password Strength Meter**: Visual password strength indicator
6. **Account Recovery Questions**: Alternative to email reset
7. **Login History**: Track login attempts and locations
8. **Device Management**: Remember trusted devices

## Testing Status

✅ Password visibility toggle - Implemented  
✅ Forgot password page - Created  
✅ Email service API - Configured  
✅ Password reset flow - Complete  
✅ Google OAuth config - Set up  
✅ Google login button - Integrated  
⏳ Full system testing - Pending

## Support

For issues or questions:
1. Check console logs for detailed errors
2. Review API responses in Network tab
3. Verify environment variables are set
4. Test with the test page: `/test-auth`
