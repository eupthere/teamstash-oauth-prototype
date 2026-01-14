import { Injectable } from '@nestjs/common';

export interface OAuthClient {
  clientId: string;
  redirectUris: string[];
  clientType: 'public' | 'confidential';
  pkceRequired: boolean;
}

@Injectable()
export class ClientStore {
  private clients: Map<string, OAuthClient> = new Map();

  constructor() {
    // Register default clients for the prototype
    this.registerClient({
      clientId: 'extension',
      redirectUris: ['http://localhost:3000/oauth/extension-callback'],
      clientType: 'public',
      pkceRequired: true,
    });

    this.registerClient({
      clientId: 'desktop',
      redirectUris: ['myapp://oauth-callback'],
      clientType: 'public',
      pkceRequired: true,
    });

    this.registerClient({
      clientId: 'web',
      redirectUris: ['http://localhost:3000/oauth/web-callback'],
      clientType: 'public',
      pkceRequired: true,
    });
  }

  private registerClient(client: OAuthClient): void {
    this.clients.set(client.clientId, client);
  }

  getClient(clientId: string): OAuthClient | undefined {
    return this.clients.get(clientId);
  }

  validateRedirectUri(clientId: string, redirectUri: string): boolean {
    const client = this.clients.get(clientId);
    if (!client) {
      return false;
    }
    return client.redirectUris.includes(redirectUri);
  }
}
