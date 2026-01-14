# AGENTS.md

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

Access tokens are JWT Bearer tokens.

Protected APIs require:
Authorization: Bearer <access_token>

## Extension Authentication Flow

Browser extensions and plugin-like clients must:
- Open /oauth/authorize in a new tab or window
- If the user is already logged in via web browser, they can authorize the extension immediately
- If not logged in, the user will be redirected to the web login page first
- Receive an authorization code via redirect
- Exchange code via /oauth/token
- Store access token in extension local storage
- Attach token to API requests as: `Authorization: Bearer <access_token>`

No cookies are used for extension authentication; only OAuth tokens.
