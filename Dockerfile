# # Use the official Node.js image as base
# FROM node:18-alpine AS builder

# WORKDIR /app

# # Copy package files (only those that exist)
# COPY package.json ./
# COPY package-lock.json ./
# # Do not copy pnpm-lock.yaml if it does not exist

# # Install dependencies
# RUN npm install

# # Copy all files
# COPY . .

# # Build the application
# RUN npm run build

# # Production image
# FROM node:18-alpine AS runner
# WORKDIR /app

# # Copy built files and production dependencies
# COPY --from=builder /app/.next ./.next
# COPY --from=builder /app/node_modules ./node_modules
# COPY --from=builder /app/package.json ./package.json
# COPY --from=builder /app/public ./public

# EXPOSE 3000

# CMD ["npm", "start"]

# Stage 1: Builder
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./
COPY .npmrc ./

# Install dependencies (including devDependencies)
RUN npm ci

# Copy all files
COPY . .

# Build the application
RUN npm run build

# Stage 2: Runner
FROM node:20-alpine AS runner
WORKDIR /app

# Don't run as root
USER node

# Copy necessary files from builder
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/public ./public

# Environment variables
ENV NODE_ENV production
ENV PORT 3000

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:3000 || exit 1

# Start the application
CMD ["node", "server.js"]