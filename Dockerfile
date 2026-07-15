FROM node:22-alpine AS base
ENV NODE_ENV=production
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml ./
RUN pnpm config set minimum-release-age 0
RUN pnpm install --frozen-lockfile --config.ignore-scripts=false --config.dangerously-allow-all-builds=true
COPY . .
RUN pnpm build

FROM node:22-alpine AS runner
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
WORKDIR /app

COPY --from=base /app/public ./public
COPY --from=base /app/.next/standalone ./
COPY --from=base /app/.next/static ./.next/static

EXPOSE 3000

CMD ["node", "server.js"]
