export interface LsBalanceSummary {
  dtsunik: number; // 실현손익
  cts_expcode: string; // CTS_종목번호
  mamt: number; // 매입금액
  sunamt1: number; // 추정D2예수금
  tappamt: number; // 평가금액
  sunamt: number; // 추정순자산
  tdtsunik: number; // 평가손익
}

export interface LsBalanceItem {
  sininter: number; // 이자
  fee: number; // 수수료
  mamt: number; // 매입금액
  sinamt: number; // 신용금액
  mpmd: number; // 매입/매도 구분(숫자코드)
  mdposqt: number; // 매도가능수량
  jsat: number; // 잔고상태 코드
  janqty: number; // 보유수량
  loandt: string; // 대출일자
  sysprocseq: number; // 시스템처리순번
  price: number; // 현재가(또는 기준가)
  janrt: number; // 보유비중(%)
  jdat: number; // 정리일자
  jpms: number; // 정리평가금액
  hname: string; // 종목명
  appamt: number; // 평가금액
  sunikrt: number; // 수익율(%)
  jonggb: string; // 종목구분
  msat: number; // 매수상태 코드
  tax: number; // 세금
  pamt: number; // 평균단가
  jpmd: number; // 정리매매구분
  marketgb: string; // 시장구분
  jangb: string; // 장구분
  dtsunik: number; // 평가손익
  expcode: string; // 종목코드
  mdat: number; // 정리일자(추정)
  mpms: number; // 당일매수단가
  lastdt: string; // 최종일자
}

export interface BalanceResponse {
  rsp_cd: string; // 응답코드 ("00000" 성공)
  t0424OutBlock: LsBalanceSummary; // 요약 블록
  t0424OutBlock1: LsBalanceItem[]; // 보유 종목 목록
  rsp_msg: string; // 응답 메시지
}
