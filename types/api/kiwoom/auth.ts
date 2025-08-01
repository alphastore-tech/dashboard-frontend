export interface KiwoomTokenResponse {
  /** 토큰 만료 일시(ISO 8601 또는 Kiwoom 포맷) */
  expires_dt: string;
  /** 일반적으로 "Bearer" */
  token_type: string;
  /** 실제 접근 토큰 */
  token: string;
  return_code: number;
  return_msg: string;
}
