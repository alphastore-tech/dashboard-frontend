// data.ts (모킹)
import { Strategy } from "@/app/types/types";

export const strategies: Strategy[] = [
    {
      id: "domestic-stock-long-term",
      name: "국내 주식 계좌 포트폴리오",
      description: "매크로 + 가치투자 + 단기 트레이딩",
      metrics: { sharpe: 2.3, totalReturn: 0.201, annualReturn: 0.201, maxDrawdown: -0.1802, volatility: 0.1802 },
    },
    {
      id: "foreign-stock",
      name: "해외 주식 계좌 포트폴리오",
      description: "매크로 + 가치투자 + 단기 트레이딩",
      metrics: { sharpe: 1.7, totalReturn: 0.1765, annualReturn: 0.1765, maxDrawdown: -0.0793, volatility: 0.0793 },
    },
    {
      id: "domestic-future",
      name: "국내 주식 선물 차익거래",
      description: "국내 주식 선물과 현물의 차익거래",
      metrics: { sharpe: 1.82, totalReturn: 0.2448, annualReturn: 0.2448, maxDrawdown: -0.1147, volatility: 0.1147 },
    },
    {
      id: "coins",
      name: "코인 차익거래",
      description: "코인 선물과 현물의 차익거래",
      metrics: { sharpe: 1.82, totalReturn: 0.2448, annualReturn: 0.2448, maxDrawdown: -0.1147, volatility: 0.1147 },
    },
    {
      id: "domestic-etfs",
      name: "국내 ETF 차익거래",
      description: "국내 ETF 선물과 현물의 차익거래",
      metrics: { sharpe: 1.82, totalReturn: 0.2448, annualReturn: 0.2448, maxDrawdown: -0.1147, volatility: 0.1147 },
    },
    {
      id: "follow-top-pick",
      name: "상한가 따라잡기",
      description: "상한가 주식을 따라잡는 전략",
      metrics: { sharpe: 1.82, totalReturn: 0.2448, annualReturn: 0.2448, maxDrawdown: -0.1147, volatility: 0.1147 },
    },
    {
      id: "statistical-arbitrage",
      name: "통계적 차익거래",
      description: "통계적 차익거래",
      metrics: { sharpe: 1.82, totalReturn: 0.2448, annualReturn: 0.2448, maxDrawdown: -0.1147, volatility: 0.1147 },
    },
    {
      id: "ai-model-analysis",
      name: "AI 모델 공시 감성 분석",
      description: "AI 모델로 공시 정보의 감성을 분석한 이벤트 드리븐 트레이딩",
      metrics: { sharpe: 1.82, totalReturn: 0.2448, annualReturn: 0.2448, maxDrawdown: -0.1147, volatility: 0.1147 },
    },
  ];
  