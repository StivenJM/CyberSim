# syntax=docker/dockerfile:1
FROM node:24.22.0-bookworm-slim@sha256:a5f4366e834695d5f363b920c104953a535d3a9864d1bdf74566a0ebe01daee5 AS base
WORKDIR /workspace
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
ENV NODE_ENV=development

# Workspace resolution still uses the single repository lockfile.
FROM base AS workspace-manifests
COPY package.json package-lock.json ./
COPY apps/backend/package.json apps/backend/package.json
COPY apps/frontend/package.json apps/frontend/package.json

# The full toolchain is only used by explicit maintenance/test tools.
FROM workspace-manifests AS dependencies
RUN --mount=type=cache,target=/root/.npm npm ci

FROM workspace-manifests AS frontend-dependencies
RUN --mount=type=cache,target=/root/.npm npm ci --workspace @cybersim/frontend --include-workspace-root=false

FROM frontend-dependencies AS frontend-source
COPY apps/frontend apps/frontend

# Export is a build artifact consumed by preparation, not by either app image.
FROM frontend-source AS knowledge-build
RUN npm run export:rag --workspace @cybersim/frontend

FROM frontend-source AS frontend-dev
CMD ["npm","run","dev","--workspace","@cybersim/frontend","--","--host","0.0.0.0","--port","5173","--strictPort"]

FROM workspace-manifests AS backend-dependencies
RUN --mount=type=cache,target=/root/.npm npm ci --workspace @cybersim/backend --include-workspace-root=false

FROM backend-dependencies AS backend-source
COPY apps/backend apps/backend
RUN npm run db:generate --workspace @cybersim/backend
# Runtime evidence hashes these inputs; no frontend source or export is needed.
COPY infra/n8n infra/n8n
COPY knowledge knowledge

FROM backend-source AS backend-dev
CMD ["npm","run","dev","--workspace","@cybersim/backend"]

FROM dependencies AS tools-dev
COPY apps/backend apps/backend
COPY apps/frontend apps/frontend
COPY infra infra
COPY knowledge knowledge
RUN npm run db:generate --workspace @cybersim/backend
CMD ["node","infra/tools.mjs","status"]

# Preparation/verify use only Node built-ins plus the exported catalog artifact.
FROM base AS preparation-dev
COPY infra/tools.mjs infra/verify.mjs infra/
COPY infra/n8n infra/n8n
COPY knowledge knowledge
COPY --from=knowledge-build /workspace/apps/frontend/scripts/rag-output/ apps/frontend/scripts/rag-output/
CMD ["node","infra/tools.mjs","prepare"]

