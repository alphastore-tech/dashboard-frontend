###############################################################################
# 1) deps — node_modules만 분리 설치
###############################################################################
FROM node:20.11.1-alpine3.19 AS deps
WORKDIR /app

# npm 캐시를 활용하기 위해 package.json과 lock 파일만 복사
COPY package.json package-lock.json* ./
RUN npm ci

###############################################################################
# 2) build — 소스 추가 후 Next.js 빌드
###############################################################################
FROM node:20.11.1-alpine3.19 AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG KIS_APP_KEY
ARG KIS_APP_SECRET
ARG KIS_DOMAIN
ARG NEXT_PUBLIC_KIS_CANO
ARG NEXT_PUBLIC_KIS_ACNT_PRDT_CD
ARG NEXT_PUBLIC_KIS_FUTURE_ACNT_PRDT_CD
ARG AWS_ACCESS_KEY_ID
ARG AWS_SECRET_ACCESS_KEY
ARG AWS_REGION
ARG AWS_SECRET_ID

ENV KIS_APP_KEY=${KIS_APP_KEY}
ENV KIS_APP_SECRET=${KIS_APP_SECRET}
ENV KIS_DOMAIN=${KIS_DOMAIN}
ENV NEXT_PUBLIC_KIS_CANO=${NEXT_PUBLIC_KIS_CANO}
ENV NEXT_PUBLIC_KIS_ACNT_PRDT_CD=${NEXT_PUBLIC_KIS_ACNT_PRDT_CD}
ENV NEXT_PUBLIC_KIS_FUTURE_ACNT_PRDT_CD=${NEXT_PUBLIC_KIS_FUTURE_ACNT_PRDT_CD}
ENV AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
ENV AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
ENV AWS_REGION=${AWS_REGION}
ENV AWS_SECRET_ID=${AWS_SECRET_ID}
RUN npm run build                           # next build

###############################################################################
# 3) runtime — 최종 이미지 (deps + .next + public 등)
###############################################################################
FROM node:20.11.1-alpine3.19
WORKDIR /app

ENV NODE_ENV=production \
    PORT=3000

# 필요 파일만 복사
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000
CMD ["npm", "start"]                        # next start
