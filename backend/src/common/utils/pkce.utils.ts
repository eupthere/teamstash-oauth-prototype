import * as crypto from 'crypto';

/**
 * Verifies a PKCE code_verifier against the stored code_challenge
 * 
 * @param codeVerifier - The code_verifier sent by the client
 * @param codeChallenge - The code_challenge stored during authorization
 * @param codeChallengeMethod - The method used (must be 'S256')
 * @returns true if verification succeeds, false otherwise
 */
export function verifyPKCE(
  codeVerifier: string,
  codeChallenge: string,
  codeChallengeMethod: string,
): boolean {
  if (codeChallengeMethod !== 'S256') {
    // Only S256 is supported as per AGENTS.md requirements
    return false;
  }

  // Generate SHA-256 hash of code_verifier
  const hash = crypto.createHash('sha256').update(codeVerifier).digest();
  
  // Base64URL encode the hash
  const computedChallenge = hash
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  return computedChallenge === codeChallenge;
}
