# Gunakan image Node.js resmi versi LTS
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Salin file dependency
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./

# Install dependencies (gunakan npm, pnpm, atau yarn sesuai project)
RUN if [ -f package-lock.json ]; then npm ci; \
    elif [ -f pnpm-lock.yaml ]; then npm install -g pnpm && pnpm install; \
    elif [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
    fi

# Salin seluruh source code
COPY . .

# Build Next.js app
RUN npm run build

# Production image, hanya copy hasil build dan dependency production
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Salin dependency production
COPY --from=builder /app/node_modules ./node_modules

# Salin Next.js .next hasil build
COPY --from=builder /app/.next ./.next

# Salin file statis dan konfigurasi
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.js* ./

# Jalankan Next.js app
EXPOSE 3000

CMD ["npm", "start"]