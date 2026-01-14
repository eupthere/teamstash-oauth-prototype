# AGENTS.md

## Project Purpose

This project is a prototype demonstration for OAuth-based authentication architecture.

My team is working on a separate project where:
- Users log in via web frontend page (traditional session-based authentication)
- External programs (browser extensions, plugins, third-party apps) authenticate using OAuth

This prototype demonstrates how to implement OAuth Authorization Server and Resource Server functionality to support plugin-like clients while maintaining traditional web authentication for the main application.

## Authentication Architecture

The WAS acts as both the OAuth Authorization Server and Resource Server.

### Web Client Authentication

The web client (browser-based UI) does NOT use OAuth.
Users authenticate by typing email and password directly into the web application.

This creates a session (typically via cookies) for the web client.

### Plugin-Like Client Authentication

Plugin-like clients (browser extensions, third-party apps) use standard OAuth 2.0 Authorization Code flow.

These clients must authenticate via:

GET  /oauth/authorize
POST /oauth/token

If a user is already logged in via the web browser, the plugin can leverage the existing session to obtain OAuth tokens from the authorization server without requiring re-authentication.

Access tokens are JWT Bearer tokens with short expiration times.
Refresh tokens are long-lived tokens used to obtain new access tokens.

Protected APIs require:
Authorization: Bearer <access_token>

Token refresh:
POST /oauth/token
  grant_type=refresh_token
  refresh_token=<refresh_token>

### Client ID

The `client_id` parameter identifies which application is requesting authorization.

**Important**: `client_id` identifies the **application**, not the user. User identity is separate and stored inside tokens (e.g., JWT `sub` claim).

Each client type has a unique identifier:
- Browser extension: `extension`
- Obsidian plugin: `obsidian`
- Figma plugin: `figma`
- Web frontend: `web`

The authorization server uses `client_id` to:
- Determine which redirect URIs are allowed for this client
- Apply client-specific security policies (PKCE requirements, allowed scopes)
- Track and revoke access per-client if needed

All OAuth requests must include `client_id`:

```
/oauth/authorize?client_id=extension&...
```

Each `client_id` is registered in the WAS with its configuration (redirect URIs, client type, security requirements).

An issued access token always represents a specific **user** authorizing a specific **client application**.

### PKCE

Plugin-like clients are public OAuth clients and must use PKCE (Proof Key for Code Exchange) in production.

This prototype should implement PKCE.

When implementing PKCE:
- /oauth/authorize requests must include code_challenge and code_challenge_method=S256
- /oauth/token requests must include code_verifier

### State Parameter

The `state` parameter prevents login CSRF by binding OAuth callbacks to requests initiated by the client.

How it works:
1. Client generates a random `state` value before starting OAuth flow
2. Client stores `state` locally and includes it in `/oauth/authorize` request
3. OAuth server returns the same `state` in the callback redirect
4. Client verifies the returned `state` matches the stored value
5. Callbacks with mismatched state must be rejected

Without `state`, an attacker could trick a user into authorizing the attacker's account, causing the victim's extension to log into the wrong account.

This prototype should implement `state` parameter validation.

## Extension Authentication Flow

Browser extensions and plugin-like clients must:
- Open /oauth/authorize in a new tab or window
- If the user is already logged in via web browser, they can authorize the extension immediately
- If not logged in, the user will be redirected to the web login page first
- Receive an authorization code via redirect
- Exchange code via /oauth/token to receive both access token and refresh token
- Store both tokens securely using platform-specific persistent storage:
  - Browser extensions: `chrome.storage.local` / `browser.storage.local`
  - Obsidian plugins: Encrypted data via `saveData()` API
  - Figma plugins: `figma.clientStorage`
  - Electron apps: OS-level secure storage (Keychain/Credential Manager) or encrypted files
  - Prefer persistent storage over session storage for better UX (tokens survive browser restarts)
- Attach access token to API requests as: `Authorization: Bearer <access_token>`
- When access token expires, use refresh token to obtain a new access token

No cookies are used for extension authentication; only OAuth tokens.

## OAuth Callback URIs

### Why Callback Pages Exist

Browser extensions cannot directly receive HTTP redirects.
Only normal web pages (browser tabs/windows) can receive OAuth redirects with URL parameters.

Therefore, browser-based OAuth flows require a **web-hosted callback page** that receives the redirect and relays the authorization result to the extension.

### Callback Page Mechanism

The WAS hosts a callback URL such as:

```
https://<was-domain>/oauth/extension-callback
```

After successful login and authorization, the OAuth server redirects the browser to:

```
/oauth/extension-callback?code=AUTH_CODE&state=STATE
```

This page:
- Reads the authorization code from the URL
- Passes it to the browser extension via `postMessage` + content script
- Optionally closes itself

It acts purely as a **bridge between OAuth redirects and the extension**.

### Why Not Redirect to `chrome-extension://`?

While theoretically possible, redirecting directly to extension URLs is problematic:
- Many OAuth servers reject non-HTTPS redirect URIs
- Different schemes per browser (`chrome-extension://`, `moz-extension://`)
- Harder to register and debug
- Inconsistent cross-browser behavior

A WAS-hosted HTTPS callback page is simpler and standard-compliant.

### Client-Specific Redirect URIs

All clients share the same `/oauth/authorize` and `/oauth/token` endpoints,
but **redirect URIs are client-specific**:

| Client Type             | Typical Redirect Mechanism                                    |
|------------------------|---------------------------------------------------------------|
| Browser extension      | `https://<was>/oauth/extension-callback` (web relay page)    |
| Obsidian / Electron app| Custom URI scheme (e.g. `obsidian://oauth-callback`)         |
| Desktop apps           | OS-registered custom scheme (e.g. `myapp://oauth-callback`)  |
| Web app                | Normal web callback (e.g. `/oauth/web-callback`)             |

The web-hosted callback page is **specifically for browser-based clients**.
Other plugin environments use different redirect mechanisms appropriate to their platform.
