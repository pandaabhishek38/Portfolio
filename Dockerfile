# Backend (Express + Prisma) image for Google Cloud Run.
# The Next.js frontend is deployed separately on Vercel and is not built here.

FROM node:22-bookworm-slim

# Prisma's query engine needs OpenSSL, which the slim image does not ship.
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV NODE_ENV=production

# Install dependencies from the lockfile (dev deps included so the Prisma CLI is available).
COPY package.json package-lock.json ./
RUN npm ci

# Generate the Prisma client for this platform, then drop dev dependencies.
# The generated client lives in node_modules/.prisma and is kept by the prune.
COPY prisma ./prisma
RUN npx prisma generate && npm prune --omit=dev && npm cache clean --force

COPY backend ./backend

# PORT is provided by Cloud Run (container port configured as 5001); not set here.
EXPOSE 5001

USER node

CMD ["node", "backend/index.js"]
