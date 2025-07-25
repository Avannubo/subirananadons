
# Use official Node.js image for build
FROM node:18-alpine AS builder
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci --prefer-offline

# Copy all files
COPY . .

# Build Next.js app with standalone output (Next.js 14 best practice)
RUN npm run build

# Production image
FROM node:18-alpine AS runner
WORKDIR /app

# Only copy necessary files for standalone output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
# Optionally copy .env if present
COPY --from=builder /app/.env* ./

EXPOSE 3000

# Start Next.js standalone server
CMD ["node", "server.js"]