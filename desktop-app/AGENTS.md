# desktop-app/AGENTS.md

## Purpose

This workspace implements a desktop application demonstrating **OAuth as a login mechanism** (OIDC-style identity flow).

The desktop app uses OAuth not just for resource access, but also to **authenticate and identify the user** within the application.

This demonstrates OAuth used as an identity provider for standalone applications.

## Must Implement

### OAuth Flow
1. **Initiate authorization**
   - Generate random `state` value and store it
   - Generate PKCE `code_verifier` and `code_challenge`
   - Open system browser to `/oauth/authorize` with:
     - `client_id=desktop`
     - `redirect_uri=myapp://oauth-callback` (custom URI scheme)
     - `response_type=code`
     - `state=<generated_state>`
     - `code_challenge=<generated_challenge>`
     - `code_challenge_method=S256`

2. **Receive callback**
   - Register custom URI scheme handler (`myapp://`)
   - OS redirects to app when callback URI is invoked
   - Parse `code` and `state` from URI
   - Verify `state` matches stored value

3. **Exchange code for tokens**
   - POST to `/oauth/token` with:
     - `grant_type=authorization_code`
     - `code=<authorization_code>`
     - `redirect_uri=myapp://oauth-callback`
     - `client_id=desktop`
     - `code_verifier=<original_verifier>`
   - Receive `access_token` and `refresh_token`

4. **Fetch user identity**
   - Call `/api/me` with `Authorization: Bearer <access_token>`
   - Receive user information (user_id, email, name, etc.)
   - Display user identity in app UI

5. **Store tokens securely**
   - macOS: Store in Keychain
   - Windows: Store in Credential Manager
   - Linux: Store in libsecret/keyring
   - Alternative: Encrypted file in app data directory
   - Use persistent storage for better UX

6. **Maintain login state**
   - Show logged-in user in app UI
   - Provide logout functionality
   - Display "Login" button when not authenticated

7. **Call protected resources**
   - Add `Authorization: Bearer <access_token>` header
   - Call `/api/protected-resource`

8. **Handle token refresh**
   - When access token expires (401 response)
   - POST to `/oauth/token` with `grant_type=refresh_token`
   - Update stored access token

## Must NOT

- **Must not embed a password login form** in the desktop app
- **Must not bypass OAuth** for authentication
- **Must not store tokens in plain text files**
- **Must not skip `state` validation** (security critical)
- **Must not skip PKCE** (security critical for public clients)

## Client Behavior Model

The desktop app is an **identity + resource access client**.

It uses OAuth for:
- **User authentication** (identifying who the user is)
- **Resource authorization** (accessing user's resources)

The desktop app:
- Opens the system browser for login (does not embed browser)
- Displays logged-in user identity
- Maintains local login state
- Provides login/logout UI

This follows the **OpenID Connect (OIDC) pattern** where OAuth is used for identity.

## Technical Constraints

- Must register custom URI scheme with OS (`myapp://`)
- Opens external system browser (not embedded webview)
- Uses OS-level secure storage for tokens
- Electron or native desktop framework

## Security Considerations

- Always validate `state` parameter
- Always use PKCE
- Store tokens in OS secure storage (Keychain/Credential Manager)
- Never log tokens to console or files
- Clear tokens on logout
- Handle token refresh gracefully

## Platform-Specific Details

### Custom URI Scheme Registration
- macOS: Register in `Info.plist`
- Windows: Register in Windows Registry during installation
- Linux: Register `.desktop` file

### Token Storage
- macOS: Use Keychain APIs
- Windows: Use Credential Manager APIs
- Linux: Use libsecret or Secret Service API
- Cross-platform: Use `keytar` npm package or similar
