// lib/time.ts
export const isMarketOpenKST = (startTime = 900, endTime = 1545) => {
  const nowUTC = new Date();
  // KST로 변환
  const nowKST = new Date(nowUTC.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));

  const hh = nowKST.getHours();
  const mm = nowKST.getMinutes();

  /* ------------------- ① 매일 00:00 – 00:01 ------------------- */
  // 자정 이후 1분 동안은 요일에 관계없이 true
  if (hh === 0 && mm < 1) return true;

  /* ------------------- ② 평일 장중 시간 체크 -------------- */
  const day = nowKST.getDay(); // 0 = Sun … 6 = Sat
  if (day === 0 || day === 6) return false; // 주말 제외

  const hhmm = hh * 100 + mm;
  return hhmm >= startTime && hhmm <= endTime;
};
