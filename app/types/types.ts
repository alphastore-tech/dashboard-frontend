// types.ts ─ 선택
export interface StrategyMetrics {
    sharpe: number;          // ex) 2.3
    totalReturn: number;     // ex) 0.201  (=20.1 %)    
    annualReturn: number;    // ex) 0.201  (=20.1 %)
    maxDrawdown: number;     // ex) -0.1802 (=-18.02 %)
    volatility: number;      // ex) 0.1802 (18.02 %)
}
  
export interface Strategy {
    id: string;
    name: string;
    description: string;
    metrics: StrategyMetrics;
}
  