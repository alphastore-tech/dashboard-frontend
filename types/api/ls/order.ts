/**
 * LS Orders API Response Types (CSPAQ13700)
 */

export interface CSPAQ13700OutBlock1 {
  RecCnt: number; // 레코드갯수
  AcntNo: string; // 계좌번호
  InptPwd: string; // 입력비밀번호
  OrdMktCode: string; // 주문시장코드
  BnsTpCode: string; // 매매구분
  IsuNo: string; // 종목번호
  ExecYn: string; // 체결여부
  OrdDt: string; // 주문일 (YYYYMMDD)
  SrtOrdNo2: number; // 시작주문번호2
  BkseqTpCode: string; // 역순구분
  OrdPtnCode: string; // 주문유형코드
}

export interface CSPAQ13700OutBlock2 {
  RecCnt: number; // 레코드갯수
  SellExecAmt: number; // 매도체결금액
  BuyExecAmt: number; // 매수체결금액
  SellExecQty: number; // 매도체결수량
  BuyExecQty: number; // 매수체결수량
  SellOrdQty: number; // 매도주문수량
  BuyOrdQty: number; // 매수주문수량
}

export interface CSPAQ13700OutBlock3 {
  OrdDt: string; // 주문일 (YYYYMMDD)
  MgmtBrnNo: string; // 관리지점번호
  OrdMktCode: string; // 주문시장코드
  OrdNo: number; // 주문번호
  OrgOrdNo: number; // 원주문번호
  IsuNo: string; // 종목번호
  IsuNm: string; // 종목명
  BnsTpCode: string; // 매매구분
  BnsTpNm: string; // 매매구분명
  OrdPtnCode: string; // 주문유형코드
  OrdPtnNm: string; // 주문유형명
  OrdTrxPtnCode: number; // 주문처리유형코드
  OrdTrxPtnNm: string; // 주문처리유형명
  MrcTpCode: string; // 정정취소구분
  MrcTpNm: string; // 정정취소구분명
  MrcQty: number; // 정정취소수량
  MrcAbleQty: number; // 정정취소가능수량
  OrdQty: number; // 주문수량
  OrdPrc: number; // 주문가격
  ExecQty: number; // 체결수량
  ExecPrc: number; // 체결가
  ExecTrxTime: string; // 체결처리시각 (HHMMSSmmm)
  LastExecTime: string; // 최종체결시각 (HHMMSSmmm)
  OrdprcPtnCode: string; // 호가유형코드
  OrdprcPtnNm: string; // 호가유형명
  OrdCndiTpCode: string; // 주문조건구분
  AllExecQty: number; // 전체체결수량
  RegCommdaCode: string; // 통신매체코드
  CommdaNm: string; // 통신매체명
  MbrNo: string; // 회원번호
  RsvOrdYn: string; // 예약주문여부
  LoanDt: string; // 대출일 (YYYYMMDD)
  OrdTime: string; // 주문시각 (HHMMSSmmm)
  OpDrtnNo: string; // 운용지시번호
  OdrrId: string; // 주문자ID
}

export type OrderResponse = {
  CSPAQ13700OutBlock1: CSPAQ13700OutBlock1;
  CSPAQ13700OutBlock2: CSPAQ13700OutBlock2;
  CSPAQ13700OutBlock3: CSPAQ13700OutBlock3[];
};
