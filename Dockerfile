# Use Node.js 22
# Build timestamp: 2025-11-25T01:23:00Z
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
COPY pnpm-workspace.yaml ./
COPY apps/backend/package.json ./apps/backend/
COPY apps/web/package.json ./apps/web/
COPY packages/shared/package.json ./packages/shared/
COPY apps/ai/package.json ./apps/ai/

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build shared first
RUN npm run build --workspace=@memodrops/shared

# Build AI
RUN npm run build --workspace=@memodrops/ai

# Build backend
RUN npm run build --workspace=@memodrops/backend

# Build web
RUN npm run build --workspace=web

# Expose ports
EXPOSE 3333 3000

# Start backend (default)
CMD ["npm", "run", "start", "--workspace=@memodrops/backend"]
