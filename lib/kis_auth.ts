/* lib/kis_auth.ts */
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

const { KIS_APP_KEY, KIS_APP_SECRET, KIS_DOMAIN, AWS_SECRET_ID } = process.env as Record<
  string,
  string
>;

let cachedToken: string | null = null;
let expiresAt: number = 0;

export async function getAccessToken() {
  if (cachedToken && Date.now() < expiresAt) {
    return cachedToken;
  }

  const sm = new SecretsManagerClient({ region: 'ap-northeast-2' });
  const { SecretString } = await sm.send(new GetSecretValueCommand({ SecretId: AWS_SECRET_ID }));

  const secretData = JSON.parse(SecretString!);
  cachedToken = secretData.access_token;

  const iso = `${secretData.access_token_token_expired.replace(' ', 'T')}+09:00`;
  expiresAt = new Date(iso).getTime();
  console.log('expiresAt', expiresAt);
  console.log('Date.now()', Date.now());
  return cachedToken;
}

export async function requestNewAccessToken() {
  const res = await fetch(`${KIS_DOMAIN}/oauth2/tokenP`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json; charset=UTF-8',
    },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      appkey: KIS_APP_KEY,
      appsecret: KIS_APP_SECRET,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to get access token: HTTP ${res.status} - ${errText}`);
  }

  const data = await res.json();

  if (!data.access_token || !data.expires_in) {
    throw new Error(`Invalid token response: ${JSON.stringify(data)}`);
  }

  cachedToken = data.access_token;
  // expires_in: 초 단위, access_token_token_expired: "YYYY-MM-DD HH:mm:ss"
  // 6시간 이내 재호출 시 기존 토큰 리턴, 6시간 이후엔 새 토큰 발급됨
  expiresAt = Date.now() + (data.expires_in - 3600) * 1000; // 1시간 여유를 두고 만료 처리

  return cachedToken;
}
