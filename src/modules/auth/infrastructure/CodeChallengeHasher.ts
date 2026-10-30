// Genera el parell code_verifier / code_challenge de PKCE (RFC 7636) fent
// servir la Web Crypto API del navegador. Mètode S256 sempre.

const VERIFIER_BYTES = 64; // 64 bytes -> 86 chars en base64url, dins el rang 43-128 de l'RFC

export class CodeChallengeHasher {
  static readonly METHOD = 'S256' as const;

  generateVerifier(): string {
    const bytes = crypto.getRandomValues(new Uint8Array(VERIFIER_BYTES));
    return base64UrlEncode(bytes);
  }

  async challengeFor(verifier: string): Promise<string> {
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
    return base64UrlEncode(new Uint8Array(digest));
  }
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
