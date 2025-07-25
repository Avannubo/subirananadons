# Use the official Node.js image as base
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files (only those that exist)
COPY package.json ./
COPY package-lock.json ./
# Do not copy pnpm-lock.yaml if it does not exist

# Install dependencies
RUN npm install

# Copy all files
COPY . .

# Build the application
RUN npm run build

# Production image
FROM node:18-alpine AS runner
WORKDIR /app
 
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["npm", "start"]