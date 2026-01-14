# frontend/AGENTS.md

## Purpose

This workspace implements the traditional web frontend for user authentication.

It provides a user interface for:
- Logging in with email/password
- Managing user account
- Viewing authorized applications (future)

## Must Implement

- **Signup page** - User registration form that posts to `/signup`
- **Login page** - Email/password form that posts to `/login`
- **Logout functionality** - Calls `/logout` and clears session
- **Session-based authentication** - Uses cookies, not OAuth tokens
- **Authorized apps page** (optional/future) - Shows which OAuth clients have been granted access

## Authentication Model

The web frontend uses **traditional session-based authentication**, NOT OAuth.

Signup Flow:
1. User enters email/password on signup page
2. Frontend posts registration data to backend `/signup`
3. Backend creates new user account
4. User can then log in

Login Flow:
1. User enters email/password on login page
2. Frontend posts credentials to backend `/login`
3. Backend creates session and returns session cookie
4. Frontend stores session cookie (automatic via browser)
5. All subsequent requests include session cookie

The web frontend does NOT:
- Call `/oauth/authorize`
- Call `/oauth/token`
- Store OAuth access tokens
- Use JWT tokens for its own authentication

## Must NOT

- **Must not use OAuth** for web frontend authentication
- **Must not store OAuth tokens** in browser localStorage/sessionStorage
- **Must not call `/oauth/authorize`** for web user login
- **Must not implement password forms** inside OAuth authorization flow pages

## Security Considerations

- HTTPS only in production
- CSRF protection on forms
- Secure session cookie settings (`HttpOnly`, `Secure`, `SameSite`)
- Input validation on login forms

## Technical Stack

- React/Vue/vanilla JS (to be decided)
- Communicates with backend via traditional HTTP requests
- Session cookies for authentication state
