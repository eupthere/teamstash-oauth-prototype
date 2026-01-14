# backend/AGENTS.md

## Purpose

This workspace implements the OAuth Authorization Server and Resource Server.

It is responsible for:
- Issuing access tokens and refresh tokens
- Validating tokens for protected resource access
- Hosting OAuth callback pages for browser-based clients
- Providing protected resource APIs

## Must Implement

### Web Session Authentication
- `/login` - Traditional email/password login (creates session cookie)
- `/logout` - Session termination

### OAuth Authorization Server
- `/oauth/authorize` - Authorization endpoint
  - Must validate `client_id`
  - Must validate `redirect_uri` against registered client
  - Must validate `state` parameter
  - Must enforce PKCE (`code_challenge`, `code_challenge_method=S256`)
  - Must return authorization code
- `/oauth/token` - Token endpoint
  - Must validate authorization code
  - Must validate PKCE `code_verifier`
  - Must issue JWT access tokens with short expiration
  - Must issue refresh tokens
  - Must support `grant_type=refresh_token`

### OAuth Callback Pages
- `/oauth/extension-callback` - Web-hosted callback page for browser extensions
  - Receives authorization code and state from redirect
  - Relays to extension via `postMessage`

### Resource Server APIs
- `/api/me` - User identity endpoint (for OIDC-style clients like desktop app)
  - Requires `Authorization: Bearer <access_token>`
  - Returns user information from token
- `/api/protected-resource` - Example protected resource
  - Requires `Authorization: Bearer <access_token>`
  - Demonstrates resource access

## Security Rules

- **HTTPS only** in production
- **Must validate `state` parameter** to prevent login CSRF
- **Must enforce PKCE** for public clients
- **Must validate `redirect_uri`** against registered client configuration
- **Must issue JWT access tokens** with short expiration times (e.g., 15 minutes)
- **Must require `Authorization: Bearer <token>`** on all protected resource endpoints
- **Must validate JWT signature and expiration** on protected endpoints

## Client Registration

Each `client_id` must be registered with:
- `client_id`: Unique identifier (`extension`, `web`, `desktop`, etc.)
- `redirect_uris`: Allowed redirect URIs (whitelist)
- `client_type`: `public` or `confidential`
- `pkce_required`: Boolean

Example registered clients:
- `extension` → `https://<was>/oauth/extension-callback`
- `desktop` → `myapp://oauth-callback` (custom URI scheme)
- `web` → `https://<was>/oauth/web-callback`

## Must NOT

- **Must not store OAuth tokens in cookies** for plugin-like clients
- **Must not implement alternative login endpoints** (e.g., `/auth/login`) for OAuth clients
- **Must not skip `redirect_uri` validation**
- **Must not accept authorization codes without PKCE verification**
- **Must not return tokens directly from `/oauth/authorize`** (no implicit flow support)

## Technical Stack

- NestJS framework
- JWT for access tokens
- Database or in-memory store for:
  - User accounts
  - Authorization codes (short-lived)
  - Refresh tokens
  - Client registrations
