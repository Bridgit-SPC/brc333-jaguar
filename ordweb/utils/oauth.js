import crypto from 'crypto';

// Function to generate code verifier and challenge
export const generateCodeVerifierAndChallenge = () => {
  let codeVerifier = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 128; i++) {
    codeVerifier += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  console.log({ codeVerifier });

  const sha256Hash = crypto.createHash('sha256').update(codeVerifier).digest();
  const codeChallenge = base64URLEncode(sha256Hash);
  console.log({ codeChallenge });

  return { codeVerifier, codeChallenge };
}

export function generateCodeChallenge(codeVerifier) {
  const sha256Hash = crypto.createHash('sha256').update(codeVerifier).digest('base64');
  const codeChallenge = sha256Hash
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  return codeChallenge;
}

function base64URLEncode(buffer) {
  return buffer.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export function generateRandomState() {
  // Generate a random buffer
  const buffer = crypto.randomBytes(32);

  // Convert the buffer to a hexadecimal string
  const state = buffer.toString('hex');

  return state;
}
