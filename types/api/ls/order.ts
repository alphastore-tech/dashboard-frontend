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
export interface CDPCQ04700OutBlock1 {
  RecCnt: number; // 레코드갯수
  QryTp: string; // 조회구분
  AcntNo: string; // 계좌번호
  Pwd: string; // 비밀번호
  QrySrtDt: string; // 조회시작일
  QryEndDt: string; // 조회종료일
  SrtNo: number; // 시작번호
  PdptnCode: string; // 상품유형코드
  IsuLgclssCode: string; // 종목대분류코드
  IsuNo: string; // 종목번호
}

export interface CDPCQ04700OutBlock2 {
  RecCnt: number; // 레코드갯수
  AcntNm: string; // 계좌명
}

export interface CDPCQ04700OutBlock3 {
  AcntNo: string; // 계좌번호
  TrdDt: string; // 거래일자
  TrdNo: number; // 거래번호
  TpCodeNm: string; // 구분코드명
  SmryNo: string; // 적요번호
  SmryNm: string; // 적요명
  CancTpNm: string; // 취소구분
  TrdQty: number; // 거래수량
  Trtax: number; // 거래세
  FcurrAdjstAmt: number; // 외화정산금액
  AdjstAmt: number; // 정산금액
  OvdSum: number; // 연체합
  DpsBfbalAmt: number; // 예수금전잔금액
  SellPldgRfundAmt: number; // 매도담보상환금
  DpspdgLoanBfbalAmt: number; // 예탁담보대출전잔금액
  TrdmdaNm: string; // 거래매체명
  OrgTrdNo: number; // 원거래번호
  IsuNm: string; // 종목명
  TrdUprc: number; // 거래단가
  CmsnAmt: number; // 수수료
  FcurrCmsnAmt: number; // 외화수수료금액
  RfundDiffAmt: number; // 상환차이금액
  RepayAmtSum: number; // 변제금합계
  SecCrbalQty: number; // 유가증권금잔수량
  CslLoanRfundIntrstAmt: number; // 매도대금담보대출상환이자금액
  DpspdgLoanCrbalAmt: number; // 예탁담보대출금잔금액
  TrxTime: string; // 처리시각
  Inouno: number; // 출납번호
  IsuNo: string; // 종목번호
  TrdAmt: number; // 거래금액
  ChckAmt: number; // 수표금액
  TaxSumAmt: number; // 세금합계금액
  FcurrTaxSumAmt: number; // 외화세금합계금액
  IntrstUtlfee: number; // 이자이용료
  MnyDvdAmt: number; // 배당금액
  RcvblOcrAmt: number; // 미수발생금액
  TrxBrnNo: string; // 처리지점번호
  TrxBrnNm: string; // 처리지점명
  DpspdgLoanAmt: number; // 예탁담보대출금액
  DpspdgLoanRfundAmt: number; // 예탁담보대출상환금액
  BasePrc: number; // 기준가
  DpsCrbalAmt: number; // 예수금금잔금액
  BoaAmt: number; // 과표
  MnyoutAbleAmt: number; // 출금가능금액
  BcrLoanOcrAmt: number; // 수익증권담보대출발생금
  BcrLoanBfbalAmt: number; // 수익증권담보대출전잔금
  BnsBasePrc: number; // 매매기준가
  TaxchrBasePrc: number; // 과세기준가
  TrdUnit: number; // 거래좌수
  BalUnit: number; // 잔고좌수
  EvrTax: number; // 제세금
  EvalAmt: number; // 평가금액
  BcrLoanRfundAmt: number; // 수익증권담보대출상환금
  BcrLoanCrbalAmt: number; // 수익증권담보대출금잔금
  AddMgnOcrTotamt: number; // 추가증거금발생총액
  AddMnyMgnOcrAmt: number; // 추가현금증거금발생금액
  AddMgnDfryTotamt: number; // 추가증거금납부총액
  AddMnyMgnDfryAmt: number; // 추가현금증거금납부금액
  BnsplAmt: number; // 매매손익금액
  Ictax: number; // 소득세
  Ihtax: number; // 주민세
  LoanDt: string; // 대출일
  CrcyCode: string; // 통화코드
  FcurrAmt: number; // 외화금액
  FcurrTrdAmt: number; // 외화거래금액
  FcurrDps: number; // 외화예수금
  FcurrDpsBfbalAmt: number; // 외화예수금전잔금액
  OppAcntNm: string; // 상대계좌명
  OppAcntNo: string; // 상대계좌번호
  LoanRfundAmt: number; // 대출상환금액
  LoanIntrstAmt: number; // 대출이자금액
  AskpsnNm: string; // 의뢰인명
  OrdDt: string; // 주문일자
  TrdXchrat: number; // 거래환율
  RdctCmsn: number; // 감면수수료
  FcurrStmpTx: number; // 외화인지세
  FcurrElecfnTrtax: number; // 외화전자금융거래세
  FcstckTrtax: number; // 외화증권거래세
}

export interface CDPCQ04700OutBlock4 {
  RecCnt: number; // 레코드갯수
  PnlSumAmt: number; // 손익합계금액
  CtrctAsm: number; // 약정누계
  CmsnAmtSumAmt: number; // 수수료합계금액
}

export interface CDPCQ04700OutBlock5 {
  RecCnt: number; // 레코드갯수
  MnyinAmt: number; // 입금금액
  SecinAmt: number; // 입고금액
  MnyoutAmt: number; // 출금금액
  SecoutAmt: number; // 출고금액
  DiffAmt: number; // 차이금액
  DiffAmt0: number; // 차이금액0
  SellQty: number; // 매도수량
  SellAmt: number; // 매도금액
  SellCmsn: number; // 매도수수료
  EvrTax: number; // 제세금
  FcurrSellAdjstAmt: number; // 외화매도정산금액
  BuyQty: number; // 매수수량
  BuyAmt: number; // 매수금액
  BuyCmsn: number; // 매수수수료
  ExecTax: number; // 체결세금
  FcurrBuyAdjstAmt: number; // 외화매수정산금액
}

export type OrderResponse2 = {
  CDPCQ04700OutBlock1: CDPCQ04700OutBlock1;
  CDPCQ04700OutBlock2: CDPCQ04700OutBlock2;
  CDPCQ04700OutBlock3: CDPCQ04700OutBlock3[];
  CDPCQ04700OutBlock4: CDPCQ04700OutBlock4;
  CDPCQ04700OutBlock5: CDPCQ04700OutBlock5;
};
