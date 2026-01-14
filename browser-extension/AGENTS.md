# browser-extension/AGENTS.md

## Purpose

This workspace implements a browser extension demonstrating **delegated resource access via OAuth**.

The extension does NOT provide a login UI. Instead, it leverages the user's existing web session to obtain OAuth tokens for accessing protected resources.

This demonstrates OAuth's original purpose: **authorization for third-party clients**.

## Must Implement

### OAuth Flow
1. **Initiate authorization**
   - Generate random `state` value and store it
   - Generate PKCE `code_verifier` and `code_challenge`
   - Open new tab/window to `/oauth/authorize` with:
     - `client_id=extension`
     - `redirect_uri=http://localhost:3000/oauth/extension-callback` (or appropriate backend URL)
     - `response_type=code`
     - `state=<generated_state>`
     - `code_challenge=<generated_challenge>`
     - `code_challenge_method=S256`

2. **Receive callback**
   - Listen for `postMessage` from `/oauth/extension-callback` page
   - Verify `state` matches stored value
   - Extract authorization `code`

3. **Exchange code for tokens**
   - POST to `/oauth/token` with:
     - `grant_type=authorization_code`
     - `code=<authorization_code>`
     - `redirect_uri=<same_as_authorize>`
     - `client_id=extension`
     - `code_verifier=<original_verifier>`
   - Receive `access_token` and `refresh_token`

4. **Store tokens securely**
   - Store both tokens in `chrome.storage.local` or `browser.storage.local`
   - Use persistent storage (not session storage) for better UX

5. **Call protected resources**
   - Add `Authorization: Bearer <access_token>` header
   - Call `/api/protected-resource`

6. **Handle token refresh**
   - When access token expires (401 response)
   - POST to `/oauth/token` with `grant_type=refresh_token`
   - Update stored access token

## Must NOT

- **Must not implement username/password login UI**
- **Must not call `/api/me`** for identity display (extension doesn't show logged-in user)
- **Must not use cookies** for authentication
- **Must not store tokens in web localStorage** (use extension storage APIs)
- **Must not skip `state` validation** (security critical)
- **Must not skip PKCE** (security critical for public clients)

## Client Behavior Model

The extension is a **delegated access client**, not a login client.

It assumes:
- User is already logged in via the web frontend
- Extension simply needs permission to access user's resources
- No need to display user identity in extension UI

If the user is not logged in, the OAuth flow will redirect them to the web login page first.

## Technical Constraints

- Built with **WXT framework** with **React JS** for cross-browser extension development
- Uses `src/` directory structure for extension code
- Uses browser extension storage APIs (`chrome.storage.local` / `browser.storage.local`)
- Communicates with callback page via `postMessage`
- No direct access to HTTP cookies
- Limited to extension API capabilities

## Security Considerations

- Always validate `state` parameter
- Always use PKCE
- Store tokens in extension storage, not web storage
- Never expose tokens in console logs or error messages
