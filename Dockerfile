FROM node:21-alpine3.18 AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

FROM base AS prod-deps

COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

FROM base AS builder

COPY . ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run build

FROM base AS runner

COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=builder /app/dist /app/dist

ENTRYPOINT ["node", "./dist/index.js"]
