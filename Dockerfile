###############################################################################
# 1) deps — node_modules만 분리 설치
###############################################################################
FROM node:20.11.1-alpine3.19 AS deps
WORKDIR /app

# npm 캐시를 활용하기 위해 package.json과 lock 파일만 복사
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev                       # prod-deps만 설치

###############################################################################
# 2) build — 소스 추가 후 Next.js 빌드
###############################################################################
FROM node:20.11.1-alpine3.19 AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .
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
