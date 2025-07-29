/* lib/kis_auth.ts */
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

const { AWS_SECRET_ID } = process.env as Record<
  string,
  string
>;

interface TokenInfo {
  cachedToken: string | null;
  expiresAt: number;
}

const tokenMap = new Map<string, TokenInfo>();

export async function getAccessToken(awsSecretId: string) {
  const tokenInfo = tokenMap.get(awsSecretId);
  if (tokenInfo && tokenInfo.cachedToken && Date.now() < tokenInfo.expiresAt) {
    return tokenInfo.cachedToken;
  }

  const sm = new SecretsManagerClient({ region: 'ap-northeast-2' });
  const { SecretString } = await sm.send(new GetSecretValueCommand({ SecretId: awsSecretId }));

  const secretData = JSON.parse(SecretString!);
  const cachedToken = secretData.access_token;

  const iso = `${secretData.access_token_token_expired.replace(' ', 'T')}+09:00`;
  const expiresAt = new Date(iso).getTime();
  
  tokenMap.set(awsSecretId, { cachedToken, expiresAt });
  
  console.log('expiresAt', expiresAt);
  console.log('Date.now()', Date.now());
  return cachedToken;
}