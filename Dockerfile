# 依存パッケージのインストール
FROM node:20.9.0 AS deps
WORKDIR /app
COPY ./src/package.json ./src/package-lock.json ./
RUN npm ci --only=production

# Build環境
FROM node:20.9.0 as builder
WORKDIR /app
COPY ./src ./
RUN npm ci
RUN npm run build

# 実行環境
FROM node:20.9.0-slim
WORKDIR /app
ENV NODE_ENV production
RUN useradd -m nonroot
COPY --from=builder --chown=nonroot:nonroot /app/.next ./.next
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public

# ヘルスチェック (Next.js のヘルスチェックエンドポイントを使用)
# HEALTHCHECK --interval=5m --timeout=3s \
#   CMD curl -f http://localhost:3000/api/health || exit 1

USER nonroot
EXPOSE 3000
CMD [ "node_modules/.bin/next", "start" ]
