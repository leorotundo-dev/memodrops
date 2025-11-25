# Use Node.js 18
# Build timestamp: 2025-11-24T20:59:00Z
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
COPY apps/backend/package.json ./apps/backend/
COPY apps/ai/package.json ./apps/ai/
COPY packages/shared/package.json ./packages/shared/

# Install dependencies
RUN npm ci --include=workspace-root

# Copy source code
COPY . .

# Build shared first
RUN npm run build --workspace=@memodrops/shared

# Build ai
RUN npm run build --workspace=@memodrops/ai

# Build backend
RUN npm run build --workspace=@memodrops/backend

# Expose port
EXPOSE 3000

# Start backend
CMD ["npm", "run", "start", "--workspace=@memodrops/backend"]
