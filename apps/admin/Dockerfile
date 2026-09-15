# Admin bot image (multi-stage). Build from repo root:
#   docker build -f apps/admin/Dockerfile -t admin-bot .

# --- builder: full install + compile, discarded from the final image ---
FROM node:22-alpine AS builder

WORKDIR /app

COPY .yarnrc.yml package.json yarn.lock ./
COPY .yarn/ ./.yarn/

# Workspace manifests first, so the install layer caches until deps change.
COPY apps/user/package.json apps/user/
COPY apps/admin/package.json apps/admin/
COPY packages/api-client/package.json packages/api-client/
COPY packages/grammy-kit/package.json packages/grammy-kit/
COPY packages/shared/package.json packages/shared/
COPY tools/eslint-runner/package.json tools/eslint-runner/

RUN yarn install --immutable

COPY . .

RUN yarn build

# --- runner: production-only deps + compiled output ---
FROM node:22-alpine AS runner

WORKDIR /app

COPY .yarnrc.yml package.json yarn.lock ./
COPY .yarn/ ./.yarn/

COPY apps/admin/package.json apps/admin/
COPY packages/api-client/package.json packages/api-client/
COPY packages/grammy-kit/package.json packages/grammy-kit/
COPY packages/shared/package.json packages/shared/
COPY tools/eslint-runner/package.json tools/eslint-runner/

RUN yarn workspaces focus admin --production

COPY --from=builder /app/apps/admin/dist apps/admin/dist
COPY --from=builder /app/packages/api-client/dist packages/api-client/dist
COPY --from=builder /app/packages/grammy-kit/dist packages/grammy-kit/dist
COPY --from=builder /app/packages/shared/dist packages/shared/dist

CMD ["yarn", "admin", "start"]
