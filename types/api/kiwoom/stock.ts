export interface StockInfoResponse {
  code?: string; // 종목코드
  name?: string; // 종목명
  upName?: string; // 업종명
  [key: string]: unknown; // 기타 필드 무시
}
