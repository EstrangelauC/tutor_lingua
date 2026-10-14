# Imagem da API. Construir a partir da raiz do monorepo:
#   docker build -f apps/api/Dockerfile -t camille-api .
# O pnpm vem do campo packageManager do package.json (via corepack).

FROM node:22-alpine AS base
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
# O corepack que vem com o Node pode não conhecer as assinaturas dos pnpm mais recentes.
RUN npm install -g corepack@latest && corepack enable
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY packages/shared/package.json packages/shared/
COPY apps/api/package.json apps/api/

# Compila @camille/shared e a API com as dependências de desenvolvimento.
FROM base AS build
RUN pnpm install --frozen-lockfile --filter "@camille/api..."
COPY packages/shared packages/shared
COPY apps/api apps/api
RUN pnpm --filter @camille/shared build && pnpm --filter @camille/api build

# Só as dependências de produção da API (e o link para @camille/shared).
FROM base AS deps
RUN pnpm install --frozen-lockfile --prod --filter "@camille/api..."

FROM node:22-alpine AS run
ENV NODE_ENV=production PORT=3000
WORKDIR /app
COPY --from=deps --chown=node:node /app ./
COPY --from=build --chown=node:node /app/packages/shared/dist packages/shared/dist
COPY --from=build --chown=node:node /app/apps/api/dist apps/api/dist
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD wget -qO- "http://127.0.0.1:${PORT}/health" || exit 1
WORKDIR /app/apps/api
CMD ["node", "dist/main.js"]
